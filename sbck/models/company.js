import BaseModel from './_base.js';

export default class Company extends BaseModel {
  static get tableName() {
    return 'companies';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        logoUrl: { type: ['string', null] },

        physicalAddressLine1: { type: ['string', null] },
        physicalAddressLine2: { type: ['string', null] },
        physicalCity: { type: ['string', null] },
        physicalState: { type: ['string', null] },
        physicalZip: { type: ['string', null] },

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

        timeZoneName: { type: ['string', null] },

        tenantId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const { Tenant } = this.models;
    return {
      tenant: {
        relation: this.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: `${this.tableName}.tenantId`,
          to: `${Tenant.tableName}.id`,
        },
      },
    };
  }

  static async getByTenantId(tenantId) {
    const company = await this.query().where({ tenantId }).first();

    return company;
  }

  static async getByTenantName(tenantName, trx) {
    const company = await this.query(trx)
      .joinRelated('tenant')
      .where({ name: tenantName })
      .select(`${this.tableName}.*`)
      .first();

    return company;
  }

  static async getNotificationEmails(tenantId) {
    const company = await this.query().select('notificationEmails').where({ tenantId }).first();

    return company?.notificationEmails;
  }

  static async upsert({ tenantId, ...data }) {
    const trx = await this.startTransaction();

    try {
      const current = await this.getByTenantId(tenantId);
      // eslint-disable-next-line no-negated-condition
      if (!current) {
        data.tenantId = Number(tenantId);
        await this.query(trx).insert(data);
      } else {
        await this.query(trx).patch(data).where({ tenantId });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
