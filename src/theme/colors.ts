// OfflineLedger Design System — Color Tokens
// Palette: Deep Navy (#0D1B2A) + Warm Gold (#F0A500) + Emerald accent

export const palette = {
  // Brand
  navy900: '#0D1B2A',
  navy800: '#1B2E45',
  navy700: '#243B55',
  navy600: '#2E4F70',
  navy500: '#3A6491',

  gold500: '#F0A500',
  gold400: '#F5BA3A',
  gold300: '#FAD06A',
  gold200: '#FDE4A0',

  emerald500: '#10B981',
  emerald400: '#34D399',
  emerald300: '#6EE7B7',

  red500: '#EF4444',
  red400: '#F87171',

  // Neutrals
  white: '#FFFFFF',
  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
};

export const darkColors = {
  // Backgrounds
  background:       palette.navy900,
  surface:          palette.navy800,
  surfaceVariant:   palette.navy700,
  surfaceOverlay:   'rgba(13,27,42,0.85)',

  // Brand
  primary:          palette.gold500,
  primaryVariant:   palette.gold400,
  primaryContainer: 'rgba(240,165,0,0.15)',

  // Status
  success:          palette.emerald400,
  successContainer: 'rgba(52,211,153,0.15)',
  error:            palette.red400,
  errorContainer:   'rgba(248,113,113,0.15)',

  // Text
  textPrimary:      palette.white,
  textSecondary:    palette.gray300,
  textDisabled:     palette.gray500,
  textOnPrimary:    palette.navy900,

  // UI
  border:           palette.navy600,
  divider:          'rgba(255,255,255,0.08)',
  icon:             palette.gray300,
  iconActive:       palette.gold500,
  overlay:          'rgba(0,0,0,0.6)',

  // Card / Sheet
  card:             palette.navy800,
  cardBorder:       'rgba(255,255,255,0.06)',

  // Specific
  balancePositive:  palette.emerald400,
  balanceNegative:  palette.red400,
  advanceAmount:    palette.gold400,
};

export const lightColors = {
  background:       palette.gray50,
  surface:          palette.white,
  surfaceVariant:   palette.gray100,
  surfaceOverlay:   'rgba(255,255,255,0.9)',

  primary:          palette.navy800,
  primaryVariant:   palette.navy700,
  primaryContainer: 'rgba(27,46,69,0.1)',

  success:          palette.emerald500,
  successContainer: 'rgba(16,185,129,0.1)',
  error:            palette.red500,
  errorContainer:   'rgba(239,68,68,0.1)',

  textPrimary:      palette.gray900,
  textSecondary:    palette.gray600,
  textDisabled:     palette.gray400,
  textOnPrimary:    palette.white,

  border:           palette.gray200,
  divider:          'rgba(0,0,0,0.06)',
  icon:             palette.gray500,
  iconActive:       palette.navy800,
  overlay:          'rgba(0,0,0,0.5)',

  card:             palette.white,
  cardBorder:       palette.gray200,

  balancePositive:  palette.emerald500,
  balanceNegative:  palette.red500,
  advanceAmount:    palette.navy700,
};

export type AppColors = typeof darkColors;
