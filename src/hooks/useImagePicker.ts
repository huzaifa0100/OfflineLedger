// OfflineLedger — Image Picker Hook
// Wraps react-native-image-picker, handles permissions, and copies images
// to app-private storage.
import { useCallback } from 'react';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { copyImageToPrivateStorage } from '../utils/fileStorage';
import { usePermissions } from './usePermissions';
import { useAuthStore } from '../store/useAuthStore';

const SHARED_OPTIONS: CameraOptions & ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.85,
  maxWidth: 1920,
  maxHeight: 1920,
  includeBase64: false,
  saveToPhotos: false,
};

export type ImagePickerSource = 'camera' | 'gallery';

interface UseImagePickerOptions {
  subDir: string;
  onSuccess: (privatePath: string) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
}

export function useImagePicker({
  subDir,
  onSuccess,
  onError,
  onCancel,
}: UseImagePickerOptions) {
  const { requestCamera, requestMediaImages } = usePermissions();
  const setPickingMedia = useAuthStore(state => state.setPickingMedia);

  const processResponse = useCallback(
    async (response: ImagePickerResponse) => {
      // Re-enable auto-lock after picker closes
      setTimeout(() => setPickingMedia(false), 500);

      if (response.didCancel) {
        onCancel?.();
        return;
      }
      if (response.errorCode) {
        onError?.(response.errorMessage ?? 'Image picker error');
        return;
      }
      const asset = response.assets?.[0];
      if (!asset?.uri) {
        onError?.('No image selected');
        return;
      }

      try {
        const privatePath = await copyImageToPrivateStorage(asset.uri, subDir);
        onSuccess(privatePath);
      } catch (err: any) {
        onError?.(err?.message ?? 'Failed to save image');
      }
    },
    [subDir, onSuccess, onError, onCancel, setPickingMedia],
  );

  const pickFromCamera = useCallback(async () => {
    // 1. Set picking flag IMMEDIATELY to prevent AppState lock on permission/camera dialogs
    setPickingMedia(true);

    try {
      const granted = await requestCamera();
      if (!granted) {
        setPickingMedia(false);
        return;
      }
      launchCamera(SHARED_OPTIONS, processResponse);
    } catch {
      setPickingMedia(false);
    }
  }, [requestCamera, processResponse, setPickingMedia]);

  const pickFromGallery = useCallback(async () => {
    // 1. Set picking flag IMMEDIATELY to prevent AppState lock on permission/gallery dialogs
    setPickingMedia(true);

    try {
      const granted = await requestMediaImages();
      if (!granted) {
        setPickingMedia(false);
        return;
      }
      launchImageLibrary(SHARED_OPTIONS, processResponse);
    } catch {
      setPickingMedia(false);
    }
  }, [requestMediaImages, processResponse, setPickingMedia]);

  return { pickFromCamera, pickFromGallery };
}
