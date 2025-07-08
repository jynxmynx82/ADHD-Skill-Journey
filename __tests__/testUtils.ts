import { act } from '@testing-library/react-native';

// Utility to wrap async operations in act()
export const waitForAsync = async (callback: () => void | Promise<void>) => {
  await act(async () => {
    await callback();
  });
};

// Mock for react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock for expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(),
    Recording: jest.fn(),
  },
}));

// Mock for expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
    },
  },
}));

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act(...)')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 