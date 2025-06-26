import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // In a production app, you'd send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component with hardcoded colors
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#ffffff', // Default background
    },
    content: {
      alignItems: 'center',
      maxWidth: 400,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000000', // Default text color
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: '#666666', // Default secondary text color
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    errorDetails: {
      fontSize: 14,
      color: '#666666', // Default secondary text color
      textAlign: 'center',
      marginBottom: 24,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: '#f0f0f0', // Default border color
      padding: 12,
      borderRadius: 8,
      maxWidth: '100%',
    },
    button: {
      backgroundColor: '#007AFF', // Default primary color
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    buttonText: {
      color: '#ffffff', // Default background color for text on primary
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertTriangle size={48} color="#FF3B30" style={styles.icon} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again or restart the app.
        </Text>
        
        {__DEV__ && (
          <Text style={styles.errorDetails}>
            {error.message}
          </Text>
        )}
        
        <TouchableOpacity style={styles.button} onPress={resetError}>
          <RefreshCw size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ErrorBoundary; 