// OfflineLedger — Theme index
// Central export for react-native-paper MD3 theme + our custom tokens

import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { darkColors, lightColors, AppColors } from './colors';

// Merge our custom palette into the Paper MD3 theme
export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:          darkColors.primary,
    onPrimary:        darkColors.textOnPrimary,
    background:       darkColors.background,
    surface:          darkColors.surface,
    surfaceVariant:   darkColors.surfaceVariant,
    onSurface:        darkColors.textPrimary,
    onSurfaceVariant: darkColors.textSecondary,
    error:            darkColors.error,
    outline:          darkColors.border,
  },
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:          lightColors.primary,
    onPrimary:        lightColors.textOnPrimary,
    background:       lightColors.background,
    surface:          lightColors.surface,
    surfaceVariant:   lightColors.surfaceVariant,
    onSurface:        lightColors.textPrimary,
    onSurfaceVariant: lightColors.textSecondary,
    error:            lightColors.error,
    outline:          lightColors.border,
  },
};

export { darkColors, lightColors };
export type { AppColors };
export * from './typography';
export * from './spacing';
