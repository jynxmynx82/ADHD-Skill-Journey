import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface CameraViewProps {
  onBarcodeScanned: (result: { data: string; type?: string }) => void;
  onClose: () => void;
  scanning: boolean;
}

export default function CameraView({ onBarcodeScanned, onClose, scanning }: CameraViewProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const styles = StyleSheet.create({
    scannerContainer: { 
      flex: 1, 
      backgroundColor: colors.border,
    } as ViewStyle,
    scanner: { 
      flex: 1,
    } as ViewStyle,
    scannerOverlay: { 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center', 
      alignItems: 'center',
    } as ViewStyle,
    scannerInstructionText: { 
      fontSize: 16, 
      color: colors.text, 
      textAlign: 'center', 
      marginTop: 16,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 12,
      borderRadius: 8,
    } as TextStyle,
    closeButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 20,
      padding: 8,
    } as ViewStyle,
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    } as ViewStyle,
    permissionText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    } as TextStyle,
    permissionButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    } as ViewStyle,
    permissionButtonText: {
      color: colors.background,
      fontWeight: '600',
      fontSize: 16,
    } as TextStyle,
  });

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan barcodes.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <ArrowLeft size={24} color={colors.background} />
      </TouchableOpacity>
      
      <ExpoCameraView
        style={styles.scanner}
        facing="back"
        onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
      />
      
      <View style={styles.scannerOverlay}>
        <Text style={styles.scannerInstructionText}>
          Point camera at barcode to scan
        </Text>
      </View>
    </View>
  );
} 