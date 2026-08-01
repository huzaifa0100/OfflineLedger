// OfflineLedger — MMKV Storage Singleton
// Lazy instance initialization to prevent top-level module load crashes in React Native JSI
import { MMKV } from 'react-native-mmkv';

let _storageInstance: MMKV | null = null;

export function getStorage(): MMKV | null {
  if (!_storageInstance) {
    try {
      _storageInstance = new MMKV({ id: 'offlineledger-storage' });
    } catch (e) {
      console.warn('[MMKV] Storage instantiation error:', e);
      return null;
    }
  }
  return _storageInstance;
}

export const storage = {
  getBoolean(key: string): boolean | undefined {
    return getStorage()?.getBoolean(key);
  },
  getString(key: string): string | undefined {
    return getStorage()?.getString(key);
  },
  set(key: string, value: boolean | string | number): void {
    getStorage()?.set(key, value);
  },
  delete(key: string): void {
    getStorage()?.delete(key);
  },
};

export const StorageKeys = {
  PIN_HASH:       'auth.pinHash',
  IS_LOCKED:      'auth.isLocked',
  PIN_IS_SET:     'auth.pinIsSet',
  APP_LANGUAGE:   'settings.language',
  BACKUP_LAST_AT: 'settings.lastBackupAt',
} as const;
