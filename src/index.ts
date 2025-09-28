/**
 * AWTRIX Sensors Homebridge Plugin
 * 
 * @fileoverview Main entry point for the AWTRIX Sensors Homebridge plugin
 * @author Christian Braun
 * @version 1.0.0
 */

import { API } from 'homebridge';
import { AwtrixSensorsPlatform } from './platforms/AwtrixSensorsPlatform';

/**
 * Plugin name and identifier
 */
const PLUGIN_NAME = 'homebridge-awtrix-sensors';
const PLATFORM_NAME = 'AwtrixSensors';

/**
 * Plugin registration function
 * This function is called by Homebridge when the plugin is loaded
 */
export = (api: API): void => {
  // Register the platform
  api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, AwtrixSensorsPlatform);
  
  // Register Config UI X integration
  api.on('didFinishLaunching', () => {
    // Note: Config UI X integration would be implemented here
    // For now, we'll just log that the plugin is ready
    console.log('AWTRIX Sensors plugin loaded and ready');
  });
};
