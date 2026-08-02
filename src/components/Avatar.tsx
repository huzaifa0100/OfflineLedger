import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { toImageUri } from '../utils/fileStorage';
import { getInitials, getAvatarColor } from '../utils/formatters';
import { darkColors } from '../theme/colors';
import { fontWeight, typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface AvatarProps {
  name: string;
  avatarPath?: string | null;
  size?: number;
  onPress?: () => void;
  enablePreview?: boolean;
  style?: object;
}

export function Avatar({
  name,
  avatarPath,
  size = 72,
  onPress,
  enablePreview = true,
  style,
}: AvatarProps) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [avatarPath]);

  const uri = toImageUri(avatarPath);
  const initials = getInitials(name || '?');
  const bgColor = getAvatarColor(name || '?');
  const fontSize = size * 0.38;

  const showImage = uri && !imageError;

  const handleTap = () => {
    if (onPress) {
      onPress();
    } else if (enablePreview && showImage) {
      setModalVisible(true);
    }
  };

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
    </View>
  );

  return (
    <>
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.85}
        disabled={!onPress && (!enablePreview || !showImage)}
      >
        {content}
      </TouchableOpacity>

      {/* Fullscreen Avatar Modal Viewer */}
      {showImage && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBg}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Image
              source={{ uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />

            <Text style={styles.modalTitle}>{name}</Text>
          </View>
        </Modal>
      )}
    </>
  );
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
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  modalClose: {
    position: 'absolute',
    top: spacing[10],
    right: spacing[6],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
  },
  previewImage: {
    width: '90%',
    height: '65%',
    borderRadius: radius.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: spacing[4],
    fontWeight: fontWeight.bold,
  },
});
