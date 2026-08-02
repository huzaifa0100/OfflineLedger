// OfflineLedger — WatermelonDB Database Singleton
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { User } from './models/User';
import { Document } from './models/Document';
import { Note } from './models/Note';
import { AdvanceEntry } from './models/AdvanceEntry';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'offlineledger',
  jsi: true,          // Use JSI for best performance on RN 0.71+
  onSetUpError: error => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [User, Document, Note, AdvanceEntry],
});

// Convenience collection accessors
export const usersCollection = database.get<User>('users');
export const documentsCollection = database.get<Document>('documents');
export const notesCollection = database.get<Note>('notes');
export const advancesCollection = database.get<AdvanceEntry>('advance_entries');
