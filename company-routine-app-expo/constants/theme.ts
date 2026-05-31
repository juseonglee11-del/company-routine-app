import { Platform } from 'react-native';

export const THEME_COLORS = {
  dark: {
    background: '#0F172A', // Navy/Black
    card: '#1E293B',       // Dark Slate
    textMain: '#F8FAFC',   // White
    textSub: '#94A3B8',    // Light Gray
    primary: '#3B82F6',    // Bright Blue
    border: '#334155',     // Slate
    tint: '#3B82F6',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#3B82F6',
    shadow: '#000000',
  },
  light: {
    background: '#F8FAFC', // Soft Gray
    card: '#FFFFFF',       // White
    textMain: '#0F172A',   // Slate Black
    textSub: '#64748B',    // Gray
    primary: '#2563EB',    // Deep Blue
    border: '#E2E8F0',     // Light Gray
    tint: '#2563EB',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#2563EB',
    shadow: '#CBD5E1',
  },
};

// Legacy Colors export for existing components if needed
export const Colors = THEME_COLORS;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
