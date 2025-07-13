import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Adventure, AdventureWinType, Journey } from '@/types/skillJourney';
import { Sparkles } from 'lucide-react-native';
import { PremiumFeatureGate } from '@/components/premium/PremiumFeatureGate';
import { aiStoryService } from '@/lib/aiStoryService';
import { useTheme } from '@/context/ThemeContext';

interface MemoryLaneProps {
  adventures: Adventure[];
  journey: Journey | null; // Pass the whole journey object
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
  'tried-best': 'We gave it our all!',
  'no-frustration': 'We stayed calm!',
  'laughed-about-it': 'We found the fun!',
  'made-progress': 'We got better!',
  'kept-going': 'We didn\'t give up!',
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

const getEncouragingMessage = (adventureCount: number): string => {
  if (adventureCount === 0) return "Your story is just beginning!";
  if (adventureCount === 1) return "Your first adventure! 🌱";
  if (adventureCount <= 3) return "You're building something amazing!";
  if (adventureCount <= 7) return "Look how far you've come!";
  if (adventureCount <= 14) return "You're becoming unstoppable!";
  return "You're absolutely incredible!";
};

const AdventureItem: React.FC<{ adventure: Adventure; index: number }> = ({ adventure, index }) => {
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
  journey,
  isLoading = false 
}) => {
  const { colors } = useTheme();
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (!journey) return;

    setIsGeneratingStory(true);
    try {
      const story = await aiStoryService.generateStory(journey);
      Alert.alert(story.title, story.content);
    } catch (error) {
      console.error("Error generating story:", error);
      Alert.alert("Error", "Could not generate the story. Please try again.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your adventures...</Text>
      </View>
    );
  }


  if (adventures.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={styles.emptyTitle}>Your story starts here!</Text>
        <Text style={styles.emptyText}>
          Every adventure you log helps your progress grow stronger. Ready to start your journey?
        </Text>
      </View>
    );
  }

  const encouragingMessage = getEncouragingMessage(adventures.length);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Adventure Story</Text>
      <Text style={styles.encouragingMessage}>{encouragingMessage}</Text>
      <Text style={styles.subtitle}>
        {adventures.length} adventure{adventures.length !== 1 ? 's' : ''} in your story
      </Text>

      {/* AI Story Generation Button */}
      <PremiumFeatureGate feature="ai_story_generation">
        <View style={styles.storyButtonContainer}>
          <TouchableOpacity
            style={[
              styles.storyButton,
              (adventures.length < 3 || isGeneratingStory) && styles.storyButtonDisabled,
              { backgroundColor: '#14B8A6' } // Use theme.colors.secondary[500]
            ]}
            onPress={handleGenerateStory}
            disabled={adventures.length < 3 || isGeneratingStory}
          >
            <Sparkles size={20} color={colors.background} />
            <Text style={[styles.storyButtonText, { color: colors.background }]}>
              {isGeneratingStory ? 'Creating Story...' : 'Create Adventure Story'}
            </Text>
          </TouchableOpacity>
        </View>
      </PremiumFeatureGate>
      
      <View style={styles.listContainer}>
        {adventures.map((adventure, index) => (
          <AdventureItem key={adventure.id} adventure={adventure} index={index} />
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
  encouragingMessage: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
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
  },
  photoPlaceholder: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  photoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  storyButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  storyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  storyButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  storyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MemoryLane; 