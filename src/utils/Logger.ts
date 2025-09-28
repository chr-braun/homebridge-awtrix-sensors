/**
 * Enhanced Logger for AWTRIX Homebridge Plugin
 * Provides comprehensive logging for all specifications and configurations
 */

import { Logger as HomebridgeLogger } from 'homebridge';

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

export interface ConfigurationLog {
  platformName: string;
  mqtt: {
    host: string;
    port: number;
    username: string;
    topicPrefix: string;
    connected: boolean;
  };
  awtrix: {
    ip: string;
    port: number;
    scanRange: string;
    reachable: boolean;
  };
  sensorDiscovery: {
    enabled: boolean;
    scanInterval: number;
    topicPatterns: string[];
    discoveredSensors: number;
  };
  sensors: Array<{
    name: string;
    type: string;
    mqttTopic: string;
    enabled: boolean;
    displaySlot: number;
  }>;
}

export class AwtrixLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private configLog: ConfigurationLog | null = null;

  constructor(private homebridgeLogger: HomebridgeLogger) {}

  // Configuration Logging
  logConfiguration(config: any): void {
    this.configLog = {
      platformName: config.platformName || 'AWTRIX Sensors',
      mqtt: {
        host: config.mqttHost || 'unknown',
        port: config.mqttPort || 1883,
        username: config.mqttUsername || 'unknown',
        topicPrefix: config.mqttTopicPrefix || 'awtrix_0b86f0',
        connected: false
      },
      awtrix: {
        ip: config.awtrixIp || 'unknown',
        port: config.awtrixPort || 80,
        scanRange: config.scanRange || '192.168.178',
        reachable: false
      },
      sensorDiscovery: {
        enabled: config.enableSensorDiscovery || false,
        scanInterval: config.scanInterval || 5,
        topicPatterns: config.topicPatterns || [],
        discoveredSensors: 0
      },
      sensors: []
    };

    this.info('CONFIG', 'Configuration loaded', this.configLog);
  }

  // MQTT Connection Logging
  logMqttConnection(connected: boolean, host: string, port: number): void {
    if (this.configLog) {
      this.configLog.mqtt.connected = connected;
    }
    
    if (connected) {
      this.info('MQTT', `Connected to MQTT broker at ${host}:${port}`);
    } else {
      this.error('MQTT', `Failed to connect to MQTT broker at ${host}:${port}`);
    }
  }

  // AWTRIX Device Logging
  logAwtrixDevice(reachable: boolean, ip: string, port: number): void {
    if (this.configLog) {
      this.configLog.awtrix.reachable = reachable;
    }
    
    if (reachable) {
      this.info('AWTRIX', `AWTRIX device reachable at ${ip}:${port}`);
    } else {
      this.warn('AWTRIX', `AWTRIX device not reachable at ${ip}:${port}`);
    }
  }

  // Sensor Discovery Logging
  logSensorDiscovery(enabled: boolean, scanInterval: number, topicPatterns: string[]): void {
    if (this.configLog) {
      this.configLog.sensorDiscovery.enabled = enabled;
      this.configLog.sensorDiscovery.scanInterval = scanInterval;
      this.configLog.sensorDiscovery.topicPatterns = topicPatterns;
    }
    
    this.info('DISCOVERY', `Sensor discovery ${enabled ? 'enabled' : 'disabled'}`, {
      scanInterval: `${scanInterval} minutes`,
      topicPatterns: topicPatterns
    });
  }

  // Sensor Logging
  logSensorDiscovered(sensor: any): void {
    if (this.configLog) {
      this.configLog.sensorDiscovery.discoveredSensors++;
      this.configLog.sensors.push({
        name: sensor.name,
        type: sensor.type,
        mqttTopic: sensor.mqttTopic,
        enabled: sensor.enabled,
        displaySlot: sensor.displaySlot
      });
    }
    
    this.info('SENSOR', `Discovered sensor: ${sensor.name} (${sensor.type})`, {
      topic: sensor.mqttTopic,
      enabled: sensor.enabled,
      slot: sensor.displaySlot
    });
  }

  logSensorUpdate(sensorName: string, value: any): void {
    this.debug('SENSOR', `Sensor ${sensorName} updated`, { value });
  }

  // HomeKit Accessory Logging
  logAccessoryCreated(accessoryName: string, accessoryType: string): void {
    this.info('ACCESSORY', `Created HomeKit accessory: ${accessoryName} (${accessoryType})`);
  }

  logAccessoryUpdated(accessoryName: string, value: any): void {
    this.debug('ACCESSORY', `Updated accessory ${accessoryName}`, { value });
  }

  // Message Logging
  logMessageSent(topic: string, message: any): void {
    this.debug('MESSAGE', `Sent MQTT message to ${topic}`, message);
  }

  logMessageReceived(topic: string, message: any): void {
    this.debug('MESSAGE', `Received MQTT message from ${topic}`, message);
  }

  // Error Logging
  logError(category: string, message: string, error?: any): void {
    this.error(category, message, error);
  }

  // Standard Logging Methods
  debug(category: string, message: string, data?: any): void {
    this.addLog('debug', category, message, data);
    this.homebridgeLogger.debug(`[${category}] ${message}`, data);
  }

  info(category: string, message: string, data?: any): void {
    this.addLog('info', category, message, data);
    this.homebridgeLogger.info(`[${category}] ${message}`, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.addLog('warn', category, message, data);
    this.homebridgeLogger.warn(`[${category}] ${message}`, data);
  }

  error(category: string, message: string, data?: any): void {
    this.addLog('error', category, message, data);
    this.homebridgeLogger.error(`[${category}] ${message}`, data);
  }

  // Internal Log Management
  private addLog(level: 'debug' | 'info' | 'warn' | 'error', category: string, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Log Retrieval
  getLogs(level?: string, category?: string, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  // Configuration Status
  getConfigurationStatus(): ConfigurationLog | null {
    return this.configLog;
  }

  // Health Check
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'error';
    mqtt: boolean;
    awtrix: boolean;
    sensors: number;
    lastActivity: Date | null;
  } {
    const lastActivity = this.logs.length > 0 ? (this.logs[this.logs.length - 1]?.timestamp || null) : null;
    
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (this.configLog) {
      if (!this.configLog.mqtt.connected || !this.configLog.awtrix.reachable) {
        status = 'error';
      } else if (this.configLog.sensorDiscovery.discoveredSensors === 0 && this.configLog.sensorDiscovery.enabled) {
        status = 'warning';
      }
    }

    return {
      status,
      mqtt: this.configLog?.mqtt.connected || false,
      awtrix: this.configLog?.awtrix.reachable || false,
      sensors: this.configLog?.sensorDiscovery.discoveredSensors || 0,
      lastActivity
    };
  }

  // Export Logs
  exportLogs(): string {
    return JSON.stringify({
      configuration: this.configLog,
      logs: this.logs,
      health: this.getHealthStatus(),
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  // Clear Logs
  clearLogs(): void {
    this.logs = [];
    this.info('LOGGER', 'Logs cleared');
  }
}
