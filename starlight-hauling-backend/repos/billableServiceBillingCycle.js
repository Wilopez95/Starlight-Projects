import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'billable_service_billing_cycles';

class BillableServiceBillingCycle extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async deleteBillingCyclesByServiceId({ billableServiceId, billingCycles }, trx = this.knex) {
    await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('billingCycle', billingCycles)
      .andWhere({ billableServiceId })
      .del();
  }

  getAggregatedBillingCyclesTable({ joinAs, billingCycle }, trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.billableServiceId`,
        trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
          this.tableName,
          'billingCycle',
          'billingCycles',
        ]),
      ])
      .groupBy(`${this.tableName}.billableServiceId`)
      .as(joinAs);

    if (billingCycle) {
      query.where('billingCycle', billingCycle);
    }

    return query;
  }

  getBillingCyclesByServiceId({ billableServiceId }, trx = this.knex) {
    return this.getAggregatedBillingCyclesTable({}, trx).where({ billableServiceId }).first();
  }

  async insertMany({ billableServiceId, billingCycles }, trx = this.knex) {
    const data = billingCycles.map(billingCycle => ({
      billingCycle,
      billableServiceId,
    }));

    await super.insertMany({ data }, trx);
  }
}

BillableServiceBillingCycle.TABLE_NAME = TABLE_NAME;

export default BillableServiceBillingCycle;
