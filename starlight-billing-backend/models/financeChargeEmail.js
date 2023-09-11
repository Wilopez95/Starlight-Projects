import { EMAIL_EVENTS } from '../consts/emailEvent.js';
import Mailer from './_mailer.js';

export default class FinanceChargeEmail extends Mailer {
  static get tableName() {
    return 'finance_charge_emails';
  }

  static get fkName() {
    return 'financeChargeId';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['status'],

      properties: {
        receiver: { type: ['string', null], format: 'email' },
        status: { enum: EMAIL_EVENTS },
      },
    };
  }

  static get relationMappings() {
    const { FinanceCharge } = this.models;
    return {
      order: {
        relation: Mailer.BelongsToOneRelation,
        modelClass: FinanceCharge,
        join: {
          from: `${this.tableName}.financeChargeId`,
          to: `${FinanceCharge.tableName}.id`,
        },
      },
    };
  }

  static async updateStatusesOnDelivery({
    deliveredFinanceCharges: delivered,
    failedToDeliverFinanceCharges: failedToDeliver,
  }) {
    return super.updateStatusesOnDelivery({ delivered, failedToDeliver });
  }
}
