#!/bin/bash
# AWTRIX Sensor Selector Server Start Script
# Für Raspberry Pi mit Homebridge OS

echo "🔧 AWTRIX Sensor Selector Server"
echo "================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 ist nicht installiert!"
    echo "💡 Installieren Sie Python 3: sudo apt update && sudo apt install python3"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if sensor-selector.html exists
if [ ! -f "sensor-selector.html" ]; then
    echo "❌ sensor-selector.html nicht gefunden!"
    echo "💡 Stellen Sie sicher, dass alle Dateien im Plugin-Verzeichnis sind."
    exit 1
fi

# Get port from command line argument or use default
PORT=${1:-8081}

echo "🚀 Starte Server auf Port $PORT..."
echo "📱 Lokale URL: http://localhost:$PORT"
echo "🌐 Externe URL: http://[RASPBERRY_PI_IP]:$PORT"
echo "⏹️  Drücken Sie Ctrl+C zum Beenden"
echo ""

# Start the Python server
python3 start-sensor-server.py $PORT
