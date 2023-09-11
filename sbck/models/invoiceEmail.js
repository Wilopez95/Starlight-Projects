import { EMAIL_EVENTS } from '../consts/emailEvent.js';
import Mailer from './_mailer.js';

export default class InvoiceEmail extends Mailer {
  static get tableName() {
    return 'invoice_emails';
  }

  static get fkName() {
    return 'invoiceId';
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
    const { Invoice } = this.models;
    return {
      order: {
        relation: Mailer.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.invoiceId`,
          to: `${Invoice.tableName}.id`,
        },
      },
    };
  }

  static async updateStatusesOnDelivery({
    deliveredInvoices: delivered,
    failedToDeliverInvoices: failedToDeliver,
  }) {
    return super.updateStatusesOnDelivery({ delivered, failedToDeliver });
  }
}
