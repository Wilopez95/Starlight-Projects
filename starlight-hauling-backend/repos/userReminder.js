import { unambiguousSelect } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';

import CustomerRepo from './customer.js';
import ReminderRepo from './reminder.js';

const TABLE_NAME = 'user_reminders';

class UserReminderRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated({ condition = {}, skip = 0, limit = 25, fields = ['*'] }, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        ...unambiguousSelect(this.tableName, fields),
        `${ReminderRepo.TABLE_NAME}.type`,
        `${ReminderRepo.TABLE_NAME}.entityId`,
        `${ReminderRepo.TABLE_NAME}.date`,
        `${CustomerRepo.TABLE_NAME}.id as customerId`,
        `${CustomerRepo.TABLE_NAME}.name as customerName`,
      ])
      .innerJoin(
        ReminderRepo.TABLE_NAME,
        `${ReminderRepo.TABLE_NAME}.id`,
        `${this.tableName}.reminderId`,
      )
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${ReminderRepo.TABLE_NAME}.customerId`,
      )
      .where(`${ReminderRepo.TABLE_NAME}.informByApp`, true)
      .where(condition)
      .orderBy(`${this.tableName}.createdAt`, 'desc')
      .limit(limit)
      .offset(skip);

    return result;
  }
}

UserReminderRepository.TABLE_NAME = TABLE_NAME;

export default UserReminderRepository;
