/**
 * MQTT Client utility for AWTRIX communication
 */

import mqtt, { MqttClient as MqttClientType } from 'mqtt';
import { MqttClientConfig, AwtrixMessage, SensorData, SensorConfig } from '../types';

export class MqttClient {
  private client: MqttClientType | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly config: MqttClientConfig;

  constructor(config: MqttClientConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const brokerUrl = `mqtt://${this.config.host}:${this.config.port}`;
      
      this.client = mqtt.connect(brokerUrl, {
        username: this.config.username,
        password: this.config.password,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clean: true
      });

      this.client.on('connect', () => {
        console.log(`✅ MQTT connected to ${this.config.host}:${this.config.port}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.client.on('error', (error) => {
        console.error('❌ MQTT connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.client.on('offline', () => {
        console.log('⚠️  MQTT client offline');
        this.isConnected = false;
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        console.log(`🔄 MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
          this.client?.end();
        }
      });

      this.client.on('close', () => {
        console.log('🔌 MQTT connection closed');
        this.isConnected = false;
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          console.log('🔌 MQTT disconnected');
          this.isConnected = false;
          resolve();
        });
      });
    }
  }

  async sendToAwtrix(message: AwtrixMessage): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.error('❌ MQTT client not connected');
      return false;
    }

    return new Promise((resolve) => {
      const topic = `${this.config.topicPrefix}/notify`;
      const payload = JSON.stringify(message);

      this.client!.publish(topic, payload, (error) => {
        if (error) {
          console.error('❌ Failed to send MQTT message:', error);
          resolve(false);
        } else {
          console.log(`📤 Sent to AWTRIX: ${message.text} (Slot ${message.slot})`);
          resolve(true);
        }
      });
    });
  }

  async sendSensorData(sensorData: SensorData, config: SensorConfig): Promise<boolean> {
    const message: AwtrixMessage = {
      text: `${config.name}: ${sensorData.value}${sensorData.unit || ''}`,
      slot: config.slot,
      color: config.color,
      icon: config.icon,
      effect: config.effect,
      duration: config.duration
    };

    return this.sendToAwtrix(message);
  }

  async sendTestMessage(): Promise<boolean> {
    const testMessage: AwtrixMessage = {
      text: 'HomeKit Test erfolgreich! 🎉',
      slot: 0,
      color: '#00FF00',
      icon: 2400,
      effect: 'blink',
      duration: 5
    };

    return this.sendToAwtrix(testMessage);
  }

  isConnectedToBroker(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }
}
