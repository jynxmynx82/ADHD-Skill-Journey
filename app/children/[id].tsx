import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

// Mock theme object
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    background: '#f0f0f0',
    text: '#333',
    error: '#dc3545',
    lightGray: '#d3d3d3',
    white: '#ffffff',
    cardBackground: '#ffffff',
    checkboxBorder: '#ced4da',
    checkboxChecked: '#007bff',
  },
  spacing: { m: 16, s: 8, l: 24, xs: 4, xl: 32 },
  fontSize: { title: 24, large: 20, body: 16, label: 14, small: 12 },
  borderRadius: { s: 4, m: 8, l: 12 }
};

// --- Data Structures ---
interface Goal {
  id: string;
  text: string;
  type: 'short-term' | 'long-term';
  completed: boolean;
}

interface Need {
  id: string;
  text: string;
  goals: Goal[];
}

interface ChildProfile {
  id: string;
  name: string;
  age: number | string;
  diagnosis: string;
  keyStrengths: string;
  keyChallenges: string;
  medications?: string;
  allergies?: string;
  needs?: Need[];
}

// --- Mock Data Fetching ---
const fetchChildData = (childId: string): ChildProfile | null => {
  console.log(`Fetching data for child ID (view enhanced): ${childId}`);
  if (childId) {
    return {
      id: childId,
      name: 'Emma',
      age: 8,
      diagnosis: 'ADHD - Combined Type',
      keyStrengths: 'Creative, Energetic, Excellent problem solver, Empathetic',
      keyChallenges: 'Difficulty with sustained attention in non-preferred tasks, Impulsivity in social settings, Transitions between activities',
      medications: 'Methylphenidate 10mg (AM), Melatonin 3mg (PM for sleep)',
      allergies: 'Peanuts (anaphylaxis), Dairy (mild intolerance)',
      needs: [
        {
          id: 'n1',
          text: 'Difficulty with morning routine',
          goals: [
            { id: 'g1', text: 'Complete morning routine checklist by 8:00 AM', type: 'short-term', completed: false },
            { id: 'g2', text: 'Independently start morning routine within 5 mins of waking', type: 'long-term', completed: true },
          ],
        },
        {
          id: 'n2',
          text: 'Impulsivity during homework completion',
          goals: [
            { id: 'g3', text: 'Use a timer for focused work intervals (15 mins)', type: 'short-term', completed: false },
          ],
        },
        {
          id: 'n3',
          text: 'Managing transitions between preferred and non-preferred activities',
          goals: [],
        }
      ],
    };
  }
  return null;
};

// --- UI Components ---
const InfoSection = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.checkboxBase, checked && styles.checkboxChecked]}>
    {checked && <Text style={styles.checkboxCheckmark}>✓</Text>}
  </TouchableOpacity>
);

const GoalItem = ({ goal, onToggleCompletion }: { goal: Goal; onToggleCompletion: (goalId: string) => void }) => (
  <View style={styles.goalItemContainer}>
    <Checkbox checked={goal.completed} onPress={() => onToggleCompletion(goal.id)} />
    <View style={styles.goalTextContainer}>
      <Text style={[styles.goalText, goal.completed && styles.goalTextCompleted]}>{goal.text}</Text>
      <Text style={styles.goalType}>{goal.type} - {goal.completed ? 'Completed' : 'Pending'}</Text>
    </View>
  </View>
);

const AddItemButton = ({ onPress, title }: { onPress: () => void; title: string }) => (
  <TouchableOpacity style={styles.addItemButton} onPress={onPress}>
    <Text style={styles.addItemButtonText}>{title}</Text>
  </TouchableOpacity>
);

// --- Main Screen Component ---
export default function ViewChildProfileScreen() {
  const { id: childId } = useLocalSearchParams<{ id: string }>();
  const [childInfo, setChildInfo] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      const data = fetchChildData(childId);
      setChildInfo(data);
    }
    setLoading(false);
  }, [childId]);

  const handleToggleGoalCompletion = (needId: string, goalId: string) => {
    setChildInfo(prev => {
      if (!prev || !prev.needs) return prev;
      const updatedNeeds = prev.needs.map(need => {
        if (need.id === needId) {
          return {
            ...need,
            goals: need.goals.map(goal => {
              if (goal.id === goalId) {
                console.log(`Toggling goal: ${goal.text}, new status: ${!goal.completed}`);
                return { ...goal, completed: !goal.completed };
              }
              return goal;
            }),
          };
        }
        return need;
      });
      return { ...prev, needs: updatedNeeds };
    });
  };

  const handleAddNeed = () => {
    console.log("Placeholder: Add Need button pressed for child:", childId);
    alert("Functionality to add a new need is not yet implemented.");
  };

  const handleAddGoal = (needId: string) => {
    console.log(`Placeholder: Add Goal button pressed for need: ${needId}, child: ${childId}`);
    alert("Functionality to add a new goal is not yet implemented.");
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!childInfo) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Child profile not found.</Text>
        <Link href="/children" style={styles.linkButton}>Go Back to List</Link>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.mainTitle}>{childInfo.name}'s Profile</Text>

      {/* Basic Info Card */}
      <View style={styles.card}>
        <InfoSection label="Nickname" value={childInfo.name} />
        <InfoSection label="Age" value={childInfo.age.toString()} />
        <InfoSection label="Diagnosis" value={childInfo.diagnosis} />
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <InfoSection label="Key Strengths" value={childInfo.keyStrengths} />
        <InfoSection label="Key Challenges" value={childInfo.keyChallenges} />
      </View>

      {/* Health Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Health Information</Text>
        <InfoSection label="Medications" value={childInfo.medications} />
        <InfoSection label="Allergies/Dietary Restrictions" value={childInfo.allergies} />
      </View>

      {/* Needs and Goals Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Needs & Goals</Text>
        {childInfo.needs && childInfo.needs.length > 0 ? (
          childInfo.needs.map(need => (
            <View key={need.id} style={styles.needContainer}>
              <Text style={styles.needText}>{need.text}</Text>
              {need.goals.length > 0 ? (
                need.goals.map(goal => (
                  <GoalItem key={goal.id} goal={goal} onToggleCompletion={() => handleToggleGoalCompletion(need.id, goal.id)} />
                ))
              ) : (
                <Text style={styles.noGoalsText}>No goals defined for this need yet.</Text>
              )}
              <AddItemButton title="+ Add Goal" onPress={() => handleAddGoal(need.id)} />
            </View>
          ))
        ) : (
          <Text style={styles.noNeedsText}>No needs identified yet.</Text>
        )}
        <AddItemButton title="+ Add Need" onPress={handleAddNeed} />
      </View>

      <Link href={`/children/edit/${childId}`} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit {childInfo.name}'s Profile</Text>
      </Link>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: theme.spacing.m },
  centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  mainTitle: { fontSize: theme.fontSize.title, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.l },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...(Platform.OS === 'web' ? { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }),
  },
  sectionTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    paddingBottom: theme.spacing.s,
  },
  infoSection: { marginBottom: theme.spacing.m },
  infoLabel: { fontSize: theme.fontSize.label, fontWeight: '500', color: theme.colors.text, opacity: 0.7, marginBottom: theme.spacing.xs },
  infoValue: { fontSize: theme.fontSize.body, color: theme.colors.text, lineHeight: theme.fontSize.body * 1.5 },
  errorText: { fontSize: theme.fontSize.body, color: theme.colors.error, textAlign: 'center' },
  linkButton: {
    marginTop: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.s,
    textAlign: 'center', // For text within Link if it's a direct child
    color: theme.colors.white, // If Link itself renders text
    fontSize: theme.fontSize.body,
  },
  editButton: {
    marginTop: theme.spacing.l,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  editButtonText: { color: theme.colors.white, fontSize: theme.fontSize.body, fontWeight: 'bold', textAlign: 'center' },

  // Needs and Goals specific styles
  needContainer: {
    marginBottom: theme.spacing.m,
    padding: theme.spacing.s,
    backgroundColor: theme.colors.background, // Light background for each need section
    borderRadius: theme.borderRadius.s,
  },
  needText: {
    fontSize: theme.fontSize.body,
    fontWeight: '600',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.s,
  },
  goalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    marginLeft: theme.spacing.s, // Indent goals slightly under needs
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  goalTextContainer: {
    marginLeft: theme.spacing.s,
    flex: 1,
  },
  goalText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.secondary,
  },
  goalType: {
    fontSize: theme.fontSize.small,
    color: theme.colors.secondary,
    fontStyle: 'italic',
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.checkboxBorder,
    borderRadius: theme.borderRadius.s,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.checkboxChecked,
    borderColor: theme.colors.checkboxChecked,
  },
  checkboxCheckmark: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  noGoalsText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.secondary,
    fontStyle: 'italic',
    marginLeft: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  noNeedsText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.m,
  },
  addItemButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    alignSelf: 'flex-start', // Don't make it full width
    marginTop: theme.spacing.s,
    marginLeft: theme.spacing.s, // Indent "Add Goal" button
  },
  addItemButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.body,
    fontWeight: '500',
  },
});
