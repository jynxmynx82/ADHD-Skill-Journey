import React from 'react';
import { Platform } from 'react-native';

interface WebGradientWrapperProps {
  children: React.ReactNode;
}

export function WebGradientWrapper({ children }: WebGradientWrapperProps) {
  if (Platform.OS === 'web') {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #d0f5e8 0%, #b3e0ff 100%)' }}>
        {children}
      </div>
    );
  }
  return <>{children}</>;
} 