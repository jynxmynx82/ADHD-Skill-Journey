import React from 'react';
import { View } from 'react-native';

// Mock SVG component for Jest tests
const SvgMock: React.FC<any> = ({ testID, ...props }) => {
  return <View testID={testID} {...props} />;
};

export default SvgMock;

// Ensure this file is not treated as a test
export {}; 