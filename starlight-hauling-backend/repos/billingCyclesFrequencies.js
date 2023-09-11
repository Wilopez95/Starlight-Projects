import BaseRepository from './_base.js';

const TABLE_NAME = 'billing_cycles_frequencies';

class BillingCyclesFrequencies extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllowedFrequencyTypesByBillingCycle({ billingCycles }, trx = this.knex) {
    const frequencies = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        trx.raw(`array_agg(distinct ??.??) as ??`, [
          this.tableName,
          'frequencyType',
          'frequencyTypes',
        ]),
      ])
      .whereIn('billingCycle', billingCycles)
      .first();

    return frequencies;
  }

  async getCoveringBillingCyclesByFrequencyTypes({ frequencyTypes }, trx = this.knex) {
    const billingCycles = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        trx.raw(`array_agg(distinct ??.??) as ??`, [
          this.tableName,
          'billingCycle',
          'billingCycles',
        ]),
      ])
      .whereIn('frequencyType', frequencyTypes)
      .first();

    return billingCycles;
  }
}

BillingCyclesFrequencies.TABLE_NAME = TABLE_NAME;

export default BillingCyclesFrequencies;
