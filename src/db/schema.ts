// OfflineLedger — WatermelonDB Schema v1
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name',        type: 'string' },
        { name: 'phone',       type: 'string' },
        { name: 'email',       type: 'string', isOptional: true },
        { name: 'address',     type: 'string', isOptional: true },
        { name: 'cnic',        type: 'string', isOptional: true },
        { name: 'avatar_path', type: 'string', isOptional: true },
        { name: 'total_balance', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'documents',
      columns: [
        { name: 'user_id',    type: 'string', isIndexed: true },
        { name: 'title',      type: 'string' },
        { name: 'image_path', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'user_id',    type: 'string', isIndexed: true },
        { name: 'content',    type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'advance_entries',
      columns: [
        { name: 'user_id',     type: 'string', isIndexed: true },
        { name: 'amount',      type: 'number' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
