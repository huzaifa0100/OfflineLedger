// OfflineLedger — Lock Screen (Phase 9)
// 4-digit PIN pad with biometric shortcut.
// Mode: 'unlock' (existing PIN) | 'setup' (first-time set) | 'confirm' (confirm new PIN)
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useAuthStore } from '../store/useAuthStore';
import { darkColors, palette } from '../theme/colors';
import { typography, fontWeight } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
function getBiometricsInstance() {
  try {
    const BiometricsClass = (ReactNativeBiometrics as any)?.default || ReactNativeBiometrics;
    if (typeof BiometricsClass === 'function') {
      return new BiometricsClass({ allowDeviceCredentials: false });
    }
  } catch (e) {
    console.warn('[LockScreen] Biometrics initialization skipped:', e);
  }
  return null;
}

type LockMode = 'unlock' | 'setup' | 'confirm';

const PIN_LENGTH = 4;

// ── PIN Dot Indicators ────────────────────────────────────────────────────────

function PinDots({ count, shake }: { count: number; shake: Animated.Value }) {
  return (
    <Animated.View
      style={[
        styles.dotsRow,
        {
          transform: [
            {
              translateX: shake.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: [0, -12, 12, -12, 12, 0],
              }),
            },
          ],
        },
      ]}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < count && styles.dotFilled]}
        />
      ))}
    </Animated.View>
  );
}

// ── Number Pad ────────────────────────────────────────────────────────────────

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

interface PadProps {
  onKey: (key: string) => void;
  disabled?: boolean;
}

function NumberPad({ onKey, disabled }: PadProps) {
  return (
    <View style={styles.pad}>
      {KEYS.map((key, idx) => {
        if (!key) return <View key={idx} style={styles.padKey} />;
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.padKey, styles.padKeyBtn, disabled && styles.padKeyDisabled]}
            onPress={() => !disabled && onKey(key)}
            activeOpacity={0.6}
          >
            <Text style={[
              styles.padKeyText,
              key === '⌫' && styles.padKeyTextBackspace,
            ]}>
              {key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Lock Screen ───────────────────────────────────────────────────────────────

export function LockScreen() {
  const { isPinSet, setPin, verifyPin, biometricUnlock } = useAuthStore();

  const [mode, setMode]             = useState<LockMode>(isPinSet ? 'unlock' : 'setup');
  const [pin, setPin_]              = useState('');
  const [setupPin, setSetupPin]     = useState(''); // Saved during 'setup' → 'confirm' transition
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [biometricAvail, setBioAvail] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Check biometric availability ─────────────────────────────────────────
  useEffect(() => {
    const instance = getBiometricsInstance();
    if (!instance) {
      setBioAvail(false);
      return;
    }
    instance.isSensorAvailable()
      .then(({ available }) => setBioAvail(available))
      .catch(() => setBioAvail(false));
  }, []);

  // ── Auto-trigger biometric on unlock screen open ─────────────────────────
  useEffect(() => {
    if (mode === 'unlock' && biometricAvail) {
      triggerBiometric();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricAvail]);

  const triggerBiometric = useCallback(async () => {
    try {
      const instance = getBiometricsInstance();
      if (!instance) return;
      const { success } = await instance.simplePrompt({
        promptMessage: 'Confirm your identity',
        cancelButtonText: 'Use PIN',
      });
      if (success) biometricUnlock();
    } catch {
      // User cancelled or biometric failed — fall back to PIN silently
    }
  }, [biometricUnlock]);

  // ── Shake animation for wrong PIN ────────────────────────────────────────
  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => shakeAnim.setValue(0));
  }, [shakeAnim]);

  // ── Handle PIN digit entry ────────────────────────────────────────────────
  const handleKey = useCallback(async (key: string) => {
    if (loading) return;

    if (key === '⌫') {
      setPin_(prev => prev.slice(0, -1));
      setError('');
      return;
    }

    const next = pin + key;
    setPin_(next);
    setError('');

    if (next.length < PIN_LENGTH) return;

    // PIN complete — process it
    setLoading(true);

    if (mode === 'setup') {
      // First entry: save setup PIN and move to confirm mode
      setSetupPin(next);
      setMode('confirm');
      setPin_('');
      setLoading(false);

    } else if (mode === 'confirm') {
      if (next === setupPin) {
        await setPin(next);
      } else {
        triggerShake();
        setError("PINs don't match. Try again.");
        setMode('setup');
        setSetupPin('');
        setPin_('');
      }
      setLoading(false);

    } else {
      // 'unlock' mode
      const valid = await verifyPin(next);
      if (!valid) {
        triggerShake();
        setError('Incorrect PIN. Try again.');
        setPin_('');
      }
      setLoading(false);
    }
  }, [pin, mode, loading, setupPin, setPin, verifyPin, triggerShake]);

  // ── Title text ───────────────────────────────────────────────────────────
  const titles: Record<LockMode, string> = {
    unlock:  'Enter PIN',
    setup:   'Set a PIN',
    confirm: 'Confirm PIN',
  };
  const subtitles: Record<LockMode, string> = {
    unlock:  'Enter your 4-digit PIN to continue',
    setup:   'Choose a 4-digit PIN to protect your data',
    confirm: 'Re-enter your PIN to confirm',
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={darkColors.background} />

      {/* Logo */}
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🔐</Text>
        </View>
        <Text style={styles.appName}>OfflineLedger</Text>
        <Text style={styles.tagline}>Your data, only on your device</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{titles[mode]}</Text>
      <Text style={styles.subtitle}>{subtitles[mode]}</Text>

      {/* PIN dots */}
      <PinDots count={pin.length} shake={shakeAnim} />

      {/* Error */}
      <View style={styles.errorArea}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Loading */}
      {loading && (
        <ActivityIndicator color={darkColors.primary} style={styles.spinner} />
      )}

      {/* Number pad */}
      <NumberPad onKey={handleKey} disabled={loading} />

      {/* Biometric button */}
      {mode === 'unlock' && biometricAvail && (
        <TouchableOpacity
          style={styles.bioBtn}
          onPress={triggerBiometric}
          activeOpacity={0.7}
        >
          <Text style={styles.bioBtnIcon}>👆</Text>
          <Text style={styles.bioBtnText}>Use Fingerprint</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: darkColors.background,
    alignItems: 'center',
    paddingTop: spacing[12],
    paddingHorizontal: spacing[6],
  },

  // Logo
  logoArea: { alignItems: 'center', marginBottom: spacing[8], gap: spacing[2] },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: darkColors.primaryContainer,
    borderWidth: 2,
    borderColor: darkColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  logoEmoji: { fontSize: 34 },
  appName: {
    ...typography.h1,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.bold,
  },
  tagline: {
    ...typography.bodySmall,
    color: darkColors.textDisabled,
  },

  // Heading
  title: {
    ...typography.h2,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.bodySmall,
    color: darkColors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[5],
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: darkColors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: darkColors.primary,
    borderColor: darkColors.primary,
  },

  // Error + spinner
  errorArea: { height: 20, marginBottom: spacing[2] },
  errorText: {
    ...typography.labelSmall,
    color: darkColors.error,
    textAlign: 'center',
  },
  spinner: { marginBottom: spacing[2] },

  // Number pad
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    gap: spacing[3],
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  padKey: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padKeyBtn: {
    backgroundColor: darkColors.surface,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  padKeyDisabled: { opacity: 0.5 },
  padKeyText: {
    ...typography.h2,
    color: darkColors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  padKeyTextBackspace: {
    fontSize: 22,
    color: darkColors.textSecondary,
  },

  // Biometric
  bioBtn: {
    marginTop: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: radius.xl,
    backgroundColor: darkColors.surfaceVariant,
    borderWidth: 1,
    borderColor: darkColors.border,
  },
  bioBtnIcon: { fontSize: 20 },
  bioBtnText: {
    ...typography.labelMedium,
    color: darkColors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
