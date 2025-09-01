#!/usr/bin/env node

/**
 * Debug script for RevenueCat configuration
 * This script helps identify and fix RevenueCat setup issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 RevenueCat Configuration Debug Tool\n');

// Check environment variables
console.log('1. Checking Environment Variables:');
const requiredEnvVars = ['EXPO_PUBLIC_REVENUECAT_IOS_API_KEY'];

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: Set (${value.length} characters)`);
    // Basic validation for RevenueCat API key format
    if (envVar.includes('REVENUECAT') && !value.startsWith('appl_')) {
      console.log(`   ⚠️  Warning: RevenueCat iOS API keys typically start with 'appl_'`);
    }
  } else {
    console.log(`   ❌ ${envVar}: NOT SET`);
  }
});

// Check if .env files exist
console.log('\n2. Checking .env files:');
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
envFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}: Found`);
    try {
      const content = fs.readFileSync(file, 'utf8');
      const hasRevenueCat = content.includes('REVENUECAT');
      if (hasRevenueCat) {
        console.log(`      📝 Contains RevenueCat configuration`);
      } else {
        console.log(`      ⚠️  No RevenueCat configuration found`);
      }
    } catch (error) {
      console.log(`      ❌ Error reading file: ${error.message}`);
    }
  } else {
    console.log(`   ⚪ ${file}: Not found`);
  }
});

// Check EAS configuration
console.log('\n3. Checking EAS Configuration:');
try {
  const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  const buildConfigs = easConfig.build || {};

  Object.keys(buildConfigs).forEach((buildType) => {
    console.log(`   📦 Build: ${buildType}`);
    const config = buildConfigs[buildType];
    if (config.env) {
      console.log(`      ✅ Has env configuration`);
      if (config.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) {
        console.log(`      ✅ RevenueCat API key configured`);
      } else {
        console.log(`      ⚠️  RevenueCat API key not configured`);
      }
    } else {
      console.log(`      ⚪ No env configuration`);
    }
  });
} catch (error) {
  console.log(`   ❌ Error reading eas.json: ${error.message}`);
}

// Check app.json/app.config.js
console.log('\n4. Checking App Configuration:');
try {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const extra = appConfig?.expo?.extra;
  if (extra && extra.revenuecat) {
    console.log(`   ✅ RevenueCat configuration found in app.json`);
  } else {
    console.log(`   ⚪ No RevenueCat configuration in app.json (this is OK)`);
  }
} catch (error) {
  console.log(`   ❌ Error reading app.json: ${error.message}`);
}

// Recommendations
console.log('\n💡 Recommendations:');
console.log('');

if (!process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY) {
  console.log('🔧 TO FIX "No subscription plans available" error:');
  console.log('');
  console.log('1. Create a .env file in your project root with:');
  console.log('   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('');
  console.log('2. Get your API key from:');
  console.log('   https://app.revenuecat.com/apps/[your-app]/api-keys');
  console.log('');
  console.log('3. Make sure to use the iOS API key (starts with "appl_")');
  console.log('');
  console.log('4. Restart your development server after adding the key');
  console.log('');
} else {
  console.log("✅ Environment variable is set. If you're still seeing errors:");
  console.log('');
  console.log('1. Verify the API key is correct in RevenueCat dashboard');
  console.log('2. Check that you have products configured in RevenueCat');
  console.log('3. Ensure you have a "current offering" set up');
  console.log('4. Make sure your app bundle ID matches RevenueCat configuration');
  console.log('');
}

console.log('📚 Additional Resources:');
console.log('- RevenueCat iOS Setup: https://docs.revenuecat.com/docs/ios');
console.log('- Expo + RevenueCat: https://docs.revenuecat.com/docs/expo');
console.log('- RevenueCat Dashboard: https://app.revenuecat.com/');
