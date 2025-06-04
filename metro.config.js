const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable Watchman completely
config.watchFolders = [];
config.resolver.useWatchman = false;

// Disable file watching entirely
config.server = {
  ...config.server,
  experimentalImportSupport: false,
  unstable_serverRoot: undefined,
};

// Force polling instead of file watching
config.watchman = false;

module.exports = withNativeWind(config, { input: './global.css' });
