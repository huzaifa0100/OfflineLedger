// OfflineLedger — BottomSheet Component
// Reusable animated bottom sheet modal — used for source picker, confirmations, etc.
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { darkColors } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetAction {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: BottomSheetAction[];
}

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  actions,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 14,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Optional header */}
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.actionRow,
                action.disabled && styles.actionDisabled,
              ]}
              onPress={() => {
                if (!action.disabled) {
                  onClose();
                  // Small delay so sheet closes before action fires
                  setTimeout(action.onPress, 150);
                }
              }}
              activeOpacity={0.65}
            >
              {action.icon && (
                <View style={styles.actionIconWrap}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.actionLabel,
                  action.destructive && styles.actionLabelDestructive,
                  action.disabled && styles.actionLabelDisabled,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: darkColors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: darkColors.surface,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingBottom: spacing[8],
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: darkColors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: darkColors.border,
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: darkColors.divider,
  },
  title: {
    ...typography.h3,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    ...typography.bodySmall,
    color: darkColors.textSecondary,
    marginTop: 2,
  },
  actions: {
    paddingTop: spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    gap: spacing[4],
  },
  actionDisabled: { opacity: 0.4 },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkColors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: { fontSize: 20 },
  actionLabel: {
    ...typography.bodyLarge,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  actionLabelDestructive: { color: darkColors.error },
  actionLabelDisabled: { color: darkColors.textDisabled },
  cancelRow: {
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    backgroundColor: darkColors.surfaceVariant,
    borderRadius: radius.xl,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  cancelLabel: {
    ...typography.labelLarge,
    color: darkColors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
});
