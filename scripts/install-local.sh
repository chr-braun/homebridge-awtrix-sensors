#!/bin/bash

# AWTRIX Homebridge Plugin - Local Installation Script

set -e

echo "🔧 Installing AWTRIX Homebridge Plugin locally..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the plugin directory"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Install globally
echo "📦 Installing globally..."
npm install -g .

# Verify installation
echo "✅ Verifying installation..."
if command -v homebridge > /dev/null 2>&1; then
    echo "✅ Homebridge is installed"
else
    echo "⚠️  Homebridge not found. Please install Homebridge first:"
    echo "   npm install -g homebridge"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Add the plugin to your Homebridge config.json:"
echo "   {"
echo "     \"platforms\": ["
echo "       {"
echo "         \"platform\": \"AwtrixSensors\","
echo "         \"name\": \"AWTRIX MQTT Platform\","
echo "         \"mqtt\": {"
echo "           \"host\": \"192.168.1.100\","
echo "           \"port\": 1883,"
echo "           \"username\": \"your_username\","
echo "           \"password\": \"your_password\""
echo "         },"
echo "         \"awtrix\": {"
echo "           \"ip\": \"192.168.1.151\","
echo "           \"port\": 80"
echo "         }"
echo "       }"
echo "     ]"
echo "   }"
echo ""
echo "2. Restart Homebridge"
echo "3. Check the logs for connection status"
