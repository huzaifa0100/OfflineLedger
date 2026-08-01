// OfflineLedger — Avatar Component
// Circular image with initials fallback and tap-to-change overlay
import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { toImageUri } from '../utils/fileStorage';
import { getInitials, getAvatarColor } from '../utils/formatters';
import { darkColors } from '../theme/colors';
import { fontWeight } from '../theme/typography';

interface AvatarProps {
  name: string;
  avatarPath?: string | null;
  size?: number;
  onPress?: () => void;       // If provided, shows edit overlay
  showEditOverlay?: boolean;
  style?: object;
}

export function Avatar({
  name,
  avatarPath,
  size = 72,
  onPress,
  showEditOverlay = false,
  style,
}: AvatarProps) {
  const [loading, setLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const uri = toImageUri(avatarPath);
  const initials = getInitials(name || '?');
  const bgColor = getAvatarColor(name || '?');
  const fontSize = size * 0.38;

  const showImage = uri && !imageError;

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: showImage ? darkColors.surface : bgColor,
        },
        style,
      ]}
    >
      {showImage ? (
        <>
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setImageError(true);
              setLoading(false);
            }}
            resizeMode="cover"
          />
          {loading && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              color={darkColors.primary}
            />
          )}
        </>
      ) : (
        <Text style={[styles.initials, { fontSize, color: '#FFFFFF' }]}>
          {initials}
        </Text>
      )}

      {/* Edit overlay */}
      {showEditOverlay && (
        <View style={[styles.editOverlay, { borderRadius: size / 2 }]}>
          <Text style={styles.editIcon}>✎</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
});
