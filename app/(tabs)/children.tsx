// app/(tabs)/children.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Edit, Trash2, User, Calendar, Activity, Heart, Brain, Star, Users, PenLine, ChevronRight } from 'lucide-react-native';
import { useFamily } from '@/context/FamilyContext';
import { useAuth } from '@/context/AuthContext';
import { Child } from '@/context/FamilyContext';
import { AppSafeArea, PageHeader, Card, TYPOGRAPHY, COLORS, SPACING } from '@/components/Layout';
import { useTheme } from '@/context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ChildrenScreen() {
  const { colors } = useTheme();
  const { children, loading, error, fetchChildren, deleteAllChildren } = useFamily();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;

  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Children screen focused - refreshing data...');
      fetchChildren();
    }, [fetchChildren])
  );

  const router = useRouter();
  
  const handleAddChild = () => {
    router.push('/children/add');
  };

  const handleViewChild = (id: string) => {
    router.push(`/children/${id}`);
  };

  const handleDeleteAll = async () => {
    try {
      console.log('🗑️ Starting delete all children from children screen...');
      await deleteAllChildren();
      alert('🗑️ All children deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting all children:', error);
      alert('❌ Failed to delete all children');
    }
  };

  const numColumns = isTablet ? 2 : 1;

  // 1. Create a component that returns everything you want to show ABOVE the list
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Children ({children.length})</Text>
      </View>
    </View>
  );

  // 2. Create empty state component
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Users size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Children Added Yet</Text>
      <Text style={styles.emptyDescription}>
        Start by adding your first child to track their progress and create personalized routines.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
        <Plus size={20} color={colors.background} style={{ marginRight: 8 }} />
        <Text style={{ ...TYPOGRAPHY.styles.button, color: colors.background }}>Add Your First Child</Text>
      </TouchableOpacity>
    </View>
  );

  // 3. Create loading component
  const renderLoadingComponent = () => (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.emptyTitle}>Loading children...</Text>
    </View>
  );

  // 4. Create error component
  const renderErrorComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={{ ...TYPOGRAPHY.styles.title, color: colors.error }}>⚠️</Text>
      </View>
      <Text style={styles.emptyTitle}>Error Loading Children</Text>
      <Text style={styles.emptyDescription}>
        {error?.message || 'There was a problem loading your children. Please try again.'}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={fetchChildren}>
        <Text style={{ color: colors.background, fontWeight: '600' }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // 5. List item renderer
  const renderChild = ({ item, index }: { item: any; index: number }) => {
    // Create alternating background colors for better differentiation
    const isEven = index % 2 === 0;
    const cardBackgroundColor = isEven ? colors.background : colors.card;
    
    return (
      <TouchableOpacity
        style={[
          styles.childCard, 
          isTablet && styles.childCardTablet,
          { backgroundColor: cardBackgroundColor }
        ]}
        onPress={() => handleViewChild(item.id)}
      >
        <Image source={{ uri: item.profileImage }} style={styles.childImage} />
        <View style={styles.childInfo}>
          <View style={styles.childNameRow}>
            <Text style={styles.childName}>{item.name}</Text>
            <Text style={styles.childAge}>{item.age} years</Text>
          </View>
          <Text style={styles.childDiagnosis}>{item.diagnosis}</Text>
          
          <View style={styles.childDetails}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Strengths:</Text>
              <Text style={styles.detailText}>{item.strengths.join(', ')}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Challenges:</Text>
              <Text style={styles.detailText}>{item.challenges.join(', ')}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(`/children/edit/${item.id}`)}
            >
              <PenLine size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => handleViewChild(item.id)}
            >
              <Text style={styles.viewButtonText}>View Profile</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      padding: 16,
      paddingTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    title: {
      ...TYPOGRAPHY.styles.title,
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 100, // Add padding to ensure floating button doesn't hide content
    },
    childCard: {
      backgroundColor: colors.background,
      borderRadius: 0, // Remove rounded corners for rectangular look
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomWidth: 2, // Add thicker bottom border for separation
      borderBottomColor: colors.border,
      // Add subtle background variation for better differentiation
      ...(Platform.OS === 'web' ? {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      } : {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }),
    },
    childCardTablet: {
      margin: 8,
      flex: 1,
    },
    childImage: {
      width: '100%',
      height: 150,
    },
    childInfo: {
      padding: 16,
    },
    childNameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    childName: {
      ...TYPOGRAPHY.styles.sectionHeader,
      color: colors.text,
    },
    childAge: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
    },
    childDiagnosis: {
      ...TYPOGRAPHY.styles.body,
      color: colors.primary,
      marginBottom: SPACING.md,
    },
    childDetails: {
      marginBottom: 12,
    },
    detailSection: {
      marginBottom: 8,
    },
    detailLabel: {
      ...TYPOGRAPHY.styles.button,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    detailText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.primary,
      marginLeft: SPACING.xs,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewButtonText: {
      ...TYPOGRAPHY.styles.button,
      color: colors.primary,
      marginRight: SPACING.xs,
    },
    floatingButton: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      ...(Platform.OS === 'web'
        ? { 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25)',
          }
        : {
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }
      ),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      marginTop: 80,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      ...TYPOGRAPHY.styles.sectionHeader,
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    emptyDescription: {
      ...TYPOGRAPHY.styles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.lg,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  // 6. Use FlatList as the single, main scrolling element for the screen
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={loading ? [] : children}
        renderItem={renderChild}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns.toString()}
        
        // Pass your header component to the ListHeaderComponent prop
        ListHeaderComponent={renderListHeader}
        
        // Use this for the empty state
        ListEmptyComponent={
          loading ? renderLoadingComponent : 
          error ? renderErrorComponent : 
          renderEmptyComponent
        }
        
        contentContainerStyle={styles.listContent}
      />
      
      {/* Your floating action button lives here, outside the FlatList */}
      {!loading && !error && children.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddChild}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      )}
      
      {/* Debug panel for development */}
      {__DEV__ && !loading && !error && children.length > 0 && (
        <View style={{ 
          position: 'absolute', 
          bottom: 80, 
          left: 16, 
          padding: 16, 
          backgroundColor: colors.card,
          borderRadius: 8,
          zIndex: 999
        }}>
          <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.textSecondary }}>
            Debug: {children.length} children loaded
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: colors.error,
              padding: 8,
              borderRadius: 4,
              marginTop: 8,
              alignItems: 'center'
            }}
            onPress={handleDeleteAll}
          >
            <Text style={{ ...TYPOGRAPHY.styles.small, color: colors.background, fontWeight: '600' }}>
              🗑️ Delete All (Testing)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
