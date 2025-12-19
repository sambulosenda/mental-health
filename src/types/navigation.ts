import type { ROUTES } from '@/src/constants/config';

// Route parameter types for screens that accept params
export interface RouteParams {
  chat: { type?: 'chat' | 'checkin'; moodId?: string };
  '(modals)/exercise-session': { templateId: string };
  '(modals)/journal-entry': { entryId?: string };
}

// Type for ROUTES constant
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Route names for type checking
export type RootRouteName = 'onboarding' | '(tabs)' | 'chat' | '(modals)' | 'paywall' | 'crisis';
export type TabRouteName = 'index' | 'track' | 'journal' | 'insights' | 'profile';
export type ModalRouteName = 'journal-entry' | 'chat' | 'exercise-session';
