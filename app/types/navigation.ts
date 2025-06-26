export type RootStackParamList = {
  '/(auth)': undefined;
  '/(tabs)': undefined;
  '/(settings)': undefined;
  '/(settings)/profile': undefined;
  '/(settings)/notifications': undefined;
  '/(settings)/theme': undefined;
  '/(settings)/subscription': undefined;
  '/(settings)/password': undefined;
};

export type AppRoute = keyof RootStackParamList;

export const ROUTES = {
  AUTH: '/(auth)',
  TABS: '/(tabs)',
  SETTINGS: '/(settings)',
  PROFILE: '/(settings)/profile',
  NOTIFICATIONS: '/(settings)/notifications',
  THEME: '/(settings)/theme',
  SUBSCRIPTION: '/(settings)/subscription',
  PASSWORD: '/(settings)/password',
} as const;

export function isValidRoute(route: string): route is AppRoute {
  return Object.values(ROUTES).includes(route as AppRoute);
} 