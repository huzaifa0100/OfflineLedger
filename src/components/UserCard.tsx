// OfflineLedger — UserCard Component
// Tappable list row: avatar + name + phone + chevron
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { User } from '../db/models/User';

interface UserCardProps {
  user: User;
  onPress: (user: User) => void;
}

export function UserCard({ user, onPress }: UserCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      <Avatar
        name={user.name}
        avatarPath={user.avatarPath}
        size={52}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
        <Text style={styles.phone} numberOfLines={1}>
          {user.phone}
        </Text>
        {!!user.cnic && (
          <Text style={styles.cnic} numberOfLines={1}>
            {user.cnic}
          </Text>
        )}
      </View>

      {/* Balance chip */}
      <View style={styles.right}>
        <View style={styles.balanceChip}>
          <Text style={styles.balanceLabel}>PKR</Text>
          <Text style={styles.balanceAmount} numberOfLines={1}>
            {user.totalBalance.toLocaleString('en-PK')}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkColors.card,
    marginHorizontal: spacing[4],
    marginVertical: spacing[1],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    gap: spacing[3],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.labelLarge,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  phone: {
    ...typography.bodySmall,
    color: darkColors.textSecondary,
  },
  cnic: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balanceChip: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    fontSize: 10,
  },
  balanceAmount: {
    ...typography.labelMedium,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
    maxWidth: 90,
  },
  chevron: {
    fontSize: 20,
    color: darkColors.textDisabled,
    lineHeight: 22,
  },
});
