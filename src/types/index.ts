/**
 * Type definitions for AWTRIX Homebridge Plugin
 */

export interface AwtrixConfig {
  platform: string;
  name: string;
  mqtt: {
    host: string;
    port: number;
    username: string;
    password: string;
    topicPrefix?: string;
  };
  awtrix: {
    ip: string;
    port: number;
    mqtt_topic?: string;
  };
  sensors?: {
    [key: string]: SensorConfig;
  };
}

export interface SensorConfig {
  name: string;
  type: 'temperature' | 'humidity' | 'motion' | 'light' | 'pressure' | 'custom';
  unit?: string;
  slot: number;
  color: string;
  icon: number;
  effect: 'none' | 'scroll' | 'fade' | 'blink' | 'rainbow';
  duration: number;
  entity_id?: string;
  homekit_service?: string;
  homekit_characteristic?: string;
  mqttTopic?: string;
  enabled?: boolean;
  displaySlot?: number;
}

export interface AwtrixMessage {
  text: string;
  slot: number;
  color: string;
  icon: number;
  effect: string;
  duration: number;
}

export interface AwtrixDevice {
  ip: string;
  port: number;
  name: string;
  version?: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}

export interface SensorData {
  value: string | number;
  unit?: string;
  timestamp: Date;
  entity_id?: string;
}

export interface MqttClientConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  topicPrefix: string;
}

export interface AwtrixDiscoveryConfig {
  ip: string;
  port: number;
  scanRange?: string;
  timeout?: number;
}
