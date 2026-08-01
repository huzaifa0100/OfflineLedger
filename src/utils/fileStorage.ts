// OfflineLedger — File Storage Utility
// Copies any URI (camera or gallery) into app-private storage.
// The original source is NEVER stored — only the private copy path survives.
import RNFS from 'react-native-fs';

/** Root directory for all app-owned media */
const STORAGE_ROOT = RNFS.DocumentDirectoryPath;

/**
 * Copies a source URI into the app's private document directory.
 * @param sourceUri  The temporary URI returned by image picker or camera
 * @param subDir     Subfolder within DocumentDirectoryPath (e.g. 'avatars', 'docs/user-abc')
 * @param fileName   Optional filename; defaults to timestamp + .jpg
 * @returns          The permanent private file path
 */
export async function copyImageToPrivateStorage(
  sourceUri: string,
  subDir: string,
  fileName?: string,
): Promise<string> {
  const destDir = `${STORAGE_ROOT}/${subDir}`;

  // Ensure directory exists
  const exists = await RNFS.exists(destDir);
  if (!exists) {
    await RNFS.mkdir(destDir);
  }

  const name = fileName ?? `img_${Date.now()}.jpg`;
  const destPath = `${destDir}/${name}`;

  // Strip 'file://' prefix if present — RNFS.copyFile needs a raw path
  const cleanSource = sourceUri.startsWith('file://')
    ? sourceUri.replace('file://', '')
    : sourceUri;

  await RNFS.copyFile(cleanSource, destPath);
  return destPath;
}

/**
 * Deletes a file from the app's private storage.
 * Safe to call even if the file no longer exists.
 */
export async function deletePrivateFile(filePath: string): Promise<void> {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (err) {
    console.warn('[fileStorage] Failed to delete file:', filePath, err);
  }
}

/**
 * Converts a raw private file path to a React Native Image-compatible URI.
 * Android needs the 'file://' prefix for local paths.
 */
export function toImageUri(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  return filePath.startsWith('file://') ? filePath : `file://${filePath}`;
}
