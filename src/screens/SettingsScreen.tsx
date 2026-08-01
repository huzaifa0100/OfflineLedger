// OfflineLedger — Settings Screen (Phases 8, 9, 10)
// Backup/restore, PIN management, language selection, and app info.
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { exportBackup, restoreBackup, shareBackupFile } from '../utils/exportBackup';
import { storage, StorageKeys } from '../utils/storage';
import { formatDate, formatTime } from '../utils/formatters';
import { changeLanguage } from '../locales/i18n';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

// ── Setting Row Component ────────────────────────────────────────────────────

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightContent?: React.ReactNode;
  destructive?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

function SettingRow({
  icon, title, subtitle, onPress, rightContent, destructive, loading, disabled,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.rowIconWrap}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        {loading
          ? <ActivityIndicator size="small" color={darkColors.primary} />
          : rightContent ?? <Text style={styles.rowChevron}>›</Text>
        }
      </View>
    </TouchableOpacity>
  );
}

// ── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionText}>{text}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ── Settings Screen ──────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { clearPin } = useAuthStore();

  const [exporting,   setExporting]  = useState(false);
  const [restoring,   setRestoring]  = useState(false);

  const lastBackup = storage.getString(StorageKeys.BACKUP_LAST_AT);
  const lastBackupLabel = lastBackup
    ? `Last backup: ${formatDate(new Date(lastBackup))} at ${formatTime(new Date(lastBackup))}`
    : 'Never backed up';

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const zipPath = await exportBackup();
      Alert.alert(
        '✅ Backup Saved',
        `Backup saved to your Downloads folder.\n\nWould you like to share it?`,
        [
          { text: 'No Thanks', style: 'cancel' },
          {
            text: 'Share',
            onPress: () => shareBackupFile(zipPath),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message ?? 'Could not create backup');
    } finally {
      setExporting(false);
    }
  }, []);

  // ── Restore ──────────────────────────────────────────────────────────────
  const handleRestore = useCallback(async () => {
    Alert.alert(
      '⚠️ Restore Backup',
      'This will replace ALL current data with the backup. This cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setRestoring(true);
            try {
              await restoreBackup();
            } catch (err: any) {
              Alert.alert('Restore Failed', err?.message ?? 'Could not restore backup');
            } finally {
              setRestoring(false);
            }
          },
        },
      ],
    );
  }, []);

  // ── Reset PIN ────────────────────────────────────────────────────────────
  const handleResetPin = useCallback(() => {
    Alert.alert(
      'Reset PIN',
      'This will remove your PIN lock. The app will ask you to set a new PIN on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearPin();
            Alert.alert('PIN Removed', 'Your PIN has been cleared. Set a new one on next launch.');
          },
        },
      ],
    );
  }, [clearPin]);

  // ── Language ─────────────────────────────────────────────────────────────
  const handleLanguage = useCallback(() => {
    const current = i18n.language;
    const next = current === 'en' ? 'ur' : 'en';
    changeLanguage(next as 'en' | 'ur');
    Alert.alert(
      'Language Changed',
      next === 'ur'
        ? 'زبان اردو میں تبدیل کر دی گئی۔'
        : 'Language changed to English.',
    );
  }, [i18n.language]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Backup & Restore ──────────────────────────────────────────── */}
      <SectionLabel text={t('backup.title')} />

      <View style={styles.card}>
        <SettingRow
          icon="📦"
          title={t('backup.export')}
          subtitle={lastBackupLabel}
          onPress={handleExport}
          loading={exporting}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="🔄"
          title={t('backup.import')}
          subtitle={t('backup.importHint')}
          onPress={handleRestore}
          loading={restoring}
        />
      </View>

      {/* ── Security ──────────────────────────────────────────────────── */}
      <SectionLabel text="Security" />

      <View style={styles.card}>
        <SettingRow
          icon="🔑"
          title="Reset PIN"
          subtitle="Remove and reset your app lock PIN"
          onPress={handleResetPin}
          destructive
        />
      </View>

      {/* ── Localization ──────────────────────────────────────────────── */}
      <SectionLabel text="Language" />

      <View style={styles.card}>
        <SettingRow
          icon="🌐"
          title="App Language"
          subtitle={i18n.language === 'en' ? 'English (tap to switch to Urdu)' : 'اردو (انگریزی کے لیے ٹیپ کریں)'}
          onPress={handleLanguage}
          rightContent={
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>
                {i18n.language.toUpperCase()}
              </Text>
            </View>
          }
        />
      </View>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <SectionLabel text="About" />

      <View style={styles.card}>
        <SettingRow
          icon="📱"
          title="OfflineLedger"
          subtitle="Version 1.0.0 — All data stored on device"
          rightContent={<View />}
        />
        <View style={styles.divider} />
        <SettingRow
          icon="🔒"
          title="Privacy"
          subtitle="No internet connection. No data leaves your device."
          rightContent={<View />}
        />
      </View>

      <Text style={styles.footer}>
        OfflineLedger v1.0 · Built with ❤️ · Zero Cloud · 100% Offline
      </Text>
    </ScrollView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: darkColors.background },
  content: { padding: spacing[4], paddingBottom: spacing[10] },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[5],
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  sectionText: {
    ...typography.labelSmall,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkColors.divider,
  },

  card: {
    backgroundColor: darkColors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: darkColors.divider,
    marginHorizontal: spacing[4],
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  rowDisabled: { opacity: 0.5 },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: { fontSize: 20 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: {
    ...typography.labelLarge,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  rowTitleDestructive: { color: darkColors.error },
  rowSubtitle: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    flexShrink: 1,
  },
  rowRight: { alignItems: 'center', justifyContent: 'center' },
  rowChevron: {
    fontSize: 22,
    color: darkColors.textDisabled,
  },

  langBadge: {
    backgroundColor: darkColors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderWidth: 1,
    borderColor: darkColors.primary,
  },
  langBadgeText: {
    ...typography.labelSmall,
    color: darkColors.primary,
    fontWeight: fontWeight.bold,
  },

  footer: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    textAlign: 'center',
    marginTop: spacing[8],
    lineHeight: 18,
  },
});
