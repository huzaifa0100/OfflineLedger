// OfflineLedger — Balance Card Component
// Three-stat summary card: Total Balance (editable) | Advances | Remaining
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius, shadow } from '../theme/spacing';
import { formatCurrency } from '../utils/formatters';

interface BalanceCardProps {
  totalBalance: number;
  totalAdvances: number;
  onEditTotal: () => void;
}

export function BalanceCard({
  totalBalance,
  totalAdvances,
  onEditTotal,
}: BalanceCardProps) {
  const remaining = totalBalance - totalAdvances;
  const isOverdrafted = remaining < 0;
  const remainingColor = isOverdrafted
    ? darkColors.balanceNegative
    : darkColors.balancePositive;

  return (
    <View style={styles.card}>
      {/* Decorative top accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.statsRow}>
        {/* ── Total Balance (tappable to edit) ─────────────── */}
        <TouchableOpacity
          style={[styles.stat, styles.statLeft]}
          onPress={onEditTotal}
          activeOpacity={0.7}
        >
          <Text style={styles.statLabel}>Total Balance</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {formatCurrency(totalBalance)}
          </Text>
          <View style={styles.editHint}>
            <Text style={styles.editHintIcon}>✎</Text>
            <Text style={styles.editHintText}>Tap to edit</Text>
          </View>
        </TouchableOpacity>

        {/* ── Divider ──────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Total Advances (computed, read-only) ─────────── */}
        <View style={[styles.stat, styles.statCenter]}>
          <Text style={styles.statLabel}>Advances</Text>
          <Text style={[styles.statValue, styles.advanceValue]} numberOfLines={1}>
            {formatCurrency(totalAdvances)}
          </Text>
          <Text style={styles.statSubLabel}>paid out</Text>
        </View>

        {/* ── Divider ──────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Remaining (computed, color-coded) ────────────── */}
        <View style={[styles.stat, styles.statRight]}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text
            style={[styles.statValue, { color: remainingColor }]}
            numberOfLines={1}
          >
            {isOverdrafted ? '-' : ''}{formatCurrency(Math.abs(remaining))}
          </Text>
          {isOverdrafted && (
            <View style={styles.overdraftBadge}>
              <Text style={styles.overdraftText}>Overdrafted</Text>
            </View>
          )}
          {!isOverdrafted && (
            <Text style={[styles.statSubLabel, { color: darkColors.success }]}>
              ● on track
            </Text>
          )}
        </View>
      </View>

      {/* ── Progress bar: advances vs total ────────────────── */}
      {totalBalance > 0 && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, (totalAdvances / totalBalance) * 100)}%`,
                backgroundColor: isOverdrafted
                  ? darkColors.balanceNegative
                  : darkColors.primary,
              },
            ]}
          />
        </View>
      )}

      {totalBalance > 0 && (
        <Text style={styles.progressLabel}>
          {Math.min(100, Math.round((totalAdvances / totalBalance) * 100))}% of total balance advanced
        </Text>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.card,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    overflow: 'hidden',
    ...shadow.md,
  },
  accentBar: {
    height: 3,
    backgroundColor: darkColors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[2],
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[1],
  },
  statLeft:   { alignItems: 'center' },
  statCenter: { alignItems: 'center' },
  statRight:  { alignItems: 'center' },
  statLabel: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
    textAlign: 'center',
  },
  statValue: {
    ...typography.monoLarge,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  advanceValue: {
    color: darkColors.advanceAmount,
  },
  statSubLabel: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    fontSize: 10,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: darkColors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[1] + 2,
    paddingVertical: 2,
  },
  editHintIcon: {
    fontSize: 10,
    color: darkColors.primary,
  },
  editHintText: {
    fontSize: 9,
    color: darkColors.primary,
    fontWeight: fontWeight.medium,
  },
  overdraftBadge: {
    backgroundColor: darkColors.errorContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[1] + 2,
    paddingVertical: 2,
  },
  overdraftText: {
    fontSize: 9,
    color: darkColors.error,
    fontWeight: fontWeight.bold,
  },
  divider: {
    width: 1,
    marginVertical: spacing[2],
    backgroundColor: darkColors.divider,
  },

  // Progress bar
  progressTrack: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[1],
    height: 4,
    backgroundColor: darkColors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    textAlign: 'center',
    marginBottom: spacing[3],
    fontSize: 10,
  },
});
