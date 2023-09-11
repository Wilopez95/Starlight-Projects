import isEmpty from 'lodash/isEmpty.js';

import { deleteFileByUrl } from '../services/s3.js';
import { generateAndSaveStatement } from '../services/reporting/report.js';

import { logger } from '../utils/logger.js';
import { StatementSorting } from '../consts/statementSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import PrintableModel from './_printable.js';

export default class Statement extends PrintableModel {
  static get tableName() {
    return 'statements';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: [
        'customerId',
        'statementDate',
        'endDate',
        'exagoPath',
        'invoicesCount',
        'invoicesTotal',
        'paymentsTotal',
        'balance',
        'prevBalance',
      ],

      properties: {
        id: { type: 'integer' },
        customerId: { type: 'integer' },
        batchStatementId: { type: 'integer' },

        statementDate: { type: 'string' },
        endDate: { type: 'string' },
        pdfUrl: { type: ['string', null] },
        prevPdfUrl: { type: ['string', null] },
        exagoPath: { type: 'string' },

        invoicesCount: { type: 'number' },
        invoicesTotal: { type: 'number' },
        paymentsTotal: { type: 'number' },
        balance: { type: 'number' },
        prevBalance: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    const {
      BatchStatement,
      Customer,
      GenerationJob,
      Payment,
      Payout,
      Invoice,
      StatementEmail,
      RefundedPayment,
      ReversedPayment,
      FinanceCharge,
    } = this.models;
    return {
      batchStatement: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: BatchStatement,
        join: {
          from: `${this.tableName}.batchStatementId`,
          to: `${BatchStatement.tableName}.id`,
        },
      },
      customer: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      invoices: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementsItems.statementId',
            to: 'statementsItems.invoiceId',
            extra: ['section'],
          },
          to: `${Invoice.tableName}.id`,
        },
      },
      payments: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementsItems.statementId',
            to: 'statementsItems.paymentId',
            extra: ['section'],
          },
          to: `${Payment.tableName}.id`,
        },
      },
      payouts: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: Payout,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementsItems.statementId',
            to: 'statementsItems.payoutId',
            extra: ['section', 'payoutsCount'],
          },
          to: `${Payout.tableName}.id`,
        },
      },
      refundPayments: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: RefundedPayment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementsItems.statementId',
            to: 'statementsItems.refundPaymentId',
            extra: ['section'],
          },
          to: `${RefundedPayment.tableName}.id`,
        },
      },
      reversePayments: {
        relation: PrintableModel.ManyToManyRelation,
        modelClass: ReversedPayment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementsItems.statementId',
            to: 'statementsItems.reversePaymentId',
            extra: ['section'],
          },
          to: `${ReversedPayment.tableName}.id`,
        },
      },
      emails: {
        relation: PrintableModel.HasManyRelation,
        modelClass: StatementEmail,
        join: {
          from: `${this.tableName}.id`,
          to: `${StatementEmail.tableName}.statementId`,
        },
      },
      generationJob: {
        relation: PrintableModel.HasOneThroughRelation,
        modelClass: GenerationJob,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementGenerationJob.statementId',
            to: 'statementGenerationJob.generationJobId',
          },
          to: `${GenerationJob.tableName}.id`,
        },
      },
      financeCharge: {
        relation: PrintableModel.BelongsToOneRelation,
        modelClass: FinanceCharge,
        join: {
          from: `${this.tableName}.id`,
          to: `${FinanceCharge.tableName}.statementId`,
        },
      },
    };
  }

  static async createOne(
    ctx,
    {
      invoices,
      generationJob,
      batchStatementId,
      payments,
      payouts,
      refundPayments,
      reversePayments,
      ...data
    },
    { tenantName, tenantId },
    { log, userId } = {},
  ) {
    const { BatchStatement } = this.models;
    const sectionData = ({ id, section }) => ({ id: Number(id), section });

    const upsertTrx = await this.startTransaction();

    let statement;
    try {
      statement = await this.query(upsertTrx).insertGraph(
        {
          ...data,

          payments: payments.map(({ id, section }) => ({
            id: Number(id),
            section,
          })),
          refundPayments: refundPayments.map(sectionData),
          reversePayments: reversePayments.map(sectionData),
          payouts: payouts.map(({ id, payoutsCount, section }) => ({
            id: Number(id),
            payoutsCount,
            section,
          })),
          invoices: invoices.map(sectionData),
          batchStatement: {
            id: batchStatementId,
          },
        },
        { relate: true, noDelete: true, noInsert: ['batchStatement'] },
      );

      await BatchStatement.query(upsertTrx)
        .findById(batchStatementId)
        .patch({
          total: BatchStatement.raw(`total + ${statement.balance}`),
          count: BatchStatement.raw('count + 1'),
        });

      await upsertTrx.commit();
    } catch (error) {
      ctx.logger.error(error, 'Failed to create statement');

      await upsertTrx.rollback();
      await generationJob.$incrementFailedCount();

      return null;
    }

    const trx = await this.startTransaction();
    const { id } = statement;

    try {
      const { pdfUrl } = await generateAndSaveStatement(ctx, tenantName, tenantId, id);

      await this.patchById(id, { pdfUrl }, trx);

      Object.assign(statement, { pdfUrl });

      await Promise.all([
        generationJob.$incrementCount(trx),
        generationJob.$relateStatement(id, trx),
      ]);

      await trx.commit();
    } catch (error) {
      ctx.logger.error(error, 'Failed to update statement & related data');

      await trx.rollback();

      await Promise.allSettled([generationJob.$incrementFailedCount(), this.deleteById(id)]);

      return null;
    }

    log && statement.$log({ userId, action: this.logAction.create });

    return statement;
  }

  static async deleteById(id, { log, userId } = {}) {
    const { BatchStatement } = this.models;
    let statement, batchStatement;

    const trx = await this.startTransaction();

    try {
      batchStatement = await this.relatedQuery('batchStatement', trx)
        .for(id)
        .where('count', 1)
        .select(['id']);

      statement = await this.query(trx)
        .delete()
        .where({ id })
        .returning(['id', 'pdfUrl', 'balance', 'batchStatementId'])
        .first();

      const { batchStatementId } = statement;
      if (isEmpty(batchStatement)) {
        await BatchStatement.query(trx)
          .findById(batchStatementId)
          .patch({
            total: BatchStatement.raw(`total - ${statement.balance}`),
            count: BatchStatement.raw('count - 1'),
          });

        log &&
          this.log({
            id: batchStatementId,
            userId,
            action: this.logAction.modify,
            entity: this.logEntity.batchStatements,
          });
      } else {
        // if last statement was removed from batch statements delete batch too
        await BatchStatement.query(trx).deleteById(batchStatementId);

        log &&
          this.log({
            id: batchStatementId,
            userId,
            action: this.logAction.delete,
            entity: this.logEntity.batchStatements,
          });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, userId, action: this.logAction.delete });

    if (statement?.pdfUrl) {
      try {
        await deleteFileByUrl(statement.pdfUrl);
      } catch (error) {
        logger.error(error, 'Failed to remove statement pdf');
      }
    }

    return !isEmpty(statement);
  }

  static async getAllPaginated({
    condition: { customerId, businessUnitId },
    limit,
    offset,
    sortBy = StatementSorting.ID,
    sortOrder = SortOrder.DESC,
  }) {
    const { Customer } = this.models;

    let query;
    if (customerId) {
      query = Customer.relatedQuery('statements').for(customerId);
    } else if (businessUnitId) {
      query = this.query()
        .joinRelated('customer', { alias: 'c' })
        .where('c.businessUnitId', businessUnitId);
    } else {
      query = this.query();
    }

    const items = await query.limit(limit).offset(offset).orderBy(this.ref(sortBy), sortOrder);

    return items;
  }

  static async getByBatchStatementIds(batchStatementIds, fields = ['id', 'pdfUrl']) {
    const statements = await this.query()
      .whereIn('batchStatementId', batchStatementIds)
      .select(fields);

    return statements;
  }

  static async getLast(customerId, fields = ['*']) {
    const statement = await this.query()
      .where('customerId', customerId)
      .orderBy('id', 'desc')
      .select(fields)
      .first();

    return statement;
  }

  static async getCustomersForFinanceCharge(ids) {
    const items = await this.relatedQuery('customer').for(ids);

    return items;
  }

  static async count({ businessUnitId }) {
    const { count } = await this.query().where({ businessUnitId }).count('* as count').first();

    return Number(count) || 0;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched(
        '[batchStatement,customer,payments,payouts,refundPayments,reversePayments,invoices,emails]',
      );

    return item ? super.castNumbers(item) : null;
  }
}
