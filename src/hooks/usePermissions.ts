// OfflineLedger — Permissions Hook (Phase 7)
// Wraps react-native-permissions for Camera + Media Images (Android 13+).
// react-native-image-picker handles permissions internally, but explicit pre-checks
// give us a consistent experience with a rationale dialog before the OS prompt.
import { useCallback } from 'react';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  openSettings,
} from 'react-native-permissions';
import { Alert, Platform } from 'react-native';

type PermissionResult = 'granted' | 'denied' | 'blocked';

async function checkAndRequest(permission: Permission): Promise<PermissionResult> {
  const current = await check(permission);

  switch (current) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';

    case RESULTS.DENIED: {
      // Not yet asked — request it
      const result = await request(permission);
      return result === RESULTS.GRANTED || result === RESULTS.LIMITED
        ? 'granted'
        : 'denied';
    }

    case RESULTS.BLOCKED:
    case RESULTS.UNAVAILABLE:
      return 'blocked';

    default:
      return 'denied';
  }
}

function showBlockedAlert(permissionName: string) {
  Alert.alert(
    `${permissionName} Permission Required`,
    `OfflineLedger needs ${permissionName.toLowerCase()} access to work properly. ` +
      'Please enable it in the app settings.',
    [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Open Settings', onPress: openSettings },
    ],
  );
}

export function usePermissions() {
  /**
   * Request CAMERA permission.
   * Returns true if granted.
   */
  const requestCamera = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    const result = await checkAndRequest(PERMISSIONS.ANDROID.CAMERA);
    if (result === 'blocked') showBlockedAlert('Camera');
    return result === 'granted';
  }, []);

  /**
   * Request photo library / media images permission.
   * On Android 13+ uses READ_MEDIA_IMAGES; below that uses READ_EXTERNAL_STORAGE.
   */
  const requestMediaImages = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    const sdkInt = Platform.Version as number;
    const permission =
      sdkInt >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    const result = await checkAndRequest(permission);
    if (result === 'blocked') showBlockedAlert('Photo Library');
    return result === 'granted';
  }, []);

  /**
   * Request both camera AND media images — for document/avatar picking.
   * Returns true only if both are granted.
   */
  const requestCameraAndMedia = useCallback(async (): Promise<boolean> => {
    const camOk   = await requestCamera();
    const mediaOk = await requestMediaImages();
    return camOk && mediaOk;
  }, [requestCamera, requestMediaImages]);

  return { requestCamera, requestMediaImages, requestCameraAndMedia };
}
