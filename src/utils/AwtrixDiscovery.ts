/**
 * AWTRIX Device Discovery utility
 */

import axios from 'axios';
import ping from 'ping';
import { AwtrixDevice, AwtrixDiscoveryConfig } from '../types';

export class AwtrixDiscovery {
  private readonly config: AwtrixDiscoveryConfig;
  private foundDevices: AwtrixDevice[] = [];

  constructor(config: AwtrixDiscoveryConfig) {
    this.config = config;
  }

  async discoverAwtrixDevices(): Promise<AwtrixDevice[]> {
    console.log('🔍 Starting AWTRIX device discovery...');
    this.foundDevices = [];

    const baseIp = this.config.ip.split('.').slice(0, 3).join('.');
    const ipRange = Array.from({ length: 254 }, (_, i) => `${baseIp}.${i + 1}`);

    const discoveryPromises = ipRange.map(ip => this.checkAwtrixDevice(ip));
    await Promise.allSettled(discoveryPromises);

    console.log(`✅ Discovery complete. Found ${this.foundDevices.length} AWTRIX devices`);
    return this.foundDevices;
  }

  private async checkAwtrixDevice(ip: string): Promise<void> {
    try {
      // Ping check first for faster filtering
      const pingRes = await ping.promise.probe(ip, { timeout: 1 });
      if (!pingRes.alive) {
        return;
      }

      // Check AWTRIX HTTP API
      const url = `http://${ip}:${this.config.port}/api/v1/stats`;
      const response = await axios.get(url, { timeout: 2000 });

      if (response.status === 200 && response.data && response.data.version) {
        const device: AwtrixDevice = {
          ip: ip,
          port: this.config.port,
          name: response.data.name || `AWTRIX-${ip.split('.')[3]}`,
          version: response.data.version,
          status: 'online',
          lastSeen: new Date()
        };
        this.foundDevices.push(device);
        console.log(`🎯 Found AWTRIX device: ${device.name} (${device.ip}:${device.port})`);
      }
    } catch (error) {
      // Device not found or not responding - this is normal during discovery
    }
  }

  getFoundDevices(): AwtrixDevice[] {
    return this.foundDevices;
  }

  async checkDeviceStatus(ip: string): Promise<boolean> {
    try {
      const url = `http://${ip}:${this.config.port}/api/v1/stats`;
      const response = await axios.get(url, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
