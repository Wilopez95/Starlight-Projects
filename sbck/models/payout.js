import { PAYMENT_TYPES } from '../consts/paymentTypes.js';
import { dbAliases } from '../consts/dbAliases.js';
import { PayoutSorting } from '../consts/payoutSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import { PaymentSorting } from '../consts/paymentSorting.js';
import BaseModel from './_base.js';

export default class Payout extends BaseModel {
  static get tableName() {
    return 'payouts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['paymentType', 'date', 'amount', 'prevBalance', 'customerId', 'userId'],

      properties: {
        id: { type: 'integer' },
        paymentType: { enum: PAYMENT_TYPES },
        date: { type: 'string' },

        ccRetref: { type: ['string', null] },
        checkNumber: { type: ['string', null] },
        isAch: { type: 'boolean' },

        amount: { type: 'number' },
        prevBalance: { type: 'number' },

        customerId: { type: 'integer' },
        userId: { type: 'string' },
        creditCardId: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
    const { Customer, CreditCard, Payment, BusinessUnit } = this.models;
    return {
      customer: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      creditCard: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: CreditCard,
        join: {
          from: `${this.tableName}.creditCardId`,
          to: `${CreditCard.tableName}.id`,
        },
      },
      payments: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'payoutApplications.payoutId',
            to: 'payoutApplications.paymentId',
            extra: ['partialAmount'],
          },
          to: `${Payment.tableName}.id`,
        },
      },
      businessUnit: {
        relation: BaseModel.HasOneThroughRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.customerId`,
          through: {
            from: `${Customer.tableName}.id`,
            to: `${Customer.tableName}.businessUnitId`,
          },
          to: `${BusinessUnit.tableName}.id`,
        },
      },
    };
  }

  get newBalance() {
    return Number(this.prevBalance) + Number(this.amount);
  }

  static async createAndApply({ customerId, applications, ...data }, { log, userId } = {}) {
    const { Payment, Customer } = this.models;
    const trx = await this.startTransaction();

    let payout;
    try {
      await Promise.all([
        // update paid out amount of related payments
        Payment.applyPayout(applications, trx, { log, userId }),
        // update customer's balance
        Customer.incrementBalance(customerId, data.amount, trx),
      ]);

      data.date = new Date(data.date).toUTCString();
      if (data.creditCard) {
        delete data.creditCard.customer;
        data.creditCard.customerId = customerId;
      }

      // create payout itself
      payout = await this.query(trx).upsertGraphAndFetch(
        {
          ...data,

          customer: { id: customerId },

          payments: applications.map(({ id, paidOutAmount: partialAmount }) => ({
            id,
            partialAmount,
          })),
        },
        {
          relate: ['customer', 'payments', 'creditCard'],
        },
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      payout.$log({
        userId,
        action: this.logAction.create,
      });

    return payout;
  }

  static async getAllPaginated({
    condition: { customerId, businessUnitId, searchId, searchQuery, filters } = {},
    limit,
    offset,
    sortBy = PayoutSorting.DATE,
    sortOrder = SortOrder.DESC,
  }) {
    const { Customer, CreditCard } = this.models;

    let query = customerId ? Customer.relatedQuery('payouts').for(customerId) : this.query();

    if (businessUnitId || searchQuery?.length >= 3) {
      query = query.joinRelated('customer', { alias: dbAliases[Customer.tableName] });

      if (businessUnitId) {
        query = query.where(`${dbAliases[Customer.tableName]}.businessUnitId`, businessUnitId);
      }
    }

    if (searchId) {
      query = query.leftJoinRelated('creditCard', { alias: dbAliases[CreditCard.tableName] });
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, filters);

    if (sortBy === PaymentSorting.CUSTOMER) {
      if (!businessUnitId || searchQuery?.length <= 3) {
        query = query.joinRelated('customer', { alias: dbAliases[Customer.tableName] });
      }
      sortBy = `${dbAliases[Customer.tableName]}.name`;
    } else {
      sortBy = this.ref(sortBy);
    }

    const items = await query
      .limit(limit)
      .offset(offset)
      .orderBy(sortBy, sortOrder)
      .orderBy(this.ref('id'), 'desc');

    return items;
  }

  static applySearchToQuery(originalQuery, { searchId, searchQuery }) {
    const { CreditCard, Customer } = this.models;
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
        builder.orWhere(`${dbAliases[CreditCard.tableName]}.cardNumberLastDigits`, searchId);
      }

      if (searchQuery) {
        builder.orWhere({ checkNumber: searchQuery });
      }

      if (searchQuery?.length >= 3) {
        builder
          .orWhereRaw(`? % ${dbAliases[Customer.tableName]}.name`, [searchQuery])
          .orderByRaw(`? <-> ${dbAliases[Customer.tableName]}.name`, [searchQuery]);
      }

      return builder;
    });

    return query;
  }

  static applyFiltersToQuery(
    originalQuery,
    {
      filterByCreatedFrom,
      filterByCreatedTo,
      filterByType,
      filterByAmountFrom,
      filterByAmountTo,
      filterByUser,
    } = {},
  ) {
    let query = originalQuery;

    if (filterByType?.length) {
      query = query.whereIn(this.ref('paymentType'), filterByType);
    }

    if (filterByUser?.length) {
      query = query.whereIn(this.ref('userId'), filterByUser);
    }

    if (filterByCreatedFrom) {
      query = query.andWhere(this.ref('createdAt'), '>=', filterByCreatedFrom);
    }

    if (filterByCreatedTo) {
      query = query.andWhere(this.ref('createdAt'), '<=', filterByCreatedTo);
    }

    if (typeof filterByAmountFrom === 'number') {
      query = query.andWhere(this.ref('amount'), '>=', filterByAmountFrom);
    }

    if (typeof filterByAmountTo === 'number') {
      query = query.andWhere(this.ref('amount'), '<=', filterByAmountTo);
    }

    return query;
  }

  static async getAllCreatedInRange({ customerId, from, to, fields = ['*'] } = {}) {
    const items = await this.query()
      .where({ customerId })
      .andWhere('createdAt', '<=', to)
      .andWhere('createdAt', '>=', from)
      .select([...fields, this.relatedQuery('payments').count().as('payoutsCount')]);

    return items;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[customer,businessUnit,creditCard,payments]');

    return item ? super.castNumbers(item) : null;
  }

  static async getQBData({
    condition: {
      rangeFrom,
      rangeTo,
      customerIds
    } = {}
  }){
    const trx = this.knex();
    let query = this.query(trx)
      .select([
        this.raw(`${this.tableName}.id payoutId`),
        this.raw(`${this.tableName}.customer_id customerId`),
        this.raw(`${this.tableName}.amount payoutTotal`),
      ]);

    if (rangeFrom) {
      query = query.andWhere(`${this.tableName}.createdAt`, '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(`${this.tableName}.createdAt`, '<=', rangeTo);
    }

    if (customerIds?.length){
      query = query.whereIn(`${this.tableName}.customerId`, customerIds);
    }

    query = query.orderBy(`${this.tableName}.id`);
    return query;
  }
}
