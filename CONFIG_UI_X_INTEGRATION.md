# Homebridge Config UI X Integration Guide

## 🎯 **Config UI X Spezifikationen**

### **1. API-Endpunkte**
- **Swagger UI:** `http://homebridge.local:8581/swagger`
- **REST API:** `http://homebridge.local:8581/api`
- **Plugin API:** `/api/platform/{plugin-name}/`

### **2. Benutzerdefinierte Konfigurationsoberfläche**
- **HTML/CSS/JS** in `ui/dist/` Verzeichnis
- **Automatische Erkennung** durch `package.json` `configSchema`
- **API-Integration** über Fetch-Requests

### **3. Plugin-Integration**
- **Platform Registration** in `package.json`
- **Config Schema** für automatische UI-Generierung
- **API Endpoints** im Platform-Code

## 🔧 **Aktuelle Integration**

### **✅ Was funktioniert:**
- Plugin wird von Config UI X erkannt
- `configSchema` in `package.json` definiert
- UI-Dateien in `ui/dist/` vorhanden
- Mock-API für Testing implementiert

### **❌ Was fehlt:**
- **Echte API-Endpunkte** im Platform-Code
- **Config UI X API-Integration** statt Mock-API
- **Plugin-spezifische Endpunkte** für Config UI X

## 🚀 **Nächste Schritte**

### **1. Echte API-Endpunkte implementieren:**
```typescript
// In AwtrixSensorsPlatform.ts
private setupConfigUIEndpoints() {
    // Registriere API-Endpunkte für Config UI X
    this.api.on('didFinishLaunching', () => {
        this.api.registerPlatformAccessories('homebridge-awtrix-sensors', 'AwtrixSensors', []);
    });
}
```

### **2. Config UI X API verwenden:**
```javascript
// In config-ui.js
async loadConfiguration() {
    const response = await fetch('/api/platform/awtrix-sensors/config');
    this.config = await response.json();
}
```

### **3. Plugin-spezifische Endpunkte:**
- `/api/platform/awtrix-sensors/config` - Konfiguration laden/speichern
- `/api/platform/awtrix-sensors/test-mqtt` - MQTT testen
- `/api/platform/awtrix-sensors/discover-devices` - AWTRIX suchen
- `/api/platform/awtrix-sensors/scan-sensors` - Sensoren scannen

## 📋 **Implementierungsplan**

### **Phase 1: API-Endpunkte**
1. Echte API-Endpunkte im Platform-Code implementieren
2. Mock-API durch echte API-Aufrufe ersetzen
3. Error-Handling und Validierung hinzufügen

### **Phase 2: Config UI X Integration**
1. Plugin-spezifische Endpunkte registrieren
2. Config UI X API-Format verwenden
3. Plugin-Konfiguration korrekt laden/speichern

### **Phase 3: Testing & Validation**
1. Mit echter Homebridge-Instanz testen
2. Config UI X Integration validieren
3. Benutzerfreundlichkeit verbessern

## 🎯 **Erwartetes Ergebnis**

Nach der Implementierung:
- ✅ GUI funktioniert in echter Homebridge Config UI X
- ✅ Echte API-Endpunkte statt Mock-API
- ✅ Plugin-Konfiguration wird korrekt gespeichert
- ✅ Alle Funktionen arbeiten mit echter Homebridge-Instanz

## 📚 **Ressourcen**

- **Config UI X API:** `http://homebridge.local:8581/swagger`
- **Plugin Development:** https://github.com/homebridge/homebridge-config-ui-x
- **API Reference:** https://github.com/homebridge/homebridge-config-ui-x/wiki/API-Reference
- **Config Schema:** https://app.unpkg.com/homebridge-config-ui-x@4.6.4/files/config.schema.json
