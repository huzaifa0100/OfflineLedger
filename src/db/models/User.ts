// OfflineLedger — User Model
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, writer } from '@nozbe/watermelondb/decorators';

export class User extends Model {
  static table = 'users';

  static associations = {
    documents:       { type: 'has_many' as const, foreignKey: 'user_id' },
    notes:           { type: 'has_many' as const, foreignKey: 'user_id' },
    advance_entries: { type: 'has_many' as const, foreignKey: 'user_id' },
  };

  @text('name')        name!: string;
  @text('phone')       phone!: string;
  @text('email')       email!: string;
  @text('address')     address!: string;
  @text('cnic')        cnic!: string;
  @text('avatar_path') avatarPath!: string;
  @field('total_balance') totalBalance!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @writer async updateDetails(details: Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    cnic: string;
    avatarPath: string;
    totalBalance: number;
  }>) {
    await this.update(record => {
      if (details.name        !== undefined) record.name         = details.name;
      if (details.phone       !== undefined) record.phone        = details.phone;
      if (details.email       !== undefined) record.email        = details.email;
      if (details.address     !== undefined) record.address      = details.address;
      if (details.cnic        !== undefined) record.cnic         = details.cnic;
      if (details.avatarPath  !== undefined) record.avatarPath   = details.avatarPath;
      if (details.totalBalance !== undefined) record.totalBalance = details.totalBalance;
    });
  }

  @writer async deleteWithRelated() {
    // Mark for cascade delete — children handled by their own cleanup
    await this.destroyPermanently();
  }
}
