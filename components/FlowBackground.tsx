import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay 
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FlowBackground() {
  const { colors } = useTheme();
  
  // Animation values for breathing effect
  const breathingScale = useSharedValue(1);
  const ripple1Opacity = useSharedValue(0.3);
  const ripple2Opacity = useSharedValue(0.2);
  const ripple3Opacity = useSharedValue(0.1);

  // Breathing animation
  useEffect(() => {
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 4000 }),
        withTiming(1, { duration: 4000 })
      ),
      -1,
      true
    );
  }, []);

  // Ripple animations
  useEffect(() => {
    ripple1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 3000 }),
        withTiming(0.3, { duration: 3000 })
      ),
      -1,
      true
    );

    ripple2Opacity.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(0.5, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 })
      ),
      -1,
      true
    ));

    ripple3Opacity.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(0.4, { duration: 5000 }),
        withTiming(0.1, { duration: 5000 })
      ),
      -1,
      true
    ));
  }, []);

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    opacity: ripple1Opacity.value,
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    opacity: ripple2Opacity.value,
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    opacity: ripple3Opacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: '#E3F2FD', // Soft blue background
    },
    pond: {
      position: 'absolute',
      top: screenHeight * 0.2,
      left: screenWidth * 0.1,
      right: screenWidth * 0.1,
      bottom: screenHeight * 0.1,
      borderRadius: screenWidth * 0.4,
      backgroundColor: '#81C784', // Soft green pond
      opacity: 0.15,
    },
    ripple1: {
      position: 'absolute',
      top: screenHeight * 0.15,
      left: screenWidth * 0.05,
      right: screenWidth * 0.05,
      bottom: screenHeight * 0.05,
      borderRadius: screenWidth * 0.45,
      borderWidth: 2,
      borderColor: '#81C784',
    },
    ripple2: {
      position: 'absolute',
      top: screenHeight * 0.1,
      left: screenWidth * 0.02,
      right: screenWidth * 0.02,
      bottom: screenHeight * 0.02,
      borderRadius: screenWidth * 0.48,
      borderWidth: 1,
      borderColor: '#81C784',
    },
    ripple3: {
      position: 'absolute',
      top: screenHeight * 0.05,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: screenWidth * 0.5,
      borderWidth: 1,
      borderColor: '#81C784',
    },
    floatingParticles: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#81C784',
      opacity: 0.3,
    },
  });

  return (
    <View style={styles.container}>
      {/* Main pond */}
      <Animated.View style={[styles.pond, breathingStyle]} />
      
      {/* Ripple effects */}
      <Animated.View style={[styles.ripple1, ripple1Style]} />
      <Animated.View style={[styles.ripple2, ripple2Style]} />
      <Animated.View style={[styles.ripple3, ripple3Style]} />
      
      {/* Floating particles */}
      <View style={[styles.floatingParticles, { top: screenHeight * 0.3, left: screenWidth * 0.2 }]} />
      <View style={[styles.floatingParticles, { top: screenHeight * 0.4, left: screenWidth * 0.7 }]} />
      <View style={[styles.floatingParticles, { top: screenHeight * 0.6, left: screenWidth * 0.15 }]} />
      <View style={[styles.floatingParticles, { top: screenHeight * 0.7, left: screenWidth * 0.8 }]} />
    </View>
  );
} 