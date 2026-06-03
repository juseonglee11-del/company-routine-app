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
  blue: {
    background: '#EFF6FF', // Light Sky Blue
    card: '#DBEAFE',       // Soft Blue Card
    textMain: '#1E3A5F',   // Deep Navy
    textSub: '#60A5FA',    // Sky Blue
    text: '#1E3A5F',
    primary: '#3B82F6',    // Bright Blue
    border: '#BFDBFE',     // Light Blue Border
    tint: '#3B82F6',
    icon: '#93C5FD',
    tabIconDefault: '#93C5FD',
    tabIconSelected: '#3B82F6',
    shadow: '#BFDBFE',
  },
  green: {
    background: '#F0FDF4', // Light Mint
    card: '#DCFCE7',       // Soft Green Card
    textMain: '#14532D',   // Deep Green
    textSub: '#34D399',    // Mint
    text: '#14532D',
    primary: '#10B981',    // Emerald
    border: '#A7F3D0',     // Light Mint Border
    tint: '#10B981',
    icon: '#6EE7B7',
    tabIconDefault: '#6EE7B7',
    tabIconSelected: '#10B981',
    shadow: '#D1FAE5',
  },
  yellow: {
    background: '#FFFBEB', // Cream Yellow
    card: '#FEF9C3',       // Soft Yellow Card
    textMain: '#4A3800',   // Deep Brown (readable)
    textSub: '#D97706',    // Amber
    text: '#4A3800',
    primary: '#F59E0B',    // Gold Amber
    border: '#FDE68A',     // Light Yellow Border
    tint: '#F59E0B',
    icon: '#FCD34D',
    tabIconDefault: '#FCD34D',
    tabIconSelected: '#F59E0B',
    shadow: '#FEF3C7',
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
