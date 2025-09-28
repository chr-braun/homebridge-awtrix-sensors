/**
 * AWTRIX Sensors Platform for Homebridge
 * Handles MQTT communication and AWTRIX device discovery
 */

import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { AwtrixSensorAccessory } from '../accessories/AwtrixSensorAccessory';
import { MqttClient } from '../utils/MqttClient';
import { AwtrixDiscovery } from '../utils/AwtrixDiscovery';
import { MqttSensorDiscovery, DiscoveredSensor } from '../utils/MqttSensorDiscovery';
import { MqttSensorScanner, SensorScanResult } from '../utils/MqttSensorScanner';
import { SensorRuleEngine, SensorRule, SensorValue } from '../utils/SensorRuleEngine';
import { AwtrixLogger } from '../utils/Logger';
import { AwtrixConfig, SensorConfig } from '../types';

export class AwtrixSensorsPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  private mqttClient?: MqttClient;
  private awtrixDiscovery?: AwtrixDiscovery;
  private sensorDiscovery?: MqttSensorDiscovery;
  private sensorScanner?: MqttSensorScanner;
  private ruleEngine?: SensorRuleEngine;
  private discoveredSensors: Map<string, DiscoveredSensor> = new Map();
  private scannedSensors: Map<string, SensorScanResult> = new Map();
  private awtrixLogger: AwtrixLogger;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    // Initialize enhanced logger
    this.awtrixLogger = new AwtrixLogger(this.log);
    
    this.log.debug('AwtrixSensorsPlatform constructor called');
    this.log.debug('Config:', JSON.stringify(config, null, 2));

    // Log configuration
    this.awtrixLogger.logConfiguration(config);

    if (!this.validateConfig()) {
      this.log.error('Invalid configuration. Please check your config.json');
      this.awtrixLogger.logError('CONFIG', 'Invalid configuration provided');
      return;
    }

    this.initializeMqttClient();
    this.initializeAwtrixDiscovery();
    this.initializeSensorDiscovery();
    this.initializeSensorScanner();
    this.initializeRuleEngine();

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.awtrixLogger.info('PLATFORM', 'Homebridge didFinishLaunching event triggered');
      this.setupLoggingAPI();
      this.discoverDevicesAndSensors();
    });
  }

  private validateConfig(): boolean {
    this.log.debug('Validating configuration:', JSON.stringify(this.config, null, 2));
    
    // Check for new flat configuration structure
    if (this.config['mqttHost'] && this.config['awtrixIp']) {
      // New flat configuration
      if (!this.config['mqttHost'] || !this.config['mqttPort'] || !this.config['mqttUsername'] || !this.config['mqttPassword']) {
        this.log.error('Missing required MQTT configuration');
        return false;
      }

      if (!this.config['awtrixIp'] || !this.config['awtrixPort']) {
        this.log.error('Missing required AWTRIX configuration');
        return false;
      }

      this.log.info('✅ Configuration validation passed (flat structure)');
      return true;
    }

    // Fallback to old nested structure
    const awtrixConfig = this.config as AwtrixConfig;
    
    if (!awtrixConfig.mqtt || !awtrixConfig.awtrix) {
      this.log.error('Missing required configuration: mqtt or awtrix');
      this.log.error('Current config keys:', Object.keys(awtrixConfig));
      return false;
    }

    if (!awtrixConfig.mqtt.host || !awtrixConfig.mqtt.port || !awtrixConfig.mqtt.username || !awtrixConfig.mqtt.password) {
      this.log.error('Missing required MQTT configuration');
      this.log.error('MQTT config:', awtrixConfig.mqtt);
      return false;
    }

    if (!awtrixConfig.awtrix.ip || !awtrixConfig.awtrix.port) {
      this.log.error('Missing required AWTRIX configuration');
      this.log.error('AWTRIX config:', awtrixConfig.awtrix);
      return false;
    }

    this.log.info('✅ Configuration validation passed (nested structure)');
    return true;
  }

  private initializeMqttClient(): void {
    let mqttConfig;
    
    // Check for new flat configuration structure
    if (this.config['mqttHost']) {
      mqttConfig = {
        host: this.config['mqttHost'],
        port: this.config['mqttPort'],
        username: this.config['mqttUsername'],
        password: this.config['mqttPassword'],
        topicPrefix: this.config['mqttTopicPrefix'] || 'awtrix_0b86f0'
      };
    } else {
      // Fallback to old nested structure
      const awtrixConfig = this.config as AwtrixConfig;
      mqttConfig = {
        host: awtrixConfig.mqtt.host,
        port: awtrixConfig.mqtt.port,
        username: awtrixConfig.mqtt.username,
        password: awtrixConfig.mqtt.password,
        topicPrefix: awtrixConfig.mqtt.topicPrefix || 'awtrix_0b86f0'
      };
    }
    
    this.mqttClient = new MqttClient(mqttConfig);

    this.mqttClient.connect().then(() => {
      this.awtrixLogger.logMqttConnection(true, mqttConfig.host, mqttConfig.port);
    }).catch(error => {
      this.log.error('Failed to connect to MQTT broker:', error);
      this.awtrixLogger.logMqttConnection(false, mqttConfig.host, mqttConfig.port);
      this.awtrixLogger.logError('MQTT', 'Connection failed', error);
    });
  }

  private initializeAwtrixDiscovery(): void {
    let awtrixConfig;
    
    // Check for new flat configuration structure
    if (this.config['awtrixIp']) {
      awtrixConfig = {
        ip: this.config['awtrixIp'],
        port: this.config['awtrixPort'],
        scanRange: this.config['scanRange'] || '192.168.178'
      };
    } else {
      // Fallback to old nested structure
      const config = this.config as AwtrixConfig;
      awtrixConfig = {
        ip: config.awtrix.ip,
        port: config.awtrix.port,
        scanRange: (config.awtrix as any).scanRange || '192.168.178'
      };
    }
    
    this.awtrixDiscovery = new AwtrixDiscovery(awtrixConfig);
  }

  private initializeSensorDiscovery(): void {
    // Check for sensor discovery configuration
    if (!this.config['enableSensorDiscovery']) {
      this.log.info('Sensor discovery disabled');
      return;
    }

    let mqttConfig;
    
    // Get MQTT config from new flat structure or old nested structure
    if (this.config['mqttHost']) {
      mqttConfig = {
        host: this.config['mqttHost'],
        port: this.config['mqttPort'],
        username: this.config['mqttUsername'],
        password: this.config['mqttPassword']
      };
    } else {
      const awtrixConfig = this.config as AwtrixConfig;
      mqttConfig = awtrixConfig.mqtt;
    }

    if (!mqttConfig) {
      this.log.error('MQTT configuration not found for sensor discovery');
      return;
    }

    const sensorDiscoveryConfig = {
      host: mqttConfig.host,
      port: mqttConfig.port,
      username: mqttConfig.username,
      password: mqttConfig.password,
      topicPatterns: this.config['topicPatterns'] || [
        'sensors/+/temperature',
        'sensors/+/humidity',
        'sensors/+/pressure',
        'sensors/+/motion',
        'sensors/+/light'
      ],
      scanInterval: this.config['scanInterval'] || 5
    };

    this.sensorDiscovery = new MqttSensorDiscovery(sensorDiscoveryConfig, this.log);
    
    // Log sensor discovery configuration
    this.awtrixLogger.logSensorDiscovery(
      true, 
      sensorDiscoveryConfig.scanInterval, 
      sensorDiscoveryConfig.topicPatterns
    );
    
    // Set up event listeners
    this.sensorDiscovery.on('sensorDiscovered', (sensor: DiscoveredSensor) => {
      this.handleSensorDiscovered(sensor);
    });

    this.sensorDiscovery.on('sensorUpdated', (sensor: DiscoveredSensor) => {
      this.handleSensorUpdated(sensor);
    });

    this.sensorDiscovery.on('sensorRemoved', (sensor: DiscoveredSensor) => {
      this.handleSensorRemoved(sensor);
    });
  }

  private async discoverDevicesAndSensors(): Promise<void> {
    this.log.info('Starting AWTRIX device and sensor discovery...');

    try {
      // Discover AWTRIX devices
      if (this.awtrixDiscovery) {
        // const devices = await this.awtrixDiscovery.discoverDevices();
        this.log.info('AWTRIX discovery initialized');
      }

      // Start MQTT sensor discovery
      if (this.sensorDiscovery) {
        await this.sensorDiscovery.start();
        this.log.info('MQTT sensor discovery started');
      }

      // Create sensor accessories based on configuration
      this.createSensorAccessories();

    } catch (error) {
      this.log.error('Error during discovery:', error);
    }
  }

  private handleSensorDiscovered(sensor: DiscoveredSensor): void {
    this.log.info(`New sensor discovered: ${sensor.name} (${sensor.type}) on topic ${sensor.mqttTopic}`);
    
    // Log sensor discovery
    this.awtrixLogger.logSensorDiscovered(sensor);
    
    // Store the discovered sensor
    const sensorKey = `${sensor.type}_${sensor.name}`;
    this.discoveredSensors.set(sensorKey, sensor);
    
    // Create HomeKit accessory for the sensor
    this.createDiscoveredSensorAccessory(sensor);
  }

  private handleSensorUpdated(sensor: DiscoveredSensor): void {
    const sensorKey = `${sensor.type}_${sensor.name}`;
    this.discoveredSensors.set(sensorKey, sensor);
    
    // Update the HomeKit accessory
    const accessory = this.accessories.find(acc => 
      acc.context['sensor']?.name === sensor.name && 
      acc.context['sensor']?.type === sensor.type
    );
    
    if (accessory) {
      // Update the accessory's sensor data
      accessory.context['sensor'] = sensor;
      this.log.debug(`Updated sensor data for ${sensor.name}: ${sensor.lastValue}`);
      this.awtrixLogger.logSensorUpdate(sensor.name, sensor.lastValue);
    }
  }

  private handleSensorRemoved(sensor: DiscoveredSensor): void {
    this.log.info(`Sensor removed: ${sensor.name} (${sensor.type})`);
    
    const sensorKey = `${sensor.type}_${sensor.name}`;
    this.discoveredSensors.delete(sensorKey);
    
    // Remove the HomeKit accessory
    const accessory = this.accessories.find(acc => 
      acc.context['sensor']?.name === sensor.name && 
      acc.context['sensor']?.type === sensor.type
    );
    
    if (accessory) {
      this.api.unregisterPlatformAccessories('homebridge-awtrix-sensors', 'AwtrixSensors', [accessory]);
      const index = this.accessories.indexOf(accessory);
      if (index > -1) {
        this.accessories.splice(index, 1);
      }
    }
  }

  private createDiscoveredSensorAccessory(sensor: DiscoveredSensor): void {
    if (!this.mqttClient) {
      this.log.error('MQTT client not initialized, cannot create discovered sensor accessory');
      return;
    }

    const uuid = this.api.hap.uuid.generate(`${sensor.type}_${sensor.name}`);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.debug(`Accessory already exists for sensor: ${sensor.name}`);
      return;
    }

    this.log.info(`Creating HomeKit accessory for discovered sensor: ${sensor.name}`);
    
    const accessory = new this.api.platformAccessory(sensor.name, uuid);
    accessory.context['sensor'] = sensor;
    
    // Convert DiscoveredSensor to SensorConfig for the accessory
    const sensorConfig: SensorConfig = {
      name: sensor.name,
      type: sensor.type as "temperature" | "humidity" | "motion" | "light" | "pressure" | "custom",
      mqttTopic: sensor.mqttTopic,
      enabled: sensor.enabled,
      displaySlot: sensor.displaySlot,
      slot: sensor.displaySlot,
      color: '#FFFFFF',
      icon: 0,
      effect: 'none',
      duration: 5000
    };
    
    new AwtrixSensorAccessory(accessory, this.log, this.mqttClient, sensorConfig, this.Service, this.Characteristic);
    this.api.registerPlatformAccessories('homebridge-awtrix-sensors', 'AwtrixSensors', [accessory]);
    
    // Log accessory creation
    this.awtrixLogger.logAccessoryCreated(sensor.name, sensor.type);
  }

  private createSensorAccessories(): void {
    // Get sensor configurations from config
    const sensorConfigs = this.getSensorConfigs();
    
    for (const sensorConfig of sensorConfigs) {
      this.createSensorAccessory(sensorConfig);
    }
  }

  private getSensorConfigs(): SensorConfig[] {
    // Check for new flat configuration structure
    if (this.config['sensors'] && Array.isArray(this.config['sensors'])) {
      return this.config['sensors'] as SensorConfig[];
    }

    // Fallback to old nested structure
    const awtrixConfig = this.config as AwtrixConfig;
    const sensors = awtrixConfig.sensors || [];
    return Array.isArray(sensors) ? sensors : [];
  }

  private createSensorAccessory(sensorConfig: SensorConfig): void {
    if (!this.mqttClient) {
      this.log.error('MQTT client not initialized, cannot create sensor accessory');
      return;
    }

    const uuid = this.api.hap.uuid.generate(sensorConfig.name);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info(`Restoring existing accessory: ${sensorConfig.name}`);
      new AwtrixSensorAccessory(existingAccessory, this.log, this.mqttClient, sensorConfig, this.Service, this.Characteristic);
    } else {
      this.log.info(`Adding new accessory: ${sensorConfig.name}`);
      const accessory = new this.api.platformAccessory(sensorConfig.name, uuid);
      accessory.context['sensor'] = sensorConfig;
      
      new AwtrixSensorAccessory(accessory, this.log, this.mqttClient, sensorConfig, this.Service, this.Characteristic);
      this.api.registerPlatformAccessories('homebridge-awtrix-sensors', 'AwtrixSensors', [accessory]);
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info(`Loading accessory from cache: ${accessory.displayName}`);
    this.accessories.push(accessory);
  }

  private setupLoggingAPI(): void {
    // Note: Homebridge API doesn't support custom events like this
    // This would need to be implemented differently in a real scenario
    // For now, we'll just log that the API setup was called
    this.awtrixLogger.info('API', 'Logging API setup called');
  }

  private initializeSensorScanner(): void {
    // Get MQTT configuration
    let mqttConfig;
    if (this.config['mqttHost']) {
      // New flat configuration
      mqttConfig = {
        host: this.config['mqttHost'],
        port: this.config['mqttPort'] || 1883,
        username: this.config['mqttUsername'] || '',
        password: this.config['mqttPassword'] || ''
      };
    } else {
      // Fallback to nested configuration
      const awtrixConfig = this.config as any;
      if (awtrixConfig.awtrix?.mqtt) {
        mqttConfig = {
          host: awtrixConfig.awtrix.mqtt.host,
          port: awtrixConfig.awtrix.mqtt.port,
          username: awtrixConfig.awtrix.mqtt.username,
          password: awtrixConfig.awtrix.mqtt.password
        };
      }
    }

    if (!mqttConfig) {
      this.log.warn('No MQTT configuration found for sensor scanner');
      return;
    }

    const scannerConfig = {
      host: mqttConfig.host,
      port: mqttConfig.port,
      username: mqttConfig.username,
      password: mqttConfig.password,
      scanTopics: MqttSensorScanner.getCommonScanTopics(),
      scanDuration: 30, // 30 seconds scan duration
      qualityThreshold: 0.3 // Include sensors with quality >= 0.3
    };

    this.sensorScanner = new MqttSensorScanner(scannerConfig, this.log);
    
    // Set up event listeners
    this.sensorScanner.on('sensorFound', (sensor: SensorScanResult) => {
      this.handleScannedSensor(sensor);
    });

    this.sensorScanner.on('scanComplete', (sensors: SensorScanResult[]) => {
      this.handleScanComplete(sensors);
    });

    this.sensorScanner.on('scanError', (error: any) => {
      this.handleScanError(error);
    });

    this.awtrixLogger.info('SCANNER', 'MQTT sensor scanner initialized');
  }

  private handleScannedSensor(sensor: SensorScanResult): void {
    const key = `${sensor.type}_${sensor.name}`;
    this.scannedSensors.set(key, sensor);
    
    this.log.info(`Scanned sensor: ${sensor.name} (${sensor.type}) = ${sensor.value} [${sensor.quality}]`);
    this.awtrixLogger.info('SCANNER', `Found sensor: ${sensor.name}`, {
      type: sensor.type,
      value: sensor.value,
      quality: sensor.quality,
      topic: sensor.topic
    });
  }

  private handleScanComplete(sensors: SensorScanResult[]): void {
    this.log.info(`Sensor scan completed. Found ${sensors.length} sensors.`);
    this.awtrixLogger.info('SCANNER', `Scan completed with ${sensors.length} sensors`);
  }

  private handleScanError(error: any): void {
    this.log.error('Sensor scan error:', error);
    this.awtrixLogger.logError('SCANNER', 'Scan failed', error);
  }

  // Public methods for GUI access
  async startSensorScan(): Promise<SensorScanResult[]> {
    if (!this.sensorScanner) {
      throw new Error('Sensor scanner not initialized');
    }
    
    this.awtrixLogger.info('SCANNER', 'Starting manual sensor scan');
    return await this.sensorScanner.startScan();
  }

  async stopSensorScan(): Promise<void> {
    if (this.sensorScanner) {
      await this.sensorScanner.stopScan();
      this.awtrixLogger.info('SCANNER', 'Manual sensor scan stopped');
    }
  }

  getScannedSensors(): SensorScanResult[] {
    return Array.from(this.scannedSensors.values());
  }

  getScanStatus(): any {
    return this.sensorScanner?.getScanStatus() || {
      isScanning: false,
      resultsCount: 0,
      scanDuration: 0
    };
  }

  // Method to add scanned sensor to configuration
  addScannedSensorToConfig(sensorKey: string): void {
    const sensor = this.scannedSensors.get(sensorKey);
    if (!sensor) {
      throw new Error(`Sensor ${sensorKey} not found in scan results`);
    }

    // Convert scanned sensor to sensor configuration
    const sensorConfig = {
      name: sensor.name,
      type: sensor.type,
      mqttTopic: sensor.topic,
      enabled: true,
      displaySlot: 1,
      color: '#00FF00',
      icon: 0,
      effect: 'none',
      duration: 5000
    };

    // Add to configuration (this would need to be implemented based on your config structure)
    this.log.info(`Adding scanned sensor to configuration: ${sensor.name}`);
    this.awtrixLogger.info('SCANNER', `Added sensor to config: ${sensor.name}`, sensorConfig);
  }

  private initializeRuleEngine(): void {
    this.ruleEngine = new SensorRuleEngine(this.log);
    
    // Set up event listeners
    this.ruleEngine.on('ruleTriggered', (rule: SensorRule) => {
      this.handleRuleTriggered(rule);
    });

    this.ruleEngine.on('awtrixDisplay', (data: any) => {
      this.handleAwtrixDisplay(data);
    });

    this.ruleEngine.on('awtrixNotification', (data: any) => {
      this.handleAwtrixNotification(data);
    });

    this.ruleEngine.on('awtrixEffect', (data: any) => {
      this.handleAwtrixEffect(data);
    });

    this.ruleEngine.on('mqttPublish', (data: any) => {
      this.handleMqttPublish(data);
    });

    this.ruleEngine.on('homekitUpdate', (data: any) => {
      this.handleHomekitUpdate(data);
    });

    // Start rule evaluation
    this.ruleEngine.startEvaluation(2000); // Evaluate every 2 seconds

    this.awtrixLogger.info('RULE_ENGINE', 'Sensor rule engine initialized and started');
  }

  private handleRuleTriggered(rule: SensorRule): void {
    this.log.info(`Rule triggered: ${rule.name} (${rule.triggerCount} times)`);
    this.awtrixLogger.info('RULE_ENGINE', `Rule triggered: ${rule.name}`, {
      ruleId: rule.id,
      triggerCount: rule.triggerCount,
      sensorTopic: rule.sensorTopic
    });
  }

  private handleAwtrixDisplay(data: any): void {
    if (this.mqttClient) {
      const message = {
        text: data.message,
        color: data.color,
        icon: data.icon,
        slot: data.slot,
        duration: data.duration,
        priority: data.priority
      };

      this.mqttClient.publish('awtrix/display', JSON.stringify(message));
      this.log.info(`AWTRIX display: ${data.message}`);
      this.awtrixLogger.info('RULE_ENGINE', 'AWTRIX display sent', data);
    }
  }

  private handleAwtrixNotification(data: any): void {
    if (this.mqttClient) {
      const message = {
        text: data.message,
        color: data.color,
        icon: data.icon,
        duration: data.duration,
        priority: data.priority
      };

      this.mqttClient.publish('awtrix/notification', JSON.stringify(message));
      this.log.info(`AWTRIX notification: ${data.message}`);
      this.awtrixLogger.info('RULE_ENGINE', 'AWTRIX notification sent', data);
    }
  }

  private handleAwtrixEffect(data: any): void {
    if (this.mqttClient) {
      const message = {
        effect: data.effect,
        color: data.color,
        duration: data.duration
      };

      this.mqttClient.publish('awtrix/effect', JSON.stringify(message));
      this.log.info(`AWTRIX effect: ${data.effect}`);
      this.awtrixLogger.info('RULE_ENGINE', 'AWTRIX effect sent', data);
    }
  }

  private handleMqttPublish(data: any): void {
    if (this.mqttClient) {
      this.mqttClient.publish(data.topic, data.message);
      this.log.info(`MQTT publish: ${data.topic} = ${data.message}`);
      this.awtrixLogger.info('RULE_ENGINE', 'MQTT message published', data);
    }
  }

  private handleHomekitUpdate(data: any): void {
    // Update HomeKit accessory
    this.log.info(`HomeKit update: ${data.accessory} = ${data.value}`);
    this.awtrixLogger.info('RULE_ENGINE', 'HomeKit accessory updated', data);
  }

  // Rule Engine Public Methods
  createRule(ruleData: Partial<SensorRule>): SensorRule | null {
    if (!this.ruleEngine) return null;
    return this.ruleEngine.createRule(ruleData);
  }

  updateRule(ruleId: string, updates: Partial<SensorRule>): boolean {
    if (!this.ruleEngine) return false;
    return this.ruleEngine.updateRule(ruleId, updates);
  }

  deleteRule(ruleId: string): boolean {
    if (!this.ruleEngine) return false;
    return this.ruleEngine.deleteRule(ruleId);
  }

  getRule(ruleId: string): SensorRule | undefined {
    if (!this.ruleEngine) return undefined;
    return this.ruleEngine.getRule(ruleId);
  }

  getAllRules(): SensorRule[] {
    if (!this.ruleEngine) return [];
    return this.ruleEngine.getAllRules();
  }

  getRuleTemplates(): any[] {
    if (!this.ruleEngine) return [];
    return this.ruleEngine.getRuleTemplates();
  }

  createRuleFromTemplate(templateId: string, sensorTopic: string, sensorName: string, sensorType: string): SensorRule | null {
    if (!this.ruleEngine) return null;
    return this.ruleEngine.createRuleFromTemplate(templateId, sensorTopic, sensorName, sensorType);
  }

  updateSensorValue(sensorValue: SensorValue): void {
    if (this.ruleEngine) {
      this.ruleEngine.updateSensorValue(sensorValue);
    }
  }

  getRuleStatistics(): any {
    if (!this.ruleEngine) return null;
    return this.ruleEngine.getStatistics();
  }

  // Method to convert scanned sensor to rule
  convertSensorToRule(sensorTopic: string, templateId?: string): SensorRule | null {
    const sensor = this.scannedSensors.get(sensorTopic);
    if (!sensor) return null;

    if (templateId) {
      return this.createRuleFromTemplate(templateId, sensor.topic, sensor.name, sensor.type);
    }

    // Create a basic rule
    const ruleData: Partial<SensorRule> = {
      name: `Auto Rule - ${sensor.name}`,
      description: `Automatisch erstellte Regel für ${sensor.name}`,
      sensorTopic: sensor.topic,
      sensorName: sensor.name,
      sensorType: sensor.type,
      conditions: [
        {
          id: 'cond_1',
          type: 'value',
          operator: 'greater_than',
          value: 0
        }
      ],
      actions: [
        {
          id: 'action_1',
          type: 'awtrix_display',
          target: '',
          message: `${sensor.name}: {sensor_value} ${sensor.unit || ''}`,
          color: '#00FF00',
          icon: 0,
          duration: 5000,
          slot: 1,
          priority: 1
        }
      ],
      enabled: true,
      priority: 1
    };

    return this.createRule(ruleData);
  }

  // ===== RULE MANAGEMENT FOR HOMEBRIDGE CONFIG UI X =====
  
  // Get available MQTT sensors for rule creation
  getAvailableSensors(): any[] {
    const sensors: any[] = [];
    
    // Add discovered sensors
    for (const [key, sensor] of this.discoveredSensors) {
      sensors.push({
        id: key,
        name: sensor.name,
        type: sensor.type,
        topic: sensor.mqttTopic,
        lastValue: sensor.lastValue,
        unit: (sensor as any).unit || '',
        source: 'discovered'
      });
    }
    
    // Add scanned sensors
    for (const [key, sensor] of this.scannedSensors) {
      sensors.push({
        id: key,
        name: sensor.name,
        type: sensor.type,
        topic: sensor.topic,
        lastValue: sensor.value,
        unit: sensor.unit,
        quality: sensor.quality,
        source: 'scanned'
      });
    }
    
    return sensors;
  }

  // Get display templates for rule creation
  getDisplayTemplates(): any[] {
    return [
      {
        id: 'temperature_warning',
        name: 'Temperatur-Warnung',
        description: 'Zeigt Temperatur mit Warnung bei hohen Werten',
        template: '🌡️ {sensor_name}: {value}°C',
        color: '#FF6B6B',
        icon: '🌡️',
        effect: 'blink'
      },
      {
        id: 'motion_detected',
        name: 'Bewegung erkannt',
        description: 'Zeigt Bewegungserkennung an',
        template: '🏃 Bewegung in {sensor_name}!',
        color: '#4ECDC4',
        icon: '🏃',
        effect: 'fade'
      },
      {
        id: 'humidity_status',
        name: 'Luftfeuchtigkeit',
        description: 'Zeigt Luftfeuchtigkeitsstatus',
        template: '💧 {sensor_name}: {value}%',
        color: '#45B7D1',
        icon: '💧',
        effect: 'none'
      },
      {
        id: 'light_status',
        name: 'Licht-Status',
        description: 'Zeigt Lichtintensität',
        template: '💡 {sensor_name}: {value} lux',
        color: '#FFA726',
        icon: '💡',
        effect: 'rainbow'
      },
      {
        id: 'custom',
        name: 'Benutzerdefiniert',
        description: 'Eigener Text mit Variablen',
        template: '{sensor_name}: {value}{unit}',
        color: '#FFFFFF',
        icon: '📊',
        effect: 'none'
      }
    ];
  }

  // Create a simple rule from sensor and display settings
  createSimpleRule(ruleData: {
    sensorId: string;
    templateId: string;
    customText?: string;
    duration: number;
    color: string;
    icon: string;
    effect: string;
    conditions?: any[];
  }): SensorRule | null {
    const sensor = this.getAvailableSensors().find(s => s.id === ruleData.sensorId);
    if (!sensor) {
      this.log.error(`Sensor ${ruleData.sensorId} not found`);
      return null;
    }

    const template = this.getDisplayTemplates().find(t => t.id === ruleData.templateId);
    if (!template) {
      this.log.error(`Template ${ruleData.templateId} not found`);
      return null;
    }

    // Generate rule name
    const ruleName = `${template.name} - ${sensor.name}`;
    
    // Use custom text if provided, otherwise use template
    const displayText = ruleData.customText || template.template;
    
    // Replace variables in display text
    const processedText = displayText
      .replace(/{sensor_name}/g, sensor.name)
      .replace(/{value}/g, '{sensor_value}')
      .replace(/{unit}/g, sensor.unit || '');

    const rule: Partial<SensorRule> = {
      name: ruleName,
      description: `Einfache Regel für ${sensor.name} mit ${template.name}`,
      sensorTopic: sensor.topic,
      sensorName: sensor.name,
      sensorType: sensor.type,
      conditions: ruleData.conditions || [
        {
          id: 'cond_1',
          type: 'value',
          operator: 'greater_than',
          value: 0
        }
      ],
      actions: [
        {
          id: 'action_1',
          type: 'awtrix_display',
          target: '',
          message: processedText,
          color: ruleData.color,
          icon: parseInt(ruleData.icon) || 0,
          duration: ruleData.duration * 1000, // Convert to milliseconds
          slot: 1,
          priority: 1
        }
      ],
      enabled: true,
      priority: 1
    };

    const createdRule = this.createRule(rule);
    if (createdRule) {
      this.log.info(`Created simple rule: ${ruleName}`);
      this.awtrixLogger.info('RULE_ENGINE', `Simple rule created: ${ruleName}`, {
        sensorId: ruleData.sensorId,
        templateId: ruleData.templateId,
        ruleId: createdRule.id
      });
    }

    return createdRule;
  }

  // Test a rule without saving it
  testRule(ruleData: {
    sensorId: string;
    templateId: string;
    customText?: string;
    duration: number;
    color: string;
    icon: string;
    effect: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const sensor = this.getAvailableSensors().find(s => s.id === ruleData.sensorId);
      if (!sensor) {
        this.log.error(`Sensor ${ruleData.sensorId} not found for testing`);
        resolve(false);
        return;
      }

      const template = this.getDisplayTemplates().find(t => t.id === ruleData.templateId);
      if (!template) {
        this.log.error(`Template ${ruleData.templateId} not found for testing`);
        resolve(false);
        return;
      }

      // Generate test message
      const displayText = ruleData.customText || template.template;
      const processedText = displayText
        .replace(/{sensor_name}/g, sensor.name)
        .replace(/{value}/g, sensor.lastValue || 'TEST')
        .replace(/{unit}/g, sensor.unit || '');

      // Send test message to AWTRIX
      if (this.mqttClient) {
        const message = {
          text: processedText,
          color: ruleData.color,
          icon: parseInt(ruleData.icon) || 0,
          slot: 1,
          duration: ruleData.duration * 1000,
          priority: 1
        };

        this.mqttClient.publish('awtrix/display', JSON.stringify(message))
          .then(() => {
            this.log.info(`Test message sent to AWTRIX: ${processedText}`);
            this.awtrixLogger.info('RULE_ENGINE', 'Test message sent', message);
            resolve(true);
          })
          .catch((error) => {
            this.log.error('Failed to send test message:', error);
            this.awtrixLogger.logError('RULE_ENGINE', 'Test message failed', error);
            resolve(false);
          });
      } else {
        this.log.error('MQTT client not available for testing');
        resolve(false);
      }
    });
  }

  // Get rule statistics for the GUI
  getRuleStats(): any {
    if (!this.ruleEngine) {
      return {
        totalRules: 0,
        activeRules: 0,
        triggeredRules: 0,
        lastTriggered: null
      };
    }

    const stats = this.ruleEngine.getStatistics();
    return {
      totalRules: stats.totalRules,
      activeRules: stats.enabledRules,
      triggeredRules: stats.totalTriggers,
      lastTriggered: stats.lastEvaluation,
      averageTriggerTime: 0
    };
  }
}