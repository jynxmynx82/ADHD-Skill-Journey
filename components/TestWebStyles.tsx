import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';

export default function TestWebStyles() {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Test Web Styles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  } as ViewStyle,
  box: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }
    ),
  } as ViewStyle,
  text: {
    fontSize: 16,
    color: '#333',
  },
}); 