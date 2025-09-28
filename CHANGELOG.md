# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-28

### Added
- Initial release of homebridge-awtrix-sensors
- HomeKit sensor integration with AWTRIX LED matrix displays
- MQTT communication support
- Automatic AWTRIX device discovery
- Support for multiple sensor types:
  - Temperature sensors
  - Humidity sensors
  - Motion detectors
  - Light sensors
  - Air pressure sensors
  - Custom sensor types
- Customizable display options:
  - Colors (hex format)
  - Icons (AWTRIX icon database)
  - Effects (scroll, fade, blink, rainbow)
  - Display duration
  - Multiple slots (0-7)
- TypeScript support for better development experience
- Comprehensive documentation and examples
- Error handling and logging
- Real-time sensor data updates
- Test message functionality

### Features
- 🏠 HomeKit Integration
- 📡 MQTT Communication
- 🎨 Customizable Display
- 🔍 Auto Discovery
- 📱 Multiple Slots
- ⚡ Real-time Updates
- 🛠️ Easy Configuration
- 🔧 TypeScript Support

### Technical Details
- Built with TypeScript
- Compatible with Homebridge 1.6.0+
- Requires Node.js 16.0.0+
- Uses MQTT.js for communication
- Supports AWTRIX 2.x devices
- MIT License

---

## [Unreleased]

### Planned Features
- Child Bridge support for better stability
- GUI for sensor management
- Icon management and upload
- Advanced display features
- Automation and rules
- Dashboard and monitoring
- Backup and restore functionality
- Node-RED integration
- More sensor types
- Custom templates
- Color gradients
- Animation sequences
- Image upload support
