#!/bin/bash

# H-Deets AI Watchman Fix Script
# Run this if you get "Waiting for Watchman" errors

echo "🔧 Fixing Watchman issues..."

# Kill all watchman processes
echo "1. Stopping Watchman processes..."
pkill -f watchman || true

# Clear Homebrew watchman state (Intel Mac)
if [ -d "/usr/local/var/run/watchman" ]; then
    echo "2. Clearing Intel Mac Watchman state..."
    rm -rf /usr/local/var/run/watchman/*
fi

# Clear Homebrew watchman state (Apple Silicon)
if [ -d "/opt/homebrew/var/run/watchman" ]; then
    echo "2. Clearing Apple Silicon Watchman state..."
    rm -rf /opt/homebrew/var/run/watchman/*
fi

# Clear any local watchman files
echo "3. Clearing local Watchman files..."
find . -name ".watchman-cookie*" -delete 2>/dev/null || true

# Clear Metro cache
echo "4. Clearing Metro cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true

echo "✅ Watchman fixed! You can now run 'npm start' or 'npx expo start'" 