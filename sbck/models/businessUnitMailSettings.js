import BaseModel from './_base.js';
import BusinessUnit from './businessUnit.js';

export default class BusinessUnitMailSettings extends BaseModel {
  static get tableName() {
    return 'business_unit_mail_settings';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['id'],

      properties: {
        id: { type: 'integer' },
        businessUnitId: { type: 'integer' },

        adminEmail: { type: ['string', null], format: 'email' },
        notificationEmails: {
          type: ['array', null],
          items: {
            type: 'string',
            format: 'email',
          },
        },

        domain: { type: ['string', null] },

        statementsFrom: { type: ['string', null] },
        statementsReplyTo: { type: ['string', null] },
        statementsSendCopyTo: { type: ['string', null] },
        statementsSubject: { type: ['string', null] },
        statementsBody: { type: ['string', null] },
        statementsDisclaimerText: { type: ['string', null] },

        invoicesFrom: { type: ['string', null] },
        invoicesReplyTo: { type: ['string', null] },
        invoicesSendCopyTo: { type: ['string', null] },
        invoicesSubject: { type: ['string', null] },
        invoicesBody: { type: ['string', null] },
        invoicesDisclaimerText: { type: ['string', null] },

        receiptsFrom: { type: ['string', null] },
        receiptsReplyTo: { type: ['string', null] },
        receiptsSendCopyTo: { type: ['string', null] },
        receiptsSubject: { type: ['string', null] },
        receiptsBody: { type: ['string', null] },
        receiptsDisclaimerText: { type: ['string', null] },

        servicesFrom: { type: ['string', null] },
        servicesReplyTo: { type: ['string', null] },
        servicesSendCopyTo: { type: ['string', null] },
        servicesSubject: { type: ['string', null] },
        servicesBody: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    return {
      businessUnit: {
        relation: this.BelongsToOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.businessUnitId`,
          to: `${BusinessUnit.tableName}.id`,
        },
      },
    };
  }

  static async upsert({ businessUnitId, ...data }) {
    const trx = await this.startTransaction();

    try {
      const current = await this.query(trx).where({ businessUnitId }).first();
      // eslint-disable-next-line no-negated-condition
      if (!current) {
        data.businessUnitId = Number(businessUnitId);
        await this.query(trx).insert(data);
      } else {
        await this.query(trx).patch(data).where({ businessUnitId });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
