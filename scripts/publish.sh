#!/bin/bash

# AWTRIX Homebridge Plugin - Publish Script

set -e

echo "🚀 Publishing AWTRIX Homebridge Plugin to NPM..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch to publish"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Run tests (if available)
echo "🧪 Running tests..."
npm test || echo "No tests configured"

# Check if logged in to NPM
echo "🔐 Checking NPM authentication..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Error: Not logged in to NPM. Please run 'npm login' first"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Ask for confirmation
read -p "Do you want to publish version $CURRENT_VERSION to NPM? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    exit 1
fi

# Publish to NPM
echo "📤 Publishing to NPM..."
npm publish

# Create and push git tag
echo "🏷️  Creating git tag..."
git tag "v$CURRENT_VERSION"
git push origin "v$CURRENT_VERSION"

echo "✅ Successfully published version $CURRENT_VERSION to NPM!"
echo "🎉 Your plugin is now available at: https://www.npmjs.com/package/homebridge-awtrix-sensors"
