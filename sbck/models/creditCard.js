import isEmpty from 'lodash/isEmpty.js';

import { PAYMENT_GATEWAYS } from '../consts/paymentGateways.js';
import { CcSorting } from '../consts/ccSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import BaseModel from './_base.js';

export default class CreditCard extends BaseModel {
  static get tableName() {
    return 'creditCards';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'cardType',
        'cardNumberLastDigits',
        'ccAccountId',
        'customerId',
        'paymentGateway',
        'merchantId',
      ],

      properties: {
        id: { type: 'integer' },
        active: { type: 'boolean' },
        cardNickname: { type: ['string', null] },
        cardType: { type: 'string' },
        cardNumberLastDigits: { type: 'string' },

        ccAccountId: { type: 'string' },
        ccAccountToken: { type: ['string', null] },
        paymentGateway: { enum: PAYMENT_GATEWAYS },
        customerGatewayId: { type: ['string', null] },
        isAutopay: { type: 'boolean' },
        spUsed: { type: 'boolean' },

        customerId: { type: 'integer' },
        merchantId: { type: 'integer' },
        cardholderId: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { Customer, Payment, JobSite, Merchant } = this.models;
    return {
      customer: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      payments: {
        relation: BaseModel.HasManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          to: `${Payment.tableName}.creditCardId`,
        },
      },
      jobSites: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'creditCardJobSite.creditCardId',
            to: 'creditCardJobSite.jobSiteId',
          },
          to: `${JobSite.tableName}.id`,
        },
      },
      merchant: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Merchant,
        join: {
          from: `${this.tableName}.merchantId`,
          to: `${Merchant.tableName}.id`,
        },
      },
    };
  }

  static async countByCustomerId(customerId) {
    const [{ count }] = await this.query().where({ customerId }).count('* as count');

    return Number(count) || 0;
  }

  static async countByCustomerGatewayId(customerGatewayId) {
    const [{ count }] = await this.query().where({ customerGatewayId }).count('* as count');

    return Number(count) || 0;
  }

  static async getByIdPopulated(id, fields = ['*'], { jobSites = false } = {}) {
    const item = await this.query()
      .findById(id)
      .select(fields)
      .withGraphFetched(jobSites ? '[customer,jobSites]' : 'customer');

    return item;
  }

  static async createOne(
    { data: { customerId, jobSites, ...data }, customerData },
    { log, userId } = {},
  ) {
    const { Customer } = this.models;
    const trx = await this.startTransaction();

    let cc;
    try {
      cc = await this.query(trx).insertGraphAndFetch(
        {
          customer: customerId ? { id: Number(customerId) } : undefined,
          ...data,
        },
        {
          relate: ['customer'],
        },
      );

      const { id: creditCardId } = cc;
      if (!isEmpty(jobSites)) {
        await trx('creditCardJobSite')
          .withSchema(this.schemaName)
          .insert(jobSites.map(jobSiteId => ({ creditCardId, jobSiteId })));
      }

      if (customerData) {
        await Customer.patchById(customerId, customerData, trx);
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: cc.id, userId, action: this.logAction.create });

    return cc;
  }

  async $updateNonPCICompliantData(data, { log, userId } = {}) {
    const { jobSites = [] } = data;
    const updateJobSitesRef = 'jobSites' in data;
    delete data.jobSites;

    const trx = await this.constructor.startTransaction();
    const { schemaName } = this.constructor;
    try {
      await this.$patch(data);

      if (updateJobSitesRef) {
        const { id: creditCardId } = this;
        await trx('creditCardJobSite').withSchema(schemaName).where({ creditCardId }).delete();

        if (!isEmpty(jobSites)) {
          await trx('creditCardJobSite')
            .withSchema(schemaName)
            .insert(jobSites.map(jobSiteId => ({ creditCardId, jobSiteId })));
        }
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.$log({ userId, action: this.constructor.logAction.modify });

    const cc = await this.constructor.getByIdPopulated(this.id);
    return cc;
  }

  static async getAllPaginated({
    condition = {},
    offset = 0,
    limit = 25,
    sortBy = CcSorting.ID,
    sortOrder = SortOrder.DESC,
  } = {}) {
    const { jobSiteId } = condition;
    delete condition.jobSiteId;

    let query = this.query().where(condition);
    if (jobSiteId) {
      query = query
        .leftJoinRelated('jobSites')
        .withGraphFetched('jobSites')
        .andWhere(builder => builder.where({ jobSiteId }).orWhereNull('jobSiteId'));
    }

    const sortFiled = this.ccSortBy(sortBy);
    const items = await query.offset(offset).limit(limit).orderBy(this.ref(sortFiled), sortOrder);

    return items;
  }

  static async creditCardAutoPay({ id, customerId, isAutopayExist }, outerTrx) {
    const trx = outerTrx ?? (await this.startTransaction());
    try {
      let disableAutoPayQuery = trx(this.tableName)
        .withSchema(this.schemaName)
        .update({ isAutopay: false })
        .where({ customerId });
      if (isAutopayExist) {
        disableAutoPayQuery = disableAutoPayQuery.andWhereNot({ id });
        await Promise.all([
          disableAutoPayQuery,
          this.patchById(id, { isAutopay: isAutopayExist }, trx),
        ]);
      } else {
        await disableAutoPayQuery;
      }

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async deleteById(id, { log, userId } = {}) {
    await super.deleteById(id);

    log &&
      this.log({
        id,
        userId,
        action: this.logAction.delete,
      });
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[customer]');

    return item ? super.castNumbers(item) : null;
  }

  static ccSortBy(sortBy) {
    const sortedFields = {
      status: `${this.tableName}.active`,
      cardNickname: `${this.tableName}.cardNickname`,
      cardType: `${this.tableName}.cardType`,
      cardNumber: `${this.tableName}.cardNumberLastDigits`,
      paymentGateway: `${this.tableName}.paymentGateway`,
    };
    return sortedFields[sortBy] || sortedFields.status;
  }
}
