jest.mock('@/firebaseConfig', () => ({
  __esModule: true,
  default: {
    apiKey: 'test-api-key',
    authDomain: 'test-domain',
    projectId: 'test-project',
    storageBucket: 'test-bucket',
    messagingSenderId: 'test-sender',
    appId: 'test-app-id',
    measurementId: 'test-measurement',
  },
}));

// Mock firebase/app and firebase/firestore
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => [{}]),
  getApp: jest.fn(() => ({})),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  Link: 'Link',
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // Simulate no user
    return jest.fn(); // Return unsubscribe function
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      firebaseApiKey: 'test-api-key',
      firebaseAuthDomain: 'test-domain',
      firebaseProjectId: 'test-project',
      firebaseStorageBucket: 'test-bucket',
      firebaseMessagingSenderId: 'test-sender',
      firebaseAppId: 'test-app-id',
      firebaseMeasurementId: 'test-measurement',
    },
  },
}));

// Ensure this file is not treated as a test
export {}; 