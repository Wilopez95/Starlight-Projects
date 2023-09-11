import { startOfToday } from 'date-fns';

import { unambiguousSelect } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';
import CustomerRepo from './customer.js';

const TABLE_NAME = 'reminders';

class ReminderRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getFutureBy({ condition = {}, fields = ['*'] }, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .andWhere('date', '>=', startOfToday())
      .orderBy('date')
      .first();

    return result;
  }

  async getTodayReminders({ condition = {}, fields = ['*'] }, trx = this.knex) {
    condition.date = startOfToday();

    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        ...unambiguousSelect(this.tableName, fields),
        `${CustomerRepo.TABLE_NAME}.name as customerName`,
      ])
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${this.tableName}.customerId`,
      )
      .where(condition);

    return result || [];
  }
}

ReminderRepository.TABLE_NAME = TABLE_NAME;

export default ReminderRepository;
