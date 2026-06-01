import { Platform } from 'react-native';

export const THEME_COLORS = {
  dark: {
    background: '#0F172A', // Navy/Black
    card: '#1E293B',       // Dark Slate
    textMain: '#F8FAFC',   // White
    textSub: '#94A3B8',    // Light Gray
    text: '#F8FAFC',       // Alias for textMain (used by ThemedText)
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
    text: '#0F172A',       // Alias for textMain (used by ThemedText)
    primary: '#2563EB',    // Deep Blue
    border: '#E2E8F0',     // Light Gray
    tint: '#2563EB',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#2563EB',
    shadow: '#CBD5E1',
  },
  pink: {
    background: '#FFF5FA', // Soft Pastel Pink
    card: '#FFE4F1',       // Baby Pink Card
    textMain: '#4A4A4A',   // Dark Gray for Readability
    textSub: '#FF8CBA',    // Deep Pastel Pink
    text: '#4A4A4A',       // Alias for textMain (used by ThemedText)
    primary: '#FF7EB6',    // Lovely Pink
    border: '#FFD1E8',     // Light Pink Border
    tint: '#FF7EB6',
    icon: '#FFB6D9',
    tabIconDefault: '#FFB6D9',
    tabIconSelected: '#FF7EB6',
    shadow: '#E2E8F0',
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
