import { GenerationJobStatus, GENERATION_JOB_STATUSES } from '../consts/generationJobStatus.js';
import BaseModel from './_base.js';

export default class GenerationJob extends BaseModel {
  static get tableName() {
    return 'generationJobs';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'count', 'expectedCount', 'failedCount', 'status'],

      properties: {
        id: { type: 'string' },
        count: { type: 'integer' },
        expectedCount: { type: 'integer' },
        failedCount: { type: 'integer' },
        status: { enum: GENERATION_JOB_STATUSES },
      },
    };
  }

  static get relationMappings() {
    const { FinanceCharge, Invoice, Statement, Settlement } = this.models;
    return {
      invoices: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'invoiceGenerationJob.generationJobId',
            to: 'invoiceGenerationJob.invoiceId',
          },
          to: `${Invoice.tableName}.id`,
        },
      },
      statements: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Statement,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'statementGenerationJob.generationJobId',
            to: 'statementGenerationJob.statementId',
          },
          to: `${Statement.tableName}.id`,
        },
      },
      financeCharges: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: FinanceCharge,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'financeChargeGenerationJob.generationJobId',
            to: 'financeChargeGenerationJob.financeChargeId',
          },
          to: `${FinanceCharge.tableName}.id`,
        },
      },
      settlements: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Settlement,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'settlementGenerationJob.generationJobId',
            to: 'settlementGenerationJob.settlementId',
          },
          to: `${Settlement.tableName}.id`,
        },
      },
    };
  }

  static async createOne({ data }) {
    const generationJob = await this.query().insertAndFetch(data);

    return generationJob;
  }

  static async markAsFinished(id, { endTime = new Date(), durationInSec = 0 }) {
    await this.query()
      .findById(id)
      .patch({ status: GenerationJobStatus.FINISHED, endTime, durationInSec });
  }

  static async getInvoiceGenerationResult(id) {
    const generationJob = await this.query()
      .findById(id)
      .leftJoinRelated('invoices', { alias: 'i' })
      .select([
        `${this.tableName}.*`,
        this.raw('count(i.id) as ??', ['generatedInvoices']),
        this.raw('coalesce(sum(i.total), 0) as ??', ['invoicesTotal']),
        this.raw('count(distinct i.customer_id) as ??', ['customersIncluded']),
        this.relatedQuery('invoices')
          .for(id)
          .leftJoinRelated('orders')
          .count('orders.id')
          .as('processedOrders'),
        this.relatedQuery('invoices')
          .for(id)
          .leftJoinRelated('subscriptions')
          .count('subscriptions.id')
          .as('processedSubscriptions'),
      ])
      .groupBy(this.ref('id'));

    return generationJob;
  }

  static async getStatementGenerationResult(id) {
    const generationJob = await this.query()
      .findById(id)
      .leftJoinRelated('statements', { alias: 's' })
      .select([
        `${this.tableName}.*`,
        this.raw('count(s.invoices_count) as ??', ['invoicesCount']),
        this.raw('coalesce(sum(s.invoices_total), 0) as ??', ['invoicesTotal']),
        this.raw('coalesce(sum(s.payments_total), 0) as ??', ['paymentsTotal']),
        this.raw('coalesce(sum(s.balance), 0) as ??', ['total']),
        this.raw('json_agg(s.id) as ??', ['statementIds']),
        this.raw('s.batch_statement_id as ??', ['batchStatementId']),
      ])
      .groupBy(this.ref('id'))
      .groupBy('s.batchStatementId');

    if (generationJob.statementIds?.[0] === null) {
      generationJob.statementIds = [];
    }

    return generationJob;
  }

  static async getFinChargeGenerationResult(id) {
    const [generationJob, invoicesData] = await Promise.all([
      this.query()
        .findById(id)
        .leftJoinRelated('financeCharges', { alias: 'f' })
        .select([
          `${this.tableName}.*`,
          this.raw('count(distinct f.customer_id) as ??', ['customersCount']),
          this.raw('json_agg(f.id) as ??', ['financeChargeIds']),
        ])
        .groupBy(this.ref('id')),
      this.relatedQuery('financeCharges')
        .for(id)
        .leftJoin('financeChargesInvoices as fci', 'financeCharges.id', 'fci.financeChargeId')
        .count('fci.invoiceId', { as: 'invoicesCount' })
        .sum({ invoicesTotal: 'fci.fine' })
        .first(),
    ]);

    if (generationJob.financeChargeIds?.[0] === null) {
      generationJob.financeChargeIds = [];
    }

    return Object.assign(generationJob, {
      invoicesCount: Number(invoicesData.invoicesCount),
      invoicesTotal: Number(invoicesData.invoicesTotal || 0),
    });
  }

  static async getSettlementGenerationResult(id) {
    const generationJob = await this.query()
      .findById(id)
      .joinRelated('settlements', { alias: 's' })
      .select([`${this.tableName}.*`, this.raw('s.id as ??', ['settlementId'])]);

    return generationJob;
  }

  async $incrementFailedCount() {
    await this.$query().increment('failedCount', 1);
  }

  async $incrementCount(trx) {
    await this.$query(trx).increment('count', 1);
  }

  async $relateInvoice(invoiceId, trx) {
    await this.$relatedQuery('invoices', trx).relate(invoiceId);
  }

  async $relateFinCharge(finChargeId, trx) {
    await this.$relatedQuery('financeCharges', trx).relate(finChargeId);
  }

  async $relateStatement(statementId, trx) {
    await this.$relatedQuery('statements', trx).relate(statementId);
  }

  async $relateSettlement(settlementId, trx) {
    await this.$relatedQuery('settlements', trx).relate(settlementId);
  }
}
