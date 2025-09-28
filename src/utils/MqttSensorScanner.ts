/**
 * MQTT Sensor Scanner
 * Advanced sensor discovery and scanning via MQTT
 */

import mqtt from 'mqtt';
import { EventEmitter } from 'events';

export interface SensorScanResult {
  topic: string;
  name: string;
  type: string;
  value: string | number;
  unit?: string;
  timestamp: Date;
  quality: number;
  metadata?: {
    deviceId?: string;
    location?: string;
    manufacturer?: string;
    model?: string;
  };
}

export interface SensorScanConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  scanTopics: string[];
  scanDuration: number; // in seconds
  qualityThreshold: number; // 0-1, minimum quality for inclusion
}

export class MqttSensorScanner extends EventEmitter {
  private client: mqtt.MqttClient | null = null;
  private isScanning = false;
  private scanResults: Map<string, SensorScanResult> = new Map();
  private scanTimer: NodeJS.Timeout | null = null;
  private messageCounts: Map<string, number> = new Map();

  constructor(
    private config: SensorScanConfig,
    private log: any
  ) {
    super();
  }

  async startScan(): Promise<SensorScanResult[]> {
    if (this.isScanning) {
      this.log.warn('Sensor scan already in progress');
      return Array.from(this.scanResults.values());
    }

    this.log.info('Starting MQTT sensor scan...');
    this.isScanning = true;
    this.scanResults.clear();
    this.messageCounts.clear();

    try {
      await this.connectToMqtt();
      await this.subscribeToScanTopics();
      await this.performScan();
      
      this.log.info(`Sensor scan completed. Found ${this.scanResults.size} sensors.`);
      this.emit('scanComplete', Array.from(this.scanResults.values()));
      
      return Array.from(this.scanResults.values());
    } catch (error) {
      this.log.error('Sensor scan failed:', error);
      this.emit('scanError', error);
      throw error;
    } finally {
      this.isScanning = false;
      await this.disconnect();
    }
  }

  async stopScan(): Promise<void> {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    
    this.isScanning = false;
    await this.disconnect();
    this.log.info('Sensor scan stopped');
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
        this.log.info('Connected to MQTT broker for sensor scanning');
        resolve();
      });

      this.client.on('error', (error) => {
        this.log.error('MQTT connection error during scan:', error);
        reject(error);
      });

      this.client.on('message', (topic, message) => {
        this.handleSensorMessage(topic, message.toString());
      });
    });
  }

  private async subscribeToScanTopics(): Promise<void> {
    if (!this.client) return;

    const subscribePromises = this.config.scanTopics.map(topic => {
      return new Promise<void>((resolve, reject) => {
        this.client!.subscribe(topic, (error) => {
          if (error) {
            this.log.error(`Failed to subscribe to scan topic ${topic}:`, error);
            reject(error);
          } else {
            this.log.info(`Subscribed to scan topic: ${topic}`);
            resolve();
          }
        });
      });
    });

    await Promise.all(subscribePromises);
  }

  private async performScan(): Promise<void> {
    return new Promise((resolve) => {
      // Request sensor data by publishing to discovery topics
      this.config.scanTopics.forEach(topic => {
        const discoveryTopic = topic.replace('+', 'discovery');
        if (this.client) {
          this.client.publish(discoveryTopic, 'discover', { qos: 0 });
        }
      });

      // Set scan duration timer
      this.scanTimer = setTimeout(() => {
        resolve();
      }, this.config.scanDuration * 1000);
    });
  }

  private handleSensorMessage(topic: string, message: string): void {
    try {
      const sensorResult = this.parseSensorMessage(topic, message);
      
      if (sensorResult) {
        const quality = this.calculateQuality(topic, sensorResult);
        
        if (quality >= this.config.qualityThreshold) {
          const key = `${sensorResult.type}_${sensorResult.name}`;
          this.scanResults.set(key, {
            ...sensorResult,
            quality,
            timestamp: new Date()
          });
          
          this.log.debug(`Found sensor: ${sensorResult.name} (${sensorResult.type}) = ${sensorResult.value} [${quality}]`);
          this.emit('sensorFound', sensorResult);
        }
      }
    } catch (error) {
      this.log.error(`Error processing sensor message from ${topic}:`, error);
    }
  }

  private parseSensorMessage(topic: string, message: string): SensorScanResult | null {
    try {
      // Enhanced topic parsing with multiple patterns
      const topicParts = topic.split('/');
      if (topicParts.length < 2) return null;

      let name = 'unknown';
      let type = 'custom';
      let value: string | number = message;
      let unit: string | undefined;

      // Pattern 1: sensors/device_name/sensor_type
      if (topicParts.length >= 3 && topicParts[0] === 'sensors') {
        name = topicParts[1]?.replace(/_/g, ' ') || 'unknown';
        type = topicParts[2] || 'unknown';
      }
      // Pattern 2: homeassistant/sensor/device_name/state
      else if (topicParts.length >= 4 && topicParts[0] === 'homeassistant') {
        name = topicParts[2]?.replace(/_/g, ' ') || 'unknown';
        type = topicParts[1] || 'unknown';
      }
      // Pattern 3: device/room/sensor_type
      else if (topicParts.length >= 3) {
        name = topicParts[1]?.replace(/_/g, ' ') || 'unknown';
        type = topicParts[2] || 'unknown';
      }
      // Pattern 4: sensor_type/device_name
      else if (topicParts.length >= 2) {
        name = topicParts[1]?.replace(/_/g, ' ') || 'unknown';
        type = topicParts[0] || 'unknown';
      }

      // Try to parse value and unit
      try {
        const parsed = JSON.parse(message);
        if (typeof parsed === 'object') {
          value = parsed.value || parsed.state || parsed;
          unit = parsed.unit || parsed.unit_of_measurement;
        } else {
          value = parsed;
        }
      } catch {
        // If not JSON, try to parse as number
        if (!isNaN(Number(message))) {
          value = Number(message);
        }
      }

      // Extract metadata from topic
      const metadata: any = {};
      if (topic.includes('homeassistant')) {
        metadata.manufacturer = 'Home Assistant';
      }
      if (topic.includes('tasmota')) {
        metadata.manufacturer = 'Tasmota';
      }
      if (topic.includes('esphome')) {
        metadata.manufacturer = 'ESPHome';
      }

      return {
        topic,
        name,
        type,
        value,
        unit: unit || '',
        timestamp: new Date(),
        quality: 0.5, // Will be calculated later
        metadata
      };
    } catch (error) {
      this.log.error('Error parsing sensor message:', error);
      return null;
    }
  }

  private calculateQuality(topic: string, sensor: SensorScanResult): number {
    let quality = 0.5; // Base quality

    // Increase quality based on message frequency
    const messageCount = this.messageCounts.get(topic) || 0;
    this.messageCounts.set(topic, messageCount + 1);
    
    if (messageCount > 5) quality += 0.3;
    else if (messageCount > 2) quality += 0.2;
    else if (messageCount > 0) quality += 0.1;

    // Increase quality based on topic structure
    if (topic.includes('sensors/')) quality += 0.2;
    if (topic.includes('homeassistant/')) quality += 0.3;
    if (topic.includes('state')) quality += 0.1;

    // Increase quality based on value type
    if (typeof sensor.value === 'number') quality += 0.2;
    if (sensor.unit) quality += 0.1;
    if (sensor.metadata?.manufacturer) quality += 0.1;

    // Increase quality based on sensor type
    const knownTypes = ['temperature', 'humidity', 'pressure', 'motion', 'light', 'voltage', 'current', 'power'];
    if (knownTypes.includes(sensor.type)) quality += 0.2;

    return Math.min(quality, 1.0);
  }

  private async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.endAsync();
      this.client = null;
    }
  }

  getScanResults(): SensorScanResult[] {
    return Array.from(this.scanResults.values());
  }

  getScanStatus(): {
    isScanning: boolean;
    resultsCount: number;
    scanDuration: number;
    remainingTime?: number;
  } {
    return {
      isScanning: this.isScanning,
      resultsCount: this.scanResults.size,
      scanDuration: this.config.scanDuration,
      remainingTime: this.isScanning ? this.config.scanDuration : 0
    };
  }

  // Static method to get common scan topics
  static getCommonScanTopics(): string[] {
    return [
      'sensors/+/+',
      'homeassistant/sensor/+/state',
      'homeassistant/binary_sensor/+/state',
      'tasmota/+/SENSOR',
      'esphome/+/sensor/+/state',
      'zigbee2mqtt/+/sensor/+',
      'openhab/+/+',
      'domoticz/+/+',
      'sensor/+/+',
      'device/+/+',
      'iot/+/+',
      'home/+/+',
      'room/+/+',
      'climate/+/+',
      'weather/+/+'
    ];
  }
}
