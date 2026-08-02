// OfflineLedger — Modernized UserCard Component with Touch Transitions
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';
import { formatCompactCurrency } from '../utils/formatters';
import { User } from '../db/models/User';

interface UserCardProps {
  user: User;
  onPress: (user: User) => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const balance = user.totalBalance ?? 0;
  const isBalanceNegative = balance < 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(user)}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Avatar name={user.name} avatarPath={user.avatarPath} size={52} />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {user.phone}
          </Text>
          {!!user.cnic && (
            <Text style={styles.cnic} numberOfLines={1}>
              🆔 {user.cnic}
            </Text>
          )}
        </View>

        {/* Compact & Responsive Balance chip */}
        <View style={styles.right}>
          <View
            style={[
              styles.balanceChip,
              isBalanceNegative ? styles.chipNegative : styles.chipPositive,
            ]}
          >
            <Text
              style={[
                styles.balanceLabel,
                isBalanceNegative ? styles.textNegative : styles.textPositive,
              ]}
            >
              BALANCE
            </Text>
            <Text
              style={[
                styles.balanceAmount,
                isBalanceNegative ? styles.textNegative : styles.textPositive,
              ]}
              numberOfLines={1}
            >
              Rs {formatCompactCurrency(balance)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkColors.card,
    marginHorizontal: spacing[4],
    marginVertical: spacing[1.5],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    gap: spacing[3],
    ...shadow.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.labelLarge,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  phone: {
    ...typography.bodySmall,
    color: darkColors.textSecondary,
  },
  cnic: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    letterSpacing: 0.3,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  balanceChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 90,
  },
  chipPositive: {
    backgroundColor: 'rgba(240, 165, 0, 0.12)',
    borderColor: 'rgba(240, 165, 0, 0.4)',
  },
  chipNegative: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
    lineHeight: 11,
    textAlign: 'center',
  },
  textPositive: {
    color: darkColors.primary,
  },
  textNegative: {
    color: darkColors.error,
  },
  balanceAmount: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
  chevron: {
    fontSize: 22,
    color: darkColors.textDisabled,
  },
});
