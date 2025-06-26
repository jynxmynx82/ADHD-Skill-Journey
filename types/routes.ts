import { Href } from 'expo-router';

// Base route types that match expo-router's expectations
export type TabRoute = '/resources' | '/food-scanner' | '/schedule' | '/journal';
export type ChildrenRoute = '/children' | '/children/add';
export type ResourcesRoute = '/resources/products' | '/resources/self-care';
export type ScheduleRoute = '/schedule/add';
export type SettingsRoute = 
  | '/(settings)/profile'
  | '/(settings)/subscription'
  | '/(settings)/notifications'
  | '/(settings)/theme'
  | '/(settings)/password';

// Combined type for all routes
export type AppRoute = TabRoute | ChildrenRoute | ResourcesRoute | ScheduleRoute | SettingsRoute;

// Type guard functions
export function isTabRoute(route: string): route is TabRoute {
  return ['/resources', '/food-scanner', '/schedule', '/journal'].includes(route);
}

export function isChildrenRoute(route: string): route is ChildrenRoute {
  return ['/children', '/children/add'].includes(route);
}

export function isResourcesRoute(route: string): route is ResourcesRoute {
  return ['/resources/products', '/resources/self-care'].includes(route);
}

export function isScheduleRoute(route: string): route is ScheduleRoute {
  return ['/schedule/add'].includes(route);
}

// Helper type for route parameters
export interface RouteParams {
  '/children/add': { childId?: string };
  '/schedule/add': { eventId?: string };
}

// Helper type to extract params type based on route
export type RouteParamsFor<T extends AppRoute> = T extends keyof RouteParams ? RouteParams[T] : never;

// Helper function to create a typed href
export function createHref<T extends AppRoute>(route: T, params?: RouteParamsFor<T>): Href<T> {
  return params ? { pathname: route, params } : route;
} 