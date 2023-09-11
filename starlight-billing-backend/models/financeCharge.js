import { generateAndSaveFinanceCharge } from '../services/reporting/report.js';
import { updateCustomerBalance } from '../services/core.js';
import { deleteFileByUrl } from '../services/s3.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';

import { logger } from '../utils/logger.js';

import { DEFAULT_LIMIT } from '../consts/defaults.js';
import { InvoiceStatus } from '../consts/invoiceStatus.js';
import { CustomerType } from '../consts/customerType.js';
import { dbAliases } from '../consts/dbAliases.js';
import { FinanceChargesSorting } from '../consts/financeChargesSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import PrintableModel from './_printable.js';

export default class FinanceCharge extends PrintableModel {
  static get tableName() {
    return 'finance_charges';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: [
        'customerId',
        'invoiceId',
        'csrEmail',
        'csrName',
        'statementId',
        'exagoPath',
        'total',
        'financeChargeApr',
        'userId',
      ],

      properties: {
        id: { type: 'integer' },

        csrEmail: { type: 'string', format: 'email' },
        csrName: { type: 'string' },

        pdfUrl: { type: ['string', null] },
        exagoPath: { type: 'string' },

        total: { type: 'number' },
        balance: { type: 'number' },
        financeChargeApr: { type: 'number' },
        writeOff: { type: 'boolean' },

        customerId: { type: 'integer' },
        statementId: { type: 'integer' },
        invoiceId: { type: 'integer' },
        userId: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const {
      BusinessUnit,
      Customer,
      GenerationJob,
      Payment,
      Invoice,
      FinanceChargeEmail,
      Statement,
    } = this.models;
    return {
      customer: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      businessUnit: {
        relation: PrintableModel.HasOneThroughRelation,
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
      invoice: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.invoiceId`,
          to: `${Invoice.tableName}.id`,
        },
      },
      statement: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: Statement,
        join: {
          from: `${this.tableName}.statementId`,
          to: `${Statement.tableName}.id`,
        },
      },
      invoices: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'financeChargesInvoices.financeChargeId',
            to: 'financeChargesInvoices.invoiceId',
            extra: ['fine', 'toDate'],
          },
          to: `${Invoice.tableName}.id`,
        },
      },
      payments: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.invoiceId`,
          through: {
            from: 'paymentApplications.invoiceId',
            to: 'paymentApplications.paymentId',
            extra: ['amount'],
          },
          to: `${Payment.tableName}.id`,
        },
      },
      emails: {
        relation: PrintableModel.HasManyRelation,
        modelClass: FinanceChargeEmail,
        join: {
          from: `${this.tableName}.id`,
          to: `${FinanceChargeEmail.tableName}.financeChargeId`,
        },
      },
      generationJob: {
        relation: PrintableModel.HasOneThroughRelation,
        modelClass: GenerationJob,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'financeChargeGenerationJob.financeChargeId',
            to: 'financeChargeGenerationJob.generationJobId',
          },
          to: `${GenerationJob.tableName}.id`,
        },
      },
    };
  }

  static async patchById(id, data = {}, trx) {
    const { pdfUrl } = data;

    const update = [super.patchById(id, data, trx)];
    if (pdfUrl) {
      update.push(this.relatedQuery('invoice', trx).for(id).patch({ pdfUrl }));
    }

    await Promise.all(update);
  }

  static async createOne(
    ctx,
    { generationJob, ...data },
    { tenantName, tenantId, userId },
    { log } = {},
  ) {
    const { Customer, Invoice } = this.models;

    const upsertTrx = await this.startTransaction();

    let financeCharge;
    try {
      financeCharge = await this.query(upsertTrx).upsertGraphAndFetch(data, {
        relate: ['customer', 'invoices'],
        noDelete: true,
        insertMissing: false,
        noUpdate: ['customer', 'invoice', 'statement', 'invoices', 'payments'],
      });

      await upsertTrx.commit();
    } catch (error) {
      ctx.logger.error(error, 'Failed to create finance charge');
      await upsertTrx.rollback();

      await generationJob.$incrementFailedCount();

      return null;
    }

    const trx = await this.startTransaction();

    const { id } = financeCharge;
    try {
      const { pdfUrl } = await generateAndSaveFinanceCharge(ctx, tenantName, tenantId, id);

      await this.patchById(id, { pdfUrl }, trx);

      const total = Number(financeCharge.total);

      const newBalance = await Customer.incrementBalance(financeCharge.customerId, total, trx);

      await Promise.all([
        generationJob.$incrementCount(trx),
        generationJob.$relateFinCharge(id, trx),
      ]);

      updateCustomerBalance(ctx, {
        schemaName: tenantName,
        userId,
        customerId: financeCharge.customerId,
        newBalance,
      });

      await trx.commit();
    } catch (error) {
      ctx.logger.error(error, 'Failed to update finance charge & related data');
      await trx.rollback();

      await Promise.allSettled([generationJob.$incrementFailedCount(), this.deleteById(id)]);

      if (financeCharge?.invoiceId) {
        await Invoice.deleteById(financeCharge?.invoiceId, { log, userId });
      }

      return null;
    }

    log && financeCharge?.$log({ userId, action: this.logAction.create });

    return financeCharge;
  }

  // TODO: unsed?
  static async insertMany(data) {
    let financeCharges;

    const trx = await this.startTransaction();
    try {
      financeCharges = await this.query(trx).insertGraph(data, {
        relate: ['customer', 'invoices'],
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return financeCharges;
  }

  static async getAllPaginated({
    condition: { businessUnitId, customerId, filters, searchId, searchQuery } = {},
    limit = DEFAULT_LIMIT,
    offset = 0,
    sortBy = FinanceChargesSorting.ID,
    sortOrder = SortOrder.DESC,
  }) {
    const { Customer, FinanceChargeEmail } = this.models;

    let query = this.query();

    query = query.joinRelated('customer', { alias: dbAliases[Customer.tableName] });

    if (businessUnitId) {
      query = query.where(`${dbAliases[Customer.tableName]}.businessUnitId`, businessUnitId);
    }
    if (customerId) {
      query = query.where(`${this.tableName}.customerId`, customerId);
    }

    if (searchQuery) {
      query = query.leftJoinRelated('emails', {
        alias: dbAliases[FinanceChargeEmail.tableName],
      });
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, filters);

    if (sortBy === FinanceChargesSorting.CUSTOMER) {
      sortBy = `${dbAliases[Customer.tableName]}.name`;
    }
    if (sortBy === FinanceChargesSorting.CUSTOMER_TYPE) {
      sortBy = `${dbAliases[Customer.tableName]}.onAccount`;
    }

    query = query
      .limit(limit)
      .offset(offset)
      .groupBy(FinanceCharge.ref('id'))
      .groupBy(`${dbAliases[Customer.tableName]}.name`)
      .groupBy(`${dbAliases[Customer.tableName]}.onAccount`)
      .orderBy(FinanceCharge.ref(sortBy), sortOrder);

    const items = await query;
    return items;
  }

  static applySearchToQuery(originalQuery, { searchId, searchQuery }) {
    const { Customer, FinanceChargeEmail } = this.models;
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
      }

      if (searchQuery) {
        builder.orWhere(`${dbAliases[FinanceChargeEmail.tableName]}.receiver`, searchQuery);
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
      filterByStatus,
      filterByCustomer,
      filterByCreatedFrom,
      filterByCreatedTo,
      filterByAmountFrom,
      filterByAmountTo,
      filterByBalanceFrom,
      filterByBalanceTo,
      filterByUser,
    } = {},
  ) {
    const { Customer } = this.models;
    let query = originalQuery;

    if (filterByStatus?.length) {
      query = this.applyInvoiceStatusFilter(query, { filterByStatus });
    }

    if (filterByCustomer?.length) {
      query = query.andWhere(builder => {
        const qb = builder;

        if (filterByCustomer.includes(CustomerType.ON_ACCOUNT)) {
          qb.orWhere(`${dbAliases[Customer.tableName]}.onAccount`, true);
        }

        if (filterByCustomer.includes(CustomerType.PREPAID)) {
          qb.orWhere(`${dbAliases[Customer.tableName]}.onAccount`, false);
        }
      });
    }

    if (filterByStatus?.length) {
      query = this.applyInvoiceStatusFilter(query, { filterByStatus });
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
      query = query.andWhere(this.ref('total'), '>=', filterByAmountFrom);
    }

    if (typeof filterByAmountTo === 'number') {
      query = query.andWhere(this.ref('total'), '<=', filterByAmountTo);
    }

    if (typeof filterByBalanceFrom === 'number') {
      query = query.andWhere(this.ref('balance'), '>=', filterByBalanceFrom);
    }

    if (typeof filterByBalanceTo === 'number') {
      query = query.andWhere(this.ref('balance'), '<=', filterByBalanceTo);
    }

    return query;
  }

  static applyInvoiceStatusFilter(originalQuery, { filterByStatus }) {
    let query = originalQuery;

    query = query.andWhere(builder => {
      let qb = builder;

      if (filterByStatus.includes(InvoiceStatus.WRITE_OFF)) {
        qb = qb.orWhere(this.ref('writeOff'), true);
      }

      if (filterByStatus.includes(InvoiceStatus.CLOSED)) {
        qb = qb.orWhere(this.ref('balance'), 0);
      }

      if (filterByStatus.includes(InvoiceStatus.OPEN)) {
        qb = qb.orWhere(this.ref('balance'), '>', 0);
      }

      return qb;
    });

    return query;
  }

  static async deleteById(id) {
    const trx = await this.startTransaction();
    let finCharge;

    try {
      finCharge = await this.query(trx).delete().where({ id }).returning(['id', 'pdfUrl']).first();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (finCharge?.pdfUrl) {
      try {
        await deleteFileByUrl(finCharge.pdfUrl);
      } catch (error) {
        logger.error(error, 'Failed to remove finance charge pdf');
      }
    }
  }

  static async decrementBalance({ amount, invoiceId }, trx, { log, userId } = {}) {
    const items = await this.query(trx)
      .decrement('balance', amount)
      .where({ invoiceId })
      .returning('id');

    if (log && items?.length) {
      const action = this.logAction.modify;
      items.forEach(({ id }) => this.log({ id, userId, action }), this);
    }
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[businessUnit,customer,invoice,statement,invoice,payments,emails]');

    return item ? super.castNumbers(item) : null;
  }

  static async getQBSum({
    condition: { rangeFrom, rangeTo, integrationBuList, ...condition } = {},
    trx,
  }) {
    let query = this.query(trx)
      .where(unambiguousCondition(this.tableName, condition))
      .sum(FinanceCharge.ref('total'), 0)
      .joinRelated('customer');

    if (rangeFrom) {
      query = query.andWhere(FinanceCharge.ref('createdAt'), '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(FinanceCharge.ref('createdAt'), '<=', rangeTo);
    }

    if (integrationBuList?.length) {
      query = query.whereIn('customer.businessUnitId', integrationBuList);
    }

    const result = await query.first();

    return result;
  }
}
