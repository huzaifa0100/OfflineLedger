// OfflineLedger — Notepad Screen (Phase 5)
// Per-user freeform notepad with 500ms debounce auto-save.
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { Note } from '../db/models/Note';
import { database, notesCollection } from '../db';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { formatDate, formatTime } from '../utils/formatters';

interface NotepadScreenProps {
  userId: string;
}

type SaveState = 'idle' | 'saving' | 'saved';

export function NotepadScreen({ userId }: NotepadScreenProps) {
  const [note, setNote]          = useState<Note | null>(null);
  const [content, setContent]    = useState('');
  const [saveState, setSave]     = useState<SaveState>('idle');
  const [loading, setLoading]    = useState(true);

  // Refs to avoid stale closures in the debounce timer
  const noteRef    = useRef<Note | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedOnce  = useRef(false); // Tracks if initial content has been set

  // ── Initialise: fetch or create note ────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        let rows = await notesCollection
          .query(Q.where('user_id', userId))
          .fetch();

        // Create a blank note if none exists yet
        if (rows.length === 0) {
          await database.write(async () => {
            await notesCollection.create(r => {
              r.userId  = userId;
              r.content = '';
            });
          });
          rows = await notesCollection
            .query(Q.where('user_id', userId))
            .fetch();
        }

        if (mounted && rows.length > 0) {
          const n = rows[0];
          noteRef.current = n;
          setNote(n);
          setContent(n.content ?? '');
          savedOnce.current = true;
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
      // Flush any pending debounce on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);

  // ── Debounced auto-save ──────────────────────────────────────────────────
  const handleChange = useCallback((text: string) => {
    setContent(text);
    setSave('idle');

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const current = noteRef.current;
      if (!current) return;

      setSave('saving');
      try {
        await current.saveContent(text);
        // Re-fetch to get the updated `updatedAt` timestamp from WatermelonDB
        const refreshed = await notesCollection.find(current.id);
        noteRef.current = refreshed;
        setNote(refreshed);
        setSave('saved');
      } catch (err) {
        console.warn('[NotepadScreen] Auto-save failed:', err);
        setSave('idle');
      }
    }, 500);
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={darkColors.primary} size="large" />
      </View>
    );
  }

  const charCount = content.length;
  const lastEdited = note?.updatedAt;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        {/* ── Text editor ──────────────────────────────────────────────── */}
        <TextInput
          style={styles.editor}
          value={content}
          onChangeText={handleChange}
          placeholder="Start writing notes here..."
          placeholderTextColor={darkColors.textDisabled}
          multiline
          textAlignVertical="top"
          scrollEnabled
          autoCorrect={false}
          autoCapitalize="sentences"
          spellCheck={false}
          keyboardAppearance="dark"
          selectionColor={darkColors.primary}
        />

        {/* ── Footer bar ───────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {/* Save indicator */}
            {saveState === 'saving' && (
              <View style={styles.saveIndicator}>
                <ActivityIndicator
                  size="small"
                  color={darkColors.primary}
                  style={styles.saveSpinner}
                />
                <Text style={styles.saveText}>Saving...</Text>
              </View>
            )}
            {saveState === 'saved' && (
              <View style={styles.saveIndicator}>
                <Text style={styles.savedDot}>●</Text>
                <Text style={styles.saveText}>Saved</Text>
              </View>
            )}

            {/* Last edited timestamp */}
            {lastEdited && saveState === 'idle' && (
              <Text style={styles.lastEdited}>
                Last edited {formatDate(lastEdited)} at {formatTime(lastEdited)}
              </Text>
            )}
          </View>

          {/* Character count */}
          <View style={[
            styles.charBadge,
            charCount > 4500 && styles.charBadgeWarn,
            charCount > 4900 && styles.charBadgeDanger,
          ]}>
            <Text style={[
              styles.charCount,
              charCount > 4500 && styles.charCountWarn,
              charCount > 4900 && styles.charCountDanger,
            ]}>
              {charCount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.background,
  },

  // Editor
  editor: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    ...typography.bodyLarge,
    color: darkColors.textPrimary,
    lineHeight: 26,
    fontSize: 16,
    fontFamily: Platform.select({ android: 'monospace', ios: 'Courier' }),
    textAlignVertical: 'top',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: darkColors.divider,
    backgroundColor: darkColors.surface,
    minHeight: 48,
  },
  footerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  saveSpinner: { transform: [{ scale: 0.75 }] },
  savedDot: {
    color: darkColors.success,
    fontSize: 10,
  },
  saveText: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
  },
  lastEdited: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    flexShrink: 1,
  },

  // Char count
  charBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: darkColors.surfaceVariant,
  },
  charBadgeWarn: { backgroundColor: 'rgba(245,186,58,0.12)' },
  charBadgeDanger: { backgroundColor: darkColors.errorContainer },
  charCount: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    fontFamily: Platform.select({ android: 'monospace', ios: 'Courier' }),
  },
  charCountWarn: { color: darkColors.primary },
  charCountDanger: { color: darkColors.error },
});
