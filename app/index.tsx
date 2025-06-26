import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user } = useAuth();
  
  // If not authenticated, redirect to auth screen
  if (!user) {
    return <Redirect href="/(auth)" />;
  }
  
  // If authenticated, redirect to tabs
  return <Redirect href="/(tabs)" />;
}