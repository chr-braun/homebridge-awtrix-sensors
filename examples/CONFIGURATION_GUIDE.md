# AWTRIX HomeKit Integration - Konfigurationsanleitung

## 📋 **Ihre Testdaten**

- **MQTT Server:** `192.168.178.29:1883`
- **MQTT Benutzer:** `biber`
- **MQTT Passwort:** `2203801826`
- **MQTT Topic Prefix:** `awtrix_0b86f0`
- **AWTRIX IP:** `192.168.178.151`

## 🚀 **Schnellstart (Empfohlen)**

### **1. Homebridge Config UI X Installation:**
```bash
# Plugin installieren
npm install -g homebridge-awtrix-sensors

# Oder über Homebridge Config UI X:
# Plugins → Suche nach "AWTRIX Sensors" → Installieren
```

### **2. Platform hinzufügen:**
1. **Homebridge Config UI X öffnen**
2. **Platforms → Add Platform**
3. **"AWTRIX Sensors" auswählen**
4. **Name:** `AWTRIX Sensors`

### **3. Konfiguration:**
```json
{
  "platform": "AwtrixSensors",
  "name": "AWTRIX Sensors",
  "mqtt": {
    "host": "192.168.178.29",
    "port": 1883,
    "username": "biber",
    "password": "2203801826",
    "topicPrefix": "awtrix_0b86f0"
  },
  "awtrix": {
    "ip": "192.168.178.151",
    "port": 80
  }
}
```

## 🔧 **Vollständige Konfiguration**

### **Erweiterte Features:**
```json
{
  "platform": "AwtrixSensors",
  "name": "AWTRIX Sensors",
  "mqtt": {
    "host": "192.168.178.29",
    "port": 1883,
    "username": "biber",
    "password": "2203801826",
    "topicPrefix": "awtrix_0b86f0"
  },
  "awtrix": {
    "ip": "192.168.178.151",
    "port": 80
  },
  "sensorDisplay": {
    "mode": "rotation",
    "rotationInterval": 10,
    "priorityThreshold": "medium",
    "sensors": [
      {
        "id": "temperature_1",
        "name": "Temperatur Wohnzimmer",
        "type": "temperature",
        "unit": "°C",
        "enabled": true,
        "slot": 0,
        "color": "#FF6B6B",
        "duration": 10,
        "priority": "high",
        "mqtt_topic": "sensors/temperature/living_room"
      }
    ]
  }
}
```

## 🎯 **Konfigurationsoptionen**

### **MQTT Einstellungen:**
- `host`: MQTT Server IP-Adresse
- `port`: MQTT Port (Standard: 1883)
- `username`: MQTT Benutzername
- `password`: MQTT Passwort
- `topicPrefix`: Topic-Präfix für AWTRIX

### **AWTRIX Einstellungen:**
- `ip`: AWTRIX Gerät IP-Adresse
- `port`: AWTRIX HTTP Port (Standard: 80)

### **Sensor Display:**
- `mode`: `rotation` | `priority` | `manual`
- `rotationInterval`: Sekunden zwischen Sensor-Wechsel
- `priorityThreshold`: `high` | `medium` | `low`

### **Sensor Konfiguration:**
- `id`: Eindeutige Sensor-ID
- `name`: Anzeigename
- `type`: Sensor-Typ (`temperature`, `humidity`, `motion`, etc.)
- `unit`: Einheit (`°C`, `%`, `lux`, etc.)
- `enabled`: Aktiviert/Deaktiviert
- `slot`: AWTRIX Slot (0-7)
- `color`: Hex-Farbe (`#FF6B6B`)
- `duration`: Anzeigedauer in Sekunden
- `priority`: Priorität (`high`, `medium`, `low`)
- `mqtt_topic`: MQTT Topic für Sensor-Daten

## 🧪 **Testen der Konfiguration**

### **1. MQTT Verbindung testen:**
```bash
# MQTT Test
mosquitto_pub -h 192.168.178.29 -p 1883 -u biber -P 2203801826 -t "test/topic" -m "Hello AWTRIX"
```

### **2. AWTRIX HTTP Test:**
```bash
# AWTRIX Status abfragen
curl http://192.168.178.151/api/status
```

### **3. Homebridge Logs prüfen:**
```bash
# Homebridge Logs anzeigen
homebridge -D
```

## 🔍 **Troubleshooting**

### **Häufige Probleme:**

#### **MQTT Verbindung fehlgeschlagen:**
- IP-Adresse und Port prüfen
- Benutzername/Passwort korrekt?
- MQTT Server läuft?

#### **AWTRIX nicht erreichbar:**
- IP-Adresse korrekt?
- AWTRIX Gerät eingeschaltet?
- Netzwerk erreichbar?

#### **Sensoren werden nicht angezeigt:**
- MQTT Topics korrekt?
- Sensor-Daten im richtigen Format?
- Homebridge Logs prüfen

### **Debug-Modus:**
```bash
# Homebridge mit Debug-Logs starten
homebridge -D -U /path/to/homebridge
```

## 📞 **Support**

- **GitHub:** https://github.com/chr-braun/homebridge-awtrix-sensors
- **NPM:** https://www.npmjs.com/package/homebridge-awtrix-sensors
- **Issues:** GitHub Issues für Probleme und Feature-Requests

## 🎉 **Fertig!**

Nach der Konfiguration sollten Sie:
1. **AWTRIX-Geräte** in HomeKit sehen
2. **Sensor-Daten** auf der AWTRIX anzeigen
3. **MQTT-Nachrichten** senden können
4. **GUI** in Homebridge Config UI X nutzen

**Viel Spaß mit Ihrer AWTRIX HomeKit Integration!** 🚀
