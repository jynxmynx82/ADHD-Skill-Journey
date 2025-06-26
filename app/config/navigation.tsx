import { Link as CustomLink } from '@/components/ui/Link';
import { Link as ExpoLink } from 'expo-router';

// Override the default Link component
export const Link = CustomLink;

// Export other navigation utilities
export { ExpoLink }; 