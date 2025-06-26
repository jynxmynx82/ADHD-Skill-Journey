// app/schedule/new-routine.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useSchedule, SubTask } from '@/context/ScheduleContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useFamily } from '@/context/FamilyContext';
import BaseButton from '@/components/ui/BaseButton';

export default function NewRoutineScreen() {
  const router = useRouter();
  const { addEvent } = useSchedule();
  const { user } = useAuth();
  const { children, loading, error } = useFamily();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [subTasks, setSubTasks] = useState<Partial<SubTask>[]>([]);
  const [currentSubTask, setCurrentSubTask] = useState('');
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  const handleAddSubTask = useCallback(() => {
    if (currentSubTask.trim()) {
      const newSubTask = {
        taskId: `sub_${Date.now()}`,
        order: subTasks.length + 1,
        description: currentSubTask,
        isComplete: false,
        durationMinutes: 5 // Default duration
      };
      setSubTasks(prev => [...prev, newSubTask]);
      setCurrentSubTask(''); // Clear input
    }
  }, [currentSubTask, subTasks]);

  const handleSaveRoutine = async () => {
    if (!title.trim() || !user) {
      Alert.alert("Missing Info", "Please provide a title for the routine.");
      return;
    }

    const newEvent = {
      familyId: `family_${user.uid}`, // Example familyId
      createdBy: user.uid,
      title,
      category: 'General', // Default category
      startTime,
      endTime: new Date(startTime.getTime() + 30 * 60000), // Default 30 mins duration
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      childIds: selectedChildIds, // Assign to selected children
      isRecurring: false,
      subTasks: subTasks.filter(st => st.description) as SubTask[],
    };

    try {
      await addEvent(newEvent);
      router.back(); // Go back to the schedule screen after saving
    } catch (error) {
      Alert.alert("Error", "Could not save the routine.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Create New Routine</Text>

      <Text style={styles.label}>Routine Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Morning Routine"
        value={title}
        onChangeText={setTitle}
      />

      {/* Child Selection Component */}
      <Text style={styles.label}>Assign To:</Text>
      {loading ? (
        <Text>Loading children...</Text>
      ) : error ? (
        <Text>Error loading children</Text>
      ) : (
        children.map(child => (
          <View key={child.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <TouchableOpacity
              onPress={() => {
                setSelectedChildIds(prev =>
                  prev.includes(child.id) ? prev.filter(id => id !== child.id) : [...prev, child.id]
                );
              }}
              style={{ marginRight: 8, borderWidth: 1, borderColor: '#ccc', width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}
            >
              {selectedChildIds.includes(child.id) && <Text style={{ color: '#007bff' }}>✓</Text>}
            </TouchableOpacity>
            <Text>{child.name}</Text>
          </View>
        ))
      )}
      {/* Placeholder for Time, Category selectors */}
      <Text style={styles.placeholder}>[Time Picker, and Category selectors will go here]</Text>

      <Text style={styles.label}>Checklist Steps (1, 2, 3...)</Text>
      {subTasks.map((task, index) => (
        <Text key={index} style={styles.subTaskItem}>- {task.description}</Text>
      ))}
      <View style={styles.subTaskInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Add a new step"
          value={currentSubTask}
          onChangeText={setCurrentSubTask}
          onSubmitEditing={handleAddSubTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddSubTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <BaseButton title="Save Routine" onPress={handleSaveRoutine} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  placeholder: { color: '#888', marginVertical: 20, textAlign: 'center' },
  subTaskItem: { fontSize: 16, marginLeft: 8, marginBottom: 4 },
  subTaskInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
