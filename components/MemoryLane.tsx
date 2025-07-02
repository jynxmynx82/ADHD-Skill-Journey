import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Adventure, AdventureWinType } from '@/types/skillJourney';

interface MemoryLaneProps {
  adventures: Adventure[];
  isLoading?: boolean;
}

const WIN_TYPE_EMOJIS: Record<AdventureWinType, string> = {
  'tried-best': '🌟',
  'no-frustration': '😌',
  'laughed-about-it': '😄',
  'made-progress': '📈',
  'kept-going': '💪',
  'custom': '✨',
};

const WIN_TYPE_LABELS: Record<AdventureWinType, string> = {
  'tried-best': 'We tried our best!',
  'no-frustration': 'We didn\'t get frustrated!',
  'laughed-about-it': 'We laughed about it!',
  'made-progress': 'We made progress!',
  'kept-going': 'We kept going!',
  'custom': 'Custom win',
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const AdventureItem: React.FC<{ adventure: Adventure }> = ({ adventure }) => {
  return (
    <View style={styles.adventureItem}>
      <View style={styles.adventureHeader}>
        <View style={styles.winTypeContainer}>
          <Text style={styles.winTypeEmoji}>
            {WIN_TYPE_EMOJIS[adventure.winType]}
          </Text>
          <Text style={styles.winTypeLabel}>
            {WIN_TYPE_LABELS[adventure.winType]}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {formatDate(adventure.createdAt)}
        </Text>
      </View>
      
      <Text style={styles.adventureText}>
        {adventure.text}
      </Text>
      
      {adventure.photoUrl && (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoText}>📸 Photo attached</Text>
        </View>
      )}
    </View>
  );
};

export const MemoryLane: React.FC<MemoryLaneProps> = ({ 
  adventures, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading adventures...</Text>
      </View>
    );
  }

  if (adventures.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={styles.emptyTitle}>No adventures yet!</Text>
        <Text style={styles.emptyText}>
          Start your journey by logging your first adventure. Every adventure helps your tree grow!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Lane</Text>
      <Text style={styles.subtitle}>
        {adventures.length} adventure{adventures.length !== 1 ? 's' : ''} logged
      </Text>
      
      <View style={styles.listContainer}>
        {adventures.map((adventure) => (
          <AdventureItem key={adventure.id} adventure={adventure} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  adventureItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  adventureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  winTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winTypeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  winTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  adventureText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  photoPlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  photoText: {
    fontSize: 14,
    color: '#666',
  },
});

export default MemoryLane; 