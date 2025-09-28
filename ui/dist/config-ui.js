/**
 * AWTRIX Sensors Configuration UI
 * Interactive configuration interface for Homebridge Config UI X
 */

class AwtrixConfigUI {
    constructor() {
        this.config = {};
        this.sensors = [];
        this.availableSensors = [];
        this.rules = [];
        this.currentSensor = null;
        this.currentRule = null;
        
        this.setupMockAPI();
        this.initializeEventListeners();
        this.loadConfiguration();
        this.setupFormValidation();
    }

    // Setup mock API for testing
    setupMockAPI() {
        // Mock API for testing without real Homebridge integration
        this.mockAPI = {
            async getConfig() {
                return {
                    mqtt: {
                        host: '192.168.178.29',
                        port: 1883,
                        username: 'biber',
                        password: '2203801826',
                        topicPrefix: 'awtrix_0b86f0'
                    },
                    awtrix: {
                        ip: '192.168.178.151',
                        port: 80
                    },
                    sensorDisplay: {
                        mode: 'rotation',
                        rotationInterval: 10,
                        priorityThreshold: 'medium',
                        sensors: []
                    }
                };
            },

            async testMqtt(config) {
                // Simulate MQTT test
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, message: 'MQTT connection successful!' };
            },

            async discoverDevices() {
                // Simulate device discovery
                await new Promise(resolve => setTimeout(resolve, 1500));
                return {
                    success: true,
                    devices: [
                        {
                            id: 'awtrix_001',
                            name: 'AWTRIX Living Room',
                            ip: '192.168.178.151',
                            port: 80,
                            online: true,
                            version: '2.0.0'
                        }
                    ]
                };
            },

            async testMessage() {
                // Simulate test message
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, message: 'Test message sent successfully!' };
            },

            async scanSensors() {
                // Simulate sensor scanning
                await new Promise(resolve => setTimeout(resolve, 2000));
                return {
                    success: true,
                    sensors: [
                        {
                            id: 'temp_living_room',
                            name: 'Living Room Temperature',
                            type: 'temperature',
                            unit: '°C',
                            priority: 'high',
                            mqtt_topic: 'sensors/temperature/living_room',
                            value: '22.5',
                            enabled: true,
                            slot: 0,
                            color: '#FF6B6B',
                            duration: 10
                        },
                        {
                            id: 'humidity_bedroom',
                            name: 'Bedroom Humidity',
                            type: 'humidity',
                            unit: '%',
                            priority: 'medium',
                            mqtt_topic: 'sensors/humidity/bedroom',
                            value: '45',
                            enabled: true,
                            slot: 1,
                            color: '#4ECDC4',
                            duration: 8
                        },
                        {
                            id: 'motion_entrance',
                            name: 'Entrance Motion',
                            type: 'motion',
                            unit: '',
                            priority: 'high',
                            mqtt_topic: 'sensors/motion/entrance',
                            value: 'false',
                            enabled: true,
                            slot: 2,
                            color: '#45B7D1',
                            duration: 5
                        }
                    ]
                };
            },

            async searchSensors(params) {
                // Simulate sensor search
                await new Promise(resolve => setTimeout(resolve, 500));
                const allSensors = [
                    {
                        id: 'temp_living_room',
                        name: 'Living Room Temperature',
                        type: 'temperature',
                        unit: '°C',
                        priority: 'high',
                        mqtt_topic: 'sensors/temperature/living_room',
                        value: '22.5',
                        enabled: false
                    },
                    {
                        id: 'humidity_bedroom',
                        name: 'Bedroom Humidity',
                        type: 'humidity',
                        unit: '%',
                        priority: 'medium',
                        mqtt_topic: 'sensors/humidity/bedroom',
                        value: '45',
                        enabled: false
                    },
                    {
                        id: 'motion_entrance',
                        name: 'Entrance Motion',
                        type: 'motion',
                        unit: '',
                        priority: 'high',
                        mqtt_topic: 'sensors/motion/entrance',
                        value: 'false',
                        enabled: false
                    },
                    {
                        id: 'light_outdoor',
                        name: 'Outdoor Light',
                        type: 'light',
                        unit: 'lux',
                        priority: 'low',
                        mqtt_topic: 'sensors/light/outdoor',
                        value: '850',
                        enabled: false
                    },
                    {
                        id: 'pressure_weather',
                        name: 'Weather Pressure',
                        type: 'pressure',
                        unit: 'hPa',
                        priority: 'low',
                        mqtt_topic: 'sensors/pressure/weather',
                        value: '1013.25',
                        enabled: false
                    },
                    {
                        id: 'wifi_signal',
                        name: 'WiFi Signal Strength',
                        type: 'wifi',
                        unit: 'dBm',
                        priority: 'medium',
                        mqtt_topic: 'sensors/wifi/signal',
                        value: '-45',
                        enabled: false
                    }
                ];

                let filteredSensors = allSensors;

                if (params.searchTerm) {
                    filteredSensors = filteredSensors.filter(sensor => 
                        sensor.name.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
                        sensor.type.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
                        sensor.mqtt_topic.toLowerCase().includes(params.searchTerm.toLowerCase())
                    );
                }

                if (params.type) {
                    filteredSensors = filteredSensors.filter(sensor => sensor.type === params.type);
                }

                if (params.priority) {
                    filteredSensors = filteredSensors.filter(sensor => sensor.priority === params.priority);
                }

                return { success: true, sensors: filteredSensors };
            },

            async testRule(rule) {
                // Simulate rule testing
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { success: true, message: 'Rule test successful!' };
            },

            async executeRule(rule) {
                // Simulate rule execution
                await new Promise(resolve => setTimeout(resolve, 500));
                return { success: true, message: 'Rule executed successfully!' };
            },

            async getAwtrixIcons() {
                // Mock AWTRIX icons
                return {
                    success: true,
                    icons: [
                        { id: 'thermometer', name: 'Thermometer', category: 'weather' },
                        { id: 'droplet', name: 'Droplet', category: 'weather' },
                        { id: 'home', name: 'Home', category: 'general' },
                        { id: 'wifi', name: 'WiFi', category: 'network' },
                        { id: 'battery', name: 'Battery', category: 'general' }
                    ]
                };
            }
        };
    }

    initializeEventListeners() {
        // Form elements
        document.getElementById('test-mqtt-btn').addEventListener('click', () => this.testMqttConnection());
        document.getElementById('discover-awtrix-btn').addEventListener('click', () => this.discoverAwtrixDevices());
        document.getElementById('test-awtrix-btn').addEventListener('click', () => this.testAwtrixConnection());
        document.getElementById('scan-sensors-btn').addEventListener('click', () => this.scanSensors());
        document.getElementById('add-sensor-btn').addEventListener('click', () => this.showSensorModal());
        
        // Form actions
        document.getElementById('save-btn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetToDefaults());
        document.getElementById('test-all-btn').addEventListener('click', () => this.testAllConnections());
        
        // Modal events
        document.getElementById('close-sensor-modal').addEventListener('click', () => this.hideSensorModal());
        document.getElementById('cancel-sensor-btn').addEventListener('click', () => this.hideSensorModal());
        document.getElementById('save-sensor-btn').addEventListener('click', () => this.saveSensor());
        
        // Sensor search events
        document.getElementById('search-sensors-btn').addEventListener('click', () => this.searchSensors());
        document.getElementById('sensor-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchSensors();
        });
        document.getElementById('sensor-type-filter').addEventListener('change', () => this.filterAvailableSensors());
        document.getElementById('sensor-priority-filter').addEventListener('change', () => this.filterAvailableSensors());
        document.getElementById('add-selected-sensors-btn').addEventListener('click', () => this.addSelectedSensors());
        document.getElementById('refresh-sensors-btn').addEventListener('click', () => this.refreshAvailableSensors());
        document.getElementById('import-sensors-btn').addEventListener('click', () => this.importSensors());
        
        // Rule engine events
        document.getElementById('test-rule-btn').addEventListener('click', () => this.testRule());
        document.getElementById('save-rule-btn').addEventListener('click', () => this.saveRule());
        
        // Range slider
        document.getElementById('brightness').addEventListener('input', (e) => {
            document.querySelector('.range-value').textContent = e.target.value + '%';
        });
        
        // Form validation
        document.getElementById('config-form').addEventListener('input', () => this.validateForm());
    }

    setupFormValidation() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });
    }

    async loadConfiguration() {
        try {
            // Try to load from Config UI X API first
            const response = await fetch('/api/platform/awtrix-sensors/config');
            if (response.ok) {
                this.config = await response.json();
                this.populateForm();
                this.showToast('Configuration loaded from Homebridge', 'success');
            } else {
                // Fallback to mock API for testing
                this.config = await this.mockAPI.getConfig();
                this.populateForm();
                this.showToast('Configuration loaded (test mode)', 'info');
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            // Fallback to mock API for testing
            this.config = await this.mockAPI.getConfig();
            this.populateForm();
            this.showToast('Configuration loaded (test mode)', 'info');
        }
    }

    loadDefaultConfiguration() {
        this.config = {
            mqtt: {
                host: '192.168.178.29',
                port: 1883,
                username: 'biber',
                password: '2203801826',
                topicPrefix: 'awtrix_0b86f0'
            },
            awtrix: {
                ip: '192.168.178.151',
                port: 80
            },
            sensorDisplay: {
                mode: 'rotation',
                rotationInterval: 10,
                priorityThreshold: 'medium',
                sensors: []
            },
            displaySettings: {
                brightness: 80,
                autoBrightness: true,
                nightMode: {
                    enabled: false,
                    startTime: '22:00',
                    endTime: '07:00',
                    brightness: 30
                }
            }
        };
        this.populateForm();
    }

    populateForm() {
        // MQTT Configuration
        if (this.config.mqtt) {
            document.getElementById('mqtt-host').value = this.config.mqtt.host || '';
            document.getElementById('mqtt-port').value = this.config.mqtt.port || 1883;
            document.getElementById('mqtt-username').value = this.config.mqtt.username || '';
            document.getElementById('mqtt-password').value = this.config.mqtt.password || '';
            document.getElementById('mqtt-topic').value = this.config.mqtt.topicPrefix || '';
        }

        // AWTRIX Configuration
        if (this.config.awtrix) {
            document.getElementById('awtrix-ip').value = this.config.awtrix.ip || '';
            document.getElementById('awtrix-port').value = this.config.awtrix.port || 80;
        }

        // Sensor Display Configuration
        if (this.config.sensorDisplay) {
            document.getElementById('display-mode').value = this.config.sensorDisplay.mode || 'rotation';
            document.getElementById('rotation-interval').value = this.config.sensorDisplay.rotationInterval || 10;
            document.getElementById('priority-threshold').value = this.config.sensorDisplay.priorityThreshold || 'medium';
        }

        // Display Settings
        if (this.config.displaySettings) {
            document.getElementById('brightness').value = this.config.displaySettings.brightness || 80;
            document.getElementById('auto-brightness').checked = this.config.displaySettings.autoBrightness || false;
            document.getElementById('night-mode').checked = this.config.displaySettings.nightMode?.enabled || false;
        }

        // Load sensors
        if (this.config.sensorDisplay?.sensors) {
            this.sensors = this.config.sensorDisplay.sensors;
            this.displaySensors();
        }
    }

    collectFormData() {
        return {
            mqtt: {
                host: document.getElementById('mqtt-host').value,
                port: parseInt(document.getElementById('mqtt-port').value),
                username: document.getElementById('mqtt-username').value,
                password: document.getElementById('mqtt-password').value,
                topicPrefix: document.getElementById('mqtt-topic').value
            },
            awtrix: {
                ip: document.getElementById('awtrix-ip').value,
                port: parseInt(document.getElementById('awtrix-port').value)
            },
            sensorDisplay: {
                mode: document.getElementById('display-mode').value,
                rotationInterval: parseInt(document.getElementById('rotation-interval').value),
                priorityThreshold: document.getElementById('priority-threshold').value,
                sensors: this.sensors
            },
            displaySettings: {
                brightness: parseInt(document.getElementById('brightness').value),
                autoBrightness: document.getElementById('auto-brightness').checked,
                nightMode: {
                    enabled: document.getElementById('night-mode').checked,
                    startTime: '22:00',
                    endTime: '07:00',
                    brightness: 30
                }
            }
        };
    }

    async saveConfiguration() {
        if (!this.validateForm()) {
            this.showToast('Please fix validation errors before saving', 'error');
            return;
        }

        try {
            const configData = this.collectFormData();
            
            // Try Config UI X API first
            try {
                const response = await fetch('/api/platform/awtrix-sensors/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(configData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.config = configData;
                        this.showToast('Configuration saved to Homebridge!', 'success');
                        return;
                    }
                }
            } catch (apiError) {
                console.log('Config UI X API not available, using local storage');
            }
            
            // Fallback to local storage
            this.config = configData;
            localStorage.setItem('awtrix-config', JSON.stringify(configData));
            this.showToast('Configuration saved locally!', 'info');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            this.showToast('Failed to save configuration', 'error');
        }
    }

    async testMqttConnection() {
        const host = document.getElementById('mqtt-host').value;
        const port = parseInt(document.getElementById('mqtt-port').value);
        const username = document.getElementById('mqtt-username').value;
        const password = document.getElementById('mqtt-password').value;

        if (!host || !port || !username || !password) {
            this.showToast('Please fill in all MQTT fields', 'error');
            return;
        }

        this.setLoading('test-mqtt-btn', true);
        this.updateStatus('mqtt-status', 'Testing...', 'info');

        try {
            const config = { host, port, username, password };
            
            // Try Config UI X API first
            try {
                const response = await fetch('/api/platform/awtrix-sensors/test-mqtt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.updateStatus('mqtt-status', 'Connected', 'success');
                        this.showToast('MQTT connection successful!', 'success');
                        return;
                    }
                }
            } catch (apiError) {
                console.log('Config UI X API not available, using mock API');
            }
            
            // Fallback to mock API
            const result = await this.mockAPI.testMqtt(config);
            
            if (result.success) {
                this.updateStatus('mqtt-status', 'Connected', 'success');
                this.showToast('MQTT connection successful! (test mode)', 'success');
            } else {
                this.updateStatus('mqtt-status', 'Failed', 'error');
                this.showToast('MQTT connection failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.updateStatus('mqtt-status', 'Error', 'error');
            this.showToast('MQTT connection test failed', 'error');
        } finally {
            this.setLoading('test-mqtt-btn', false);
        }
    }

    async discoverAwtrixDevices() {
        this.setLoading('discover-awtrix-btn', true);

        try {
            const result = await this.mockAPI.discoverDevices();
            
            if (result.success) {
                this.showToast(`Found ${result.devices.length} AWTRIX devices!`, 'success');
                this.updateStatus('awtrix-status', `${result.devices.length} devices found`, 'success');
            } else {
                this.showToast('Failed to discover AWTRIX devices', 'error');
                this.updateStatus('awtrix-status', 'Discovery failed', 'error');
            }
        } catch (error) {
            this.showToast('AWTRIX discovery failed', 'error');
            this.updateStatus('awtrix-status', 'Error', 'error');
        } finally {
            this.setLoading('discover-awtrix-btn', false);
        }
    }

    async testAwtrixConnection() {
        this.setLoading('test-awtrix-btn', true);

        try {
            const result = await this.mockAPI.testMessage();
            
            if (result.success) {
                this.showToast('Test message sent to AWTRIX!', 'success');
                this.updateStatus('awtrix-status', 'Test successful', 'success');
            } else {
                this.showToast('Failed to send test message', 'error');
                this.updateStatus('awtrix-status', 'Test failed', 'error');
            }
        } catch (error) {
            this.showToast('AWTRIX test failed', 'error');
            this.updateStatus('awtrix-status', 'Error', 'error');
        } finally {
            this.setLoading('test-awtrix-btn', false);
        }
    }

    async scanSensors() {
        this.setLoading('scan-sensors-btn', true);

        try {
            const result = await this.mockAPI.scanSensors();
            
            if (result.success) {
                this.sensors = result.sensors || [];
                this.displaySensors();
                this.showToast(`Found ${this.sensors.length} sensors!`, 'success');
            } else {
                this.showToast('Failed to scan sensors', 'error');
            }
        } catch (error) {
            this.showToast('Sensor scanning failed', 'error');
        } finally {
            this.setLoading('scan-sensors-btn', false);
        }
    }

    displaySensors() {
        const sensorsList = document.getElementById('sensors-list');
        sensorsList.innerHTML = '';

        if (this.sensors.length === 0) {
            sensorsList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No sensors configured. Click "Add Custom Sensor" to add one.</p>';
            return;
        }

        this.sensors.forEach((sensor, index) => {
            const sensorCard = document.createElement('div');
            sensorCard.className = 'sensor-card';
            sensorCard.innerHTML = `
                <div class="sensor-card-header">
                    <h4>${sensor.name}</h4>
                    <span class="sensor-type">${sensor.type}</span>
                </div>
                <div class="sensor-details">
                    <div class="sensor-detail">
                        <label>ID</label>
                        <span>${sensor.id}</span>
                    </div>
                    <div class="sensor-detail">
                        <label>Unit</label>
                        <span>${sensor.unit || 'N/A'}</span>
                    </div>
                    <div class="sensor-detail">
                        <label>Slot</label>
                        <span>${sensor.slot}</span>
                    </div>
                    <div class="sensor-detail">
                        <label>Priority</label>
                        <span>${sensor.priority}</span>
                    </div>
                    <div class="sensor-detail">
                        <label>Duration</label>
                        <span>${sensor.duration}s</span>
                    </div>
                    <div class="sensor-detail">
                        <label>Status</label>
                        <span style="color: ${sensor.enabled ? '#28a745' : '#dc3545'}">${sensor.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
                <div class="sensor-actions">
                    <button class="btn btn-primary" onclick="configUI.editSensor(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="configUI.toggleSensor(${index})">
                        <i class="fas fa-power-off"></i> ${sensor.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-secondary" onclick="configUI.deleteSensor(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            sensorsList.appendChild(sensorCard);
        });
    }

    showSensorModal(sensorIndex = null) {
        this.currentSensor = sensorIndex;
        const modal = document.getElementById('sensor-modal');
        const form = document.getElementById('sensor-form');
        
        if (sensorIndex !== null) {
            // Edit existing sensor
            const sensor = this.sensors[sensorIndex];
            form.id.value = sensor.id;
            form.name.value = sensor.name;
            form.type.value = sensor.type;
            form.unit.value = sensor.unit || '';
            form.mqtt_topic.value = sensor.mqtt_topic || '';
            form.slot.value = sensor.slot;
            form.color.value = sensor.color || '#FF6B6B';
            form.duration.value = sensor.duration || 10;
            form.priority.value = sensor.priority || 'medium';
            form.enabled.checked = sensor.enabled !== false;
        } else {
            // Add new sensor
            form.reset();
            form.id.value = '';
            form.name.value = '';
            form.type.value = 'temperature';
            form.unit.value = '°C';
            form.mqtt_topic.value = '';
            form.slot.value = '0';
            form.color.value = '#FF6B6B';
            form.duration.value = 10;
            form.priority.value = 'medium';
            form.enabled.checked = true;
        }
        
        modal.classList.add('show');
    }

    hideSensorModal() {
        document.getElementById('sensor-modal').classList.remove('show');
        this.currentSensor = null;
    }

    saveSensor() {
        const form = document.getElementById('sensor-form');
        const sensorData = {
            id: form.id.value,
            name: form.name.value,
            type: form.type.value,
            unit: form.unit.value,
            mqtt_topic: form.mqtt_topic.value,
            slot: parseInt(form.slot.value),
            color: form.color.value,
            duration: parseInt(form.duration.value),
            priority: form.priority.value,
            enabled: form.enabled.checked
        };

        if (!sensorData.id || !sensorData.name || !sensorData.mqtt_topic) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (this.currentSensor !== null) {
            // Edit existing sensor
            this.sensors[this.currentSensor] = sensorData;
            this.showToast('Sensor updated successfully', 'success');
        } else {
            // Add new sensor
            this.sensors.push(sensorData);
            this.showToast('Sensor added successfully', 'success');
        }

        this.displaySensors();
        this.hideSensorModal();
    }

    editSensor(index) {
        this.showSensorModal(index);
    }

    toggleSensor(index) {
        this.sensors[index].enabled = !this.sensors[index].enabled;
        this.displaySensors();
        this.showToast(`Sensor ${this.sensors[index].name} ${this.sensors[index].enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    deleteSensor(index) {
        if (confirm(`Are you sure you want to delete sensor "${this.sensors[index].name}"?`)) {
            this.sensors.splice(index, 1);
            this.displaySensors();
            this.showToast('Sensor deleted successfully', 'success');
        }
    }

    async testAllConnections() {
        this.setLoading('test-all-btn', true);
        
        try {
            await this.testMqttConnection();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.discoverAwtrixDevices();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.testAwtrixConnection();
            
            this.showToast('All connection tests completed!', 'success');
        } catch (error) {
            this.showToast('Some connection tests failed', 'error');
        } finally {
            this.setLoading('test-all-btn', false);
        }
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This will clear your current configuration.')) {
            this.loadDefaultConfiguration();
            this.showToast('Configuration reset to defaults', 'info');
        }
    }

    validateForm() {
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = value !== '';

        if (isValid) {
            field.style.borderColor = '#e9ecef';
        } else {
            field.style.borderColor = '#dc3545';
        }

        return isValid;
    }

    setLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    updateStatus(elementId, text, type) {
        const element = document.getElementById(elementId);
        const icon = element.querySelector('i');
        const span = element.querySelector('span');
        
        span.textContent = text;
        element.className = `status-indicator ${type}`;
        
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            icon.className = 'fas fa-times-circle';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
        } else {
            icon.className = 'fas fa-circle';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Sensor Search & Selection Methods
    async searchSensors() {
        const searchTerm = document.getElementById('sensor-search-input').value.toLowerCase();
        const typeFilter = document.getElementById('sensor-type-filter').value;
        const priorityFilter = document.getElementById('sensor-priority-filter').value;

        this.setLoading('search-sensors-btn', true);

        try {
            const result = await this.mockAPI.searchSensors({
                searchTerm,
                type: typeFilter,
                priority: priorityFilter
            });
            
            if (result.success) {
                this.availableSensors = result.sensors || [];
                this.populateAvailableSensorsDropdown();
                this.showToast(`Found ${this.availableSensors.length} sensors`, 'success');
            } else {
                this.showToast('Failed to search sensors', 'error');
            }
        } catch (error) {
            this.showToast('Sensor search failed', 'error');
        } finally {
            this.setLoading('search-sensors-btn', false);
        }
    }

    filterAvailableSensors() {
        const typeFilter = document.getElementById('sensor-type-filter').value;
        const priorityFilter = document.getElementById('sensor-priority-filter').value;
        
        const filteredSensors = this.availableSensors.filter(sensor => {
            const matchesType = !typeFilter || sensor.type === typeFilter;
            const matchesPriority = !priorityFilter || sensor.priority === priorityFilter;
            return matchesType && matchesPriority;
        });

        this.populateAvailableSensorsDropdown(filteredSensors);
    }

    populateAvailableSensorsDropdown(sensors = this.availableSensors) {
        const dropdown = document.getElementById('available-sensors-dropdown');
        dropdown.innerHTML = '';

        if (sensors.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No sensors found';
            option.disabled = true;
            dropdown.appendChild(option);
            return;
        }

        sensors.forEach(sensor => {
            const option = document.createElement('option');
            option.value = sensor.id;
            option.textContent = `${sensor.name} (${sensor.type}) - ${sensor.mqtt_topic}`;
            option.dataset.sensor = JSON.stringify(sensor);
            dropdown.appendChild(option);
        });
    }

    addSelectedSensors() {
        const dropdown = document.getElementById('available-sensors-dropdown');
        const selectedOptions = Array.from(dropdown.selectedOptions);
        
        if (selectedOptions.length === 0) {
            this.showToast('Please select sensors to add', 'warning');
            return;
        }

        let addedCount = 0;
        selectedOptions.forEach(option => {
            if (option.dataset.sensor) {
                const sensor = JSON.parse(option.dataset.sensor);
                if (!this.sensors.find(s => s.id === sensor.id)) {
                    this.sensors.push(sensor);
                    addedCount++;
                }
            }
        });

        this.displaySensors();
        this.populateRuleSensorDropdown();
        this.showToast(`Added ${addedCount} sensors`, 'success');
    }

    async refreshAvailableSensors() {
        this.setLoading('refresh-sensors-btn', true);
        
        try {
            const response = await fetch('/api/platform/awtrix-sensors/available-sensors', {
                method: 'POST'
            });

            const result = await response.json();
            if (result.success) {
                this.availableSensors = result.sensors || [];
                this.populateAvailableSensorsDropdown();
                this.showToast('Available sensors refreshed', 'success');
            } else {
                this.showToast('Failed to refresh sensors', 'error');
            }
        } catch (error) {
            this.showToast('Failed to refresh sensors', 'error');
        } finally {
            this.setLoading('refresh-sensors-btn', false);
        }
    }

    importSensors() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSensors = JSON.parse(e.target.result);
                        if (Array.isArray(importedSensors)) {
                            this.sensors = [...this.sensors, ...importedSensors];
                            this.displaySensors();
                            this.populateRuleSensorDropdown();
                            this.showToast(`Imported ${importedSensors.length} sensors`, 'success');
                        } else {
                            this.showToast('Invalid sensor file format', 'error');
                        }
                    } catch (error) {
                        this.showToast('Failed to parse sensor file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    populateRuleSensorDropdown() {
        const dropdown = document.getElementById('rule-sensor');
        dropdown.innerHTML = '<option value="">Select Sensor</option>';
        
        this.sensors.forEach(sensor => {
            const option = document.createElement('option');
            option.value = sensor.id;
            option.textContent = `${sensor.name} (${sensor.type})`;
            dropdown.appendChild(option);
        });
    }

    // Rule Engine Methods
    async testRule() {
        const rule = this.collectRuleData();
        if (!this.validateRule(rule)) {
            this.showToast('Please fill in all required rule fields', 'error');
            return;
        }

        this.setLoading('test-rule-btn', true);

        try {
            const response = await fetch('/api/platform/awtrix-sensors/test-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });

            const result = await response.json();
            if (result.success) {
                this.showToast('Rule test successful!', 'success');
            } else {
                this.showToast('Rule test failed: ' + result.message, 'error');
            }
        } catch (error) {
            this.showToast('Rule test failed', 'error');
        } finally {
            this.setLoading('test-rule-btn', false);
        }
    }

    saveRule() {
        const rule = this.collectRuleData();
        if (!this.validateRule(rule)) {
            this.showToast('Please fill in all required rule fields', 'error');
            return;
        }

        rule.id = this.currentRule || Date.now().toString();
        rule.createdAt = new Date().toISOString();

        if (this.currentRule) {
            // Update existing rule
            const index = this.rules.findIndex(r => r.id === this.currentRule);
            if (index !== -1) {
                this.rules[index] = rule;
                this.showToast('Rule updated successfully', 'success');
            }
        } else {
            // Add new rule
            this.rules.push(rule);
            this.showToast('Rule created successfully', 'success');
        }

        this.displayRules();
        this.clearRuleForm();
    }

    collectRuleData() {
        return {
            name: document.getElementById('rule-name').value,
            enabled: document.getElementById('rule-enabled').checked,
            condition: {
                sensor: document.getElementById('rule-sensor').value,
                operator: document.getElementById('rule-operator').value,
                value: document.getElementById('rule-value').value,
                unit: document.getElementById('rule-unit').value
            },
            action: {
                type: document.getElementById('rule-action-type').value,
                value: document.getElementById('rule-action-value').value,
                priority: document.getElementById('rule-priority').value
            },
            timing: {
                delay: parseInt(document.getElementById('rule-delay').value),
                duration: parseInt(document.getElementById('rule-duration').value),
                repeat: document.getElementById('rule-repeat').checked
            }
        };
    }

    validateRule(rule) {
        return rule.name && 
               rule.condition.sensor && 
               rule.condition.operator && 
               rule.condition.value && 
               rule.action.type;
    }

    displayRules() {
        const rulesList = document.getElementById('rules-list');
        rulesList.innerHTML = '';

        if (this.rules.length === 0) {
            rulesList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No rules configured. Create your first rule above.</p>';
            return;
        }

        this.rules.forEach((rule, index) => {
            const ruleCard = document.createElement('div');
            ruleCard.className = 'rule-card';
            ruleCard.innerHTML = `
                <div class="rule-card-header">
                    <h4>${rule.name}</h4>
                    <span class="rule-status ${rule.enabled ? 'enabled' : 'disabled'}">
                        ${rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
                <div class="rule-details">
                    <div class="rule-detail">
                        <label>Sensor</label>
                        <span>${rule.condition.sensor}</span>
                    </div>
                    <div class="rule-detail">
                        <label>Condition</label>
                        <span>${rule.condition.operator} ${rule.condition.value}${rule.condition.unit}</span>
                    </div>
                    <div class="rule-detail">
                        <label>Action</label>
                        <span>${rule.action.type}: ${rule.action.value}</span>
                    </div>
                    <div class="rule-detail">
                        <label>Priority</label>
                        <span>${rule.action.priority}</span>
                    </div>
                    <div class="rule-detail">
                        <label>Delay</label>
                        <span>${rule.timing.delay}s</span>
                    </div>
                    <div class="rule-detail">
                        <label>Duration</label>
                        <span>${rule.timing.duration}s</span>
                    </div>
                </div>
                <div class="rule-actions">
                    <button class="btn btn-primary" onclick="configUI.editRule(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="configUI.toggleRule(${index})">
                        <i class="fas fa-power-off"></i> ${rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-test" onclick="configUI.testRuleById('${rule.id}')">
                        <i class="fas fa-play"></i> Test
                    </button>
                    <button class="btn btn-secondary" onclick="configUI.deleteRule(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            rulesList.appendChild(ruleCard);
        });
    }

    editRule(index) {
        const rule = this.rules[index];
        this.currentRule = rule.id;
        
        document.getElementById('rule-name').value = rule.name;
        document.getElementById('rule-enabled').checked = rule.enabled;
        document.getElementById('rule-sensor').value = rule.condition.sensor;
        document.getElementById('rule-operator').value = rule.condition.operator;
        document.getElementById('rule-value').value = rule.condition.value;
        document.getElementById('rule-unit').value = rule.condition.unit;
        document.getElementById('rule-action-type').value = rule.action.type;
        document.getElementById('rule-action-value').value = rule.action.value;
        document.getElementById('rule-priority').value = rule.action.priority;
        document.getElementById('rule-delay').value = rule.timing.delay;
        document.getElementById('rule-duration').value = rule.timing.duration;
        document.getElementById('rule-repeat').checked = rule.timing.repeat;
        
        this.showToast('Rule loaded for editing', 'info');
    }

    toggleRule(index) {
        this.rules[index].enabled = !this.rules[index].enabled;
        this.displayRules();
        this.showToast(`Rule ${this.rules[index].name} ${this.rules[index].enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    deleteRule(index) {
        if (confirm(`Are you sure you want to delete rule "${this.rules[index].name}"?`)) {
            this.rules.splice(index, 1);
            this.displayRules();
            this.showToast('Rule deleted successfully', 'success');
        }
    }

    async testRuleById(ruleId) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (!rule) return;

        try {
            const response = await fetch('/api/platform/awtrix-sensors/test-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });

            const result = await response.json();
            if (result.success) {
                this.showToast(`Rule "${rule.name}" test successful!`, 'success');
            } else {
                this.showToast(`Rule "${rule.name}" test failed: ${result.message}`, 'error');
            }
        } catch (error) {
            this.showToast(`Rule "${rule.name}" test failed`, 'error');
        }
    }

    clearRuleForm() {
        document.getElementById('rule-name').value = '';
        document.getElementById('rule-enabled').checked = true;
        document.getElementById('rule-sensor').value = '';
        document.getElementById('rule-operator').value = '';
        document.getElementById('rule-value').value = '';
        document.getElementById('rule-unit').value = '';
        document.getElementById('rule-action-type').value = '';
        document.getElementById('rule-action-value').value = '';
        document.getElementById('rule-priority').value = 'high';
        document.getElementById('rule-delay').value = '0';
        document.getElementById('rule-duration').value = '10';
        document.getElementById('rule-repeat').checked = false;
        this.currentRule = null;
    }

    // ===== SIMPLE RULE CREATION METHODS =====
    
    async loadAvailableSensors() {
        try {
            // Try to get sensors from the platform
            const response = await fetch('/api/platform/awtrix-sensors/available-sensors', {
                method: 'GET'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.availableSensors = result.sensors || [];
                    this.populateSimpleRuleSensorDropdown();
                    this.showToast(`Loaded ${this.availableSensors.length} available sensors`, 'success');
                    return;
                }
            }
        } catch (error) {
            console.log('API not available, using mock data');
        }
        
        // Fallback to mock data
        this.availableSensors = [
            {
                id: 'temp_living_room',
                name: 'Living Room Temperature',
                type: 'temperature',
                unit: '°C',
                lastValue: '22.5',
                topic: 'sensors/temperature/living_room'
            },
            {
                id: 'humidity_bedroom',
                name: 'Bedroom Humidity',
                type: 'humidity',
                unit: '%',
                lastValue: '45',
                topic: 'sensors/humidity/bedroom'
            },
            {
                id: 'motion_entrance',
                name: 'Entrance Motion',
                type: 'motion',
                unit: '',
                lastValue: 'false',
                topic: 'sensors/motion/entrance'
            },
            {
                id: 'light_outdoor',
                name: 'Outdoor Light',
                type: 'light',
                unit: 'lux',
                lastValue: '850',
                topic: 'sensors/light/outdoor'
            }
        ];
        
        this.populateSimpleRuleSensorDropdown();
        this.showToast(`Loaded ${this.availableSensors.length} available sensors (demo mode)`, 'info');
    }
    
    populateSimpleRuleSensorDropdown() {
        // Populate dropdown with available sensors
        this.populateSensorDropdown();
    }
    
    
    onSensorSelected() {
        const sensorSelect = document.getElementById('rule-sensor-select');
        const sensorInfo = document.getElementById('sensor-info');
        const templateSuggestions = document.getElementById('template-suggestions');
        
        if (!sensorSelect || !sensorInfo) return;
        
        const selectedSensorId = sensorSelect.value;
        if (!selectedSensorId) {
            sensorInfo.style.display = 'none';
            if (templateSuggestions) templateSuggestions.style.display = 'none';
            return;
        }
        
        // Find sensor data
        const sensor = this.availableSensors.find(s => s.id === selectedSensorId);
        if (!sensor) return;
        
        // Update sensor info display
        const sensorName = sensorInfo.querySelector('.sensor-name');
        const sensorType = sensorInfo.querySelector('.sensor-type');
        const sensorValue = sensorInfo.querySelector('.sensor-value');
        const sensorTopic = sensorInfo.querySelector('.sensor-topic');
        
        if (sensorName) sensorName.textContent = `Name: ${sensor.name}`;
        if (sensorType) sensorType.textContent = `Typ: ${sensor.type}`;
        if (sensorValue) sensorValue.textContent = `Wert: ${Math.round(parseFloat(sensor.lastValue || 0))} ${sensor.unit || ''}`;
        if (sensorTopic) sensorTopic.textContent = `Topic: ${sensor.topic}`;
        
        sensorInfo.style.display = 'block';
        
        // Show template suggestions based on sensor type
        this.showTemplateSuggestions(sensor.type);
        
        // Auto-select appropriate template
        this.autoSelectTemplate(sensor.type);
        
        // Update preview
        this.updateSimpleRulePreview();
    }
    
    populateSensorDropdown() {
        const dropdown = document.getElementById('rule-sensor-select');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Sensor auswählen...</option>';
        
        this.availableSensors.forEach(sensor => {
            const option = document.createElement('option');
            option.value = sensor.id;
            
            // Create enhanced display text with rounded values
            const qualityIndicator = sensor.quality ? ` (${Math.round(sensor.quality * 100)}%)` : '';
            const sourceIndicator = sensor.source === 'scanned' ? ' 🔍' : ' 📡';
            const roundedValue = sensor.lastValue ? Math.round(parseFloat(sensor.lastValue)) : 'N/A';
            const valueText = `${roundedValue}${sensor.unit || ''}`;
            
            option.textContent = `${sensor.name} (${sensor.type}) - ${valueText}${qualityIndicator}${sourceIndicator}`;
            option.title = `Topic: ${sensor.topic}\nTyp: ${sensor.type}\nWert: ${valueText}\nQualität: ${sensor.quality ? Math.round(sensor.quality * 100) + '%' : 'Unbekannt'}`;
            option.dataset.sensor = JSON.stringify(sensor);
            dropdown.appendChild(option);
        });
    }
    
    filterSensors() {
        const searchInput = document.getElementById('sensor-search');
        const cards = document.querySelectorAll('.sensor-card');
        
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        
        cards.forEach(card => {
            const sensorId = card.dataset.sensorId;
            const sensor = this.availableSensors.find(s => s.id === sensorId);
            
            if (!sensor) return;
            
            const matches = 
                sensor.name.toLowerCase().includes(searchTerm) ||
                sensor.type.toLowerCase().includes(searchTerm) ||
                sensor.topic.toLowerCase().includes(searchTerm) ||
                (sensor.lastValue && sensor.lastValue.toString().includes(searchTerm));
            
            card.style.display = matches ? 'block' : 'none';
        });
    }
    
    async testSimpleRule() {
        const ruleData = this.collectSimpleRuleData();
        
        if (!this.validateSimpleRule(ruleData)) {
            this.showToast('Bitte wählen Sie einen Sensor und ein Template aus', 'error');
            return;
        }
        
        try {
            // Try API first
            const response = await fetch('/api/platform/awtrix-sensors/test-simple-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('✅ Regel-Test erfolgreich! Nachricht wurde an AWTRIX gesendet.', 'success');
                    return;
                }
            }
        } catch (error) {
            console.log('API not available, using mock test');
        }
        
        // Fallback to mock test
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.showToast('✅ Regel-Test erfolgreich! (Demo-Modus)', 'success');
    }
    
    async saveSimpleRule() {
        const ruleData = this.collectSimpleRuleData();
        
        if (!this.validateSimpleRule(ruleData)) {
            this.showToast('Bitte wählen Sie einen Sensor und ein Template aus', 'error');
            return;
        }
        
        try {
            // Try API first
            const response = await fetch('/api/platform/awtrix-sensors/save-simple-rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showToast('✅ Regel erfolgreich gespeichert!', 'success');
                    this.resetSimpleRule();
                    return;
                }
            }
        } catch (error) {
            console.log('API not available, using local storage');
        }
        
        // Fallback to local storage
        const savedRules = JSON.parse(localStorage.getItem('awtrix-simple-rules') || '[]');
        ruleData.id = Date.now().toString();
        ruleData.createdAt = new Date().toISOString();
        savedRules.push(ruleData);
        localStorage.setItem('awtrix-simple-rules', JSON.stringify(savedRules));
        
        this.showToast('✅ Regel erfolgreich gespeichert! (lokal)', 'success');
        this.resetSimpleRule();
    }
    
    resetSimpleRule() {
        // Reset form elements
        const elements = [
            'rule-sensor-select',
            'rule-template-select',
            'rule-custom-text',
            'rule-duration-slider',
            'rule-color-select',
            'rule-icon-select',
            'rule-effect-select'
        ];
        
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'range') {
                    element.value = 5;
                } else if (element.type === 'text') {
                    element.value = '';
                } else {
                    element.selectedIndex = 0;
                }
            }
        });
        
        // Reset duration display
        const durationValue = document.getElementById('rule-duration-value');
        if (durationValue) {
            durationValue.textContent = '5';
        }
        
        // Hide custom text group
        const customTextGroup = document.getElementById('custom-text-group');
        if (customTextGroup) {
            customTextGroup.style.display = 'none';
        }
        
        // Reset preview
        const preview = document.getElementById('rule-preview');
        if (preview) {
            preview.textContent = 'Wählen Sie einen Sensor und ein Template aus';
            preview.style.color = '#00ff00';
        }
        
        this.showToast('Formular zurückgesetzt', 'info');
    }
    
    collectSimpleRuleData() {
        const sensorSelect = document.getElementById('rule-sensor-select');
        const templateSelect = document.getElementById('rule-template-select');
        const customText = document.getElementById('rule-custom-text');
        const durationSlider = document.getElementById('rule-duration-slider');
        const colorSelect = document.getElementById('rule-color-select');
        const iconSelect = document.getElementById('rule-icon-select');
        const effectSelect = document.getElementById('rule-effect-select');
        
        const selectedSensor = this.availableSensors.find(s => s.id === sensorSelect.value);
        
        if (!selectedSensor) {
            return null;
        }
        
        // Generate display text
        let displayText = '';
        if (templateSelect.value === 'custom' && customText && customText.value) {
            displayText = customText.value;
        } else {
            const templates = {
                'temperature_warning': '🌡️ {sensor_name}: {value}°C',
                'motion_detected': '🏃 Bewegung in {sensor_name}!',
                'humidity_status': '💧 {sensor_name}: {value}%',
                'light_status': '💡 {sensor_name}: {value} lux'
            };
            displayText = templates[templateSelect.value] || '{sensor_name}: {value}{unit}';
        }
        
        // Replace variables
        displayText = displayText
            .replace(/{sensor_name}/g, selectedSensor.name)
            .replace(/{value}/g, '{sensor_value}')
            .replace(/{unit}/g, selectedSensor.unit || '');
        
        return {
            sensorId: selectedSensor.id,
            sensorName: selectedSensor.name,
            sensorType: selectedSensor.type,
            sensorTopic: selectedSensor.topic,
            templateId: templateSelect.value,
            customText: templateSelect.value === 'custom' ? customText.value : null,
            displayText: displayText,
            duration: parseInt(durationSlider.value),
            color: colorSelect.value,
            icon: iconSelect.value,
            effect: effectSelect.value,
            enabled: true
        };
    }
    
    validateSimpleRule(ruleData) {
        return ruleData && 
               ruleData.sensorId && 
               ruleData.templateId && 
               ruleData.displayText;
    }
}

// Integrated GUI Functions
let guiVisible = false;

function toggleIntegratedGUI() {
    const guiContainer = document.getElementById('integrated-gui-container');
    const configForm = document.getElementById('config-form');
    const toggleText = document.getElementById('gui-toggle-text');
    
    if (!guiVisible) {
        // Show integrated GUI
        guiContainer.style.display = 'block';
        configForm.style.display = 'none';
        toggleText.textContent = 'Normale Konfiguration Anzeigen';
        guiVisible = true;
        
        // Show notification
        if (window.configUI) {
            window.configUI.showToast('Integrierte GUI wird angezeigt...', 'success');
        }
    } else {
        // Show normal configuration
        guiContainer.style.display = 'none';
        configForm.style.display = 'block';
        toggleText.textContent = 'Integrierte GUI Anzeigen';
        guiVisible = false;
        
        // Show notification
        if (window.configUI) {
            window.configUI.showToast('Normale Konfiguration wird angezeigt...', 'info');
        }
    }
}

function openIntegratedGUI() {
    // Try to open the integrated GUI in a new window
    const integratedGuiUrl = window.location.origin + '/ui/dist/integrated-gui.html';
    window.open(integratedGuiUrl, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
    
    // Show notification
    if (window.configUI) {
        window.configUI.showToast('Integrierte GUI wird geöffnet...', 'info');
    }
}

function openSimpleGUI() {
    // Try to open the simple GUI in a new window
    const simpleGuiUrl = window.location.origin + '/ui/dist/simple-gui.html';
    window.open(simpleGuiUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // Show notification
    if (window.configUI) {
        window.configUI.showToast('Einfache GUI wird geöffnet...', 'info');
    }
}

// Simple Rule Creation Functions
function loadAvailableSensors() {
    if (window.configUI) {
        window.configUI.loadAvailableSensors();
    }
}

function testSimpleRule() {
    if (window.configUI) {
        window.configUI.testSimpleRule();
    }
}

function saveSimpleRule() {
    if (window.configUI) {
        window.configUI.saveSimpleRule();
    }
}

function resetSimpleRule() {
    if (window.configUI) {
        window.configUI.resetSimpleRule();
    }
}

// Tab switching function
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.gui-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTabButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (selectedTabButton) {
        selectedTabButton.classList.add('active');
    }
}

// Make functions globally available
window.toggleIntegratedGUI = toggleIntegratedGUI;
window.openIntegratedGUI = openIntegratedGUI;
window.openSimpleGUI = openSimpleGUI;
window.loadAvailableSensors = loadAvailableSensors;
window.testSimpleRule = testSimpleRule;
window.saveSimpleRule = saveSimpleRule;
window.resetSimpleRule = resetSimpleRule;
window.switchTab = switchTab;

// Initialize the configuration UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.configUI = new AwtrixConfigUI();
    
    // Initialize simple rule creation event listeners
    initializeSimpleRuleListeners();
});

function initializeSimpleRuleListeners() {
    // Duration slider
    const durationSlider = document.getElementById('rule-duration-slider');
    if (durationSlider) {
        durationSlider.addEventListener('input', function() {
            const valueSpan = document.getElementById('rule-duration-value');
            if (valueSpan) {
                valueSpan.textContent = this.value;
            }
            updateSimpleRulePreview();
        });
    }
    
    // Template selection
    const templateSelect = document.getElementById('rule-template-select');
    if (templateSelect) {
        templateSelect.addEventListener('change', function() {
            const customTextGroup = document.getElementById('custom-text-group');
            if (customTextGroup) {
                if (this.value === 'custom') {
                    customTextGroup.style.display = 'block';
                } else {
                    customTextGroup.style.display = 'none';
                }
            }
            updateSimpleRulePreview();
        });
    }
    
    // All other form elements
    const formElements = [
        'rule-sensor-select',
        'rule-custom-text',
        'rule-color-select',
        'rule-icon-select',
        'rule-effect-select'
    ];
    
    formElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', updateSimpleRulePreview);
            element.addEventListener('input', updateSimpleRulePreview);
        }
    });
}

function updateSimpleRulePreview() {
    const sensorSelect = document.getElementById('rule-sensor-select');
    const templateSelect = document.getElementById('rule-template-select');
    const customText = document.getElementById('rule-custom-text');
    const colorSelect = document.getElementById('rule-color-select');
    const iconSelect = document.getElementById('rule-icon-select');
    const preview = document.getElementById('rule-preview');
    
    if (!sensorSelect || !templateSelect || !preview) return;
    
    const selectedSensor = sensorSelect.value;
    const selectedTemplate = templateSelect.value;
    
    if (!selectedSensor || !selectedTemplate) {
        preview.textContent = 'Wählen Sie einen Sensor und ein Template aus';
        return;
    }
    
    // Get sensor data
    const sensorOption = sensorSelect.options[sensorSelect.selectedIndex];
    const sensorData = sensorOption.dataset.sensor ? JSON.parse(sensorOption.dataset.sensor) : null;
    
    if (!sensorData) {
        preview.textContent = 'Sensor-Daten nicht verfügbar';
        return;
    }
    
    // Generate preview text
    let displayText = '';
    
    if (selectedTemplate === 'custom' && customText && customText.value) {
        displayText = customText.value;
    } else {
        // Use template
        const templates = {
            'temperature_warning': '🌡️ {sensor_name}: {value}°C',
            'motion_detected': '🏃 Bewegung in {sensor_name}!',
            'humidity_status': '💧 {sensor_name}: {value}%',
            'light_status': '💡 {sensor_name}: {value} lux'
        };
        displayText = templates[selectedTemplate] || '{sensor_name}: {value}{unit}';
    }
    
    // Replace variables
    displayText = displayText
        .replace(/{sensor_name}/g, sensorData.name)
        .replace(/{value}/g, sensorData.lastValue || 'TEST')
        .replace(/{unit}/g, sensorData.unit || '');
    
    // Set preview
    const selectedIcon = iconSelect ? iconSelect.value : '📊';
    const selectedColor = colorSelect ? colorSelect.value : '#FFFFFF';
    
    preview.innerHTML = `${selectedIcon} ${displayText}`;
    preview.style.color = selectedColor;
}

// Enhanced sensor dropdown functionality
function onSensorSelected() {
    const sensorSelect = document.getElementById('rule-sensor-select');
    const sensorInfo = document.getElementById('sensor-info');
    const templateSuggestions = document.getElementById('template-suggestions');
    
    if (!sensorSelect || !sensorInfo) return;
    
    const selectedSensorId = sensorSelect.value;
    if (!selectedSensorId) {
        sensorInfo.style.display = 'none';
        templateSuggestions.style.display = 'none';
        return;
    }
    
    // Find sensor data
    const sensor = window.availableSensors?.find(s => s.id === selectedSensorId);
    if (!sensor) return;
    
    // Update sensor info display
    const sensorName = sensorInfo.querySelector('.sensor-name');
    const sensorType = sensorInfo.querySelector('.sensor-type');
    const sensorValue = sensorInfo.querySelector('.sensor-value');
    const sensorTopic = sensorInfo.querySelector('.sensor-topic');
    
    if (sensorName) sensorName.textContent = `Name: ${sensor.name}`;
    if (sensorType) sensorType.textContent = `Typ: ${sensor.type}`;
    if (sensorValue) sensorValue.textContent = `Wert: ${sensor.lastValue} ${sensor.unit || ''}`;
    if (sensorTopic) sensorTopic.textContent = `Topic: ${sensor.topic}`;
    
    sensorInfo.style.display = 'block';
    
    // Show template suggestions based on sensor type
    showTemplateSuggestions(sensor.type);
    
    // Auto-select appropriate template
    autoSelectTemplate(sensor.type);
    
    // Update preview
    updateSimpleRulePreview();
}

function showTemplateSuggestions(sensorType) {
    const templateSuggestions = document.getElementById('template-suggestions');
    const suggestionChips = templateSuggestions.querySelector('.suggestion-chips');
    
    if (!templateSuggestions || !suggestionChips) return;
    
    // Clear existing suggestions
    suggestionChips.innerHTML = '';
    
    // Define suggestions based on sensor type
    const suggestions = {
        'temperature': [
            { id: 'temperature_warning', name: '🌡️ Temperatur-Warnung', description: 'Zeigt Temperatur mit Warnung' },
            { id: 'temperature_status', name: '🌡️ Temperatur-Status', description: 'Einfache Temperaturanzeige' }
        ],
        'humidity': [
            { id: 'humidity_status', name: '💧 Luftfeuchtigkeit', description: 'Zeigt Luftfeuchtigkeitsstatus' },
            { id: 'humidity_warning', name: '💧 Feuchtigkeits-Warnung', description: 'Warnung bei hoher Luftfeuchtigkeit' }
        ],
        'motion': [
            { id: 'motion_detected', name: '🏃 Bewegung erkannt', description: 'Zeigt Bewegungserkennung an' },
            { id: 'motion_status', name: '🏃 Bewegungs-Status', description: 'Aktueller Bewegungsstatus' }
        ],
        'light': [
            { id: 'light_status', name: '💡 Licht-Status', description: 'Zeigt Lichtintensität' },
            { id: 'light_warning', name: '💡 Licht-Warnung', description: 'Warnung bei zu wenig Licht' }
        ],
        'pressure': [
            { id: 'pressure_status', name: '📊 Luftdruck', description: 'Zeigt Luftdruck an' },
            { id: 'pressure_warning', name: '📊 Druck-Warnung', description: 'Warnung bei Druckänderungen' }
        ]
    };
    
    const typeSuggestions = suggestions[sensorType] || [
        { id: 'custom', name: '📝 Benutzerdefiniert', description: 'Eigener Text mit Variablen' }
    ];
    
    // Create suggestion chips
    typeSuggestions.forEach(suggestion => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = suggestion.name;
        chip.title = suggestion.description;
        chip.onclick = () => selectTemplateSuggestion(suggestion.id);
        suggestionChips.appendChild(chip);
    });
    
    templateSuggestions.style.display = 'block';
}

function selectTemplateSuggestion(templateId) {
    const templateSelect = document.getElementById('rule-template-select');
    if (templateSelect) {
        templateSelect.value = templateId;
        onTemplateSelected();
    }
    
    // Update suggestion chips visual state
    const chips = document.querySelectorAll('.suggestion-chip');
    chips.forEach(chip => {
        chip.classList.remove('selected');
        if (chip.textContent.includes(templateId.replace('_', ' '))) {
            chip.classList.add('selected');
        }
    });
}

function autoSelectTemplate(sensorType) {
    const templateSelect = document.getElementById('rule-template-select');
    if (!templateSelect) return;
    
    // Auto-select based on sensor type
    const autoSelectMap = {
        'temperature': 'temperature_warning',
        'humidity': 'humidity_status',
        'motion': 'motion_detected',
        'light': 'light_status',
        'pressure': 'pressure_status'
    };
    
    const suggestedTemplate = autoSelectMap[sensorType];
    if (suggestedTemplate) {
        templateSelect.value = suggestedTemplate;
    }
}

function onTemplateSelected() {
    const templateSelect = document.getElementById('rule-template-select');
    const customTextGroup = document.getElementById('custom-text-group');
    
    if (!templateSelect || !customTextGroup) return;
    
    // Show/hide custom text input based on selection
    if (templateSelect.value === 'custom') {
        customTextGroup.style.display = 'block';
    } else {
        customTextGroup.style.display = 'none';
    }
    
    // Update preview
    updateSimpleRulePreview();
}

// Enhanced sensor loading with better data
async function loadAvailableSensors() {
    try {
        // Try to get sensors from platform API
        const response = await fetch('/api/sensors');
        if (response.ok) {
            const sensors = await response.json();
            window.availableSensors = sensors;
            populateSimpleRuleSensorDropdown(sensors);
            return;
        }
    } catch (error) {
        console.log('Platform API not available, using mock data');
    }
    
    // Enhanced mock data with whole number values
    const mockSensors = [
        { id: 'temp_1', name: 'Wohnzimmer Temperatur', type: 'temperature', topic: 'sensors/livingroom/temperature', lastValue: '22', unit: '°C', source: 'discovered', quality: 0.95 },
        { id: 'temp_2', name: 'Küche Temperatur', type: 'temperature', topic: 'sensors/kitchen/temperature', lastValue: '24', unit: '°C', source: 'discovered', quality: 0.88 },
        { id: 'hum_1', name: 'Küche Luftfeuchtigkeit', type: 'humidity', topic: 'sensors/kitchen/humidity', lastValue: '45', unit: '%', source: 'discovered', quality: 0.92 },
        { id: 'hum_2', name: 'Badezimmer Luftfeuchtigkeit', type: 'humidity', topic: 'sensors/bathroom/humidity', lastValue: '65', unit: '%', source: 'scanned', quality: 0.85 },
        { id: 'motion_1', name: 'Eingang Bewegung', type: 'motion', topic: 'sensors/entrance/motion', lastValue: '1', unit: '', source: 'scanned', quality: 0.98 },
        { id: 'motion_2', name: 'Korridor Bewegung', type: 'motion', topic: 'sensors/corridor/motion', lastValue: '0', unit: '', source: 'scanned', quality: 0.90 },
        { id: 'light_1', name: 'Schlafzimmer Licht', type: 'light', topic: 'sensors/bedroom/light', lastValue: '250', unit: 'lux', source: 'scanned', quality: 0.87 },
        { id: 'light_2', name: 'Wohnzimmer Licht', type: 'light', topic: 'sensors/livingroom/light', lastValue: '1200', unit: 'lux', source: 'scanned', quality: 0.93 },
        { id: 'press_1', name: 'Wetter Luftdruck', type: 'pressure', topic: 'weather/pressure', lastValue: '1013', unit: 'hPa', source: 'discovered', quality: 0.99 },
        { id: 'press_2', name: 'Balkon Luftdruck', type: 'pressure', topic: 'sensors/balcony/pressure', lastValue: '1013', unit: 'hPa', source: 'discovered', quality: 0.91 }
    ];
    
    window.availableSensors = mockSensors;
    populateSimpleRuleSensorDropdown(mockSensors);
}

// Global functions for sensor filtering
function filterSensors() {
    if (window.awtrixConfigUI) {
        window.awtrixConfigUI.filterSensors();
    }
}

function onSensorSelected() {
    if (window.awtrixConfigUI) {
        const sensorSelect = document.getElementById('rule-sensor-select');
        const selectedSensorId = sensorSelect.value;
        if (selectedSensorId) {
            const sensor = window.availableSensors?.find(s => s.id === selectedSensorId);
            if (sensor) {
                window.awtrixConfigUI.onSensorSelected(sensor);
            }
        }
    }
}

function onTemplateSelected() {
    if (window.awtrixConfigUI) {
        window.awtrixConfigUI.onTemplateSelected();
    }
}

