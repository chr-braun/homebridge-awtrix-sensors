/**
 * AWTRIX Sensor HomeKit Accessory
 */

import { Service, PlatformAccessory } from 'homebridge';
import { MqttClient } from '../utils/MqttClient';
import { SensorConfig, SensorData } from '../types';

export class AwtrixSensorAccessory {
  private readonly service: Service;
  private readonly informationService: Service;
  private readonly mqttClient: MqttClient;
  private readonly config: SensorConfig;
  private currentValue: string | number = 'N/A';

  constructor(
    private readonly accessory: PlatformAccessory,
    private readonly log: any,
    mqttClient: MqttClient,
    config: SensorConfig,
    private readonly Service: any,
    private readonly Characteristic: any
  ) {
    this.mqttClient = mqttClient;
    this.config = config;

    // Create information service
    this.informationService = this.accessory.getService(this.Service.AccessoryInformation) ||
      this.accessory.addService(this.Service.AccessoryInformation);

    this.informationService
      .setCharacteristic(this.Characteristic.Name, config.name)
      .setCharacteristic(this.Characteristic.Manufacturer, 'AWTRIX')
      .setCharacteristic(this.Characteristic.Model, 'AWTRIX Sensor')
      .setCharacteristic(this.Characteristic.SerialNumber, `AWTRIX-${config.slot}`)
      .setCharacteristic(this.Characteristic.FirmwareRevision, '1.0.0');

    // Create sensor service based on type
    this.service = this.createSensorService();

    // Set up characteristic updates
    this.setupCharacteristicHandlers();
  }

  private createSensorService(): Service {
    const serviceType = this.getServiceType();
    return this.accessory.getService(serviceType) ||
      this.accessory.addService(serviceType, this.config.name);
  }

  private getServiceType(): any {
    switch (this.config.type) {
      case 'temperature':
        return this.Service.TemperatureSensor;
      case 'humidity':
        return this.Service.HumiditySensor;
      case 'motion':
        return this.Service.MotionSensor;
      case 'light':
        return this.Service.LightSensor;
      default:
        return this.Service.TemperatureSensor; // Default fallback
    }
  }

  private setupCharacteristicHandlers(): void {
    // Set up characteristic based on sensor type
    switch (this.config.type) {
      case 'temperature':
        this.setupTemperatureSensor();
        break;
      case 'humidity':
        this.setupHumiditySensor();
        break;
      case 'motion':
        this.setupMotionSensor();
        break;
      case 'light':
        this.setupLightSensor();
        break;
      default:
        this.setupGenericSensor();
    }
  }

  private setupTemperatureSensor(): void {
    const temperatureService = this.service;
    
    temperatureService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(() => {
        return this.getNumericValue();
      });

    // Update temperature every 30 seconds
    setInterval(() => {
      this.updateTemperatureValue();
    }, 30000);
  }

  private setupHumiditySensor(): void {
    const humidityService = this.service;
    
    humidityService.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
      .onGet(() => {
        return this.getNumericValue();
      });

    // Update humidity every 30 seconds
    setInterval(() => {
      this.updateHumidityValue();
    }, 30000);
  }

  private setupMotionSensor(): void {
    const motionService = this.service;
    
    motionService.getCharacteristic(this.Characteristic.MotionDetected)
      .onGet(() => {
        return this.getBooleanValue();
      });

    // Update motion every 10 seconds
    setInterval(() => {
      this.updateMotionValue();
    }, 10000);
  }

  private setupLightSensor(): void {
    const lightService = this.service;
    
    lightService.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel)
      .onGet(() => {
        return this.getNumericValue();
      });

    // Update light level every 30 seconds
    setInterval(() => {
      this.updateLightValue();
    }, 30000);
  }

  private setupGenericSensor(): void {
    // Generic sensor setup - can be customized based on needs
    this.log.info(`Setting up generic sensor: ${this.config.name}`);
  }

  private getNumericValue(): number {
    const value = typeof this.currentValue === 'number' ? this.currentValue : parseFloat(this.currentValue.toString());
    return isNaN(value) ? 0 : value;
  }

  private getBooleanValue(): boolean {
    if (typeof this.currentValue === 'boolean') {
      return this.currentValue;
    }
    
    const stringValue = this.currentValue.toString().toLowerCase();
    return stringValue === 'true' || stringValue === '1' || stringValue === 'on' || stringValue === 'yes';
  }

  private async updateTemperatureValue(): Promise<void> {
    try {
      // In a real implementation, this would get data from HomeKit or MQTT
      const mockValue = Math.random() * 30 + 15; // 15-45°C
      this.currentValue = mockValue;
      
      // Send to AWTRIX
      const sensorData: SensorData = {
        value: mockValue,
        unit: '°C',
        timestamp: new Date()
      };
      
      await this.mqttClient.sendSensorData(sensorData, this.config);
      
      this.service.updateCharacteristic(this.Characteristic.CurrentTemperature, mockValue);
    } catch (error) {
      this.log.error(`Failed to update temperature sensor ${this.config.name}:`, error);
    }
  }

  private async updateHumidityValue(): Promise<void> {
    try {
      const mockValue = Math.random() * 40 + 30; // 30-70%
      this.currentValue = mockValue;
      
      const sensorData: SensorData = {
        value: mockValue,
        unit: '%',
        timestamp: new Date()
      };
      
      await this.mqttClient.sendSensorData(sensorData, this.config);
      
      this.service.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, mockValue);
    } catch (error) {
      this.log.error(`Failed to update humidity sensor ${this.config.name}:`, error);
    }
  }

  private async updateMotionValue(): Promise<void> {
    try {
      const mockValue = Math.random() > 0.7; // 30% chance of motion
      this.currentValue = mockValue ? 'Motion detected' : 'No motion';
      
      const sensorData: SensorData = {
        value: this.currentValue,
        timestamp: new Date()
      };
      
      await this.mqttClient.sendSensorData(sensorData, this.config);
      
      this.service.updateCharacteristic(this.Characteristic.MotionDetected, mockValue);
    } catch (error) {
      this.log.error(`Failed to update motion sensor ${this.config.name}:`, error);
    }
  }

  private async updateLightValue(): Promise<void> {
    try {
      const mockValue = Math.random() * 1000; // 0-1000 lux
      this.currentValue = mockValue;
      
      const sensorData: SensorData = {
        value: mockValue,
        unit: 'lux',
        timestamp: new Date()
      };
      
      await this.mqttClient.sendSensorData(sensorData, this.config);
      
      this.service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, mockValue);
    } catch (error) {
      this.log.error(`Failed to update light sensor ${this.config.name}:`, error);
    }
  }

  async sendTestMessage(): Promise<boolean> {
    try {
      return await this.mqttClient.sendTestMessage();
    } catch (error) {
      this.log.error(`Failed to send test message for ${this.config.name}:`, error);
      return false;
    }
  }

  getConfig(): SensorConfig {
    return this.config;
  }

  getCurrentValue(): string | number {
    return this.currentValue;
  }
}