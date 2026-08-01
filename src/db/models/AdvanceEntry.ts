// OfflineLedger — AdvanceEntry Model (financial ledger entries)
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';
import { User } from './User';

export class AdvanceEntry extends Model {
  static table = 'advance_entries';

  static associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
  };

  @text('user_id')      userId!: string;
  @field('amount')      amount!: number;      // Always positive — represents money paid out
  @text('description')  description!: string; // e.g. "Eid advance", "Medical emergency"

  @readonly @date('created_at') createdAt!: Date; // Date + time of this advance

  @relation('users', 'user_id') user!: User;
}
