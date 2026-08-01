// OfflineLedger — Backup & Restore Utility (Phase 8)
// Export: copies DB + media files → zips → saves to Downloads.
// Restore: picks ZIP → unzips → overwrites files → prompts restart.
import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import { pickSingle, types, isCancel } from '@react-native-documents/picker';
import { Alert, Share } from 'react-native';
import { storage, StorageKeys } from './storage';

// ── Path helpers ──────────────────────────────────────────────────────────────

/** SQLite DB file. On Android: <app-data>/databases/watermelondb.db */
const DB_PATH = (() => {
  const filesDir = RNFS.DocumentDirectoryPath; // .../com.offlineledger/files
  const appDataDir = filesDir.replace(/\/files$/, '');
  return `${appDataDir}/databases/watermelondb.db`;
})();

/** All user media (avatars + docs) */
const MEDIA_DIR = RNFS.DocumentDirectoryPath;

/** Temp dir used for assembling the backup archive */
const TEMP_BACKUP_DIR = `${RNFS.CachesDirectoryPath}/ol_backup_temp`;

/** Temp dir used for unzipping a restore archive */
const TEMP_RESTORE_DIR = `${RNFS.CachesDirectoryPath}/ol_restore_temp`;

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

  const items = await RNFS.readDir(src);
  for (const item of items) {
    const destPath = `${dest}/${item.name}`;
    if (item.isDirectory()) {
      await copyDirRecursive(item.path, destPath);
    } else {
      await RNFS.copyFile(item.path, destPath);
    }
  }
}

// ── EXPORT ───────────────────────────────────────────────────────────────────

/**
 * Exports all app data to a ZIP file in the Downloads directory.
 * Structure inside ZIP:
 *   offlineledger.db  — the SQLite database
 *   media/            — all avatars and document images
 */
export async function exportBackup(): Promise<string> {
  // 1. Clean + create temp assembly dir
  if (await RNFS.exists(TEMP_BACKUP_DIR)) {
    await RNFS.unlink(TEMP_BACKUP_DIR);
  }
  await RNFS.mkdir(TEMP_BACKUP_DIR);

  // 2. Copy SQLite DB
  const dbExists = await RNFS.exists(DB_PATH);
  if (dbExists) {
    await RNFS.copyFile(DB_PATH, `${TEMP_BACKUP_DIR}/offlineledger.db`);
  }

  // 3. Copy media directory (avatars + docs)
  const mediaExists = await RNFS.exists(MEDIA_DIR);
  if (mediaExists) {
    await copyDirRecursive(MEDIA_DIR, `${TEMP_BACKUP_DIR}/media`);
  }

  // 4. Zip the temp dir
  const fileName = `OfflineLedger_backup_${timestamp()}.zip`;
  const destZip  = `${RNFS.DownloadDirectoryPath}/${fileName}`;
  await zip(TEMP_BACKUP_DIR, destZip);

  // 5. Clean up temp dir
  await RNFS.unlink(TEMP_BACKUP_DIR).catch(() => {});

  // 6. Record last backup time
  storage.set(StorageKeys.BACKUP_LAST_AT, new Date().toISOString());

  return destZip;
}

// ── RESTORE ──────────────────────────────────────────────────────────────────

/**
 * Lets the user pick a backup ZIP, verifies it, and restores all data.
 * After restore, the user must restart the app for changes to take effect.
 */
export async function restoreBackup(): Promise<void> {
  // 1. Pick the ZIP file
  let result;
  try {
    result = await pickSingle({ type: [types.zip], copyTo: 'cachesDirectory' });
  } catch (err) {
    if (isCancel(err)) return; // User cancelled — silently exit
    throw err;
  }

  const zipUri = result.fileCopyUri ?? result.uri;
  if (!zipUri) throw new Error('Could not access the selected file.');

  // Strip file:// prefix for RNFS
  const zipPath = zipUri.replace('file://', '');

  // 2. Clean + create temp restore dir
  if (await RNFS.exists(TEMP_RESTORE_DIR)) {
    await RNFS.unlink(TEMP_RESTORE_DIR);
  }
  await RNFS.mkdir(TEMP_RESTORE_DIR);

  // 3. Unzip
  await unzip(zipPath, TEMP_RESTORE_DIR);

  // 4. Verify archive has expected content
  const dbRestorePath = `${TEMP_RESTORE_DIR}/offlineledger.db`;
  const dbValid = await RNFS.exists(dbRestorePath);
  if (!dbValid) {
    await RNFS.unlink(TEMP_RESTORE_DIR).catch(() => {});
    throw new Error(
      'Invalid backup file. The selected ZIP does not appear to be an OfflineLedger backup.',
    );
  }

  // 5. Restore DB file
  const dbDir = DB_PATH.replace('/watermelondb.db', '');
  if (!(await RNFS.exists(dbDir))) await RNFS.mkdir(dbDir);
  await RNFS.copyFile(dbRestorePath, DB_PATH);

  // 6. Restore media files
  const mediaRestoreDir = `${TEMP_RESTORE_DIR}/media`;
  if (await RNFS.exists(mediaRestoreDir)) {
    // Clear existing media
    if (await RNFS.exists(MEDIA_DIR)) await RNFS.unlink(MEDIA_DIR);
    await copyDirRecursive(mediaRestoreDir, MEDIA_DIR);
  }

  // 7. Clean up temp dir
  await RNFS.unlink(TEMP_RESTORE_DIR).catch(() => {});

  // 8. Prompt user to restart
  Alert.alert(
    '✅ Restore Complete',
    'Your data has been restored successfully.\n\nPlease close and reopen the app to apply the changes.',
    [{ text: 'OK' }],
  );
}

// ── SHARE (optional) ─────────────────────────────────────────────────────────

/**
 * Share the backup ZIP file via the native share sheet.
 * Can be used after exportBackup() to send via WhatsApp, email, etc.
 */
export async function shareBackupFile(zipPath: string): Promise<void> {
  await Share.share({
    title: 'OfflineLedger Backup',
    url: `file://${zipPath}`,
    message: 'OfflineLedger backup file',
  });
}
