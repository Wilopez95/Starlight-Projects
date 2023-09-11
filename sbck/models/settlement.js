import { unambiguousCondition } from '../utils/dbHelpers.js';

import { deleteFileByUrl } from '../services/s3.js';
import { generateSettlement } from '../services/pdfGenerator.js';
import { SettlementsSorting } from '../consts/settlementsSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import PrintableModel from './_printable.js';

export default class Settlement extends PrintableModel {
  static get tableName() {
    return 'settlements';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['date', 'paymentGateway', 'fees', 'adjustments', 'businessUnitId', 'merchantId'],

      properties: {
        id: { type: 'integer' },
        businessUnitId: { type: 'integer' },
        merchantId: { type: 'integer' },
        date: { type: 'string' },
        paymentGateway: { type: 'string' },
        fees: { type: 'number' },
        adjustments: { type: 'number' },
        pdfUrl: { type: 'string' },
        count: { type: 'number' },
        amount: { type: 'number' },
        net: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    const { BusinessUnit, BankDeposit, SettlementTransaction, Merchant } = this.models;
    return {
      settlementTransactions: {
        relation: PrintableModel.HasManyRelation,
        modelClass: SettlementTransaction,
        join: {
          from: `${this.tableName}.id`,
          to: `${SettlementTransaction.tableName}.settlementId`,
        },
      },
      bankDeposit: {
        relation: PrintableModel.HasOneRelation,
        modelClass: BankDeposit,
        join: {
          from: `${this.tableName}.id`,
          to: `${BankDeposit.tableName}.settlementId`,
        },
      },
      merchant: {
        relation: Merchant.BelongsToOneRelation,
        modelClass: Merchant,
        join: {
          from: `${this.tableName}.merchantId`,
          to: `${Merchant.tableName}.id`,
        },
      },
      businessUnit: {
        relation: BusinessUnit.BelongsToOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.businessUnitId`,
          to: `${BusinessUnit.tableName}.id`,
        },
      },
    };
  }

  async $addPdfUrl({ pdfUrl }, trx) {
    await this.$query(trx).patch({
      pdfUrl,
    });
  }

  static async exists({ condition: { date, merchantId, businessUnitId, mid } }) {
    const existingSettlement = await this.query()
      .select('id')
      .where({ date, merchantId, businessUnitId, mid })
      .first();

    return !!existingSettlement;
  }

  static async getWithTransactions(id, trx) {
    const result = await this.query(trx)
      .findById(id)
      .withGraphJoined('settlementTransactions.payment.customer', {
        joinOperation: 'leftJoin',
      });

    return result;
  }

  static async getAllPaginated({
    condition: { from, to, businessUnitId },
    limit,
    offset,
    sortBy = SettlementsSorting.DATE,
    sortOrder = SortOrder.DESC,
  }) {
    let query = this.query().where({ businessUnitId }).limit(limit).offset(offset);

    if (from) {
      query = query.andWhere(Settlement.ref('date'), '>=', from);
    }

    if (to) {
      query = query.andWhere(Settlement.ref('date'), '<=', to);
    }

    const result = await query.orderBy(this.ref(sortBy), sortOrder);

    return result;
  }

  static async count({ condition: { businessUnitId } }) {
    const { count } = await this.query().where({ businessUnitId }).count('* as count').first();

    return Number(count) || 0;
  }

  static async getPdfUrls(settlementIds) {
    const items = await this.query().findByIds(settlementIds).select(['pdfUrl', 'createdAt']);

    return items;
  }

  static async deleteByIds(ids, { log, userId } = {}) {
    const trx = await this.startTransaction();
    let deletedSettlements;

    try {
      deletedSettlements = await this.query(trx)
        .findByIds(ids)
        .delete()
        .returning(['id', 'pdfUrl']);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (log) {
      const action = this.logAction.delete;
      ids.forEach(id => this.log({ id, userId, action }), this);
    }

    if (deletedSettlements?.length) {
      await Promise.allSettled(
        deletedSettlements
          .filter(settlement => settlement.pdfUrl)
          .map(({ pdfUrl }) => deleteFileByUrl(pdfUrl)),
      );
    }
  }

  static async createSettlement({ data }) {
    const trx = await this.startTransaction();

    let settlement, settlementData, settlementId;
    try {
      settlement = await this.query(trx)
        .insertGraph(data, {
          relate: ['settlementTransactions'],
        })
        .returning(['id', 'date']);

      settlementId = settlement.id;
      settlementData = await this.getWithTransactions(settlementId, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    settlementData.settlementTransactions.forEach(transaction => {
      if (
        transaction.payment &&
        Number(data.businessUnitId) === Number(transaction.payment.customer.businessUnitId)
      ) {
        transaction.customerName = transaction.payment.customer.name;
      }
    });

    let pdfUrl;
    try {
      pdfUrl = await generateSettlement({
        subscriberName: this.schemaName,
        settlementId,
        settlementInput: {
          settlementDate: settlementData.date,
          transactions: settlementData.settlementTransactions,
        },
      });

      await settlement.$addPdfUrl({ pdfUrl });
    } catch (error) {
      await this.deleteById(settlementId);

      throw error;
    }

    return settlement;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[businessUnit,bankDeposit,settlementTransactions.[payment]]');

    return item ? super.castNumbers(item) : null;
  }

  static async getQBSum({
    condition: { rangeFrom, rangeTo, integrationBuList, ...condition } = {},
    trx,
  }) {
    let query = this.query(trx)
      .where(unambiguousCondition(this.tableName, condition))
      .distinctOn('merchant.mid', `${this.tableName}.date`)
      .joinRelated('merchant')
      .as('distinctSettlements');

    if (rangeFrom) {
      query = query.andWhere(Settlement.ref('date'), '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(Settlement.ref('date'), '<=', rangeTo);
    }

    if (integrationBuList?.length) {
      query = query.whereIn(Settlement.ref('businessUnitId'), integrationBuList);
    }

    const result = await this.query(trx).from(query).sum('distinctSettlements.adjustments').first();

    return result;
  }
}
