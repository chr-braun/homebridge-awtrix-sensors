/**
 * MQTT Sensor Discovery Service
 * Automatically discovers MQTT sensors based on topic patterns
 */

import mqtt from 'mqtt';
import { EventEmitter } from 'events';

export interface DiscoveredSensor {
  name: string;
  type: string;
  mqttTopic: string;
  lastValue?: string | number;
  lastSeen: Date;
  enabled: boolean;
  displaySlot: number;
}

export interface SensorDiscoveryConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  topicPatterns: string[];
  scanInterval: number; // in minutes
}

export class MqttSensorDiscovery extends EventEmitter {
  private client: mqtt.MqttClient | null = null;
  private discoveredSensors: Map<string, DiscoveredSensor> = new Map();
  private scanTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(
    private config: SensorDiscoveryConfig,
    private log: any
  ) {
    super();
  }

  async start(): Promise<void> {
    this.log.info('Starting MQTT sensor discovery...');
    
    try {
      await this.connectToMqtt();
      this.subscribeToPatterns();
      this.startPeriodicScan();
      this.log.info('MQTT sensor discovery started successfully');
    } catch (error) {
      this.log.error('Failed to start MQTT sensor discovery:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.log.info('Stopping MQTT sensor discovery...');
    
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    if (this.client) {
      await this.client.endAsync();
      this.client = null;
    }

    this.isConnected = false;
    this.log.info('MQTT sensor discovery stopped');
  }

  private async connectToMqtt(): Promise<void> {
    return new Promise((resolve, reject) => {
      const mqttUrl = `mqtt://${this.config.host}:${this.config.port}`;
      
      this.client = mqtt.connect(mqttUrl, {
        username: this.config.username,
        password: this.config.password,
        keepalive: 60,
        reconnectPeriod: 5000,
        connectTimeout: 30000
      });

      this.client.on('connect', () => {
        this.log.info('Connected to MQTT broker for sensor discovery');
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (error) => {
        this.log.error('MQTT connection error:', error);
        reject(error);
      });

      this.client.on('message', (topic, message) => {
        this.handleSensorMessage(topic, message.toString());
      });

      this.client.on('reconnect', () => {
        this.log.info('Reconnecting to MQTT broker...');
      });

      this.client.on('close', () => {
        this.log.info('MQTT connection closed');
        this.isConnected = false;
      });
    });
  }

  private subscribeToPatterns(): void {
    if (!this.client || !this.isConnected) {
      this.log.error('MQTT client not connected, cannot subscribe to patterns');
      return;
    }

    this.config.topicPatterns.forEach(pattern => {
      if (this.client) {
        this.client.subscribe(pattern, (error) => {
          if (error) {
            this.log.error(`Failed to subscribe to pattern ${pattern}:`, error);
          } else {
            this.log.info(`Subscribed to MQTT pattern: ${pattern}`);
          }
        });
      }
    });
  }

  private handleSensorMessage(topic: string, message: string): void {
    try {
      // Parse sensor data
      const sensorData = this.parseSensorMessage(topic, message);
      
      if (sensorData) {
        const sensorKey = `${sensorData.type}_${sensorData.name}`;
        const existingSensor = this.discoveredSensors.get(sensorKey);
        
        const sensor: DiscoveredSensor = {
          name: sensorData.name,
          type: sensorData.type,
          mqttTopic: topic,
          lastValue: sensorData.value,
          lastSeen: new Date(),
          enabled: existingSensor?.enabled ?? true,
          displaySlot: existingSensor?.displaySlot ?? 0
        };

        this.discoveredSensors.set(sensorKey, sensor);
        
        this.log.debug(`Discovered sensor: ${sensor.name} (${sensor.type}) = ${sensor.lastValue}`);
        this.emit('sensorDiscovered', sensor);
        this.emit('sensorUpdated', sensor);
      }
    } catch (error) {
      this.log.error(`Error processing sensor message from ${topic}:`, error);
    }
  }

  private parseSensorMessage(topic: string, message: string): { name: string; type: string; value: string | number } | null {
    try {
      // Extract sensor name and type from topic
      // Example: sensors/living_room/temperature -> name: "living_room", type: "temperature"
      const topicParts = topic.split('/');
      if (topicParts.length < 3) {
        return null;
      }

      const name = topicParts[1]?.replace(/_/g, ' ') || 'unknown';
      const type = topicParts[2] || 'custom';
      
      // Parse value
      let value: string | number = message;
      if (!isNaN(Number(message))) {
        value = Number(message);
      }

      return { name, type, value };
    } catch (error) {
      this.log.error('Error parsing sensor message:', error);
      return null;
    }
  }

  private startPeriodicScan(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
    }

    this.scanTimer = setInterval(() => {
      this.performScan();
    }, this.config.scanInterval * 60 * 1000);

    // Perform initial scan
    this.performScan();
  }

  private async performScan(): Promise<void> {
    if (!this.isConnected) {
      this.log.warn('MQTT not connected, skipping sensor scan');
      return;
    }

    this.log.debug('Performing periodic sensor scan...');
    
    // Request sensor data by publishing to discovery topics
    this.config.topicPatterns.forEach(pattern => {
      const discoveryTopic = pattern.replace('+', 'discovery');
      if (this.client) {
        this.client.publish(discoveryTopic, 'discover', { qos: 0 });
      }
    });
  }

  getDiscoveredSensors(): DiscoveredSensor[] {
    return Array.from(this.discoveredSensors.values());
  }

  getSensorByKey(key: string): DiscoveredSensor | undefined {
    return this.discoveredSensors.get(key);
  }

  updateSensor(sensorKey: string, updates: Partial<DiscoveredSensor>): void {
    const sensor = this.discoveredSensors.get(sensorKey);
    if (sensor) {
      const updatedSensor = { ...sensor, ...updates };
      this.discoveredSensors.set(sensorKey, updatedSensor);
      this.emit('sensorUpdated', updatedSensor);
      this.log.info(`Updated sensor: ${sensorKey}`);
    }
  }

  removeSensor(sensorKey: string): void {
    const sensor = this.discoveredSensors.get(sensorKey);
    if (sensor) {
      this.discoveredSensors.delete(sensorKey);
      this.emit('sensorRemoved', sensor);
      this.log.info(`Removed sensor: ${sensorKey}`);
    }
  }
}