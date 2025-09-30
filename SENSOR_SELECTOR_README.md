# AWTRIX Sensor Selector - Externe Webseite

## Übersicht

Die externe Sensor-Auswahl bietet eine erweiterte, benutzerfreundliche Oberfläche zur Auswahl von MQTT-Sensoren für die AWTRIX-Integration. Diese Webseite läuft auf einem separaten Port und kann über die Homebridge Config UI X geöffnet werden.

## Features

- 🔍 **Live-Suche** mit Debouncing für bessere Performance
- 🎨 **Visuelle Sensor-Karten** mit Icons und Farbkodierung
- 📊 **Qualitäts-Indikatoren** für jeden Sensor
- 🏷️ **Filter nach Typ** (Temperatur, Luftfeuchtigkeit, etc.)
- 📱 **Responsive Design** für Desktop und Mobile
- ⚡ **Echtzeit-Updates** der Sensor-Werte
- 💾 **Automatische Speicherung** der Auswahl

## Installation

### Auf Raspberry Pi mit Homebridge OS

1. **Dateien kopieren**: Stellen Sie sicher, dass alle Dateien im Plugin-Verzeichnis sind:
   - `sensor-selector.html`
   - `start-sensor-server.py`
   - `start-sensor-server.sh`

2. **Berechtigungen setzen**:
   ```bash
   chmod +x start-sensor-server.py
   chmod +x start-sensor-server.sh
   ```

3. **Server starten**:
   ```bash
   # Mit Standard-Port 8081
   ./start-sensor-server.sh
   
   # Mit benutzerdefiniertem Port
   ./start-sensor-server.sh 8082
   ```

### Manueller Start

```bash
# Python-Server direkt starten
python3 start-sensor-server.py [PORT]

# Beispiel: Port 8081
python3 start-sensor-server.py 8081
```

## Verwendung

### Über Homebridge Config UI X

1. Öffnen Sie die AWTRIX Sensors Plugin-Konfiguration
2. Scrollen Sie zum Abschnitt "Erweiterte Sensor Auswahl"
3. Wählen Sie einen freien Port (Standard: 8081)
4. Klicken Sie auf "Externe Sensor Auswahl öffnen"
5. Die Webseite öffnet sich in einem neuen Fenster

### Direkter Zugriff

- **Lokal**: `http://localhost:8081`
- **Extern**: `http://[RASPBERRY_PI_IP]:8081`

## Funktionen

### Sensor-Suche
- **Live-Suche**: Tippen Sie in das Suchfeld für sofortige Ergebnisse
- **Filter**: Wählen Sie einen Sensor-Typ aus dem Dropdown
- **Zurücksetzen**: Klicken Sie auf "Filter zurücksetzen"

### Sensor-Auswahl
- **Klickbare Karten**: Klicken Sie auf eine Sensor-Karte zur Auswahl
- **Visuelle Indikatoren**: Ausgewählte Sensoren werden hervorgehoben
- **Status-Anzeige**: Anzahl der ausgewählten Sensoren wird angezeigt

### Speicherung
- **Automatisch**: Auswahl wird automatisch in localStorage gespeichert
- **Übernahme**: Sensoren werden automatisch in die Haupt-Konfiguration übernommen
- **Synchronisation**: Schließen des Fensters löst die Übernahme aus

## Technische Details

### Port-Management
- **Standard-Port**: 8081
- **Verfügbare Ports**: 8081-8090
- **Automatische Erkennung**: Freie Ports werden automatisch gefunden
- **Fehlerbehandlung**: Benutzerfreundliche Fehlermeldungen bei Port-Konflikten

### Kompatibilität
- **Python 3**: Erforderlich für den Server
- **Moderne Browser**: Chrome, Firefox, Safari, Edge
- **Mobile Geräte**: Responsive Design für Smartphones und Tablets
- **Raspberry Pi**: Optimiert für ARM-Architektur

### Sicherheit
- **CORS-Headers**: Für Cross-Origin-Requests
- **Lokale Speicherung**: Keine Server-seitige Datenspeicherung
- **Port-Beschränkung**: Nur Ports 8080-8090 erlaubt

## Fehlerbehebung

### Port bereits belegt
```
❌ Port 8081 ist bereits belegt!
💡 Versuchen Sie einen anderen Port oder beenden Sie den anderen Server
```
**Lösung**: Verwenden Sie einen anderen Port oder beenden Sie den konkurrierenden Prozess

### Python nicht gefunden
```
❌ Python 3 ist nicht installiert!
```
**Lösung**: Installieren Sie Python 3 auf dem Raspberry Pi

### Popup blockiert
```
⚠️ Popup blockiert! Bitte erlauben Sie Popups für diese Seite
```
**Lösung**: Erlauben Sie Popups für die Homebridge Config UI X Seite

### Sensor-Auswahl nicht sichtbar
**Lösung**: 
1. Überprüfen Sie, ob der Server läuft
2. Testen Sie die URL direkt im Browser
3. Überprüfen Sie die Firewall-Einstellungen

## Entwicklung

### Lokale Entwicklung
```bash
# Server starten
python3 start-sensor-server.py 8081

# Browser öffnen
open http://localhost:8081
```

### Debugging
- **Browser-Konsole**: Öffnen Sie die Entwicklertools (F12)
- **Server-Logs**: Überwachen Sie die Terminal-Ausgabe
- **Network-Tab**: Überprüfen Sie HTTP-Requests

## Support

Bei Problemen oder Fragen:
1. Überprüfen Sie die Fehlerbehebung
2. Schauen Sie in die Browser-Konsole
3. Überprüfen Sie die Server-Logs
4. Testen Sie die direkte URL-Zugriffe

---

**Hinweis**: Diese externe Webseite ist speziell für die AWTRIX-Integration entwickelt und läuft unabhängig von Homebridge, aber integriert sich nahtlos in die Konfiguration.
