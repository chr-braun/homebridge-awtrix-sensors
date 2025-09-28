# NPM Publish Guide

This guide will help you publish the AWTRIX Homebridge Plugin to NPM.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **NPM CLI**: Install NPM CLI if not already installed
3. **GitHub Repository**: Create a GitHub repository for the plugin

## Step 1: NPM Account Setup

1. **Create NPM Account**
   ```bash
   npm adduser
   ```
   Or if you already have an account:
   ```bash
   npm login
   ```

2. **Verify Login**
   ```bash
   npm whoami
   ```

## Step 2: GitHub Repository Setup

1. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name: `homebridge-awtrix-sensors`
   - Description: "Homebridge plugin for AWTRIX LED matrix displays with MQTT sensor integration"
   - Make it public
   - Don't initialize with README (we already have one)

2. **Add Remote Origin**
   ```bash
   git remote add origin https://github.com/christianbraun/homebridge-awtrix-sensors.git
   ```

3. **Push to GitHub**
   ```bash
   git push -u origin main
   ```

## Step 3: Final Checks

1. **Verify Package.json**
   ```bash
   npm pack --dry-run
   ```
   This shows what will be included in the package.

2. **Test Build**
   ```bash
   npm run build
   ```

3. **Check Files**
   ```bash
   ls -la lib/
   ```
   Should contain compiled JavaScript files.

## Step 4: Publish to NPM

### Option A: Manual Publish

1. **Publish**
   ```bash
   npm publish
   ```

2. **Verify Publication**
   ```bash
   npm view homebridge-awtrix-sensors
   ```

### Option B: Using Script

1. **Run Publish Script**
   ```bash
   ./scripts/publish.sh
   ```

## Step 5: Post-Publication

1. **Create GitHub Release**
   - Go to GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.0.0`
   - Title: `AWTRIX Homebridge Plugin v1.0.0`
   - Description: Copy from CHANGELOG.md

2. **Update Documentation**
   - Update README.md with NPM installation instructions
   - Add badges for NPM version, downloads, etc.

3. **Test Installation**
   ```bash
   npm install -g homebridge-awtrix-sensors
   ```

## Step 6: Homebridge Plugin Registry

1. **Submit to Homebridge Plugin Registry**
   - Go to [Homebridge Plugin Registry](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
   - Follow the submission process

2. **Update Homebridge UI**
   - The plugin should appear in Homebridge UI after publication

## Troubleshooting

### Common Issues

1. **Package Name Already Exists**
   - Change the name in package.json
   - Update all references

2. **Version Already Exists**
   - Update version in package.json
   - Commit and tag the new version

3. **Build Errors**
   - Check TypeScript compilation
   - Fix any type errors
   - Ensure all dependencies are installed

4. **Permission Errors**
   - Make sure you're logged in to NPM
   - Check if you have permission to publish

### Useful Commands

```bash
# Check NPM status
npm whoami

# View package info
npm view homebridge-awtrix-sensors

# Unpublish (if needed, within 24 hours)
npm unpublish homebridge-awtrix-sensors@1.0.0

# Update version
npm version patch  # or minor, major
```

## Success Checklist

- [ ] NPM account created and logged in
- [ ] GitHub repository created and connected
- [ ] Package builds without errors
- [ ] All tests pass (if any)
- [ ] Package published to NPM
- [ ] Installation tested
- [ ] GitHub release created
- [ ] Documentation updated
- [ ] Homebridge Plugin Registry submission (optional)

## Next Steps After Publication

1. **Monitor Downloads**: Check NPM statistics
2. **Handle Issues**: Respond to GitHub issues
3. **Update Plugin**: Release new versions as needed
4. **Community**: Engage with users and contributors

---

**Congratulations!** 🎉 Your AWTRIX Homebridge Plugin is now available to the world!
