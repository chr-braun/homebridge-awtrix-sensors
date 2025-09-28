# Installation Guide

This guide will help you install and configure the homebridge-awtrix-sensors plugin.

## Prerequisites

Before installing the plugin, ensure you have the following:

### Required Software
- **Node.js** 16.0.0 or higher
- **Homebridge** 1.6.0 or higher
- **AWTRIX device** with MQTT support
- **MQTT broker** (Mosquitto, Eclipse Mosquitto, etc.)

### Network Requirements
- AWTRIX device and Homebridge server on the same network
- MQTT broker accessible from both devices
- Port 1883 (MQTT) open (or custom port)

## Installation Methods

### Method 1: Homebridge UI (Recommended)

1. **Open Homebridge UI**
   - Navigate to your Homebridge web interface
   - Usually available at `http://homebridge-ip:8581`

2. **Go to Plugins**
   - Click on the "Plugins" tab
   - Search for "AWTRIX Sensors"

3. **Install Plugin**
   - Click "Install" next to the plugin
   - Wait for installation to complete

4. **Configure Plugin**
   - Go to "Plugins" → "AWTRIX Sensors"
   - Click the gear icon to configure
   - Add your MQTT and AWTRIX settings

### Method 2: Command Line

1. **Install via npm**
   ```bash
   npm install -g homebridge-awtrix-sensors
   ```

2. **Add to config.json**
   ```json
   {
     "platforms": [
       {
         "platform": "AwtrixSensors",
         "name": "AWTRIX MQTT Platform",
         "mqtt": {
           "host": "192.168.1.100",
           "port": 1883,
           "username": "your_username",
           "password": "your_password"
         },
         "awtrix": {
           "ip": "192.168.1.151",
           "port": 80
         }
       }
     ]
   }
   ```

3. **Restart Homebridge**
   ```bash
   homebridge -R
   ```

### Method 3: Development Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/christianbraun/homebridge-awtrix-sensors.git
   cd homebridge-awtrix-sensors
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Plugin**
   ```bash
   npm run build
   ```

4. **Link Plugin**
   ```bash
   npm link
   ```

## Configuration

### Basic Configuration

Add the following to your `config.json`:

```json
{
  "platforms": [
    {
      "platform": "AwtrixSensors",
      "name": "AWTRIX MQTT Platform",
      "mqtt": {
        "host": "192.168.1.100",
        "port": 1883,
        "username": "your_mqtt_username",
        "password": "your_mqtt_password",
        "topicPrefix": "awtrix_0b86f0"
      },
      "awtrix": {
        "ip": "192.168.1.151",
        "port": 80,
        "mqtt_topic": "awtrix_0b86f0/notify"
      }
    }
  ]
}
```

### Advanced Configuration

For more advanced configuration options, see the [Configuration Guide](CONFIGURATION.md).

## MQTT Broker Setup

### Using Mosquitto

1. **Install Mosquitto**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients
   
   # macOS
   brew install mosquitto
   
   # Windows
   # Download from https://mosquitto.org/download/
   ```

2. **Configure Mosquitto**
   ```bash
   # Edit configuration
   sudo nano /etc/mosquitto/mosquitto.conf
   
   # Add the following:
   listener 1883
   allow_anonymous true
   ```

3. **Start Mosquitto**
   ```bash
   sudo systemctl start mosquitto
   sudo systemctl enable mosquitto
   ```

### Using Docker

1. **Run Mosquitto Container**
   ```bash
   docker run -it -p 1883:1883 -p 9001:9001 \
     -v mosquitto.conf:/mosquitto/config/mosquitto.conf \
     eclipse-mosquitto
   ```

## AWTRIX Setup

1. **Enable MQTT on AWTRIX**
   - Open AWTRIX web interface
   - Go to Settings → MQTT
   - Enable MQTT
   - Set broker IP and port
   - Set username and password (if required)

2. **Test MQTT Connection**
   - Use MQTT Explorer or similar tool
   - Connect to your MQTT broker
   - Subscribe to `awtrix_0b86f0/notify`
   - Send a test message

## Verification

### Check Plugin Status

1. **Homebridge Logs**
   ```bash
   homebridge -D
   ```
   Look for:
   ```
   [AWTRIX MQTT Platform] ✅ MQTT connected
   [AWTRIX MQTT Platform] 🎯 Found AWTRIX device: AWTRIX-151
   ```

2. **HomeKit App**
   - Open Home app
   - Look for new accessories
   - Check if sensors appear

3. **AWTRIX Display**
   - Check if test messages appear
   - Verify sensor data is displayed

### Troubleshooting

If you encounter issues:

1. **Check Logs**
   ```bash
   homebridge -D
   ```

2. **Verify MQTT Connection**
   ```bash
   mosquitto_pub -h 192.168.1.100 -t "awtrix_0b86f0/notify" -m '{"text":"Test","slot":0,"color":"#00FF00","icon":2400,"effect":"blink","duration":5}'
   ```

3. **Check Network Connectivity**
   ```bash
   ping 192.168.1.151
   telnet 192.168.1.151 80
   ```

## Next Steps

After successful installation:

1. **Add Sensors** - Configure your first sensor
2. **Customize Display** - Set colors, icons, and effects
3. **Test Functionality** - Send test messages
4. **Explore Features** - Check out advanced configuration options

## Support

If you need help:

- 📧 Email: christian@awtrix-integration.com
- 🐛 Issues: [GitHub Issues](https://github.com/christianbraun/homebridge-awtrix-sensors/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/christianbraun/homebridge-awtrix-sensors/discussions)
