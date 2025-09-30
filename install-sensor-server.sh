#!/bin/bash
# AWTRIX Sensor Selector Server - Installation Script
# Für Raspberry Pi mit Homebridge OS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
SERVICE_NAME="awtrix-sensor-server"
SERVICE_USER="homebridge"
DEFAULT_PORT="8081"
LOG_DIR="/var/log/awtrix-sensor-server"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  AWTRIX Sensor Server Installer${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Dieses Script sollte nicht als root ausgeführt werden!"
        print_status "Führen Sie es als normaler Benutzer aus. Das Script wird nach sudo-Passwort fragen, wenn nötig."
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_status "Überprüfe System-Anforderungen..."
    
    # Check if Python 3 is installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 ist nicht installiert!"
        print_status "Installiere Python 3..."
        sudo apt update
        sudo apt install -y python3 python3-pip python3-venv
    else
        print_success "Python 3 gefunden: $(python3 --version)"
    fi
    
    # Check if pip is installed
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 ist nicht installiert!"
        print_status "Installiere pip3..."
        sudo apt install -y python3-pip
    else
        print_success "pip3 gefunden: $(pip3 --version)"
    fi
    
    # Check if systemd is available
    if ! command -v systemctl &> /dev/null; then
        print_warning "systemd nicht gefunden. Service wird nicht automatisch gestartet."
    else
        print_success "systemd gefunden"
    fi
}

# Create virtual environment
create_venv() {
    print_status "Erstelle virtuelle Python-Umgebung..."
    
    if [ -d "$VENV_DIR" ]; then
        print_warning "Virtuelle Umgebung existiert bereits. Lösche sie..."
        rm -rf "$VENV_DIR"
    fi
    
    python3 -m venv "$VENV_DIR"
    print_success "Virtuelle Umgebung erstellt: $VENV_DIR"
}

# Install dependencies
install_dependencies() {
    print_status "Installiere Python-Abhängigkeiten..."
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install required packages
    pip install flask flask-cors
    
    print_success "Abhängigkeiten installiert"
}

# Create configuration file
create_config() {
    print_status "Erstelle Konfigurationsdatei..."
    
    local config_file="$SCRIPT_DIR/sensor-server-config.json"
    
    cat > "$config_file" << EOF
{
    "server": {
        "host": "0.0.0.0",
        "port": $DEFAULT_PORT,
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
        "file": "$LOG_DIR/sensor-server.log",
        "max_size": "10MB",
        "backup_count": 5
    },
    "ui": {
        "title": "AWTRIX Sensor Auswahl",
        "theme": "modern",
        "auto_refresh": true,
        "refresh_interval": 5000
    }
}
EOF
    
    print_success "Konfigurationsdatei erstellt: $config_file"
}

# Create enhanced Python server
create_enhanced_server() {
    print_status "Erstelle erweiterten Python-Server..."
    
    local server_file="$SCRIPT_DIR/sensor-server.py"
    
    cat > "$server_file" << 'EOF'
#!/usr/bin/env python3
"""
AWTRIX Sensor Selector Server - Enhanced Version
Mit Flask, CORS, Logging und Konfiguration
"""

import os
import json
import logging
import threading
import time
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template_string, request, jsonify, send_from_directory
from flask_cors import CORS

# Load configuration
def load_config():
    config_file = os.path.join(os.path.dirname(__file__), 'sensor-server-config.json')
    try:
        with open(config_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Default configuration
        return {
            "server": {"host": "0.0.0.0", "port": 8081, "debug": False},
            "awtrix": {"default_ip": "192.168.178.151", "default_port": 7001},
            "mqtt": {"default_host": "192.168.178.29", "default_port": 1883},
            "logging": {"level": "INFO", "file": "/var/log/awtrix-sensor-server/sensor-server.log"},
            "ui": {"title": "AWTRIX Sensor Auswahl", "theme": "modern"}
        }

config = load_config()

# Setup logging
def setup_logging():
    log_config = config.get('logging', {})
    log_level = getattr(logging, log_config.get('level', 'INFO').upper())
    
    # Create log directory if it doesn't exist
    log_file = log_config.get('file', '/var/log/awtrix-sensor-server/sensor-server.log')
    log_dir = os.path.dirname(log_file)
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger(__name__)

logger = setup_logging()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Global variables
selected_sensors = []
rules = []
server_config = config.get('server', {})
ui_config = config.get('ui', {})

# Load HTML template
def load_html_template():
    template_file = os.path.join(os.path.dirname(__file__), 'sensor-selector.html')
    try:
        with open(template_file, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        logger.error("sensor-selector.html not found!")
        return "<h1>Error: sensor-selector.html not found!</h1>"

# Routes
@app.route('/')
def index():
    """Serve the main sensor selector page"""
    html_template = load_html_template()
    return render_template_string(html_template)

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """Get available sensors (mock data for now)"""
    # In a real implementation, this would connect to MQTT
    mock_sensors = [
        {
            "id": "temp_living_room",
            "name": "Temperatur Wohnzimmer",
            "type": "temperature",
            "topic": "home/sensors/livingroom/temperature",
            "value": "22.5",
            "unit": "°C",
            "quality": 95,
            "lastSeen": datetime.now().strftime("%H:%M:%S"),
            "icon": "thermometer-half",
            "color": "#ff6b6b"
        },
        {
            "id": "humidity_kitchen",
            "name": "Luftfeuchtigkeit Küche",
            "type": "humidity",
            "topic": "home/sensors/kitchen/humidity",
            "value": "45",
            "unit": "%",
            "quality": 88,
            "lastSeen": datetime.now().strftime("%H:%M:%S"),
            "icon": "tint",
            "color": "#4ecdc4"
        },
        {
            "id": "motion_entrance",
            "name": "Bewegung Eingang",
            "type": "motion",
            "topic": "home/sensors/entrance/motion",
            "value": "0",
            "unit": "",
            "quality": 92,
            "lastSeen": datetime.now().strftime("%H:%M:%S"),
            "icon": "walking",
            "color": "#45b7d1"
        }
    ]
    
    return jsonify(mock_sensors)

@app.route('/api/sensors/selected', methods=['POST'])
def save_selected_sensors():
    """Save selected sensors"""
    global selected_sensors
    data = request.get_json()
    
    if 'sensors' in data:
        selected_sensors = data['sensors']
        logger.info(f"Saved {len(selected_sensors)} selected sensors")
        
        # Save to file for persistence
        save_file = os.path.join(os.path.dirname(__file__), 'selected_sensors.json')
        with open(save_file, 'w') as f:
            json.dump(selected_sensors, f, indent=2)
        
        return jsonify({"success": True, "count": len(selected_sensors)})
    
    return jsonify({"success": False, "error": "No sensors provided"}), 400

@app.route('/api/rules', methods=['GET', 'POST'])
def handle_rules():
    """Handle sensor display rules"""
    global rules
    
    if request.method == 'GET':
        return jsonify(rules)
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if 'rule' in data:
            rule = data['rule']
            rule['id'] = f"rule_{int(time.time())}"
            rule['created'] = datetime.now().isoformat()
            rules.append(rule)
            
            logger.info(f"Added rule: {rule.get('name', 'Unnamed')}")
            
            # Save to file
            save_file = os.path.join(os.path.dirname(__file__), 'sensor_rules.json')
            with open(save_file, 'w') as f:
                json.dump(rules, f, indent=2)
            
            return jsonify({"success": True, "rule": rule})
    
    return jsonify({"success": False, "error": "Invalid request"}), 400

@app.route('/api/rules/<rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    """Delete a specific rule"""
    global rules
    
    original_count = len(rules)
    rules = [rule for rule in rules if rule.get('id') != rule_id]
    
    if len(rules) < original_count:
        # Save to file
        save_file = os.path.join(os.path.dirname(__file__), 'sensor_rules.json')
        with open(save_file, 'w') as f:
            json.dump(rules, f, indent=2)
        
        logger.info(f"Deleted rule: {rule_id}")
        return jsonify({"success": True})
    
    return jsonify({"success": False, "error": "Rule not found"}), 404

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    """Handle configuration"""
    if request.method == 'GET':
        return jsonify(config)
    
    elif request.method == 'POST':
        data = request.get_json()
        # Update configuration (implement as needed)
        return jsonify({"success": True})

@app.route('/api/status')
def status():
    """Get server status"""
    return jsonify({
        "status": "running",
        "version": "1.0.36",
        "uptime": time.time() - start_time,
        "selected_sensors": len(selected_sensors),
        "rules": len(rules),
        "config": server_config
    })

# Load existing data on startup
def load_existing_data():
    global selected_sensors, rules
    
    # Load selected sensors
    sensors_file = os.path.join(os.path.dirname(__file__), 'selected_sensors.json')
    if os.path.exists(sensors_file):
        try:
            with open(sensors_file, 'r') as f:
                selected_sensors = json.load(f)
            logger.info(f"Loaded {len(selected_sensors)} selected sensors")
        except Exception as e:
            logger.error(f"Error loading selected sensors: {e}")
    
    # Load rules
    rules_file = os.path.join(os.path.dirname(__file__), 'sensor_rules.json')
    if os.path.exists(rules_file):
        try:
            with open(rules_file, 'r') as f:
                rules = json.load(f)
            logger.info(f"Loaded {len(rules)} rules")
        except Exception as e:
            logger.error(f"Error loading rules: {e}")

if __name__ == '__main__':
    start_time = time.time()
    
    # Load existing data
    load_existing_data()
    
    # Get server configuration
    host = server_config.get('host', '0.0.0.0')
    port = server_config.get('port', 8081)
    debug = server_config.get('debug', False)
    
    logger.info(f"Starting AWTRIX Sensor Server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    try:
        app.run(host=host, port=port, debug=debug, threaded=True)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise
EOF
    
    chmod +x "$server_file"
    print_success "Erweiterten Server erstellt: $server_file"
}

# Create systemd service
create_systemd_service() {
    if ! command -v systemctl &> /dev/null; then
        print_warning "systemd nicht verfügbar. Überspringe Service-Erstellung."
        return
    fi
    
    print_status "Erstelle systemd Service..."
    
    local service_file="/etc/systemd/system/${SERVICE_NAME}.service"
    local current_user=$(whoami)
    
    sudo tee "$service_file" > /dev/null << EOF
[Unit]
Description=AWTRIX Sensor Selector Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=$current_user
Group=$current_user
WorkingDirectory=$SCRIPT_DIR
Environment=PATH=$VENV_DIR/bin
ExecStart=$VENV_DIR/bin/python $SCRIPT_DIR/sensor-server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$SCRIPT_DIR $LOG_DIR

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    
    print_success "Systemd Service erstellt: $service_file"
}

# Create log directory
create_log_directory() {
    print_status "Erstelle Log-Verzeichnis..."
    
    sudo mkdir -p "$LOG_DIR"
    sudo chown "$(whoami):$(whoami)" "$LOG_DIR"
    
    print_success "Log-Verzeichnis erstellt: $LOG_DIR"
}

# Create startup script
create_startup_script() {
    print_status "Erstelle Start-Script..."
    
    local start_script="$SCRIPT_DIR/start-server.sh"
    
    cat > "$start_script" << EOF
#!/bin/bash
# AWTRIX Sensor Server - Start Script

cd "$SCRIPT_DIR"
source "$VENV_DIR/bin/activate"

echo "🚀 Starte AWTRIX Sensor Server..."
echo "📁 Verzeichnis: $SCRIPT_DIR"
echo "🐍 Python: \$(which python)"
echo "📊 Port: $DEFAULT_PORT"
echo ""

python sensor-server.py
EOF
    
    chmod +x "$start_script"
    print_success "Start-Script erstellt: $start_script"
}

# Create management script
create_management_script() {
    print_status "Erstelle Management-Script..."
    
    local mgmt_script="$SCRIPT_DIR/manage-server.sh"
    
    cat > "$mgmt_script" << EOF
#!/bin/bash
# AWTRIX Sensor Server - Management Script

SERVICE_NAME="$SERVICE_NAME"
SCRIPT_DIR="$SCRIPT_DIR"

case "\$1" in
    start)
        echo "🚀 Starte AWTRIX Sensor Server..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start "\$SERVICE_NAME"
        else
            cd "\$SCRIPT_DIR"
            ./start-server.sh &
        fi
        ;;
    stop)
        echo "🛑 Stoppe AWTRIX Sensor Server..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl stop "\$SERVICE_NAME"
        else
            pkill -f "sensor-server.py"
        fi
        ;;
    restart)
        echo "🔄 Starte AWTRIX Sensor Server neu..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl restart "\$SERVICE_NAME"
        else
            pkill -f "sensor-server.py"
            sleep 2
            cd "\$SCRIPT_DIR"
            ./start-server.sh &
        fi
        ;;
    status)
        echo "📊 Status des AWTRIX Sensor Servers:"
        if command -v systemctl &> /dev/null; then
            sudo systemctl status "\$SERVICE_NAME"
        else
            if pgrep -f "sensor-server.py" > /dev/null; then
                echo "✅ Server läuft"
            else
                echo "❌ Server läuft nicht"
            fi
        fi
        ;;
    logs)
        echo "📋 Logs des AWTRIX Sensor Servers:"
        if command -v systemctl &> /dev/null; then
            sudo journalctl -u "\$SERVICE_NAME" -f
        else
            tail -f "$LOG_DIR/sensor-server.log"
        fi
        ;;
    *)
        echo "Verwendung: \$0 {start|stop|restart|status|logs}"
        echo ""
        echo "Befehle:"
        echo "  start   - Startet den Server"
        echo "  stop    - Stoppt den Server"
        echo "  restart - Startet den Server neu"
        echo "  status  - Zeigt den Status"
        echo "  logs    - Zeigt die Logs"
        exit 1
        ;;
esac
EOF
    
    chmod +x "$mgmt_script"
    print_success "Management-Script erstellt: $mgmt_script"
}

# Test installation
test_installation() {
    print_status "Teste Installation..."
    
    # Check if virtual environment works
    if [ -f "$VENV_DIR/bin/python" ]; then
        print_success "Virtuelle Umgebung funktioniert"
    else
        print_error "Virtuelle Umgebung funktioniert nicht!"
        return 1
    fi
    
    # Check if server file exists and is executable
    if [ -f "$SCRIPT_DIR/sensor-server.py" ] && [ -x "$SCRIPT_DIR/sensor-server.py" ]; then
        print_success "Server-Script ist bereit"
    else
        print_error "Server-Script fehlt oder ist nicht ausführbar!"
        return 1
    fi
    
    # Test Python imports
    source "$VENV_DIR/bin/activate"
    if python -c "import flask, flask_cors" 2>/dev/null; then
        print_success "Python-Abhängigkeiten funktionieren"
    else
        print_error "Python-Abhängigkeiten funktionieren nicht!"
        return 1
    fi
    
    print_success "Installation erfolgreich getestet!"
}

# Main installation function
main() {
    print_header
    
    check_root
    check_requirements
    create_venv
    install_dependencies
    create_config
    create_enhanced_server
    create_log_directory
    create_startup_script
    create_management_script
    create_systemd_service
    test_installation
    
    print_success "🎉 Installation abgeschlossen!"
    echo ""
    echo -e "${CYAN}Nächste Schritte:${NC}"
    echo "1. Starte den Server: $SCRIPT_DIR/manage-server.sh start"
    echo "2. Öffne die Webseite: http://localhost:$DEFAULT_PORT"
    echo "3. Oder über externe IP: http://[RASPBERRY_PI_IP]:$DEFAULT_PORT"
    echo ""
    echo -e "${CYAN}Verwaltung:${NC}"
    echo "• Status prüfen: $SCRIPT_DIR/manage-server.sh status"
    echo "• Logs anzeigen: $SCRIPT_DIR/manage-server.sh logs"
    echo "• Server stoppen: $SCRIPT_DIR/manage-server.sh stop"
    echo "• Server neu starten: $SCRIPT_DIR/manage-server.sh restart"
    echo ""
    echo -e "${CYAN}Konfiguration:${NC}"
    echo "• Konfigurationsdatei: $SCRIPT_DIR/sensor-server-config.json"
    echo "• Log-Dateien: $LOG_DIR/"
    echo ""
}

# Run main function
main "$@"
