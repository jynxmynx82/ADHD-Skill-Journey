// app/(tabs)/schedule.tsx

import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSchedule, ScheduleEvent } from '@/context/ScheduleContext';
import { Plus } from 'lucide-react-native';
import { AppSafeArea, PageHeader, Card, TYPOGRAPHY, COLORS, SPACING } from '@/components/Layout';

export default function ScheduleScreen() {
  const router = useRouter();
  const { events, isLoading } = useSchedule();

  const renderRoutineCard = ({ item }: { item: ScheduleEvent }) => (
    <Card>
      <Text style={styles.routineName}>{item.title}</Text>
      <Text style={styles.routineChild}>Assigned to: {item.childIds.length} children</Text>
      {item.subTasks.map(task => (
        <Text key={task.taskId} style={styles.taskTitle}>- {task.description}</Text>
      ))}
    </Card>
  );

  return (
    <AppSafeArea>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader title="Schedule" />
      
      <View style={styles.content}>
        <FlatList
          data={events}
          renderItem={renderRoutineCard}
          keyExtractor={(item) => item.id!}
          ListEmptyComponent={<Text style={styles.emptyText}>No routines scheduled.</Text>}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/schedule/new-routine')}
      >
        <Plus size={24} color={COLORS.text.inverse} />
      </TouchableOpacity>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  addButton: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4 
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    ...TYPOGRAPHY.styles.bodySecondary
  },
  routineName: { 
    ...TYPOGRAPHY.styles.sectionHeader,
    marginBottom: 4,
  },
  routineChild: { 
    ...TYPOGRAPHY.styles.bodySecondary,
    marginBottom: 8,
  },
  taskTitle: { 
    ...TYPOGRAPHY.styles.body,
    marginLeft: 8,
  },
});