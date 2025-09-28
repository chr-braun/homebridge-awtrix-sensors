/**
 * Homebridge Config UI X Integration for AWTRIX Sensors
 */

import { API, Logging } from 'homebridge';

export class AwtrixConfigUI {
  private api: API;
  private log: Logging;

  constructor(api: API, log: Logging) {
    this.api = api;
    this.log = log;
  }

  /**
   * Register the configuration UI with Homebridge Config UI X
   */
  registerConfigUI() {
    // Register the configuration page
    this.api.on('didFinishLaunching', () => {
      this.log.info('AWTRIX Config UI registered with Homebridge Config UI X');
    });
  }

  /**
   * Get the configuration UI HTML
   */
  getConfigUI(): string {
    return `
      <div id="awtrix-config-ui">
        <h2>AWTRIX HomeKit Integration</h2>
        <p>Configure your AWTRIX devices and MQTT settings below.</p>
        
        <div class="config-section">
          <h3>MQTT Server Configuration</h3>
          <div class="form-group">
            <label for="mqtt-host">Host:</label>
            <input type="text" id="mqtt-host" placeholder="192.168.178.29">
          </div>
          <div class="form-group">
            <label for="mqtt-port">Port:</label>
            <input type="number" id="mqtt-port" placeholder="1883">
          </div>
          <div class="form-group">
            <label for="mqtt-username">Username:</label>
            <input type="text" id="mqtt-username" placeholder="biber">
          </div>
          <div class="form-group">
            <label for="mqtt-password">Password:</label>
            <input type="password" id="mqtt-password" placeholder="password">
          </div>
          <div class="form-group">
            <label for="mqtt-topic">Topic Prefix:</label>
            <input type="text" id="mqtt-topic" placeholder="awtrix_0b86f0">
          </div>
        </div>

        <div class="config-section">
          <h3>AWTRIX Device Configuration</h3>
          <div class="form-group">
            <label for="awtrix-ip">AWTRIX IP:</label>
            <input type="text" id="awtrix-ip" placeholder="192.168.178.151">
          </div>
          <div class="form-group">
            <label for="awtrix-port">AWTRIX Port:</label>
            <input type="number" id="awtrix-port" placeholder="80">
          </div>
        </div>

        <div class="config-section">
          <h3>Sensor Display Control</h3>
          <div class="form-group">
            <label for="display-mode">Display Mode:</label>
            <select id="display-mode">
              <option value="rotation">Rotation (alle Sensoren nacheinander)</option>
              <option value="priority">Priority (nur wichtige Sensoren)</option>
              <option value="manual">Manual (manuelle Auswahl)</option>
            </select>
          </div>
          <div class="form-group">
            <label for="rotation-interval">Rotation Interval (Sekunden):</label>
            <input type="number" id="rotation-interval" value="10" min="5" max="60">
          </div>
          <div class="form-group">
            <label for="priority-threshold">Priority Threshold:</label>
            <select id="priority-threshold">
              <option value="high">High (nur kritische Werte)</option>
              <option value="medium">Medium (wichtige Werte)</option>
              <option value="low">Low (alle Werte)</option>
            </select>
          </div>
        </div>

        <div class="config-actions">
          <button id="test-mqtt-btn" class="btn btn-primary">Test MQTT Connection</button>
          <button id="discover-devices-btn" class="btn btn-secondary">Discover AWTRIX Devices</button>
          <button id="scan-sensors-btn" class="btn btn-info">Scan MQTT Sensors</button>
          <button id="send-test-btn" class="btn btn-success">Send Test Message</button>
        </div>

        <div id="status-display">
          <div class="status-item">
            <span class="status-label">MQTT Status:</span>
            <span id="mqtt-status" class="status-value">Not connected</span>
          </div>
          <div class="status-item">
            <span class="status-label">Devices Found:</span>
            <span id="devices-count" class="status-value">0</span>
          </div>
          <div class="status-item">
            <span class="status-label">Sensors Found:</span>
            <span id="sensors-count" class="status-value">0</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get the configuration UI JavaScript
   */
  getConfigJS(): string {
    return `
      // AWTRIX Config UI JavaScript
      class AwtrixConfigUI {
        constructor() {
          this.initializeEventListeners();
          this.loadConfiguration();
        }

        initializeEventListeners() {
          document.getElementById('test-mqtt-btn').addEventListener('click', () => {
            this.testMqttConnection();
          });

          document.getElementById('discover-devices-btn').addEventListener('click', () => {
            this.discoverDevices();
          });

          document.getElementById('scan-sensors-btn').addEventListener('click', () => {
            this.scanSensors();
          });

          document.getElementById('send-test-btn').addEventListener('click', () => {
            this.sendTestMessage();
          });
        }

        async loadConfiguration() {
          try {
            const response = await fetch('/api/platform/awtrix-sensors/config');
            if (response.ok) {
              const config = await response.json();
              this.updateConfigUI(config);
            }
          } catch (error) {
            console.error('Failed to load configuration:', error);
          }
        }

        updateConfigUI(config) {
          if (config.mqtt) {
            document.getElementById('mqtt-host').value = config.mqtt.host || '';
            document.getElementById('mqtt-port').value = config.mqtt.port || 1883;
            document.getElementById('mqtt-username').value = config.mqtt.username || '';
            document.getElementById('mqtt-password').value = config.mqtt.password || '';
            document.getElementById('mqtt-topic').value = config.mqtt.topicPrefix || '';
          }
          if (config.awtrix) {
            document.getElementById('awtrix-ip').value = config.awtrix.ip || '';
            document.getElementById('awtrix-port').value = config.awtrix.port || 80;
          }
          if (config.sensorDisplay) {
            document.getElementById('display-mode').value = config.sensorDisplay.mode || 'rotation';
            document.getElementById('rotation-interval').value = config.sensorDisplay.rotationInterval || 10;
            document.getElementById('priority-threshold').value = config.sensorDisplay.priorityThreshold || 'medium';
          }
        }

        async testMqttConnection() {
          const host = document.getElementById('mqtt-host').value;
          const port = parseInt(document.getElementById('mqtt-port').value);
          const username = document.getElementById('mqtt-username').value;
          const password = document.getElementById('mqtt-password').value;

          if (!host || !port || !username || !password) {
            alert('Bitte füllen Sie alle MQTT-Felder aus');
            return;
          }

          try {
            const response = await fetch('/api/platform/awtrix-sensors/test-mqtt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ host, port, username, password })
            });

            const result = await response.json();
            if (result.success) {
              this.updateStatus('mqtt-status', 'Connected', 'success');
              alert('MQTT-Verbindung erfolgreich!');
            } else {
              this.updateStatus('mqtt-status', 'Failed', 'error');
              alert('MQTT-Verbindung fehlgeschlagen: ' + result.message);
            }
          } catch (error) {
            this.updateStatus('mqtt-status', 'Error', 'error');
            alert('Fehler beim Testen der MQTT-Verbindung');
          }
        }

        async discoverDevices() {
          try {
            const response = await fetch('/api/platform/awtrix-sensors/discover-devices', {
              method: 'POST'
            });

            const result = await response.json();
            if (result.success) {
              document.getElementById('devices-count').textContent = result.devices.length;
              alert(\`\${result.devices.length} AWTRIX-Geräte gefunden!\`);
            } else {
              alert('Fehler beim Suchen nach AWTRIX-Geräten');
            }
          } catch (error) {
            alert('Fehler beim Suchen nach AWTRIX-Geräten');
          }
        }

        async scanSensors() {
          try {
            const response = await fetch('/api/platform/awtrix-sensors/scan-sensors', {
              method: 'POST'
            });

            const result = await response.json();
            if (result.success) {
              document.getElementById('sensors-count').textContent = result.sensors.length;
              alert(\`\${result.sensors.length} Sensoren gefunden!\`);
            } else {
              alert('Fehler beim Scannen der Sensoren');
            }
          } catch (error) {
            alert('Fehler beim Scannen der Sensoren');
          }
        }

        async sendTestMessage() {
          try {
            const response = await fetch('/api/platform/awtrix-sensors/test-message', {
              method: 'POST'
            });

            const result = await response.json();
            if (result.success) {
              alert('Test-Nachricht gesendet!');
            } else {
              alert('Fehler beim Senden der Test-Nachricht');
            }
          } catch (error) {
            alert('Fehler beim Senden der Test-Nachricht');
          }
        }

        updateStatus(elementId, text, type) {
          const element = document.getElementById(elementId);
          element.textContent = text;
          element.className = \`status-value status-\${type}\`;
        }
      }

      // Initialize when DOM is loaded
      document.addEventListener('DOMContentLoaded', () => {
        new AwtrixConfigUI();
      });
    `;
  }

  /**
   * Get the configuration UI CSS
   */
  getConfigCSS(): string {
    return `
      #awtrix-config-ui {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .config-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #e9ecef;
      }

      .config-section h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .form-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 5px;
        color: #333;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }

      .config-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.3s;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
      }

      .btn-info {
        background-color: #17a2b8;
        color: white;
      }

      .btn-info:hover {
        background-color: #138496;
      }

      .btn-success {
        background-color: #28a745;
        color: white;
      }

      .btn-success:hover {
        background-color: #1e7e34;
      }

      #status-display {
        background: white;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e9ecef;
      }

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .status-item:last-child {
        border-bottom: none;
      }

      .status-label {
        font-weight: 600;
        color: #333;
      }

      .status-value {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }

      .status-success {
        background-color: #d4edda;
        color: #155724;
      }

      .status-error {
        background-color: #f8d7da;
        color: #721c24;
      }

      .status-info {
        background-color: #d1ecf1;
        color: #0c5460;
      }
    `;
  }
}
