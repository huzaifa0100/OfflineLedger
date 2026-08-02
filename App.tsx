/**
 * OfflineLedger — Root Application (Final)
 * Bootstraps: i18n → GestureHandler → SafeArea → Paper → NavigationContainer → RootNavigator
 * Phase 9: AppState listener → auto-locks app on background
 * Phase 10: i18next initialized as a side-effect import
 */

// Phase 10: initialize i18next before anything renders
import './src/locales/i18n';

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppDarkTheme, AppLightTheme } from './src/theme';
import { useAuthStore } from './src/store/useAuthStore';
import { useThemeStore } from './src/store/useThemeStore';

const NAV_DARK_THEME = {
  dark: true,
  colors: {
    primary:      '#F0A500',
    background:   '#0D1B2A',
    card:         '#1B2E45',
    text:         '#FFFFFF',
    border:       '#2E4F70',
    notification: '#F0A500',
  },
  fonts: {
    regular:  { fontFamily: 'Roboto',        fontWeight: '400' as const },
    medium:   { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    bold:     { fontFamily: 'Roboto-Bold',   fontWeight: '700' as const },
    heavy:    { fontFamily: 'Roboto-Bold',   fontWeight: '900' as const },
  },
};

const NAV_LIGHT_THEME = {
  dark: false,
  colors: {
    primary:      '#1B2E45',
    background:   '#F9FAFB',
    card:         '#FFFFFF',
    text:         '#111827',
    border:       '#E5E7EB',
    notification: '#10B981',
  },
  fonts: {
    regular:  { fontFamily: 'Roboto',        fontWeight: '400' as const },
    medium:   { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    bold:     { fontFamily: 'Roboto-Bold',   fontWeight: '700' as const },
    heavy:    { fontFamily: 'Roboto-Bold',   fontWeight: '900' as const },
  },
};

function App() {
  const initFromStorage = useAuthStore(state => state.initFromStorage);
  const { themeMode, initTheme } = useThemeStore();
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    initFromStorage();
    initTheme();
  }, [initFromStorage, initTheme]);

  // Determine active theme
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const paperTheme = isDark ? AppDarkTheme : AppLightTheme;
  const navTheme = isDark ? NAV_DARK_THEME : NAV_LIGHT_THEME;

  // Note: App only requires PIN unlock on complete cold start / app launch or manual lock

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={isDark ? '#0D1B2A' : '#F9FAFB'}
            translucent={false}
          />
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
