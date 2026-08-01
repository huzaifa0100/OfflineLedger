// OfflineLedger — DocumentThumb Component
// Single grid tile in the documents grid: thumbnail image + title + long-press delete
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Document } from '../db/models/Document';
import { toImageUri } from '../utils/fileStorage';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { formatDate } from '../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_COLUMNS = 2;
const GRID_GAP = spacing[2];
const TILE_SIZE =
  (SCREEN_WIDTH - spacing[4] * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface DocumentThumbProps {
  document: Document;
  onPress: (doc: Document) => void;
  onLongPress: (doc: Document) => void;
}

export function DocumentThumb({ document, onPress, onLongPress }: DocumentThumbProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const uri = toImageUri(document.imagePath);

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => onPress(document)}
      onLongPress={() => onLongPress(document)}
      delayLongPress={400}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {uri && !error ? (
          <>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setError(true); setLoading(false); }}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={darkColors.primary} size="small" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorPlaceholder}>
            <Text style={styles.errorIcon}>🖼️</Text>
            <Text style={styles.errorText}>Image missing</Text>
          </View>
        )}

        {/* Long-press hint badge */}
        <View style={styles.hintBadge}>
          <Text style={styles.hintText}>Hold to delete</Text>
        </View>
      </View>

      {/* Caption */}
      <View style={styles.caption}>
        <Text style={styles.title} numberOfLines={1}>
          {document.title || 'Untitled'}
        </Text>
        <Text style={styles.date}>{formatDate(document.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export { TILE_SIZE };

const styles = StyleSheet.create({
  tile: {
    width: TILE_SIZE,
    backgroundColor: darkColors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: darkColors.cardBorder,
    overflow: 'hidden',
  },
  imageWrap: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: darkColors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.surfaceVariant,
  },
  errorPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
  },
  errorIcon: { fontSize: 32 },
  errorText: { ...typography.labelSmall, color: darkColors.textDisabled },
  hintBadge: {
    position: 'absolute',
    bottom: spacing[1],
    right: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing[1] + 2,
    paddingVertical: 2,
  },
  hintText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
  caption: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    gap: 2,
  },
  title: {
    ...typography.labelMedium,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  date: {
    ...typography.labelSmall,
    color: darkColors.textDisabled,
    fontSize: 10,
  },
});
