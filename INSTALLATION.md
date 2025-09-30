# AWTRIX Sensor Server - Installation

## Übersicht

Der AWTRIX Sensor Server bietet eine erweiterte, dynamische Oberfläche zur Auswahl und Konfiguration von MQTT-Sensoren für AWTRIX LED-Matrix-Displays. Die Installation erfolgt über ein automatisches Script, das eine virtuelle Python-Umgebung erstellt und alle Abhängigkeiten verwaltet.

## 🚀 Schnellstart

### 1. Plugin installieren
```bash
# Über Homebridge Config UI X
# Suche nach "AWTRIX Sensors" und installiere

# Oder manuell über NPM
npm install -g homebridge-awtrix-sensors
```

### 2. Sensor Server installieren
```bash
# Wechsle in das Plugin-Verzeichnis
cd /home/homebridge/.homebridge/node_modules/homebridge-awtrix-sensors

# Führe das Installations-Script aus
./install-sensor-server.sh
```

### 3. Server starten
```bash
# Über das Management-Script
./manage-server.sh start

# Oder manuell
./start-server.sh
```

### 4. Webseite öffnen
- **Lokal**: http://localhost:8081
- **Extern**: http://[RASPBERRY_PI_IP]:8081

## 📋 System-Anforderungen

### Mindestanforderungen
- **Python 3.7+** (empfohlen: Python 3.9+)
- **pip3** (Python Package Manager)
- **Homebridge** (bereits installiert)
- **Raspberry Pi OS** oder **Ubuntu/Debian**

### Unterstützte Systeme
- ✅ Raspberry Pi OS (Homebridge OS)
- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ macOS (für Entwicklung)
- ✅ Windows 10+ (mit WSL)

## 🔧 Detaillierte Installation

### Schritt 1: Plugin-Installation

#### Option A: Über Homebridge Config UI X
1. Öffnen Sie Homebridge Config UI X
2. Gehen Sie zu "Plugins"
3. Suchen Sie nach "AWTRIX Sensors"
4. Klicken Sie auf "Install"

#### Option B: Manuell über NPM
```bash
# Global installieren
npm install -g homebridge-awtrix-sensors

# Oder lokal im Homebridge-Verzeichnis
cd /home/homebridge/.homebridge
npm install homebridge-awtrix-sensors
```

### Schritt 2: Sensor Server Installation

Das Installations-Script führt folgende Schritte automatisch aus:

1. **System-Check**: Überprüft Python 3 und pip3
2. **Virtuelle Umgebung**: Erstellt isolierte Python-Umgebung
3. **Abhängigkeiten**: Installiert Flask, Flask-CORS und weitere Pakete
4. **Konfiguration**: Erstellt JSON-Konfigurationsdatei
5. **Server-Script**: Erstellt erweiterten Python-Server
6. **Service**: Erstellt systemd-Service (Linux)
7. **Management**: Erstellt Verwaltungs-Scripts
8. **Logging**: Richtet Log-System ein

```bash
# Script ausführen
./install-sensor-server.sh
```

### Schritt 3: Konfiguration

#### Konfigurationsdatei bearbeiten
```bash
nano sensor-server-config.json
```

**Beispiel-Konfiguration:**
```json
{
    "server": {
        "host": "0.0.0.0",
        "port": 8081,
        "debug": false
    },
    "awtrix": {
        "default_ip": "192.168.178.151",
        "default_port": 7001
    },
    "mqtt": {
        "default_host": "192.168.178.29",
        "default_port": 1883,
        "default_username": "biber",
        "default_password": "2203801826"
    },
    "logging": {
        "level": "INFO",
        "file": "/var/log/awtrix-sensor-server/sensor-server.log"
    }
}
```

## 🎛️ Verwaltung

### Management-Script verwenden

```bash
# Server starten
./manage-server.sh start

# Server stoppen
./manage-server.sh stop

# Server neu starten
./manage-server.sh restart

# Status prüfen
./manage-server.sh status

# Logs anzeigen
./manage-server.sh logs
```

### Systemd-Service (Linux)

```bash
# Service aktivieren
sudo systemctl enable awtrix-sensor-server

# Service starten
sudo systemctl start awtrix-sensor-server

# Service stoppen
sudo systemctl stop awtrix-sensor-server

# Status prüfen
sudo systemctl status awtrix-sensor-server

# Logs anzeigen
sudo journalctl -u awtrix-sensor-server -f
```

## 🌐 Web-Interface

### Zugriff
- **Lokal**: http://localhost:8081
- **Extern**: http://[RASPBERRY_PI_IP]:8081
- **Homebridge Integration**: Über den "Externe Sensor Auswahl" Button

### Features
- 🔍 **Live-Suche** mit Debouncing
- 🎨 **Visuelle Sensor-Karten** mit Icons
- 📊 **Qualitäts-Indikatoren**
- 🏷️ **Filter nach Typ**
- ⚙️ **Regel-Builder** mit Drag & Drop
- 👁️ **Live-Preview** der AWTRIX-Anzeige
- 📱 **Responsive Design**

## 🔧 Fehlerbehebung

### Häufige Probleme

#### 1. Python nicht gefunden
```bash
# Python 3 installieren
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### 2. Port bereits belegt
```bash
# Verfügbare Ports prüfen
netstat -tulpn | grep :8081

# Anderen Port verwenden
nano sensor-server-config.json
# "port": 8082
```

#### 3. Berechtigungsfehler
```bash
# Script ausführbar machen
chmod +x install-sensor-server.sh
chmod +x manage-server.sh
chmod +x start-server.sh
```

#### 4. Virtuelle Umgebung funktioniert nicht
```bash
# Umgebung neu erstellen
rm -rf venv/
./install-sensor-server.sh
```

### Logs prüfen

```bash
# Server-Logs
tail -f /var/log/awtrix-sensor-server/sensor-server.log

# Oder über systemd
sudo journalctl -u awtrix-sensor-server -f

# Oder über Management-Script
./manage-server.sh logs
```

### Debug-Modus aktivieren

```bash
# Konfiguration bearbeiten
nano sensor-server-config.json

# Debug-Modus aktivieren
{
    "server": {
        "debug": true
    }
}

# Server neu starten
./manage-server.sh restart
```

## 📁 Verzeichnisstruktur

```
homebridge-awtrix-sensors/
├── lib/                          # TypeScript-kompilierte Dateien
├── ui/                          # Homebridge Config UI X Interface
├── sensor-selector.html         # Externe Sensor-Auswahl Webseite
├── install-sensor-server.sh     # Installations-Script
├── manage-server.sh             # Management-Script
├── start-server.sh              # Start-Script
├── sensor-server.py             # Flask-basierter Server
├── sensor-server-config.json    # Konfigurationsdatei
├── venv/                        # Virtuelle Python-Umgebung
├── selected_sensors.json        # Ausgewählte Sensoren
├── sensor_rules.json            # Sensor-Regeln
└── /var/log/awtrix-sensor-server/  # Log-Dateien
```

## 🔄 Updates

### Plugin aktualisieren
```bash
# Über Homebridge Config UI X
# Oder manuell:
npm update -g homebridge-awtrix-sensors
```

### Sensor Server aktualisieren
```bash
# Script erneut ausführen
./install-sensor-server.sh

# Server neu starten
./manage-server.sh restart
```

## 🆘 Support

Bei Problemen oder Fragen:

1. **Logs prüfen**: `./manage-server.sh logs`
2. **Status prüfen**: `./manage-server.sh status`
3. **Debug-Modus**: Konfiguration auf `"debug": true` setzen
4. **Neue Installation**: `rm -rf venv/ && ./install-sensor-server.sh`

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

---

**Hinweis**: Diese Installation ist speziell für Raspberry Pi mit Homebridge OS optimiert, funktioniert aber auch auf anderen Linux-Systemen.
