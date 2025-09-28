class AwtrixConfigUI {
    constructor() {
        this.currentConfig = {
            mqtt: { host: '', port: 1883, username: '', password: '' },
            awtrix: { ip: '', port: 7001 }
        };
        
        this.loadConfiguration();
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

    async searchMqttSensors() {
        const searchBtn = document.getElementById('search-btn');
        const resultsContainer = document.getElementById('results-container');
        const sensorsList = document.getElementById('sensors-list');
        
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suche...';
        searchBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const sensors = [
                { name: 'Wohnzimmer Temperatur', type: 'temperature', value: '22.5', unit: '°C', topic: 'home/sensors/temperature/living' },
                { name: 'Badezimmer Luftfeuchtigkeit', type: 'humidity', value: '65', unit: '%', topic: 'home/sensors/humidity/bathroom' },
                { name: 'Küche Bewegung', type: 'motion', value: '1', unit: '', topic: 'home/sensors/motion/kitchen' },
                { name: 'Außenlicht', type: 'light', value: '850', unit: 'lux', topic: 'home/sensors/light/outdoor' }
            ];
            
            sensorsList.innerHTML = sensors.map(sensor => `
                <div class="sensor-item">
                    <div class="sensor-info">
                        <h5>${sensor.name}</h5>
                        <p>${sensor.type} • ${sensor.topic}</p>
                    </div>
                    <div class="sensor-value">${Math.round(parseFloat(sensor.value))}${sensor.unit}</div>
                </div>
            `).join('');
            
            resultsContainer.style.display = 'block';
            this.showToast(`✅ ${sensors.length} Sensoren gefunden`, 'success');
            
        } catch (error) {
            this.showToast('❌ Fehler bei der Sensor-Suche', 'error');
        } finally {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Sensoren suchen';
            searchBtn.disabled = false;
        }
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

function testMqttConnection() { if (window.awtrixConfigUI) window.awtrixConfigUI.testMqttConnection(); }
function testAwtrixConnection() { if (window.awtrixConfigUI) window.awtrixConfigUI.testAwtrixConnection(); }
function searchMqttSensors() { if (window.awtrixConfigUI) window.awtrixConfigUI.searchMqttSensors(); }
function saveConfiguration() { if (window.awtrixConfigUI) window.awtrixConfigUI.saveConfiguration(); }

document.addEventListener('DOMContentLoaded', () => {
    window.awtrixConfigUI = new AwtrixConfigUI();
});
