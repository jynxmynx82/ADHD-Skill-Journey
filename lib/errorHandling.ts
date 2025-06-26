/**
 * Error Handling Utilities
 * Provides consistent error handling across the app
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, any>;
}

export class AppError extends Error {
  code: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    userMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.severity = severity;
    this.timestamp = new Date();
    this.context = context;
  }
}

// Error codes for consistent error handling
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_EMAIL_ALREADY_IN_USE: 'AUTH_EMAIL_ALREADY_IN_USE',
  AUTH_NETWORK_ERROR: 'AUTH_NETWORK_ERROR',
  
  // Firebase errors
  FIREBASE_CONFIG_MISSING: 'FIREBASE_CONFIG_MISSING',
  FIREBASE_PERMISSION_DENIED: 'FIREBASE_PERMISSION_DENIED',
  FIREBASE_DOCUMENT_NOT_FOUND: 'FIREBASE_DOCUMENT_NOT_FOUND',
  
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_NO_CONNECTION: 'NETWORK_NO_CONNECTION',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_INVALID_LENGTH: 'VALIDATION_INVALID_LENGTH',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_PERMISSION_DENIED: 'STORAGE_PERMISSION_DENIED',
  
  // Camera errors
  CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
  CAMERA_NOT_AVAILABLE: 'CAMERA_NOT_AVAILABLE',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password must be at least 6 characters long.',
  [ERROR_CODES.AUTH_EMAIL_ALREADY_IN_USE]: 'An account with this email already exists.',
  [ERROR_CODES.AUTH_NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  
  [ERROR_CODES.FIREBASE_CONFIG_MISSING]: 'App configuration error. Please restart the app.',
  [ERROR_CODES.FIREBASE_PERMISSION_DENIED]: 'Access denied. Please check your permissions.',
  [ERROR_CODES.FIREBASE_DOCUMENT_NOT_FOUND]: 'The requested information was not found.',
  
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.NETWORK_NO_CONNECTION]: 'No internet connection. Please check your network.',
  
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Please enter a valid format.',
  [ERROR_CODES.VALIDATION_INVALID_LENGTH]: 'Please check the length of this field.',
  
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 'Storage limit reached. Please free up some space.',
  [ERROR_CODES.STORAGE_PERMISSION_DENIED]: 'Storage permission denied.',
  
  [ERROR_CODES.CAMERA_PERMISSION_DENIED]: 'Camera permission is required to scan barcodes.',
  [ERROR_CODES.CAMERA_NOT_AVAILABLE]: 'Camera is not available on this device.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.OPERATION_FAILED]: 'Operation failed. Please try again.',
} as const;

/**
 * Convert Firebase errors to AppError
 */
export function handleFirebaseError(error: any, context?: string): AppError {
  const errorCode = error?.code || 'unknown';
  const errorMessage = error?.message || 'Unknown Firebase error';
  
  // Map Firebase error codes to our error codes
  const errorCodeMap: Record<string, string> = {
    'auth/invalid-credential': ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    'auth/user-not-found': ERROR_CODES.AUTH_USER_NOT_FOUND,
    'auth/weak-password': ERROR_CODES.AUTH_WEAK_PASSWORD,
    'auth/email-already-in-use': ERROR_CODES.AUTH_EMAIL_ALREADY_IN_USE,
    'auth/network-request-failed': ERROR_CODES.AUTH_NETWORK_ERROR,
    'permission-denied': ERROR_CODES.FIREBASE_PERMISSION_DENIED,
    'not-found': ERROR_CODES.FIREBASE_DOCUMENT_NOT_FOUND,
  };
  
  const mappedCode = errorCodeMap[errorCode] || ERROR_CODES.UNKNOWN_ERROR;
  const userMessage = ERROR_MESSAGES[mappedCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  return new AppError(
    mappedCode,
    errorMessage,
    userMessage,
    'medium',
    { originalError: error, context }
  );
}

/**
 * Convert network errors to AppError
 */
export function handleNetworkError(error: any, context?: string): AppError {
  const isTimeout = error?.message?.includes('timeout') || error?.code === 'ECONNABORTED';
  const isNoConnection = error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR';
  
  const code = isTimeout ? ERROR_CODES.NETWORK_TIMEOUT : 
               isNoConnection ? ERROR_CODES.NETWORK_NO_CONNECTION : 
               ERROR_CODES.UNKNOWN_ERROR;
  
  return new AppError(
    code,
    error?.message || 'Network error',
    ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES],
    'medium',
    { originalError: error, context }
  );
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  code: string = ERROR_CODES.VALIDATION_REQUIRED_FIELD,
  message?: string
): AppError {
  return new AppError(
    code,
    message || `Validation error for field: ${field}`,
    ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES],
    'low',
    { field }
  );
}

/**
 * Log error for debugging (in production, this would send to a service like Sentry)
 */
export function logError(error: AppError | Error, context?: string) {
  if (__DEV__) {
    console.error(`[${context || 'App'}] Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        userMessage: error.userMessage,
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
      }),
    });
  } else {
    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { extra: { context } });
    console.error('Production error:', error.message);
  }
}

/**
 * Handle async operations with consistent error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    let appError: AppError;
    
    if (error instanceof AppError) {
      appError = error;
    } else if (error && typeof error === 'object' && 'code' in error) {
      // Firebase error
      appError = handleFirebaseError(error, context);
    } else {
      // Generic error
      appError = new AppError(
        ERROR_CODES.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        ERROR_MESSAGES.UNKNOWN_ERROR,
        'medium',
        { originalError: error, context }
      );
    }
    
    logError(appError, context);
    return { data: null, error: appError };
  }
} 