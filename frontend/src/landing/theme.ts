import { useTheme } from '../contexts/ThemeContext';

export const landingColors = {
  primary: '#8B5CF6',
  primaryHeader: '#6B46C1',
  secondary: '#FB923C',
  accent: '#38BDF8',
  background: '#F8FAFC',
  headerBg: '#F8F8FC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  success: '#10B981',
  text: '#1E293B',
  textMuted: '#64748B',
  navLink: '#555555',
  logInBg: '#ECE5F9',
} as const;

export const darkLandingColors = {
  primary: '#8B5CF6',
  primaryHeader: '#A78BFA',
  secondary: '#FB923C',
  accent: '#38BDF8',
  background: '#0E172A',
  headerBg: '#1E293B',
  surface: '#1E293B',
  border: '#334155',
  success: '#10B981',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  navLink: '#CBD5E1',
  logInBg: '#312E81',
} as const;

export function useLandingColors() {
  const { effectiveTheme } = useTheme();
  return effectiveTheme === 'dark' ? darkLandingColors : landingColors;
}
