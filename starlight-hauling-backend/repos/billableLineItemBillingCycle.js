import VersionedRepository from './_versioned.js';
import GlobalRateRecurrLineItemCycleRepo from './globalRateRecurringLineItemBillingCycle.js';
import CustomRatesRecurrLineItemCycleRepo from './customRatesGroupRecurringLineItemBillingCycle.js';

const TABLE_NAME = 'billable_line_item_billing_cycles';

class BillableLineItemBillingCycleRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async deleteByIds({ billableLineItemId, billingCycles }, trx = this.knex) {
    await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('billingCycle', billingCycles)
      .andWhere({ billableLineItemId })
      .del();
  }

  async getBillingCyclesByLineItemId(
    {
      condition: {
        billableLineItemId,
        globalRatesRecurringLineItemId,
        customRatesGroupRecurringLineItemId,
        billingCycle,
      },
      fields = ['*'],
    },
    trx = this.knex,
  ) {
    let query = trx(this.tableName).withSchema(this.schemaName).where({ billableLineItemId });

    if (billingCycle) {
      query = query.andWhere({ billingCycle }).first();
    }

    if (globalRatesRecurringLineItemId) {
      const targetTable = GlobalRateRecurrLineItemCycleRepo.TABLE_NAME;
      fields.push(`${targetTable}.price`);
      fields.push(`${targetTable}.id`);

      query.leftJoin(targetTable, builder => {
        builder
          .on(`${targetTable}.billableLineItemBillingCycleId`, `${this.tableName}.id`)
          .andOnVal(
            `${targetTable}.global_rates_recurring_line_item_id`,
            '=',
            globalRatesRecurringLineItemId,
          );
      });
    }

    if (customRatesGroupRecurringLineItemId) {
      const targetTable = CustomRatesRecurrLineItemCycleRepo.TABLE_NAME;
      fields.push(`${targetTable}.price`);
      fields.push(`${targetTable}.id`);

      query.leftJoin(targetTable, builder => {
        builder
          .on(`${targetTable}.billableLineItemBillingCycleId`, `${this.tableName}.id`)
          .andOnVal(
            `${targetTable}.custom_rates_group_recurring_line_item_id`,
            '=',
            customRatesGroupRecurringLineItemId,
          );
      });
    }

    const items = await query.select(fields);

    return items;
  }

  async insertMany({ billableLineItemId, billingCycles }, trx = this.knex) {
    const data = billingCycles.map(billingCycle => ({
      billingCycle,
      billableLineItemId,
    }));

    await super.insertMany({ data }, trx);
  }

  getAllByIds({ ids }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(
        'billable_line_item_id',
        trx.raw(`array_agg(??.??) as ??`, [
          'billable_line_item_billing_cycles',
          'billingCycle',
          'billingCycles',
        ]),
      )
      .whereIn('billable_line_item_id', ids)
      .groupBy('billable_line_item_billing_cycles.billable_line_item_id');
  }

  getAggregatedBillingCyclesTable({ joinAs, billingCycle }, trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.billableLineItemId`,
        trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
          this.tableName,
          'billingCycle',
          'billingCycles',
        ]),
      ])
      .groupBy(`${this.tableName}.billableLineItemId`)
      .as(joinAs);

    if (billingCycle) {
      query.where('billingCycle', billingCycle);
    }

    return query;
  }
}

BillableLineItemBillingCycleRepository.TABLE_NAME = TABLE_NAME;

export default BillableLineItemBillingCycleRepository;
