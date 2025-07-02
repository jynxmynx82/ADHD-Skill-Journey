import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import TreeTrunk from '@/assets/svg/TreeTrunk.svg';
import Branch from '@/assets/svg/Branch.svg';
import Leaf from '@/assets/svg/Leaf.svg';
import { ResilienceTree as ResilienceTreeType } from '@/types/skillJourney';

interface ResilienceTreeProps {
  tree: ResilienceTreeType;
  size?: 'small' | 'medium' | 'large';
}

// Enhanced branch positions with leaf clusters
const BRANCH_CLUSTERS = [
  {
    branch: { left: 120, top: 120, rotate: -20 },
    leaves: [
      { left: 140, top: 100, rotate: -15, size: 0.8 },
      { left: 150, top: 110, rotate: 5, size: 1.0 },
      { left: 130, top: 115, rotate: -25, size: 0.7 },
    ]
  },
  {
    branch: { left: 200, top: 80, rotate: 10 },
    leaves: [
      { left: 220, top: 60, rotate: 15, size: 0.9 },
      { left: 230, top: 70, rotate: 25, size: 0.8 },
      { left: 210, top: 75, rotate: 5, size: 1.1 },
      { left: 225, top: 65, rotate: 20, size: 0.7 },
    ]
  },
  {
    branch: { left: 80, top: 200, rotate: -40 },
    leaves: [
      { left: 60, top: 180, rotate: -35, size: 0.8 },
      { left: 70, top: 190, rotate: -45, size: 0.9 },
      { left: 65, top: 185, rotate: -30, size: 0.7 },
    ]
  },
  {
    branch: { left: 220, top: 200, rotate: 30 },
    leaves: [
      { left: 240, top: 180, rotate: 35, size: 0.9 },
      { left: 250, top: 190, rotate: 40, size: 0.8 },
      { left: 235, top: 185, rotate: 25, size: 1.0 },
    ]
  },
  {
    branch: { left: 150, top: 40, rotate: 0 },
    leaves: [
      { left: 170, top: 20, rotate: 10, size: 0.8 },
      { left: 180, top: 30, rotate: 20, size: 0.9 },
      { left: 160, top: 25, rotate: -5, size: 0.7 },
      { left: 175, top: 15, rotate: 15, size: 0.8 },
    ]
  },
  {
    branch: { left: 60, top: 100, rotate: -30 },
    leaves: [
      { left: 40, top: 80, rotate: -25, size: 0.8 },
      { left: 50, top: 90, rotate: -35, size: 0.9 },
      { left: 45, top: 85, rotate: -20, size: 0.7 },
    ]
  },
];

// Additional standalone leaf positions for variety
const STANDALONE_LEAVES = [
  { left: 100, top: 60, rotate: 0, size: 0.8 },
  { left: 200, top: 40, rotate: 10, size: 0.9 },
  { left: 80, top: 80, rotate: -20, size: 0.7 },
  { left: 220, top: 60, rotate: 25, size: 0.8 },
  { left: 120, top: 200, rotate: -15, size: 0.9 },
  { left: 180, top: 60, rotate: 5, size: 0.7 },
];

const SIZE_MAP = {
  small: { width: 120, height: 180 },
  medium: { width: 200, height: 300 },
  large: { width: 300, height: 450 },
};

const ResilienceTreeComponent: React.FC<ResilienceTreeProps> = ({ tree, size = 'medium' }) => {
  const { width, height } = SIZE_MAP[size];
  const treeLevel = Math.min(tree.treeLevel, 5);
  const branchCount = Math.min(tree.branchCount || treeLevel + 2, BRANCH_CLUSTERS.length);
  
  // Calculate total leaves based on tree progress
  const totalLeaves = Math.min(tree.leafCount, 25); // Cap at 25 leaves max
  
  // Distribute leaves across branches and standalone positions
  const getLeafPositions = () => {
    const positions: Array<{ left: number; top: number; rotate: number; size: number }> = [];
    
    // Add leaves from branch clusters first
    let leafIndex = 0;
    for (let i = 0; i < branchCount && leafIndex < totalLeaves; i++) {
      const cluster = BRANCH_CLUSTERS[i];
      const clusterLeaves = Math.min(cluster.leaves.length, Math.ceil(totalLeaves / branchCount));
      
      for (let j = 0; j < clusterLeaves && leafIndex < totalLeaves; j++) {
        positions.push(cluster.leaves[j]);
        leafIndex++;
      }
    }
    
    // Add standalone leaves to fill remaining slots
    let standaloneIndex = 0;
    while (leafIndex < totalLeaves && standaloneIndex < STANDALONE_LEAVES.length) {
      positions.push(STANDALONE_LEAVES[standaloneIndex]);
      leafIndex++;
      standaloneIndex++;
    }
    
    return positions;
  };

  const leafPositions = getLeafPositions();

  return (
    <View style={[styles.container, { width, height }]}>  
      {/* Tree trunk as base */}
      <TreeTrunk width={width} height={height} style={StyleSheet.absoluteFill} />

      {/* Render branches */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const pos = BRANCH_CLUSTERS[i].branch;
        return (
          <View
            key={`branch-${i}`}
            style={[
              styles.branch,
              {
                left: pos.left * (width / 300),
                top: pos.top * (height / 450),
                transform: [{ rotate: `${pos.rotate}deg` }],
              },
            ]}
          >
            <Branch width={60} height={40} />
          </View>
        );
      })}

      {/* Render leaves with dynamic positioning */}
      {leafPositions.map((pos, i) => {
        const leafWidth = 20 * pos.size;
        const leafHeight = 30 * pos.size;
        
        return (
          <View
            key={`leaf-${i}`}
            style={[
              styles.leaf,
              {
                left: pos.left * (width / 300),
                top: pos.top * (height / 450),
                transform: [{ rotate: `${pos.rotate}deg` }],
              },
            ]}
          >
            <Leaf width={leafWidth} height={leafHeight} />
          </View>
        );
      })}

      {/* Tree stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.levelText}>Level {treeLevel}</Text>
        <Text style={styles.leafText}>{totalLeaves} leaves</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  branch: {
    position: 'absolute',
  },
  leaf: {
    position: 'absolute',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  leafText: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 2,
  },
});

export default ResilienceTreeComponent; 