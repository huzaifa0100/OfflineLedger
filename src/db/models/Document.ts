// OfflineLedger — Document Model (image attachments per user)
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation, writer } from '@nozbe/watermelondb/decorators';
import { User } from './User';

export class Document extends Model {
  static table = 'documents';

  static associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
  };

  @text('user_id')    userId!: string;
  @text('title')      title!: string;
  @text('image_path') imagePath!: string;  // Always app-private RNFS.DocumentDirectoryPath

  @readonly @date('created_at') createdAt!: Date;

  @relation('users', 'user_id') user!: User;

  @writer async updateTitle(newTitle: string) {
    await this.update(record => {
      record.title = newTitle;
    });
  }
}
