import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Mock theme object (consistent with other screens)
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    danger: '#dc3545',
    background: '#f0f0f0',
    text: '#333',
    lightGray: '#d3d3d3',
    white: '#ffffff',
    cardBackground: '#ffffff',
    inputBorder: '#ced4da',
  },
  spacing: { m: 16, s: 8, l: 24, xs: 4, xl: 32 },
  fontSize: { title: 24, large: 20, body: 16, label: 14, small: 12 },
  borderRadius: { s: 4, m: 8, l: 12 }
};

// --- Data Structures ---
interface Task {
  id: string; // Simple unique ID, e.g., timestamp or counter
  title: string;
  time: string; // e.g., "08:00 AM" or "15 minutes"
}

interface Routine {
  routineName: string;
  childId: string | null;
  tasks: Task[];
}

interface MockChild {
  id: string;
  name: string;
}

// Mock data for child selection
const MOCK_CHILDREN: MockChild[] = [
  { id: '1', name: 'Emma' },
  { id: '2', name: 'Jack' },
  { id: '3', name: 'Liam (No Routines Yet)' },
];

// --- UI Components (Placeholders/Mocks) ---
// Using basic TextInput and TouchableOpacity instead of custom Input/Button for simplicity here
const CustomInput = (props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{props.label}</Text>
    <TextInput
      style={[styles.textInput, props.multiline && styles.multilineInput]}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={theme.colors.lightGray}
      multiline={props.multiline}
    />
  </View>
);

const CustomButton = (props: { title: string; onPress: () => void; type?: 'primary' | 'danger' | 'secondary' }) => (
  <TouchableOpacity
    style={[styles.buttonBase, props.type === 'danger' ? styles.dangerButton : (props.type === 'secondary' ? styles.secondaryButton : styles.primaryButton)]}
    onPress={props.onPress}
  >
    <Text style={styles.buttonText}>{props.title}</Text>
  </TouchableOpacity>
);


// --- Add Routine Screen Component ---
export default function AddRoutineScreen() {
  const router = useRouter();
  const [routineName, setRoutineName] = useState('');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskTitle, setCurrentTaskTitle] = useState('');
  const [currentTaskTime, setCurrentTaskTime] = useState('');

  const handleAddTask = () => {
    if (!currentTaskTitle.trim() || !currentTaskTime.trim()) {
      Alert.alert('Missing Task Info', 'Please enter both a title and time for the task.');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(), // Simple unique ID
      title: currentTaskTitle.trim(),
      time: currentTaskTime.trim(),
    };
    setTasks([...tasks, newTask]);
    setCurrentTaskTitle('');
    setCurrentTaskTime('');
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      Alert.alert('Missing Routine Name', 'Please enter a name for the routine.');
      return;
    }
    if (!selectedChildId) {
      Alert.alert('No Child Selected', 'Please select a child for this routine.');
      return;
    }
    if (tasks.length === 0) {
      Alert.alert('No Tasks Added', 'Please add at least one task to the routine.');
      return;
    }

    const newRoutine: Routine = {
      routineName,
      childId: selectedChildId,
      tasks,
    };

    console.log('Saving New Routine:', JSON.stringify(newRoutine, null, 2));
    Alert.alert('Routine Saved (Mock)', `Routine "${routineName}" for child ID ${selectedChildId} logged to console.`);
    // router.back(); // Or navigate to the schedule list
    // Reset form or navigate away
    setRoutineName('');
    setSelectedChildId(null);
    setTasks([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.mainTitle}>Create New Routine</Text>

      {/* Routine Name Input */}
      <CustomInput
        label="Routine Name"
        value={routineName}
        onChangeText={setRoutineName}
        placeholder="e.g., Morning Checklist, Bedtime Wind-down"
      />

      {/* Child Selector */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Assign to Child</Text>
        <View style={styles.childSelectorContainer}>
          {MOCK_CHILDREN.map(child => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childButton,
                selectedChildId === child.id && styles.childButtonSelected,
              ]}
              onPress={() => setSelectedChildId(child.id)}
            >
              <Text
                style={[
                  styles.childButtonText,
                  selectedChildId === child.id && styles.childButtonTextSelected,
                ]}
              >
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
         {selectedChildId && <Text style={styles.selectedChildText}>Selected: {MOCK_CHILDREN.find(c => c.id === selectedChildId)?.name}</Text>}
      </View>

      {/* Add Task Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Tasks</Text>
        <CustomInput
          label="Task Title"
          value={currentTaskTitle}
          onChangeText={setCurrentTaskTitle}
          placeholder="e.g., Brush Teeth, Pack School Bag"
        />
        <CustomInput
          label="Task Time / Duration"
          value={currentTaskTime}
          onChangeText={setCurrentTaskTime}
          placeholder="e.g., 07:30 AM or 15 mins"
        />
        <CustomButton title="Add Task to Routine" onPress={handleAddTask} type="secondary" />
      </View>

      {/* Current Tasks List */}
      {tasks.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Tasks in Routine</Text>
          {tasks.map((task, index) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>{index + 1}. {task.title}</Text>
                <Text style={styles.taskTime}>Time/Duration: {task.time}</Text>
              </View>
              <CustomButton title="Remove" onPress={() => handleRemoveTask(task.id)} type="danger"/>
            </View>
          ))}
        </View>
      )}

      {/* Save Routine Button */}
      <CustomButton title="Save Routine" onPress={handleSaveRoutine} />
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  contentContainer: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
  mainTitle: { fontSize: theme.fontSize.title, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.l },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...(Platform.OS === 'web' ? { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }),
  },
  sectionTitle: { fontSize: theme.fontSize.large, fontWeight: '600', color: theme.colors.primary, marginBottom: theme.spacing.m },
  inputGroup: { marginBottom: theme.spacing.m },
  label: { fontSize: theme.fontSize.label, fontWeight: '500', color: theme.colors.text, marginBottom: theme.spacing.xs },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.s * 1.2,
    fontSize: theme.fontSize.body,
    backgroundColor: theme.colors.white,
    minHeight: 40,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonBase: {
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s,
  },
  primaryButton: { backgroundColor: theme.colors.primary },
  secondaryButton: { backgroundColor: theme.colors.secondary },
  dangerButton: { backgroundColor: theme.colors.danger, paddingVertical: theme.spacing.s, marginTop: 0 }, // smaller for remove
  buttonText: { color: theme.colors.white, fontSize: theme.fontSize.body, fontWeight: 'bold' },

  childSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.s,
  },
  childButton: {
    backgroundColor: theme.colors.lightGray,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    marginRight: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  childButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  childButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  childButtonTextSelected: {
    color: theme.colors.white,
  },
  selectedChildText: {
    fontSize: theme.fontSize.small,
    fontStyle: 'italic',
    color: theme.colors.secondary,
    marginTop: theme.spacing.xs,
  },

  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  taskDetails: {
    flex: 1,
    marginRight: theme.spacing.s,
  },
  taskTitle: { fontSize: theme.fontSize.body, fontWeight: '500' },
  taskTime: { fontSize: theme.fontSize.small, color: theme.colors.secondary },
});
