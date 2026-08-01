// OfflineLedger — Note Model (per-user freeform notepad)
import { Model } from '@nozbe/watermelondb';
import { date, readonly, text, relation, writer } from '@nozbe/watermelondb/decorators';
import { User } from './User';

export class Note extends Model {
  static table = 'notes';

  static associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
  };

  @text('user_id') userId!: string;
  @text('content') content!: string;

  @readonly @date('updated_at') updatedAt!: Date;

  @relation('users', 'user_id') user!: User;

  @writer async saveContent(newContent: string) {
    await this.update(record => {
      record.content = newContent;
    });
  }
}
