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
}
