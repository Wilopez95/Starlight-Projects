import BaseRepository from './_base.js';
import FrequencyRepo from './frequency.js';
import GlobalRateRecurringServiceFrequencyRepo from './globalRateRecurringServiceFrequency.js';
import CustomRateRecurrServiceFrequencyRepo from './customRatesGroupRecurringServiceFrequency.js';

const TABLE_NAME = 'billable_service_frequencies';

class BillableServiceFrequencyRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['billableServiceId', 'frequencyId'];
  }

  async deleteByIds({ condition: { billableServiceId, frequencyIds } }, trx = this.knex) {
    await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('frequencyId', frequencyIds)
      .andWhere({ billableServiceId })
      .del();
  }

  async getByBillableServiceId(
    {
      condition: { billableServiceId },
      nestedCondition: {
        globalRateRecurringServiceId,
        customRateRecurringServiceId,
        billingCycle,
      } = {},
      fields = ['*'],
      nestedFields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    const selects = [
      ...fields.map(field => `${this.tableName}.${field}`),
      ...nestedFields.map(field => `${FrequencyRepo.TABLE_NAME}.${field}`),
    ];

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        FrequencyRepo.TABLE_NAME,
        `${FrequencyRepo.TABLE_NAME}.id`,
        `${this.tableName}.frequencyId`,
      )
      .where(`${this.tableName}.billableServiceId`, billableServiceId);

    if (globalRateRecurringServiceId) {
      const targetTableName = GlobalRateRecurringServiceFrequencyRepo.TABLE_NAME;
      selects.push(`${targetTableName}.billingCycle`);
      if (customRateRecurringServiceId) {
        selects.push(`${targetTableName}.price as globalPrice`);
      } else {
        selects.push(`${targetTableName}.price`);
      }

      query.leftJoin(targetTableName, builder => {
        builder
          .on(`${targetTableName}.billable_service_frequency_id`, '=', `${this.tableName}.id`)
          .andOnVal(
            `${targetTableName}.global_rate_recurring_service_id`,
            '=',
            globalRateRecurringServiceId,
          )
          .andOnVal(`${targetTableName}.billing_cycle`, '=', billingCycle);
      });
    }

    if (customRateRecurringServiceId) {
      const targetTableName = CustomRateRecurrServiceFrequencyRepo.TABLE_NAME;
      selects.push(
        `${targetTableName}.price`,
        `${targetTableName}.effectiveDate`,
        `${targetTableName}.nextPrice`,
      );

      query.leftJoin(targetTableName, builder => {
        builder
          .on(`${targetTableName}.billable_service_frequency_id`, '=', `${this.tableName}.id`)
          .andOnVal(
            `${targetTableName}.custom_rates_group_recurring_service_id`,
            '=',
            customRateRecurringServiceId,
          )
          .andOnVal(`${targetTableName}.billing_cycle`, '=', billingCycle);
      });
    }

    const result = await query.select(selects);

    return result || [];
  }
}

BillableServiceFrequencyRepository.TABLE_NAME = TABLE_NAME;

export default BillableServiceFrequencyRepository;
