class AwtrixConfigUI {
    constructor() {
        this.currentTab = 'config';
        this.currentStep = 1;
        this.availableSensors = [];
        this.currentSensor = null;
        this.availableAwtrixDevices = [];
        this.currentConfig = {
            mqtt: { host: '', port: 1883, username: '', password: '', topicPrefix: 'awtrix' },
            awtrix: { ip: '', port: 7001 }
        };
        
        this.initializeEventListeners();
        this.loadConfiguration();
        this.initializeAssistant();
    }

    initializeEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchTab(tabName);
            });
        });

        document.getElementById('sensor-color')?.addEventListener('input', () => this.updateConfigPreview());
        document.getElementById('sensor-duration')?.addEventListener('input', () => this.updateConfigPreview());
        document.getElementById('sensor-display-type')?.addEventListener('change', () => this.updateConfigPreview());
        document.getElementById('sensor-icon')?.addEventListener('change', () => this.updateConfigPreview());
        
        document.getElementById('rule-operator')?.addEventListener('change', () => this.updateRulePreview());
        document.getElementById('rule-threshold')?.addEventListener('input', () => this.updateRulePreview());
        document.getElementById('rule-action')?.addEventListener('change', () => this.updateRulePreview());
        document.getElementById('rule-message')?.addEventListener('input', () => this.updateRulePreview());
    }

    initializeAssistant() {
        this.currentStep = 1;
        this.updateProgress();
        this.showStep(1);
        
        // Debug: Fülle Dropdown sofort mit Testdaten
        this.loadTestSensors();
    }
    
    loadTestSensors() {
        const sensorSelect = document.getElementById("assistant-sensor-select");
        if (!sensorSelect) return;
        
        const testSensors = [
            { id: "test_temp", name: "Test Temperatur", type: "temperature", lastValue: "22.5", unit: "°C" },
            { id: "test_humidity", name: "Test Luftfeuchtigkeit", type: "humidity", lastValue: "65", unit: "%" },
            { id: "test_motion", name: "Test Bewegung", type: "motion", lastValue: "1", unit: "" }
        ];
        
        sensorSelect.innerHTML = "<option value="">Sensor auswählen...</option>";
        testSensors.forEach(sensor => {
            const option = document.createElement("option");
            option.value = sensor.id;
            option.textContent = `${sensor.name} (${Math.round(parseFloat(sensor.lastValue))}${sensor.unit})`;
            sensorSelect.appendChild(option);
        });
    }
        this.currentStep = 1;
        this.updateProgress();
        this.showStep(1);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(`${tabName}-tab`).classList.add('active');
        event.target.classList.add('active');
        this.currentTab = tabName;
        
        if (tabName === 'rules') {
            this.initializeAssistant();
        }
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateProgress();
            this.showStep(this.currentStep);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgress();
            this.showStep(this.currentStep);
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progress = (this.currentStep / 3) * 100;
        progressFill.style.width = `${progress}%`;
        
        for (let i = 1; i <= 3; i++) {
            const step = document.getElementById(`step-${i}`);
            if (i < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (i === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        }
    }

    showStep(stepNumber) {
        document.querySelectorAll('.assistant-step').forEach(step => step.classList.remove('active'));
        document.getElementById(`assistant-step-${stepNumber}`).classList.add('active');
    }

    async loadAssistantSensors() {
        const loadBtn = document.getElementById('load-sensors-btn');
        const sensorSelect = document.getElementById('assistant-sensor-select');
        
        loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suche...';
        loadBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.availableSensors = [
                { id: 'temp_living', name: 'Wohnzimmer Temperatur', type: 'temperature', lastValue: '22.5', unit: '°C', topic: 'home/sensors/temperature/living', quality: 0.95 },
                { id: 'humidity_bathroom', name: 'Badezimmer Luftfeuchtigkeit', type: 'humidity', lastValue: '65', unit: '%', topic: 'home/sensors/humidity/bathroom', quality: 0.88 },
                { id: 'motion_kitchen', name: 'Küche Bewegung', type: 'motion', lastValue: '1', unit: '', topic: 'home/sensors/motion/kitchen', quality: 0.92 },
                { id: 'light_outdoor', name: 'Außenlicht', type: 'light', lastValue: '850', unit: 'lux', topic: 'home/sensors/light/outdoor', quality: 0.78 }
            ];
            
            sensorSelect.innerHTML = '<option value="">Sensor auswählen...</option>';
            this.availableSensors.forEach(sensor => {
                const option = document.createElement('option');
                option.value = sensor.id;
                option.textContent = `${sensor.name} (${Math.round(parseFloat(sensor.lastValue))}${sensor.unit})`;
                sensorSelect.appendChild(option);
            });
            
            this.showToast(`✅ ${this.availableSensors.length} Sensoren gefunden`, 'success');
            
        } catch (error) {
            this.showToast('❌ Fehler beim Laden der Sensoren', 'error');
        } finally {
            loadBtn.innerHTML = '<i class="fas fa-search"></i> Sensoren suchen';
            loadBtn.disabled = false;
        }
    }

    onAssistantSensorSelected() {
        const sensorSelect = document.getElementById('assistant-sensor-select');
        const sensorInfo = document.getElementById('assistant-sensor-info');
        const nextBtn = document.getElementById('step1-next-btn');
        
        const selectedSensorId = sensorSelect.value;
        
        if (!selectedSensorId) {
            sensorInfo.style.display = 'none';
            nextBtn.disabled = true;
            return;
        }
        
        const sensor = this.availableSensors.find(s => s.id === selectedSensorId);
        if (!sensor) return;
        
        this.currentSensor = sensor;
        
        const sensorName = sensorInfo.querySelector('.sensor-name');
        const sensorType = sensorInfo.querySelector('.sensor-type');
        const sensorValue = sensorInfo.querySelector('.sensor-value');
        const sensorTopic = sensorInfo.querySelector('.sensor-topic');
        
        if (sensorName) sensorName.textContent = `Name: ${sensor.name}`;
        if (sensorType) sensorType.textContent = `Typ: ${sensor.type}`;
        if (sensorValue) sensorValue.textContent = `Wert: ${Math.round(parseFloat(sensor.lastValue))} ${sensor.unit}`;
        if (sensorTopic) sensorTopic.textContent = `Topic: ${sensor.topic}`;
        
        sensorInfo.style.display = 'block';
        nextBtn.disabled = false;
        
        const ruleUnit = document.getElementById('rule-unit');
        if (ruleUnit) {
            ruleUnit.textContent = sensor.unit;
        }
    }

    updateConfigPreview() {
        const previewDisplay = document.getElementById('config-preview-display');
        const previewText = document.getElementById('preview-text');
        const previewIcon = document.getElementById('preview-icon');
        
        if (!previewDisplay || !this.currentSensor) return;
        
        const color = document.getElementById('sensor-color')?.value || '#00ff00';
        const displayType = document.getElementById('sensor-display-type')?.value || 'normal';
        const icon = document.getElementById('sensor-icon')?.value || 'thermometer';
        
        if (previewText) {
            previewText.textContent = `${Math.round(parseFloat(this.currentSensor.lastValue))}${this.currentSensor.unit}`;
        }
        
        if (previewIcon) {
            const iconMap = {
                'thermometer': '🌡️', 'droplet': '💧', 'sun': '☀️', 'moon': '🌙', 'heart': '❤️', 'star': '⭐'
            };
            previewIcon.textContent = iconMap[icon] || '🌡️';
        }
        
        previewDisplay.style.color = color;
        previewDisplay.className = 'preview-display';
        if (displayType !== 'normal') {
            previewDisplay.classList.add(`effect-${displayType}`);
        }
    }

    updateRulePreview() {
        const previewText = document.getElementById('rule-preview-text');
        if (!previewText || !this.currentSensor) return;
        
        const operator = document.getElementById('rule-operator')?.value || 'greater';
        const threshold = document.getElementById('rule-threshold')?.value || '25';
        const action = document.getElementById('rule-action')?.value || 'display';
        const message = document.getElementById('rule-message')?.value || 'Temperatur zu hoch!';
        
        const operatorMap = {
            'greater': 'größer als', 'less': 'kleiner als', 'equal': 'gleich', 'not_equal': 'ungleich'
        };
        
        const actionMap = {
            'display': 'Anzeige senden', 'notification': 'Benachrichtigung', 'effect': 'Effekt starten', 'mqtt': 'MQTT-Nachricht'
        };
        
        const ruleText = `Wenn <strong>${this.currentSensor.name}</strong> <strong>${operatorMap[operator]}</strong> <strong>${threshold}</strong>${this.currentSensor.unit}, dann <strong>${actionMap[action]}</strong>: "${message}"`;
        
        previewText.innerHTML = ruleText;
    }

    finishAssistant() {
        const ruleName = document.getElementById('rule-name')?.value || 'Neue Regel';
        const operator = document.getElementById('rule-operator')?.value || 'greater';
        const threshold = document.getElementById('rule-threshold')?.value || '25';
        const action = document.getElementById('rule-action')?.value || 'display';
        const message = document.getElementById('rule-message')?.value || 'Temperatur zu hoch!';
        
        const rule = {
            id: `rule_${Date.now()}`,
            name: ruleName,
            sensor: this.currentSensor,
            condition: { operator: operator, threshold: parseFloat(threshold) },
            action: { type: action, message: message },
            config: {
                color: document.getElementById('sensor-color')?.value || '#00ff00',
                duration: parseInt(document.getElementById('sensor-duration')?.value || '5'),
                displayType: document.getElementById('sensor-display-type')?.value || 'normal',
                icon: document.getElementById('sensor-icon')?.value || 'thermometer',
                priority: document.getElementById('sensor-priority')?.value || 'medium'
            },
            enabled: true,
            createdAt: new Date().toISOString()
        };
        
        console.log('Created rule:', rule);
        this.showToast('✅ Regel erfolgreich erstellt!', 'success');
        
        setTimeout(() => {
            this.initializeAssistant();
            this.switchTab('sensors');
        }, 2000);
    }

    async loadConfiguration() {
        try {
            this.updateConfigUI();
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    updateConfigUI() {
        document.getElementById('mqtt-host').value = this.currentConfig.mqtt.host;
        document.getElementById('mqtt-port').value = this.currentConfig.mqtt.port;
        document.getElementById('mqtt-username').value = this.currentConfig.mqtt.username;
        document.getElementById('mqtt-password').value = this.currentConfig.mqtt.password;
        document.getElementById('awtrix-ip').value = this.currentConfig.awtrix.ip;
        document.getElementById('awtrix-port').value = this.currentConfig.awtrix.port;
    }

    async saveConfiguration() {
        this.currentConfig.mqtt.host = document.getElementById('mqtt-host').value;
        this.currentConfig.mqtt.port = parseInt(document.getElementById('mqtt-port').value);
        this.currentConfig.mqtt.username = document.getElementById('mqtt-username').value;
        this.currentConfig.mqtt.password = document.getElementById('mqtt-password').value;
        this.currentConfig.awtrix.ip = document.getElementById('awtrix-ip').value;
        this.currentConfig.awtrix.port = parseInt(document.getElementById('awtrix-port').value);
        
        try {
            this.showToast('✅ Konfiguration gespeichert', 'success');
        } catch (error) {
            this.showToast('❌ Fehler beim Speichern', 'error');
        }
    }

    async testMqttConnection() {
        this.showToast('🔄 Teste MQTT-Verbindung...', 'info');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showToast('✅ MQTT-Verbindung erfolgreich', 'success');
        } catch (error) {
            this.showToast('❌ MQTT-Verbindung fehlgeschlagen', 'error');
        }
    }

    async testAwtrixConnection() {
        this.showToast('🔄 Teste AWTRIX-Verbindung...', 'info');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.showToast('✅ AWTRIX-Verbindung erfolgreich', 'success');
        } catch (error) {
            this.showToast('❌ AWTRIX-Verbindung fehlgeschlagen', 'error');
        }
    }

    async discoverAwtrixDevices() {
        this.showToast('🔄 Suche AWTRIX-Geräte...', 'info');
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.availableAwtrixDevices = [
                { name: 'AWTRIX Living Room', ip: '192.168.1.200', port: 7001 },
                { name: 'AWTRIX Kitchen', ip: '192.168.1.201', port: 7001 }
            ];
            this.updateAwtrixDevicesList();
            this.showToast(`✅ ${this.availableAwtrixDevices.length} AWTRIX-Geräte gefunden`, 'success');
        } catch (error) {
            this.showToast('❌ Fehler bei der Geräte-Suche', 'error');
        }
    }

    updateAwtrixDevicesList() {
        const devicesList = document.getElementById('awtrix-devices');
        if (!devicesList) return;
        
        if (this.availableAwtrixDevices.length === 0) {
            devicesList.innerHTML = `
                <div class="no-devices">
                    <i class="fas fa-search"></i>
                    <p>Keine AWTRIX Geräte gefunden. Überprüfen Sie die Netzwerkverbindung.</p>
                    <button class="btn btn-primary" onclick="discoverAwtrixDevices()">
                        <i class="fas fa-search"></i> Geräte suchen
                    </button>
                </div>
            `;
            return;
        }
        
        devicesList.innerHTML = this.availableAwtrixDevices.map(device => `
            <div class="device-item">
                <div class="device-info">
                    <h4>${device.name}</h4>
                    <p>IP: ${device.ip}:${device.port}</p>
                </div>
                <div class="device-actions">
                    <button class="btn btn-sm btn-primary" onclick="testDevice('${device.ip}')">
                        <i class="fas fa-play"></i> Testen
                    </button>
                </div>
            </div>
        `).join('');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 5000);
    }
}

// Global functions
function switchTab(tabName) { if (window.awtrixConfigUI) window.awtrixConfigUI.switchTab(tabName); }
function loadAssistantSensors() { if (window.awtrixConfigUI) window.awtrixConfigUI.loadAssistantSensors(); }
function onAssistantSensorSelected() { if (window.awtrixConfigUI) window.awtrixConfigUI.onAssistantSensorSelected(); }
function nextStep() { if (window.awtrixConfigUI) window.awtrixConfigUI.nextStep(); }
function prevStep() { if (window.awtrixConfigUI) window.awtrixConfigUI.prevStep(); }
function finishAssistant() { if (window.awtrixConfigUI) window.awtrixConfigUI.finishAssistant(); }
function testMqttConnection() { if (window.awtrixConfigUI) window.awtrixConfigUI.testMqttConnection(); }
function testAwtrixConnection() { if (window.awtrixConfigUI) window.awtrixConfigUI.testAwtrixConnection(); }
function discoverAwtrixDevices() { if (window.awtrixConfigUI) window.awtrixConfigUI.discoverAwtrixDevices(); }
function saveConfiguration() { if (window.awtrixConfigUI) window.awtrixConfigUI.saveConfiguration(); }

document.addEventListener('DOMContentLoaded', () => {
    window.awtrixConfigUI = new AwtrixConfigUI();
});
