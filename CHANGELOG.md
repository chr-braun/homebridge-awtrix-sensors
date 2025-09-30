# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.40] - 2025-01-27

### Fixed
- **Erweiterte Pfad-Erkennung**: Mehrere Pfad-Varianten für verschiedene Homebridge-Installationen
- **Fallback-Pfade**: Automatische Erkennung des korrekten Plugin-Verzeichnisses
- **Verbesserte Diagnose**: Detaillierte Logs für alle versuchten Pfade
- **Robuste Pfad-Auflösung**: Funktioniert mit verschiedenen NPM-Installationen

### Enhanced
- **Intelligente Pfad-Erkennung**: Prüft mehrere mögliche Verzeichnisstrukturen
- **Bessere Fehlerbehandlung**: Zeigt alle versuchten Pfade in den Logs
- **Verbesserte Kompatibilität**: Funktioniert mit globalen und lokalen NPM-Installationen

## [1.0.39] - 2025-01-27

### Fixed
- **Pfad-Korrektur**: Korrigierte Plugin-Verzeichnis-Erkennung für Sensor Server
- **Datei-Existenz-Prüfung**: Überprüfung ob Sensor Server-Dateien vorhanden sind
- **Verbesserte Fehlerbehandlung**: Detaillierte Fehlermeldungen bei fehlenden Dateien
- **Debug-Logging**: Erweiterte Logs für Pfad-Debugging

### Enhanced
- **Robuste Pfad-Erkennung**: Automatische Erkennung des Plugin-Verzeichnisses
- **Bessere Diagnose**: Klare Fehlermeldungen bei Installationsproblemen
- **Verbesserte Kompatibilität**: Funktioniert mit verschiedenen Homebridge-Installationen

## [1.0.38] - 2025-01-27

### Added
- **Automatischer Sensor Server Start**: Der Sensor Server startet automatisch beim Plugin-Start
- **Integrierte Prozess-Verwaltung**: Python-Server läuft als Child-Process des Plugins
- **Automatisches Cleanup**: Server wird beim Plugin-Stop ordnungsgemäß beendet
- **Erweiterte Logging**: Detaillierte Logs für Server-Start und -Stop
- **Port-Management**: Automatische Port-Erkennung und -Verwaltung

### Enhanced
- **Nahtlose Integration**: Keine manuelle Server-Installation mehr nötig
- **Robuste Fehlerbehandlung**: Graceful Shutdown und Error Recovery
- **Verbesserte Benutzerfreundlichkeit**: Ein-Klick-Installation und -Start

### Technical
- **Child Process Management**: Verwendung von Node.js `spawn()` für Python-Server
- **Event-Driven Architecture**: Integration in Homebridge Lifecycle Events
- **Process Monitoring**: Überwachung des Server-Status und automatische Neustarts

## [1.0.37] - 2025-01-27

### Added
- **Dynamische Regeln-Oberfläche**: Vollständige Regel-Konfiguration in der externen Sensor-Auswahl
- **Visueller Rule-Builder**: Drag & Drop Interface für Sensor-Regeln
- **Live-Preview**: AWTRIX-Display-Vorschau in Echtzeit
- **Vorgefertigte Templates**: Schnelle Regel-Erstellung mit Templates
- **Flask-basierter Server**: Erweiterter Python-Server mit API und CORS
- **Automatisches Installations-Script**: `install-sensor-server.sh` für einfache Installation
- **Virtuelle Python-Umgebung**: Isolierte Installation ohne System-Abhängigkeiten
- **Systemd-Service**: Automatischer Start und Management
- **Management-Scripts**: Einfache Verwaltung mit `manage-server.sh`
- **Konfigurationsdatei**: JSON-basierte Konfiguration
- **Strukturiertes Logging**: Detaillierte Logs mit Rotation

### Enhanced
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Port-Management**: Automatische Port-Erkennung und -Verwaltung
- **Error Handling**: Verbesserte Fehlerbehandlung und Benutzerführung
- **API-Endpoints**: RESTful API für Sensor- und Regel-Management
- **CORS-Support**: Nahtlose Integration in Homebridge Config UI X

### Technical
- **Python 3.13+ Support**: Kompatibel mit neuesten Python-Versionen
- **Flask + Flask-CORS**: Moderne Web-Framework-Integration
- **Virtuelle Umgebung**: Isolierte Abhängigkeiten
- **Systemd-Integration**: Service-Management auf Linux-Systemen
- **Log-Rotation**: Automatische Log-Datei-Verwaltung

## [1.0.36] - 2025-01-27

### Added
- **Externe Sensor-Auswahl**: Neue Webseite für erweiterte Sensor-Auswahl
- **Port-freie Auswahl**: Server kann auf beliebigem Port 8081-8090 laufen
- **Visuelle Sensor-Karten**: Moderne Karten-Darstellung mit Icons und Farben
- **Live-Suche mit Debouncing**: Optimierte Performance bei der Suche
- **Raspberry Pi Kompatibilität**: Speziell für Homebridge OS optimiert
- **Python HTTP Server**: Einfacher Server ohne Nginx-Abhängigkeit
- **Automatische Port-Erkennung**: Findet automatisch freie Ports
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Start-Scripts**: Einfache Start-Scripts für verschiedene Umgebungen

### Enhanced
- **GUI Integration**: Sehr sichtbarer Button in der Haupt-GUI
- **Status-Anzeigen**: Detaillierte Status-Meldungen für alle Aktionen
- **Error Handling**: Verbesserte Fehlerbehandlung und Benutzerführung
- **Dokumentation**: Umfassende README für die externe Sensor-Auswahl

### Technical
- **CORS-Support**: Cross-Origin-Requests für nahtlose Integration
- **localStorage Integration**: Automatische Synchronisation der Auswahl
- **Popup-Management**: Intelligente Popup-Erkennung und -Behandlung
- **Port-Management**: Automatische Erkennung und Verwaltung von Ports

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
