// OfflineLedger Design System — Spacing & Layout Tokens

export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
};

export const radius = {
  none:  0,
  sm:    6,
  md:    12,
  lg:    18,
  xl:    24,
  '2xl': 32,
  full:  9999,
};

export const shadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const layout = {
  screenPaddingH: spacing[4],  // 16px horizontal padding on screens
  screenPaddingV: spacing[4],  // 16px vertical padding on screens
  cardPadding:    spacing[4],
  listItemHeight: 72,
  avatarSizeLg:   72,
  avatarSizeMd:   48,
  avatarSizeSm:   36,
  fabSize:        56,
  headerHeight:   56,
  tabBarHeight:   60,
};
