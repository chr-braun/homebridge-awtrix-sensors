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

## [1.0.2-beta] - 2025-09-28

### Added
- **Complete GUI Implementation** - Full-featured web interface
- **MQTT Server Configuration** - Server settings, connection testing, availability checks
- **Sensor Display Control** - Value selection, individual durations, priorities, slot assignment
- **Advanced Icon Management** - AWTRIX icon database with search and categories
- **Real-time Testing** - MQTT connection tests, AWTRIX message sending
- **Device Discovery** - Automatic AWTRIX device scanning and detection
- **Configuration Management** - Save/load settings, persistent storage
- **Toast Notifications** - User feedback for all operations
- **Responsive Design** - Mobile-friendly interface

### Enhanced
- **Sensor Management** - Complete sensor lifecycle management
- **Display Modes** - Rotation, Priority, Manual display modes
- **Visual Controls** - Color pickers, duration sliders, slot selectors
- **Error Handling** - Comprehensive error messages and validation
- **API Endpoints** - RESTful API for all GUI operations

### Technical Improvements
- **Express.js Backend** - Robust server architecture
- **Socket.IO Integration** - Real-time communication
- **Modular Frontend** - Clean JavaScript architecture
- **CSS Grid Layout** - Modern responsive design
- **Configuration Persistence** - Server-side config management

## [1.0.1-2] - 2025-09-28

### Fixed
- Fixed Homebridge plugin configuration for GUI installation
- Added proper platform registration in package.json
- Enhanced plugin discovery for Homebridge Config UI X

## [1.0.1-1] - 2025-09-28

### Fixed
- Enhanced configuration validation with detailed debug logging
- Improved error messages for missing configuration sections
- Better debugging output for troubleshooting config issues

## [1.0.1] - 2025-09-28

### Added
- Enhanced GUI with real AWTRIX device discovery
- Icon browser with 25+ pre-defined AWTRIX icons
- Message composer with live preview functionality
- Real-time MQTT communication testing
- Improved error handling and user feedback
- Category-based icon filtering and search
- Enhanced UI/UX with modern design elements

### Fixed
- Improved network discovery reliability
- Better error messages and user notifications
- Enhanced socket.io communication stability

### Technical Improvements
- Real network scanning instead of mock data
- Live icon database integration
- Improved responsive design for mobile devices
- Better modal and form handling

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
