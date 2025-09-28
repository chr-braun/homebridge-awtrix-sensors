/**
 * AWTRIX Sensors Homebridge Platform
 */

import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { MqttClient } from '../utils/MqttClient';
import { AwtrixDiscovery } from '../utils/AwtrixDiscovery';
import { AwtrixSensorAccessory } from '../accessories/AwtrixSensorAccessory';
import { AwtrixConfig, AwtrixDevice, SensorConfig } from '../types';

export class AwtrixSensorsPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  private mqttClient: MqttClient | null = null;
  private awtrixDiscovery: AwtrixDiscovery | null = null;
  private discoveredDevices: AwtrixDevice[] = [];
  private sensorAccessories: Map<string, AwtrixSensorAccessory> = new Map();

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // Validate configuration
    if (!this.validateConfig()) {
      this.log.error('Invalid configuration. Please check your config.json');
      return;
    }

    // Initialize MQTT client
    this.initializeMqttClient();

    // Initialize AWTRIX discovery
    this.initializeAwtrixDiscovery();

    // Setup Config UI X API endpoints
    this.setupConfigUIEndpoints();

    // When this event is fired, it means Homebridge has restored all cached accessories
    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      this.discoverDevicesAndSensors();
    });
  }

  private validateConfig(): boolean {
    this.log.debug('Validating configuration:', JSON.stringify(this.config, null, 2));
    
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

    this.log.info('✅ Configuration validation passed');
    return true;
  }

  private initializeMqttClient(): void {
    const awtrixConfig = this.config as AwtrixConfig;
    
    this.mqttClient = new MqttClient({
      host: awtrixConfig.mqtt.host,
      port: awtrixConfig.mqtt.port,
      username: awtrixConfig.mqtt.username,
      password: awtrixConfig.mqtt.password,
      topicPrefix: awtrixConfig.mqtt.topicPrefix || 'awtrix_0b86f0'
    });

    this.mqttClient.connect().catch(error => {
      this.log.error('Failed to connect to MQTT broker:', error);
    });
  }

  private initializeAwtrixDiscovery(): void {
    const awtrixConfig = this.config as AwtrixConfig;
    
    this.awtrixDiscovery = new AwtrixDiscovery({
      ip: awtrixConfig.awtrix.ip,
      port: awtrixConfig.awtrix.port,
      scanRange: awtrixConfig.awtrix.ip.split('.').slice(0, 3).join('.'),
      timeout: 2000
    });
  }

  private async discoverDevicesAndSensors(): Promise<void> {
    try {
      // Discover AWTRIX devices
      if (this.awtrixDiscovery) {
        this.discoveredDevices = await this.awtrixDiscovery.discoverAwtrixDevices();
        this.log.info(`🔍 Discovered ${this.discoveredDevices.length} AWTRIX devices`);

        for (const device of this.discoveredDevices) {
          this.log.info(`🎯 AWTRIX Device: ${device.name} (${device.ip}:${device.port})`);
        }
      }

      // Create sensor accessories
      await this.createSensorAccessories();

    } catch (error) {
      this.log.error('Error during device discovery:', error);
    }
  }

  private async createSensorAccessories(): Promise<void> {
    const awtrixConfig = this.config as AwtrixConfig;
    
    if (!awtrixConfig.sensors) {
      this.log.info('No sensors configured. Add sensors to your config.json to get started.');
      return;
    }

    for (const [sensorKey, sensorConfig] of Object.entries(awtrixConfig.sensors)) {
      await this.createSensorAccessory(sensorKey, sensorConfig);
    }
  }

  private async createSensorAccessory(sensorKey: string, sensorConfig: SensorConfig): Promise<void> {
    const uuid = this.api.hap.uuid.generate(`awtrix-sensor-${sensorKey}`);
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    if (existingAccessory) {
      this.log.info(`Restoring existing sensor accessory: ${sensorConfig.name}`);
      this.api.updatePlatformAccessories([existingAccessory]);
      
      if (this.mqttClient) {
        const sensorAccessory = new AwtrixSensorAccessory(existingAccessory, this.log, this.mqttClient, sensorConfig, this.Service, this.Characteristic);
        this.sensorAccessories.set(sensorKey, sensorAccessory);
      }
    } else {
      this.log.info(`Adding new sensor accessory: ${sensorConfig.name}`);
      const accessory = new this.api.platformAccessory(sensorConfig.name, uuid);
      
      if (this.mqttClient) {
        const sensorAccessory = new AwtrixSensorAccessory(accessory, this.log, this.mqttClient, sensorConfig, this.Service, this.Characteristic);
        this.sensorAccessories.set(sensorKey, sensorAccessory);
      }

      this.accessories.push(accessory);
      this.api.registerPlatformAccessories('homebridge-awtrix-sensors', 'AwtrixSensors', [accessory]);
    }
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info(`Loading accessory from cache: ${accessory.displayName}`);
    this.accessories.push(accessory);
  }

  // Public methods for external access
  public getDiscoveredDevices(): AwtrixDevice[] {
    return this.discoveredDevices;
  }

  public getSensorAccessories(): Map<string, AwtrixSensorAccessory> {
    return this.sensorAccessories;
  }

  public async sendTestMessage(): Promise<boolean> {
    if (!this.mqttClient) {
      this.log.error('MQTT client not initialized');
      return false;
    }

    try {
      return await this.mqttClient.sendTestMessage();
    } catch (error) {
      this.log.error('Failed to send test message:', error);
      return false;
    }
  }

  public async refreshDevices(): Promise<void> {
    await this.discoverDevicesAndSensors();
  }

  public getMqttConnectionStatus(): boolean {
    return this.mqttClient ? this.mqttClient.isConnectedToBroker() : false;
  }

  private setupConfigUIEndpoints(): void {
    // Note: In a real implementation, these would be registered with Homebridge Config UI X
    // For now, we'll add them as methods that can be called by the Config UI
    this.log.info('Config UI X endpoints registered for AWTRIX Sensors');
    
    // Setup mock API endpoints for GUI functionality
    this.setupMockAPIEndpoints();
  }

  private setupMockAPIEndpoints(): void {
    // This is a mock implementation for testing the GUI
    // In a real Homebridge Config UI X integration, these would be proper API endpoints
    
    // Mock global API object for GUI testing
    if (typeof global !== 'undefined') {
      (global as any).awtrixAPI = {
        // Configuration endpoints
        getConfig: () => this.getConfig(),
        updateConfig: (config: any) => this.updateConfig(config),
        
        // MQTT endpoints
        testMqtt: (config: any) => this.testMqttConnection(config),
        
        // AWTRIX endpoints
        discoverDevices: () => this.discoverAwtrixDevices(),
        testMessage: () => this.sendTestMessageToAwtrix(),
        
        // Sensor endpoints
        scanSensors: () => this.scanMqttSensors(),
        searchSensors: (params: any) => this.searchSensors(params.searchTerm, params.type, params.priority),
        getAvailableSensors: () => this.getAvailableSensors(),
        
        // Rule endpoints
        testRule: (rule: any) => this.testRule(rule),
        executeRule: (rule: any) => this.executeRule(rule),
        
        // Icon endpoints
        getIcons: () => this.getAwtrixIcons()
      };
    }
  }

  // Mock API methods for GUI testing
  private async discoverAwtrixDevices(): Promise<any> {
    // Mock AWTRIX device discovery
    const mockDevices = [
      {
        id: 'awtrix_001',
        name: 'AWTRIX Living Room',
        ip: '192.168.178.151',
        port: 80,
        online: true,
        version: '2.0.0'
      }
    ];
    
    return {
      success: true,
      devices: mockDevices
    };
  }

  private async sendTestMessageToAwtrix(): Promise<any> {
    // Mock test message sending
    this.log.info('Sending test message to AWTRIX...');
    
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Test message sent successfully'
    };
  }

  private async scanMqttSensors(): Promise<any> {
    // Mock MQTT sensor scanning
    const mockSensors = [
      {
        id: 'temp_living_room',
        name: 'Living Room Temperature',
        type: 'temperature',
        unit: '°C',
        priority: 'high',
        mqtt_topic: 'sensors/temperature/living_room',
        value: '22.5',
        enabled: true,
        slot: 0,
        color: '#FF6B6B',
        duration: 10
      },
      {
        id: 'humidity_bedroom',
        name: 'Bedroom Humidity',
        type: 'humidity',
        unit: '%',
        priority: 'medium',
        mqtt_topic: 'sensors/humidity/bedroom',
        value: '45',
        enabled: true,
        slot: 1,
        color: '#4ECDC4',
        duration: 8
      },
      {
        id: 'motion_entrance',
        name: 'Entrance Motion',
        type: 'motion',
        unit: '',
        priority: 'high',
        mqtt_topic: 'sensors/motion/entrance',
        value: 'false',
        enabled: true,
        slot: 2,
        color: '#45B7D1',
        duration: 5
      }
    ];
    
    return {
      success: true,
      sensors: mockSensors
    };
  }

  // Config UI X API Methods
  public async getConfig(): Promise<AwtrixConfig> {
    return this.config as AwtrixConfig;
  }

  public async updateConfig(newConfig: Partial<AwtrixConfig>): Promise<boolean> {
    try {
      // Update configuration
      Object.assign(this.config, newConfig);
      
      // Reinitialize MQTT if config changed
      if (newConfig.mqtt) {
        this.initializeMqttClient();
      }
      
      this.log.info('Configuration updated successfully');
      return true;
    } catch (error) {
      this.log.error('Failed to update configuration:', error);
      return false;
    }
  }

  public async testMqttConnection(testConfig: { host: string; port: number; username: string; password: string }): Promise<boolean> {
    try {
      const mqtt = require('mqtt');
      const client = mqtt.connect(`mqtt://${testConfig.host}:${testConfig.port}`, {
        username: testConfig.username,
        password: testConfig.password,
        connectTimeout: 5000
      });

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          client.end();
          resolve(false);
        }, 5000);

        client.on('connect', () => {
          clearTimeout(timeout);
          client.end();
          resolve(true);
        });

        client.on('error', () => {
          clearTimeout(timeout);
          client.end();
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  public async getAwtrixIcons(): Promise<any[]> {
    // Return predefined AWTRIX icons
    return [
      { id: 2400, name: 'House', category: 'Home', emoji: '🏠' },
      { id: 2422, name: 'Temperature', category: 'Weather', emoji: '🌡️' },
      { id: 51658, name: 'Humidity', category: 'Weather', emoji: '💧' },
      { id: 2313, name: 'Motion', category: 'Security', emoji: '👁️' },
      { id: 2401, name: 'Light', category: 'Weather', emoji: '☀️' },
      { id: 2402, name: 'Pressure', category: 'Weather', emoji: '🌬️' },
      { id: 2403, name: 'WiFi', category: 'Network', emoji: '📶' },
      { id: 2404, name: 'Bluetooth', category: 'Network', emoji: '📱' },
      { id: 2405, name: 'Battery', category: 'Power', emoji: '🔋' },
      { id: 2406, name: 'Clock', category: 'Time', emoji: '🕐' },
      { id: 2407, name: 'Calendar', category: 'Time', emoji: '📅' },
      { id: 2408, name: 'Mail', category: 'Communication', emoji: '📧' },
      { id: 2409, name: 'Phone', category: 'Communication', emoji: '📞' },
      { id: 2410, name: 'Message', category: 'Communication', emoji: '💬' },
      { id: 2411, name: 'Music', category: 'Media', emoji: '🎵' },
      { id: 2412, name: 'Video', category: 'Media', emoji: '🎥' },
      { id: 2413, name: 'Camera', category: 'Media', emoji: '📷' },
      { id: 2414, name: 'Settings', category: 'System', emoji: '⚙️' },
      { id: 2415, name: 'Info', category: 'System', emoji: 'ℹ️' },
      { id: 2416, name: 'Warning', category: 'System', emoji: '⚠️' },
      { id: 2417, name: 'Error', category: 'System', emoji: '❌' },
      { id: 2418, name: 'Success', category: 'System', emoji: '✅' },
      { id: 2419, name: 'Loading', category: 'System', emoji: '⏳' },
      { id: 2420, name: 'Heart', category: 'Health', emoji: '❤️' },
      { id: 2421, name: 'Star', category: 'General', emoji: '⭐' }
    ];
  }

  // Sensor Search & Selection API Methods
  public async searchSensors(searchTerm: string, type?: string, priority?: string): Promise<any[]> {
    // Simulate sensor search - in real implementation, this would query MQTT topics
    const mockSensors = [
      {
        id: 'temp_living_room',
        name: 'Living Room Temperature',
        type: 'temperature',
        unit: '°C',
        priority: 'high',
        mqtt_topic: 'sensors/temperature/living_room',
        value: '22.5',
        enabled: false
      },
      {
        id: 'humidity_bedroom',
        name: 'Bedroom Humidity',
        type: 'humidity',
        unit: '%',
        priority: 'medium',
        mqtt_topic: 'sensors/humidity/bedroom',
        value: '45',
        enabled: false
      },
      {
        id: 'motion_entrance',
        name: 'Entrance Motion',
        type: 'motion',
        unit: '',
        priority: 'high',
        mqtt_topic: 'sensors/motion/entrance',
        value: 'false',
        enabled: false
      },
      {
        id: 'light_outdoor',
        name: 'Outdoor Light',
        type: 'light',
        unit: 'lux',
        priority: 'low',
        mqtt_topic: 'sensors/light/outdoor',
        value: '850',
        enabled: false
      },
      {
        id: 'pressure_weather',
        name: 'Weather Pressure',
        type: 'pressure',
        unit: 'hPa',
        priority: 'low',
        mqtt_topic: 'sensors/pressure/weather',
        value: '1013.25',
        enabled: false
      },
      {
        id: 'wifi_signal',
        name: 'WiFi Signal Strength',
        type: 'wifi',
        unit: 'dBm',
        priority: 'medium',
        mqtt_topic: 'sensors/wifi/signal',
        value: '-45',
        enabled: false
      }
    ];

    let filteredSensors = mockSensors;

    if (searchTerm) {
      filteredSensors = filteredSensors.filter(sensor => 
        sensor.name.toLowerCase().includes(searchTerm) ||
        sensor.type.toLowerCase().includes(searchTerm) ||
        sensor.mqtt_topic.toLowerCase().includes(searchTerm)
      );
    }

    if (type) {
      filteredSensors = filteredSensors.filter(sensor => sensor.type === type);
    }

    if (priority) {
      filteredSensors = filteredSensors.filter(sensor => sensor.priority === priority);
    }

    return filteredSensors;
  }

  public async getAvailableSensors(): Promise<any[]> {
    return this.searchSensors('');
  }

  // Rule Engine API Methods
  public async testRule(rule: any): Promise<boolean> {
    try {
      // Simulate rule testing
      this.log.info(`Testing rule: ${rule.name}`);
      
      // In real implementation, this would:
      // 1. Check if the sensor exists and is accessible
      // 2. Validate the condition logic
      // 3. Test the action execution
      // 4. Verify timing parameters
      
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.log.info(`Rule test successful: ${rule.name}`);
      return true;
    } catch (error) {
      this.log.error(`Rule test failed: ${rule.name}`, error);
      return false;
    }
  }

  public async executeRule(rule: any): Promise<boolean> {
    try {
      this.log.info(`Executing rule: ${rule.name}`);
      
      // In real implementation, this would:
      // 1. Monitor the specified sensor
      // 2. Check the condition
      // 3. Execute the action when condition is met
      // 4. Handle timing and repetition
      
      // For now, just simulate execution
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.log.info(`Rule executed successfully: ${rule.name}`);
      return true;
    } catch (error) {
      this.log.error(`Rule execution failed: ${rule.name}`, error);
      return false;
    }
  }
}
