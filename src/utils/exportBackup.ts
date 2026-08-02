// OfflineLedger — Backup & Restore Utility
// Export: copies DB + media files → zips → saves to accessible storage.
// Restore: picks ZIP via document picker → unzips → overwrites files → prompts restart.
import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import { pick, saveDocuments, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import { Alert, Share } from 'react-native';
import { storage, StorageKeys } from './storage';
import { useAuthStore } from '../store/useAuthStore';

// ── Path helpers ──────────────────────────────────────────────────────────────

/** All user media (avatars + docs) */
const MEDIA_DIR = RNFS.DocumentDirectoryPath;

/** Temp dir used for assembling the backup archive */
const TEMP_BACKUP_DIR = `${RNFS.CachesDirectoryPath}/ol_backup_temp`;

/** Temp dir used for unzipping a restore archive */
const TEMP_RESTORE_DIR = `${RNFS.CachesDirectoryPath}/ol_restore_temp`;

// ── Database finder helper ───────────────────────────────────────────────────

// ── Database finder helper ───────────────────────────────────────────────────

async function findDatabasePath(): Promise<string | null> {
  const filesDir = RNFS.DocumentDirectoryPath;
  const appDataDir = filesDir.replace(/\/files$/, '');
  const candidateDirs = [`${appDataDir}/databases`, filesDir];
  const candidateNames = [
    'offlineledger.db',
    'offlineledger',
    'watermelon.db',
    'watermelon',
    'watermelondb.db',
  ];

  for (const dir of candidateDirs) {
    if (await RNFS.exists(dir)) {
      for (const name of candidateNames) {
        const fullPath = `${dir}/${name}`;
        if (await RNFS.exists(fullPath)) {
          return fullPath;
        }
      }
      try {
        const items = await RNFS.readDir(dir);
        for (const item of items) {
          if (
            item.isFile() &&
            (item.name.endsWith('.db') ||
              item.name.includes('ledger') ||
              item.name.includes('watermelon'))
          ) {
            return item.path;
          }
        }
      } catch (e) {
        // Skip unreadable dirs
      }
    }
  }
  return null;
}

async function ensureDatabasePath(): Promise<string> {
  const existing = await findDatabasePath();
  if (existing) return existing;

  const filesDir = RNFS.DocumentDirectoryPath;
  const appDataDir = filesDir.replace(/\/files$/, '');
  const dbDir = `${appDataDir}/databases`;

  if (!(await RNFS.exists(dbDir))) {
    await RNFS.mkdir(dbDir).catch(() => {});
  }

  const defaultDbPath = `${dbDir}/offlineledger.db`;
  if (!(await RNFS.exists(defaultDbPath))) {
    await RNFS.writeFile(defaultDbPath, '', 'utf8').catch(() => {});
  }
  return defaultDbPath;
}

// ── Timestamp helper ──────────────────────────────────────────────────────────

function timestamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('');
}

// ── Recursive directory copy helper ─────────────────────────────────────────

async function copyDirRecursive(src: string, dest: string): Promise<void> {
  const destExists = await RNFS.exists(dest);
  if (!destExists) await RNFS.mkdir(dest);

  try {
    const items = await RNFS.readDir(src);
    for (const item of items) {
      // Ignore cache/temp backup dirs
      if (item.name.startsWith('ol_backup') || item.name.startsWith('ol_restore')) continue;
      const destPath = `${dest}/${item.name}`;
      if (item.isDirectory()) {
        await copyDirRecursive(item.path, destPath);
      } else {
        await RNFS.copyFile(item.path, destPath).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[copyDirRecursive] Error listing directory:', src, err);
  }
}

// ── EXPORT ───────────────────────────────────────────────────────────────────

export async function exportBackup(): Promise<string> {
  // 1. Clean + create temp assembly dir
  if (await RNFS.exists(TEMP_BACKUP_DIR)) {
    await RNFS.unlink(TEMP_BACKUP_DIR).catch(() => {});
  }
  await RNFS.mkdir(TEMP_BACKUP_DIR);

  try {
    // 2. Ensure SQLite DB path exists (creates file if not initialized yet)
    const dbPath = await ensureDatabasePath();
    await RNFS.copyFile(dbPath, `${TEMP_BACKUP_DIR}/offlineledger.db`);

    // 3. Copy media directory (avatars + docs)
    const mediaExists = await RNFS.exists(MEDIA_DIR);
    if (mediaExists) {
      await copyDirRecursive(MEDIA_DIR, `${TEMP_BACKUP_DIR}/media`);
    }

    // 4. Create ZIP archive in guaranteed-writable Cache directory
    const fileName = `OfflineLedger_backup_${timestamp()}.zip`;
    const primaryZipPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    if (await RNFS.exists(primaryZipPath)) {
      await RNFS.unlink(primaryZipPath).catch(() => {});
    }

    await zip(TEMP_BACKUP_DIR, primaryZipPath);

    // 5. Attempt direct copy to Downloads directory
    let savedPath = '';
    const downloadsPathsToTry = [
      RNFS.DownloadDirectoryPath ? `${RNFS.DownloadDirectoryPath}/${fileName}` : null,
      '/storage/emulated/0/Download/' + fileName,
      '/sdcard/Download/' + fileName,
      RNFS.ExternalDirectoryPath ? `${RNFS.ExternalDirectoryPath}/${fileName}` : null,
    ].filter(Boolean) as string[];

    for (const targetPath of downloadsPathsToTry) {
      try {
        if (await RNFS.exists(targetPath)) {
          await RNFS.unlink(targetPath).catch(() => {});
        }
        await RNFS.copyFile(primaryZipPath, targetPath);
        savedPath = targetPath;
        break;
      } catch (e) {
        // Continue trying next location
      }
    }

    // 6. If direct filesystem copy failed (due to Scoped Storage), trigger native Save Documents dialog
    if (!savedPath) {
      const sourceUri = primaryZipPath.startsWith('file://') ? primaryZipPath : `file://${primaryZipPath}`;
      const saveResults = await saveDocuments({
        sourceUris: [sourceUri],
        mimeType: 'application/zip',
        fileName,
      });

      const firstSaved = saveResults?.[0];
      if (firstSaved?.uri) {
        savedPath = firstSaved.uri;
      } else if (firstSaved?.error) {
        throw new Error(`Failed to save backup: ${firstSaved.error}`);
      } else {
        savedPath = primaryZipPath;
      }
    }

    // Record last backup time
    storage.set(StorageKeys.BACKUP_LAST_AT, new Date().toISOString());
    return savedPath;
  } finally {
    // Clean up temp assembly dir
    await RNFS.unlink(TEMP_BACKUP_DIR).catch(() => {});
  }
}

// ── RESTORE ──────────────────────────────────────────────────────────────────

export async function restoreBackup(): Promise<void> {
  // Disable auto-lock during document picking
  useAuthStore.getState().setPickingMedia(true);

  let results;
  try {
    results = await pick({
      type: [types.zip, 'application/zip', 'application/x-zip-compressed', '*/*'],
      copyTo: 'cachesDirectory',
    });
  } catch (err: any) {
    useAuthStore.getState().setPickingMedia(false);
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return; // User cancelled
    throw err;
  } finally {
    useAuthStore.getState().setPickingMedia(false);
  }

  const result = results?.[0];
  if (!result) return;

  const fileCopyUri = (result as any).fileCopyUri;
  const rawUri = fileCopyUri || result.uri;
  if (!rawUri) throw new Error('Could not access the selected backup file.');

  const fileName = result.name ?? rawUri;
  if (!fileName.toLowerCase().endsWith('.zip') && !rawUri.toLowerCase().endsWith('.zip')) {
    throw new Error('Please select a valid .zip backup file.');
  }

  // 1. Prepare local cached path for unzipping
  const localZipPath = `${RNFS.CachesDirectoryPath}/ol_restore_archive.zip`;
  if (await RNFS.exists(localZipPath)) {
    await RNFS.unlink(localZipPath).catch(() => {});
  }

  // 2. Resolve content:// provider or encoded URI into physical file path
  let sourcePath = rawUri;
  if (sourcePath.startsWith('content://')) {
    const rawMatch = sourcePath.match(/document\/raw%3A(.+)$/i) || sourcePath.match(/document\/raw:(.+)$/i);
    if (rawMatch?.[1]) {
      sourcePath = decodeURIComponent(rawMatch[1]);
    }
  }

  const cleanSourcePath = decodeURIComponent(sourcePath).replace(/^file:\/\//, '');

  // 3. Copy file to local cache path
  try {
    if (await RNFS.exists(cleanSourcePath)) {
      await RNFS.copyFile(cleanSourcePath, localZipPath);
    } else if (rawUri.startsWith('file://')) {
      await RNFS.copyFile(rawUri.replace(/^file:\/\//, ''), localZipPath);
    } else if (fileCopyUri) {
      const copyPath = decodeURIComponent(fileCopyUri).replace(/^file:\/\//, '');
      if (await RNFS.exists(copyPath)) {
        await RNFS.copyFile(copyPath, localZipPath);
      }
    }
  } catch (copyErr) {
    console.warn('[restoreBackup] Copy to cache warning:', copyErr);
  }

  const zipFileToUnzip = (await RNFS.exists(localZipPath)) ? localZipPath : cleanSourcePath;

  // 4. Clean + create temp restore dir
  if (await RNFS.exists(TEMP_RESTORE_DIR)) {
    await RNFS.unlink(TEMP_RESTORE_DIR).catch(() => {});
  }
  await RNFS.mkdir(TEMP_RESTORE_DIR);

  // 5. Unzip
  await unzip(zipFileToUnzip, TEMP_RESTORE_DIR);

  // 3. Verify archive has expected content
  const dbRestorePath = `${TEMP_RESTORE_DIR}/offlineledger.db`;
  const dbValid = await RNFS.exists(dbRestorePath);
  if (!dbValid) {
    await RNFS.unlink(TEMP_RESTORE_DIR).catch(() => {});
    throw new Error(
      'Invalid backup file. The selected ZIP does not contain an OfflineLedger database.',
    );
  }

  // 4. Restore DB file
  const filesDir = RNFS.DocumentDirectoryPath;
  const appDataDir = filesDir.replace(/\/files$/, '');
  const dbDir = `${appDataDir}/databases`;
  if (!(await RNFS.exists(dbDir))) await RNFS.mkdir(dbDir);
  await RNFS.copyFile(dbRestorePath, `${dbDir}/offlineledger.db`);

  // 5. Restore media files
  const mediaRestoreDir = `${TEMP_RESTORE_DIR}/media`;
  if (await RNFS.exists(mediaRestoreDir)) {
    await copyDirRecursive(mediaRestoreDir, MEDIA_DIR);
  }

  // 6. Clean up temp dir
  await RNFS.unlink(TEMP_RESTORE_DIR).catch(() => {});

  // 7. Prompt user to restart
  Alert.alert(
    '✅ Restore Complete',
    'Your data has been restored successfully.\n\nPlease close and reopen the app to load your restored records.',
    [{ text: 'OK' }],
  );
}
