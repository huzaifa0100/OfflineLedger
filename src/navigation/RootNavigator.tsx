// OfflineLedger — Root Navigator with Gesture Bar Safe Area Support & Modern UI
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserStackNavigator } from './UserStackNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LockScreen } from '../screens/LockScreen';
import { useAuthStore } from '../store/useAuthStore';
import { darkColors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/spacing';

// ── Vector Tab Icons ────────────────────────────────────────────────────────

function ClientsVectorIcon({ color }: { color: string }) {
  return (
    <View style={styles.vectorIconBox}>
      <View style={[styles.avatarHead, { backgroundColor: color }]} />
      <View style={[styles.avatarBody, { backgroundColor: color }]} />
    </View>
  );
}

function SettingsVectorIcon({ color }: { color: string }) {
  return (
    <View style={styles.vectorIconBox}>
      <View style={[styles.gearRing, { borderColor: color }]}>
        <View style={[styles.gearCenter, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export type RootTabParamList = {
  Workers: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { isLocked, isPinSet } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Calculate dynamic bottom padding so tab bar never overlaps system gesture bar
  const bottomPadding = Math.max(insets.bottom, spacing[2]);
  const tabBarHeight = 62 + bottomPadding;

  // ── Auth guard: render lock screen if locked or PIN not yet set ──────────
  if (isLocked || !isPinSet) {
    return <LockScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkColors.surface,
          borderTopColor: darkColors.cardBorder,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: spacing[2],
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: darkColors.primary,
        tabBarInactiveTintColor: darkColors.textDisabled,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Workers"
        component={UserStackNavigator}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <ClientsVectorIcon color={focused ? darkColors.primary : darkColors.textDisabled} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: darkColors.surface,
            borderBottomWidth: 1,
            borderBottomColor: darkColors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: darkColors.textPrimary,
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <SettingsVectorIcon color={focused ? darkColors.primary : darkColors.textDisabled} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    paddingHorizontal: 14,
    paddingVertical: spacing[1],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: darkColors.primaryContainer,
  },
  vectorIconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 1,
  },
  avatarBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  gearRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
