// app/(tabs)/schedule.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSchedule, ScheduleEvent } from '@/context/ScheduleContext'; // Import from our new context
import { Plus } from 'lucide-react-native';

export default function ScheduleScreen() {
  const router = useRouter();
  const { events, isLoading } = useSchedule();

  const renderRoutineCard = ({ item }: { item: ScheduleEvent }) => (
    <View style={styles.routineCard}>
      <Text style={styles.routineName}>{item.title}</Text>
      <Text style={styles.routineChild}>Assigned to: {item.assignedTo.length} people</Text>
      {item.subTasks.map(task => (
        <Text key={task.taskId} style={styles.taskTitle}>- {task.description}</Text>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
      </View>
      
      <FlatList
        data={events}
        renderItem={renderRoutineCard}
        keyExtractor={(item) => item.id!}
        ListEmptyComponent={<Text style={styles.emptyText}>No routines scheduled.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/schedule/new-routine')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold' },
    addButton: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
    routineCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    routineName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    routineChild: { fontSize: 14, color: '#555', marginBottom: 8 },
    taskTitle: { fontSize: 14, color: '#333', marginLeft: 8 },
});