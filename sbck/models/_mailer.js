import isEmpty from 'lodash/isEmpty.js';

import { EmailEvent } from '../consts/emailEvent.js';
import BaseModel from './_base.js';

export default class Mailer extends BaseModel {
  static get fkName() {
    return 'id';
  }

  static async updateStatusesOnSend({ failed, successful }) {
    const trx = await this.startTransaction();
    try {
      await Promise.all([
        isEmpty(successful) ||
          this.query(trx)
            .patch({ status: EmailEvent.SENT })
            .whereIn(this.fkName, successful)
            .andWhere({ status: EmailEvent.PENDING }),
        isEmpty(failed) ||
          this.query(trx)
            .patch({ status: EmailEvent.FAILED_TO_SEND })
            .whereIn(this.fkName, failed)
            .andWhere({ status: EmailEvent.PENDING }),
      ]);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async updateStatusesOnDelivery({ delivered, failedToDeliver }) {
    const trx = await this.startTransaction();
    try {
      await Promise.all([
        isEmpty(delivered) ||
          this.query(trx)
            .patch({
              status: EmailEvent.DELIVERED,
            })
            .whereIn(this.fkName, delivered)
            .andWhere({ status: EmailEvent.SENT }),
        isEmpty(failedToDeliver) ||
          this.query(trx)
            .patch({
              status: EmailEvent.FAILED_TO_DELIVER,
            })
            .whereIn(this.fkName, failedToDeliver)
            .andWhere({ status: EmailEvent.SENT }),
      ]);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
