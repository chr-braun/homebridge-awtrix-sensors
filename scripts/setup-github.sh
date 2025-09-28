#!/bin/bash

# AWTRIX Homebridge Plugin - GitHub Setup Script

set -e

echo "🐙 Setting up GitHub repository for AWTRIX Homebridge Plugin..."

# Check if git remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Git remote 'origin' already exists"
    REMOTE_URL=$(git remote get-url origin)
    echo "📍 Remote URL: $REMOTE_URL"
else
    echo "❌ No git remote 'origin' found"
    echo "Please create a GitHub repository first and add it as origin:"
    echo "git remote add origin https://github.com/christianbraun/homebridge-awtrix-sensors.git"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

# Create GitHub repository settings
echo "⚙️  Setting up GitHub repository settings..."

# Enable GitHub Pages (if needed)
echo "📄 GitHub Pages setup (optional):"
echo "   Go to Settings > Pages > Source: Deploy from a branch > main > /docs"

# Enable Issues and Discussions
echo "💬 Enable Issues and Discussions in GitHub repository settings"

# Add repository topics
echo "🏷️  Suggested repository topics:"
echo "   homebridge, homekit, awtrix, mqtt, sensors, led-matrix, smart-home, iot"

echo "✅ GitHub repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/christianbraun/homebridge-awtrix-sensors"
echo "2. Add repository description and topics"
echo "3. Enable Issues and Discussions"
echo "4. Set up NPM_TOKEN secret for automated publishing"
echo "5. Create a release for v1.0.0"
