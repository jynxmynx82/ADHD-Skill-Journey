import React from 'react';
import { render } from '@testing-library/react-native';
import TreeTrunk from '@/assets/svg/TreeTrunk.svg';
import Branch from '@/assets/svg/Branch.svg';
import Leaf from '@/assets/svg/Leaf.svg';

describe('SVG Imports', () => {
  test('TreeTrunk SVG imports and renders correctly', () => {
    const { getByTestId } = render(
      <TreeTrunk 
        width={300} 
        height={400} 
        testID="tree-trunk"
      />
    );
    
    const treeTrunk = getByTestId('tree-trunk');
    expect(treeTrunk).toBeTruthy();
  });

  test('Branch SVG imports and renders correctly', () => {
    const { getByTestId } = render(
      <Branch 
        width={200} 
        height={100} 
        testID="branch"
      />
    );
    
    const branch = getByTestId('branch');
    expect(branch).toBeTruthy();
  });

  test('Leaf SVG imports and renders correctly', () => {
    const { getByTestId } = render(
      <Leaf 
        width={20} 
        height={30} 
        testID="leaf"
      />
    );
    
    const leaf = getByTestId('leaf');
    expect(leaf).toBeTruthy();
  });

  test('SVG components accept props correctly', () => {
    const { getByTestId } = render(
      <TreeTrunk 
        width={400} 
        height={500} 
        testID="tree-trunk-props"
        opacity={0.8}
      />
    );
    
    const treeTrunk = getByTestId('tree-trunk-props');
    expect(treeTrunk).toBeTruthy();
  });

  test('Multiple SVG components can be rendered together', () => {
    const { getByTestId } = render(
      <>
        <TreeTrunk width={300} height={400} testID="tree-trunk-multi" />
        <Branch width={100} height={80} testID="branch-multi" />
        <Leaf width={15} height={25} testID="leaf-multi" />
      </>
    );
    
    expect(getByTestId('tree-trunk-multi')).toBeTruthy();
    expect(getByTestId('branch-multi')).toBeTruthy();
    expect(getByTestId('leaf-multi')).toBeTruthy();
  });
}); 