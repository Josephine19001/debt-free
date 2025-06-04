#!/bin/bash

# H-Deets AI Development Start Script
# This script bypasses common Watchman issues on macOS

echo "🚀 Starting H-Deets AI Development Server..."

# Option 1: Start without Watchman
echo "📁 Starting with Watchman disabled..."
EXPO_NO_WATCHMAN=1 npx expo start --clear

# Fallback: If above fails, use tunnel mode
if [ $? -ne 0 ]; then
    echo "⚠️ Fallback: Starting with tunnel mode..."
    npx expo start --tunnel --clear
fi 