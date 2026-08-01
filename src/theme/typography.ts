// OfflineLedger Design System — Typography Tokens
import { StyleSheet, Platform } from 'react-native';

// Font families — use system fonts that ship on Android
// For production, add custom fonts via react-native-fonts or assets
export const fontFamily = {
  regular:  Platform.select({ android: 'Roboto',        ios: 'System' })!,
  medium:   Platform.select({ android: 'Roboto-Medium', ios: 'System' })!,
  bold:     Platform.select({ android: 'Roboto-Bold',   ios: 'System' })!,
  mono:     Platform.select({ android: 'monospace',     ios: 'Courier' })!,
};

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   19,
  xl:   22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
};

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
};

export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
};

export const typography = StyleSheet.create({
  // Display
  displayLarge: {
    fontSize:   fontSize['4xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -1,
  },
  displaySmall: {
    fontSize:   fontSize['3xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  // Headings
  h1: {
    fontSize:   fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize:   fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  h3: {
    fontSize:   fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  // Body
  bodyLarge: {
    fontSize:   fontSize.md,
    fontWeight: fontWeight.regular,
  },
  bodyMedium: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.regular,
  },
  bodySmall: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.regular,
  },
  // Label
  labelLarge: {
    fontSize:   fontSize.base,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize:   fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
  },
  labelSmall: {
    fontSize:   fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.4,
  },
  // Mono (for amounts, IDs)
  mono: {
    fontSize:   fontSize.base,
    fontFamily: fontFamily.mono,
  },
  monoLarge: {
    fontSize:   fontSize.xl,
    fontFamily: fontFamily.mono,
    fontWeight: fontWeight.bold,
  },
});
