// OfflineLedger — Root Navigator (Updated: Phase 9 auth guard + Settings tab)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { UserStackNavigator } from './UserStackNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LockScreen } from '../screens/LockScreen';
import { useAuthStore } from '../store/useAuthStore';
import { darkColors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export type RootTabParamList = {
  Workers: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const { isLocked, isPinSet } = useAuthStore();

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
          borderTopColor: darkColors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: spacing[2],
          paddingTop: spacing[1],
        },
        tabBarActiveTintColor:   darkColors.primary,
        tabBarInactiveTintColor: darkColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Workers"
        component={UserStackNavigator}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
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
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            color: darkColors.textPrimary,
            fontWeight: '600',
          },
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
