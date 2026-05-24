import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useState } from "react";

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission required
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = ({ data }: any) => {
    if (scanned) return;

    setScanned(true);

    router.push({
      pathname: "/item-details",
      params: {
        toolId: data,
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "code128",
            "code39",
          ],
        }}
        onBarcodeScanned={handleScan}
      />

      <View style={styles.overlay}>
        <Text style={styles.scanText}>
          Scan Tool QR / Barcode
        </Text>

        {scanned ? (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>
              Scan Again
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  scanText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  scanAgainButton: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  scanAgainText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  backButton: {
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  permissionContainer: {
    flex: 1,
    backgroundColor: "#020b1f",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  permissionText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  permissionButton: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 16,
  },

  permissionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});