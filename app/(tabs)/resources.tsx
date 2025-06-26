import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Linking,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Resource, ResourceCategory } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, Video, FileText, Users, Wrench, ExternalLink, Heart, Star, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock data - Replace with actual data source later
const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Understanding ADHD',
    description: 'A comprehensive guide about ADHD and its impact.',
    type: 'articles',
    url: 'https://example.com/understanding-adhd',
    imageUrl: 'https://via.placeholder.com/300x200',
    featured: true,
    dateAdded: '2024-03-20',
  },
  {
    id: '2',
    title: 'ADHD Management Strategies',
    description: 'Video series on effective strategies for managing ADHD.',
    type: 'videos',
    url: 'https://example.com/management-strategies',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-19',
  },
  {
    id: '3',
    title: 'Self-Care Guide',
    description: 'Tips and strategies for maintaining your well-being.',
    type: 'articles',
    url: 'https://example.com/self-care',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-18',
  },
  {
    id: '4',
    title: 'ADHD and School Success',
    description: 'Strategies for helping your child succeed in school.',
    type: 'articles',
    url: 'https://example.com/school-success',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-17',
  },
  {
    id: '5',
    title: 'Building Routines',
    description: 'How to create and maintain effective routines for children with ADHD.',
    type: 'videos',
    url: 'https://example.com/routines',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-16',
  },
  {
    id: '6',
    title: 'Parent Self-Care Essentials',
    description: 'A comprehensive guide to maintaining your well-being while supporting your child with ADHD.',
    type: 'self-care',
    url: 'https://example.com/parent-self-care',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-15',
  },
  {
    id: '7',
    title: 'Stress Management for Parents',
    description: 'Learn practical techniques to manage stress and prevent burnout while caring for your child.',
    type: 'self-care',
    url: 'https://example.com/stress-management',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-14',
  },
  {
    id: '8',
    title: 'Mindfulness for ADHD Parents',
    description: 'Simple mindfulness exercises to help you stay present and reduce anxiety.',
    type: 'self-care',
    url: 'https://example.com/mindfulness-adhd',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-13',
  },
  {
    id: '9',
    title: 'Building Your Support Network',
    description: 'How to create and maintain a strong support system as a parent of a child with ADHD.',
    type: 'self-care',
    url: 'https://example.com/support-network',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-12',
  },
  {
    id: '10',
    title: 'Healthy Boundaries Guide',
    description: 'Learn how to set and maintain healthy boundaries while supporting your child with ADHD.',
    type: 'self-care',
    url: 'https://example.com/healthy-boundaries',
    imageUrl: 'https://via.placeholder.com/300x200',
    dateAdded: '2024-03-11',
  }
];

const CATEGORIES: ResourceCategory[] = ['all', 'articles', 'videos', 'books', 'tools', 'community', 'self-care', 'favorites'];

export default function ResourcesScreen() {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: ResourceCategory }>();

  // Set initial category from URL params
  useEffect(() => {
    if (category && CATEGORIES.includes(category)) {
      setSelectedCategory(category);
    }
  }, [category]);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('resourceFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (resourceId: string) => {
    try {
      const newFavorites = favorites.includes(resourceId)
        ? favorites.filter(id => id !== resourceId)
        : [...favorites, resourceId];
      
      setFavorites(newFavorites);
      await AsyncStorage.setItem('resourceFavorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const getIconForCategory = useCallback((category: ResourceCategory) => {
    switch (category) {
      case 'articles':
        return <FileText size={20} color={colors.text} />;
      case 'videos':
        return <Video size={20} color={colors.text} />;
      case 'books':
        return <BookOpen size={20} color={colors.text} />;
      case 'tools':
        return <Wrench size={20} color={colors.text} />;
      case 'community':
        return <Users size={20} color={colors.text} />;
      case 'self-care':
        return <Heart size={20} color={colors.text} />;
      case 'favorites':
        return <Star size={20} color={colors.text} />;
      default:
        return null;
    }
  }, [colors.text]);

  const handleResourcePress = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  }, []);

  const filteredResources = RESOURCES.filter(resource => {
    if (selectedCategory === 'favorites') {
      return favorites.includes(resource.id);
    }
    return selectedCategory === 'all' || resource.type === selectedCategory;
  });

  const featuredResource = RESOURCES.find(resource => resource.featured);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: isWeb ? 'center' : undefined,
      justifyContent: isWeb ? 'flex-start' : undefined,
    },
    inner: {
      flex: 1,
      width: isWeb ? Math.min(windowWidth * 0.9, 1200) : '100%',
      maxWidth: isWeb ? 1200 : '100%',
      alignSelf: isWeb ? 'center' : 'stretch',
      backgroundColor: isWeb ? 'rgba(255,255,255,0.95)' : colors.background,
      borderRadius: isWeb ? 24 : 0,
      marginTop: isWeb ? 32 : 0,
      marginBottom: isWeb ? 32 : 0,
      marginLeft: isWeb ? 80 : 0,
      overflow: 'hidden',
    },
    header: {
      padding: 16,
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      marginRight: 12,
      padding: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    categoryContainer: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryContent: {
      paddingHorizontal: 16,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
    },
    categoryTextActive: {
      color: colors.background,
    },
    featuredContainer: {
      margin: 16,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featuredImage: {
      width: '100%',
      height: 200,
    },
    featuredContent: {
      padding: 16,
    },
    featuredTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    featuredDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    featuredFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    featuredType: {
      fontSize: 14,
      color: colors.primary,
    },
    gridContainer: {
      padding: 16,
    },
    gridContainerTablet: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    resourceCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resourceCardTablet: {
      width: '48%',
    },
    resourceImage: {
      width: '100%',
      height: 150,
    },
    resourceContent: {
      padding: 16,
    },
    resourceTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    resourceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    resourceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resourceType: {
      fontSize: 14,
      color: colors.primary,
    },
    favoriteButton: {
      padding: 4,
    },
  });

  // Web-only gradient wrapper
  const WebGradientWrapper = ({ children }: { children: React.ReactNode }) =>
    isWeb ? (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #d0f5e8 0%, #b3e0ff 100%)' }}>
        {children}
      </div>
    ) : (
      <>{children}</>
    );

  return (
    <WebGradientWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                accessibilityLabel="Go back"
              >
                <ArrowLeft color={colors.text} size={24} />
              </TouchableOpacity>
              <Text style={styles.title}>Resources</Text>
            </View>
          </View>

          <ScrollView>
            {/* Category Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
              contentContainerStyle={styles.categoryContent}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  {getIconForCategory(category)}
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured Resource */}
            {featuredResource && (
              <TouchableOpacity
                style={styles.featuredContainer}
                onPress={() => handleResourcePress(featuredResource.url)}
              >
                {featuredResource.imageUrl && (
                  <Image
                    source={{ uri: featuredResource.imageUrl }}
                    style={styles.featuredImage}
                  />
                )}
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle}>{featuredResource.title}</Text>
                  <Text style={styles.featuredDescription}>
                    {featuredResource.description}
                  </Text>
                  <View style={styles.featuredFooter}>
                    <Text style={styles.featuredType}>
                      {featuredResource.type.charAt(0).toUpperCase() + featuredResource.type.slice(1)}
                    </Text>
                    <ExternalLink size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Resource Grid */}
            <View style={[styles.gridContainer, isTablet && styles.gridContainerTablet]}>
              {filteredResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={[styles.resourceCard, isTablet && styles.resourceCardTablet]}
                  onPress={() => handleResourcePress(resource.url)}
                >
                  {resource.imageUrl && (
                    <Image
                      source={{ uri: resource.imageUrl }}
                      style={styles.resourceImage}
                    />
                  )}
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceDescription} numberOfLines={2}>
                      {resource.description}
                    </Text>
                    <View style={styles.resourceFooter}>
                      <Text style={styles.resourceType}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(resource.id)}
                        style={styles.favoriteButton}
                      >
                        <Star
                          size={16}
                          color={favorites.includes(resource.id) ? colors.primary : colors.textSecondary}
                          fill={favorites.includes(resource.id) ? colors.primary : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </WebGradientWrapper>
  );
} 