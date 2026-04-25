import { MD3DarkTheme } from 'react-native-paper';
import { COLORS } from './colors';

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.ACCENT,
    secondary: COLORS.DEEP_BLUE,
    background: COLORS.BACKGROUND,
    surface: COLORS.SURFACE,
    surfaceVariant: COLORS.SURFACE_VARIANT,
    onSurface: COLORS.ON_SURFACE,
    onSurfaceVariant: COLORS.ON_SURFACE_MUTED,
    outline: COLORS.OUTLINE,
    error: COLORS.OVERDUE_RED,
  },
};
