import { unambiguousSelect } from '../utils/dbHelpers.js';
// pre-pricing service refactor code
// import VersionedRepository from './_versioned.js';
// import GlobalRateRecurringServiceRepo from './globalRateRecurringService.js';
// import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
// import FrequencyRepo from './frequency.js';
// end pre-pricing service refactor code
import GlobalRateRecurringServiceRepo from './globalRateRecurringService.js';
import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
import FrequencyRepo from './frequency.js';
import RatesRepository from './_rates.js';

const TABLE_NAME = 'global_rates_recurring_service_frequency';

class GlobalRatesRecurringServiceFrequencyRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = [
      'globalRateRecurringServiceId',
      'billableServiceFrequencyId',
      'billingCycle',
    ];
  }

  async getHistoricalRecords(
    {
      condition: {
        businessUnitId,
        businessLineId,
        billingCycle,
        frequencyId,
        billableServiceId,
        materialId,
        equipmentItemId,
      },
      fields = ['*'],
    },
    trx = this.knex,
  ) {
    const selects = unambiguousSelect(this.historicalTableName, fields);

    const items = await trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        GlobalRateRecurringServiceRepo.TABLE_NAME,
        `${GlobalRateRecurringServiceRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.globalRateRecurringServiceId`,
      )
      .innerJoin(
        BillableServiceFrequencyRepo.TABLE_NAME,
        `${BillableServiceFrequencyRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.billableServiceFrequencyId`,
      )
      .where({
        [`${this.historicalTableName}.billingCycle`]: billingCycle,
        [`${BillableServiceFrequencyRepo.TABLE_NAME}.frequencyId`]: frequencyId,
        [`${BillableServiceFrequencyRepo.TABLE_NAME}.billableServiceId`]: billableServiceId,
        [`${GlobalRateRecurringServiceRepo.TABLE_NAME}.businessUnitId`]: businessUnitId,
        [`${GlobalRateRecurringServiceRepo.TABLE_NAME}.businessLineId`]: businessLineId,
        [`${GlobalRateRecurringServiceRepo.TABLE_NAME}.billableServiceId`]: billableServiceId,
        [`${GlobalRateRecurringServiceRepo.TABLE_NAME}.materialId`]: materialId ?? null,
        [`${GlobalRateRecurringServiceRepo.TABLE_NAME}.equipmentItemId`]: equipmentItemId,
      })
      .orderBy(`${this.historicalTableName}.createdAt`, 'desc');

    return items;
  }

  async getRatesForBatchUpdate({ serviceIds, materialIds, equipmentItemIds }, trx = this.knex) {
    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(
        GlobalRateRecurringServiceRepo.TABLE_NAME,
        `${GlobalRateRecurringServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.globalRateRecurringServiceId`,
      )
      .whereIn(`${GlobalRateRecurringServiceRepo.TABLE_NAME}.billableServiceId`, serviceIds)
      .whereIn(`${GlobalRateRecurringServiceRepo.TABLE_NAME}.materialId`, materialIds)
      .whereIn(`${GlobalRateRecurringServiceRepo.TABLE_NAME}.equipmentItemId`, equipmentItemIds);

    return items;
  }

  async getRateBySpecificDate({
    businessUnitId,
    businessLineId,
    billableServiceId,
    materialId,
    serviceFrequencyId,
    specifiedDate,
  }) {
    const globalRateRecurringServiceHT = GlobalRateRecurringServiceRepo.getHistoricalTableName();
    const billableServiceFrequencyTable = BillableServiceFrequencyRepo.TABLE_NAME;
    const frequencyTable = FrequencyRepo.TABLE_NAME;

    const query = this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(
        globalRateRecurringServiceHT,
        `${this.historicalTableName}.globalRateRecurringServiceId`,
        `${globalRateRecurringServiceHT}.originalId`,
      )
      .innerJoin(
        billableServiceFrequencyTable,
        `${this.historicalTableName}.billableServiceFrequencyId`,
        `${billableServiceFrequencyTable}.id`,
      )
      .leftJoin(
        frequencyTable,
        `${billableServiceFrequencyTable}.frequencyId`,
        `${frequencyTable}.id`,
      )
      .first([
        `${this.historicalTableName}.price`,
        `${frequencyTable}.times as frequencyTimes`,
        `${frequencyTable}.type as frequencyType`,
        `${this.historicalTableName}.globalRateRecurringServiceId
                    as globalRatesRecurringServicesId`,
      ])
      .where({
        [`${globalRateRecurringServiceHT}.businessUnitId`]: businessUnitId,
        [`${globalRateRecurringServiceHT}.businessLineId`]: businessLineId,
        [`${globalRateRecurringServiceHT}.billableServiceId`]: billableServiceId,
        [`${globalRateRecurringServiceHT}.materialId`]: materialId,
        [`${billableServiceFrequencyTable}.frequencyId`]: serviceFrequencyId,
      })
      .andWhere(`${this.historicalTableName}.createdAt`, '<=', specifiedDate)
      .andWhere(`${globalRateRecurringServiceHT}.createdAt`, '<=', specifiedDate)
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: `${globalRateRecurringServiceHT}.createdAt`, order: 'desc' },
      ]);

    this.ctxState.logger.debug(
      `globalRecurringServiceRatesRepo->getRateBySpecificDate->result: ${query.toString()}`,
    );
    const result = await query;
    this.ctxState.logger.debug(
      result,
      `globalRecurringServiceRatesRepo->getRateBySpecificDate->result`,
    );
    return result;
  }
}

GlobalRatesRecurringServiceFrequencyRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesRecurringServiceFrequencyRepository;
