/**
 * OfflineLedger — Root Application (Final)
 * Bootstraps: i18n → GestureHandler → SafeArea → Paper → NavigationContainer → RootNavigator
 * Phase 9: AppState listener → auto-locks app on background
 * Phase 10: i18next initialized as a side-effect import
 */

// Phase 10: initialize i18next before anything renders
import './src/locales/i18n';

import React, { useEffect, useRef } from 'react';
import { StatusBar, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppDarkTheme } from './src/theme';
import { useAuthStore } from './src/store/useAuthStore';

const NAV_THEME = {
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
    regular:  { fontFamily: 'Roboto',       fontWeight: '400' as const },
    medium:   { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    bold:     { fontFamily: 'Roboto-Bold',   fontWeight: '700' as const },
    heavy:    { fontFamily: 'Roboto-Bold',   fontWeight: '900' as const },
  },
};

function App() {
  const lock = useAuthStore(state => state.lock);
  const initFromStorage = useAuthStore(state => state.initFromStorage);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  // ── Phase 9: auto-lock on background ─────────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasActive = appState.current === 'active';
      const goingBackground = nextState === 'background';
      const isPicking = useAuthStore.getState().isPickingMedia;

      // Never lock if app is currently picking camera/gallery media or showing permission dialogs
      if (wasActive && goingBackground && !isPicking) {
        lock();
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [lock]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={AppDarkTheme}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#0D1B2A"
            translucent={false}
          />
          <NavigationContainer theme={NAV_THEME}>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
