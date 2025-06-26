// context/ScheduleContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
// Import your Firebase db instance and Firestore functions
import { db } from '@/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Define the data types based on our data model
export interface SubTask {
  taskId: string;
  order: number;
  description: string;
  durationMinutes: number;
  isComplete: boolean;
  childDrawingUri?: string | null;
}
export interface ScheduleEvent {
  id?: string; // Document ID from Firestore
  familyId: string;
  createdBy: string;
  title: string;
  category: string;
  startTime: Date; // Use native Date objects in the app
  endTime: Date;
  timeZone: string;
  childIds: string[];
  isRecurring: boolean;
  recurringRule?: any; // For future use
  subTasks: SubTask[];
}

interface ScheduleContextType {
  events: ScheduleEvent[];
  isLoading: boolean;
  addEvent: (eventData: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  // Add updateEvent and deleteEvent later
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect will listen for real-time updates from Firestore
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    // In a real app, you would set up the Firestore listener here.
    // For now, we'll just use mock data to build the UI.
    // const mockEvents: ScheduleEvent[] = [
    //   // Mock data similar to your original file, but matching our new structure
    // ];
    // setEvents(mockEvents);
    setIsLoading(false);

  }, [user]);

  const addEvent = async (eventData: Omit<ScheduleEvent, 'id'>) => {
    if (!user) throw new Error("User not authenticated");

    try {
      await addDoc(collection(db, 'events'), {
        ...eventData,
      });
      // For now, we just add it to our local mock state
      // const newEvent = { ...eventData, id: Date.now().toString() };
      // setEvents(prevEvents => [newEvent, ...prevEvents]);
      // console.log("New event added (mock):", newEvent);
    } catch (error) {
      console.error("Error adding event:", error);
      throw error; // Re-throw the error to be handled by the calling component
    }

  };

  const value = { events, isLoading, addEvent };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
