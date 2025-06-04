import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSubscription } from '../context/subscription-provider';
import { FreemiumGate } from '../components/freemium-gate';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showFreemiumGate, setShowFreemiumGate] = useState(false);
  const { canAccessFeature, getRemainingFreeScans, incrementFreeUsage, isSubscribed } =
    useSubscription();

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleScanPress = () => {
    // Check if user can access scanning feature
    if (!canAccessFeature('product_scan')) {
      setShowFreemiumGate(true);
      return;
    }

    // Proceed with scanning
    setScanned(false);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    // Increment usage for free users
    incrementFreeUsage('product_scan');

    // Mock scan result
    Alert.alert('Product Scanned!', `Found: ${data}\n\nAnalyzing ingredients...`, [
      {
        text: 'View Details',
        onPress: () => {
          // Navigate to product details or analysis
          router.push('/products/add');
        },
      },
      {
        text: 'Scan Another',
        onPress: () => setScanned(false),
        style: 'cancel',
      },
    ]);
  };

  const renderFreemiumHeader = () => {
    if (isSubscribed) return null;

    const remainingScans = getRemainingFreeScans();
    const isLimitReached = remainingScans === 0;

    return (
      <View style={styles.freemiumHeader}>
        <LinearGradient
          colors={isLimitReached ? ['#FF6B6B', '#FF8E53'] : ['#4ECDC4', '#44A08D']}
          style={styles.freemiumBanner}
        >
          <Ionicons name={isLimitReached ? 'alert-circle' : 'scan'} size={20} color="white" />
          <Text style={styles.freemiumText}>
            {isLimitReached
              ? 'Free scans used up - Upgrade for unlimited scans'
              : `${remainingScans} free scans remaining`}
          </Text>
          {isLimitReached && (
            <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/paywall')}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#ccc" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan product barcodes and labels
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderFreemiumHeader()}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan Product</Text>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            Alert.alert(
              'How to Scan',
              'Point your camera at a product barcode or ingredient list. Make sure the text is clear and well-lit for best results.'
            );
          }}
        >
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'upc_a', 'upc_e', 'ean13', 'ean8', 'code128'],
          }}
        >
          <View style={styles.overlay}>
            {/* Scanning Frame */}
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <Text style={styles.instructionText}>
              Position barcode or ingredient list within the frame
            </Text>
          </View>
        </CameraView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.scanButton,
            !canAccessFeature('product_scan') && styles.scanButtonDisabled,
          ]}
          onPress={handleScanPress}
        >
          <LinearGradient
            colors={canAccessFeature('product_scan') ? ['#4ECDC4', '#44A08D'] : ['#ccc', '#999']}
            style={styles.scanButtonGradient}
          >
            <Ionicons name="scan" size={32} color="white" />
            <Text style={styles.scanButtonText}>
              {canAccessFeature('product_scan') ? 'Tap to Scan' : 'Upgrade to Scan'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualButton} onPress={() => router.push('/products/add')}>
          <Text style={styles.manualButtonText}>Add Manually Instead</Text>
        </TouchableOpacity>
      </View>

      <FreemiumGate
        visible={showFreemiumGate}
        feature="product_scan"
        featureName="Product Scanning"
        featureDescription="Quickly analyze products by scanning barcodes or ingredient lists with your camera"
        icon="scan"
        onClose={() => setShowFreemiumGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  freemiumHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  freemiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  freemiumText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4ECDC4',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
  },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scanButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  manualButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
