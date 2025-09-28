# homebridge-awtrix-sensors

[![npm version](https://badge.fury.io/js/homebridge-awtrix-sensors.svg)](https://badge.fury.io/js/homebridge-awtrix-sensors)
[![Downloads](https://img.shields.io/npm/dm/homebridge-awtrix-sensors.svg)](https://www.npmjs.com/package/homebridge-awtrix-sensors)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Homebridge plugin that integrates AWTRIX LED matrix displays with HomeKit through MQTT. Display sensor data from HomeKit accessories on your AWTRIX display with customizable colors, icons, and effects.

## Features

- 🏠 **HomeKit Integration** - Connect any HomeKit sensor to AWTRIX
- 📡 **MQTT Communication** - Reliable real-time data transmission
- 🎨 **Customizable Display** - Colors, icons, effects, and animations
- 🔍 **Auto Discovery** - Automatically find AWTRIX devices on your network
- 📱 **Multiple Slots** - Display up to 8 different sensors simultaneously
- ⚡ **Real-time Updates** - Live sensor data updates
- 🛠️ **Easy Configuration** - Simple JSON configuration
- 🔧 **TypeScript** - Fully typed for better development experience

## Installation

### Prerequisites

- Node.js 16.0.0 or higher
- Homebridge 1.6.0 or higher
- AWTRIX device with MQTT support
- MQTT broker (Mosquitto, etc.)

### Install via Homebridge UI

1. Open Homebridge UI
2. Go to Plugins
3. Search for "AWTRIX Sensors"
4. Click Install

### Install via npm

```bash
npm install -g homebridge-awtrix-sensors
```

## Configuration

Add the platform to your `config.json`:

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
      },
      "sensors": {
        "temperature": {
          "name": "Temperatur",
          "type": "temperature",
          "unit": "°C",
          "slot": 0,
          "color": "#FF6B35",
          "icon": 2422,
          "effect": "scroll",
          "duration": 10
        },
        "humidity": {
          "name": "Luftfeuchtigkeit",
          "type": "humidity",
          "unit": "%",
          "slot": 1,
          "color": "#00A3FF",
          "icon": 51658,
          "effect": "fade",
          "duration": 8
        },
        "motion": {
          "name": "Bewegung",
          "type": "motion",
          "slot": 2,
          "color": "#00FF00",
          "icon": 2313,
          "effect": "blink",
          "duration": 5
        }
      }
    }
  ]
}
```

## Configuration Options

### Platform Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `platform` | string | Yes | Must be "AwtrixSensors" |
| `name` | string | Yes | Display name for the platform |
| `mqtt` | object | Yes | MQTT broker configuration |
| `awtrix` | object | Yes | AWTRIX device configuration |
| `sensors` | object | No | Sensor configurations |

### MQTT Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `host` | string | Yes | MQTT broker IP address |
| `port` | number | Yes | MQTT broker port (usually 1883) |
| `username` | string | Yes | MQTT username |
| `password` | string | Yes | MQTT password |
| `topicPrefix` | string | No | MQTT topic prefix (default: "awtrix_0b86f0") |

### AWTRIX Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `ip` | string | Yes | AWTRIX device IP address |
| `port` | number | Yes | AWTRIX HTTP port (usually 80) |
| `mqtt_topic` | string | No | MQTT topic for notifications |

### Sensor Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | string | Yes | Display name for the sensor |
| `type` | string | Yes | Sensor type (temperature, humidity, motion, light, pressure, custom) |
| `unit` | string | No | Unit of measurement |
| `slot` | number | Yes | AWTRIX display slot (0-7) |
| `color` | string | Yes | Display color (hex format) |
| `icon` | number | Yes | AWTRIX icon ID |
| `effect` | string | Yes | Display effect (none, scroll, fade, blink, rainbow) |
| `duration` | number | Yes | Display duration in seconds |

## Supported Sensor Types

- **Temperature** - Temperature sensors (°C)
- **Humidity** - Humidity sensors (%)
- **Motion** - Motion detectors (boolean)
- **Light** - Light sensors (lux)
- **Pressure** - Air pressure sensors (hPa)
- **Custom** - Custom sensor types

## Display Effects

- **none** - No animation
- **scroll** - Text scrolls from right to left
- **fade** - Text fades in and out
- **blink** - Text blinks on and off
- **rainbow** - Rainbow color animation

## AWTRIX Icon Database

The plugin supports the full AWTRIX icon database. You can find available icons at:
- [AWTRIX Icon Database](https://blueforcer.github.io/awtrix2/#/icons)
- Icon IDs range from 1 to 5000+

## Examples

### Basic Temperature Sensor

```json
{
  "sensors": {
    "living_room_temp": {
      "name": "Wohnzimmer",
      "type": "temperature",
      "unit": "°C",
      "slot": 0,
      "color": "#FF6B35",
      "icon": 2422,
      "effect": "scroll",
      "duration": 15
    }
  }
}
```

### Motion Sensor with Blink Effect

```json
{
  "sensors": {
    "front_door_motion": {
      "name": "Eingang",
      "type": "motion",
      "slot": 1,
      "color": "#00FF00",
      "icon": 2313,
      "effect": "blink",
      "duration": 5
    }
  }
}
```

### Multiple Sensors

```json
{
  "sensors": {
    "temperature": {
      "name": "Temperatur",
      "type": "temperature",
      "unit": "°C",
      "slot": 0,
      "color": "#FF6B35",
      "icon": 2422,
      "effect": "scroll",
      "duration": 10
    },
    "humidity": {
      "name": "Luftfeuchtigkeit",
      "type": "humidity",
      "unit": "%",
      "slot": 1,
      "color": "#00A3FF",
      "icon": 51658,
      "effect": "fade",
      "duration": 8
    },
    "motion": {
      "name": "Bewegung",
      "type": "motion",
      "slot": 2,
      "color": "#00FF00",
      "icon": 2313,
      "effect": "blink",
      "duration": 5
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **MQTT Connection Failed**
   - Check MQTT broker credentials
   - Verify network connectivity
   - Check firewall settings

2. **AWTRIX Not Responding**
   - Verify AWTRIX IP address
   - Check AWTRIX is connected to network
   - Ensure MQTT is enabled on AWTRIX

3. **Sensors Not Updating**
   - Check sensor configuration
   - Verify HomeKit accessory is working
   - Check Homebridge logs for errors

### Debug Mode

Enable debug logging in Homebridge:

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },
  "platforms": [
    {
      "platform": "AwtrixSensors",
      "debug": true
    }
  ]
}
```

### Logs

Check Homebridge logs for detailed information:

```bash
# Homebridge UI
# Go to Logs section

# Command line
homebridge -D
```

## Development

### Building from Source

```bash
git clone https://github.com/christianbraun/homebridge-awtrix-sensors.git
cd homebridge-awtrix-sensors
npm install
npm run build
```

### Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: christian@awtrix-integration.com
- 🐛 Issues: [GitHub Issues](https://github.com/christianbraun/homebridge-awtrix-sensors/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/christianbraun/homebridge-awtrix-sensors/discussions)

## Acknowledgments

- [AWTRIX Project](https://github.com/blueforcer/awtrix2) - Amazing LED matrix display
- [Homebridge](https://homebridge.io/) - HomeKit bridge for non-HomeKit devices
- [MQTT.js](https://github.com/mqttjs/MQTT.js) - MQTT client for Node.js

## Changelog

### 1.0.0
- Initial release
- HomeKit sensor integration
- MQTT communication
- AWTRIX device discovery
- Multiple sensor types support
- Customizable display options

---

Made with ❤️ for the AWTRIX community
