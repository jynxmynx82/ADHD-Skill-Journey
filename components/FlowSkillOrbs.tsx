import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFamily } from '@/context/FamilyContext';
import { slice1Service } from '@/lib/skillJourneyService';
import { Journey } from '@/types/skillJourney';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FlowSkillOrbsProps {
  onSkillSelect: (skillId: string) => void;
  selectedSkill: string | null;
}

export default function FlowSkillOrbs({ onSkillSelect, selectedSkill }: FlowSkillOrbsProps) {
  const { colors } = useTheme();
  const { selectedChildId } = useFamily();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  // Load journeys
  useEffect(() => {
    const loadJourneys = async () => {
      console.log('FlowSkillOrbs: Loading journeys for childId:', selectedChildId);
      
      if (!selectedChildId) {
        console.log('FlowSkillOrbs: No selectedChildId, setting empty journeys');
        setLoading(false);
        setJourneys([]);
        return;
      }

      try {
        setLoading(true);
        const result = await slice1Service.getJourneys(selectedChildId);
        console.log('FlowSkillOrbs: API result:', result);
        
        if (result && result.data) {
          console.log('FlowSkillOrbs: Setting journeys:', result.data.length);
          setJourneys(result.data);
        } else {
          console.log('FlowSkillOrbs: No data, setting empty journeys');
          setJourneys([]);
        }
      } catch (error) {
        console.error('FlowSkillOrbs: Error loading journeys:', error);
        setJourneys([]);
      } finally {
        setLoading(false);
      }
    };

    loadJourneys();
  }, [selectedChildId]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
    },
    orb: {
      position: 'absolute',
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    orbText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    selectedOrb: {
      borderWidth: 3,
      borderColor: colors.primary,
    },
    skillRipple: {
      position: 'absolute',
      borderRadius: 100,
      borderWidth: 2,
      opacity: 0.4,
    },
    skillRipple2: {
      position: 'absolute',
      borderRadius: 150,
      borderWidth: 1,
      opacity: 0.3,
    },
    skillRipple3: {
      position: 'absolute',
      borderRadius: 200,
      borderWidth: 1,
      opacity: 0.2,
    },
  });

  // Orb positions (distributed around the pond)
  const orbPositions = [
    { top: screenHeight * 0.25, left: screenWidth * 0.15 },
    { top: screenHeight * 0.35, left: screenWidth * 0.75 },
    { top: screenHeight * 0.55, left: screenWidth * 0.2 },
    { top: screenHeight * 0.65, left: screenWidth * 0.7 },
    { top: screenHeight * 0.45, left: screenWidth * 0.45 },
  ];

  const getOrbSize = (progress: number) => {
    const baseSize = 60;
    const maxGrowth = 40;
    return baseSize + (progress / 100) * maxGrowth;
  };

  const getOrbColor = (category: string) => {
    const colors = {
      'calming': '#4A90E2', // Blue
      'focus': '#50C878',   // Green
      'social': '#FF6B6B',  // Red
      'physical': '#FFD93D', // Yellow
      'default': '#9B59B6', // Purple
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  // Function to mix colors when ripples intersect
  const mixColors = (color1: string, color2: string) => {
    // Simple color mixing - average the RGB values
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  console.log('FlowSkillOrbs: Render state - loading:', loading, 'journeys:', journeys?.length);

  if (loading || !journeys) {
    console.log('FlowSkillOrbs: Returning null due to loading or no journeys');
    return null;
  }

  console.log('FlowSkillOrbs: Rendering orbs for', journeys.length, 'journeys');

  return (
    <View style={styles.container}>
      {journeys.map((journey, index) => {
        console.log('FlowSkillOrbs: Processing journey', index, journey);
        
        if (!journey || !journey.skillData) {
          console.log('FlowSkillOrbs: Skipping journey', index, 'due to conditions');
          return null;
        }
        
        const position = orbPositions[index % orbPositions.length];
        const size = getOrbSize(journey.progress?.adventureCount || 0);
        const color = getOrbColor(journey.skillData.category);
        const isSelected = selectedSkill === journey.skillData.id;

        return (
          <View
            key={journey.skillData.id}
            style={[
              styles.orb,
              {
                top: position.top,
                left: position.left,
                width: size,
                height: size,
                backgroundColor: color,
              },
              isSelected && styles.selectedOrb,
            ]}
          >
            {/* Skill ripples that expand outward */}
            <View
              style={[
                styles.skillRipple,
                {
                  top: -40,
                  left: -40,
                  width: size + 80,
                  height: size + 80,
                  borderColor: color,
                }
              ]}
            />
            <View
              style={[
                styles.skillRipple2,
                {
                  top: -90,
                  left: -90,
                  width: size + 180,
                  height: size + 180,
                  borderColor: color,
                }
              ]}
            />
            <View
              style={[
                styles.skillRipple3,
                {
                  top: -140,
                  left: -140,
                  width: size + 280,
                  height: size + 280,
                  borderColor: color,
                }
              ]}
            />
            
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => onSkillSelect(journey.skillData.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.orbText}>
                {journey.skillData.name}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
} 