import { EMAIL_EVENTS } from '../consts/emailEvent.js';
import Mailer from './_mailer.js';

export default class StatementEmail extends Mailer {
  static get tableName() {
    return 'statement_emails';
  }

  static get fkName() {
    return 'statementId';
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
    const { Statement } = this.models;
    return {
      order: {
        relation: Mailer.BelongsToOneRelation,
        modelClass: Statement,
        join: {
          from: `${this.tableName}.statementId`,
          to: `${Statement.tableName}.id`,
        },
      },
    };
  }

  static async updateStatusesOnDelivery({
    deliveredStatements: delivered,
    failedToDeliverStatements: failedToDeliver,
  }) {
    return super.updateStatusesOnDelivery({ delivered, failedToDeliver });
  }
}
