import compose from 'lodash/fp/compose.js';
import { endOfToday, startOfToday } from 'date-fns';
import omit from 'lodash/omit.js';

import { camelCaseKeys, unambiguousSelect } from '../utils/dbHelpers.js';
import { compareDateAsc } from '../utils/dateTime.js';
import { calculateRateValue } from '../services/batchRates.js';
import { BATCH_RATES_SOURCE } from '../consts/batchRates.js';

import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import MqSender from '../services/amqp/sender.js';
import FrequencyRepo from './frequency.js';
import CustomRatesGroupServiceRepo from './customRatesGroupService.js';
import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
import GlobalRateRecurringServiceFreqRepo from './globalRateRecurringServiceFrequency.js';
import VersionedRepository from './_versioned.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'custom_rates_group_recurring_service_frequency';

class CustomGroupRatesRecurringServiceFrequencyRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = [
      'customRatesGroupRecurringServiceId',
      'billableServiceFrequencyId',
      'billingCycle',
    ];
  }

  mapFields(originalObj, { skipNested } = {}) {
    return compose(
      obj => {
        if (!skipNested) {
          if (obj.customRateGroupService) {
            obj.customRateGroupService = camelCaseKeys(obj.customRateGroupService);
          }
        }
        return obj;
      },
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  getUpdatedServiceRates({
    globalRates,
    customRates,
    calculation,
    value,
    source,
    effectiveDate = null,
    overrideUpdates,
  }) {
    const rowsToUpdate = [];
    const today = endOfToday();

    customRates.forEach(customRate => {
      let newPrice = Number.NaN;

      if (!overrideUpdates && compareDateAsc(customRate.effectiveDate, today) === 1) {
        return;
      }

      if (source === BATCH_RATES_SOURCE.current) {
        newPrice = calculateRateValue({
          currentRate: Number(customRate.price),
          calculation,
          value,
          source,
        });
      }
      if (source === BATCH_RATES_SOURCE.global) {
        const globalRate = globalRates.find(
          rate =>
            rate.billableServiceId === customRate.customRateGroupService.billableServiceId &&
            rate.materialId === customRate.customRateGroupService.materialId &&
            rate.equipmentItemId === customRate.customRateGroupService.equipmentItemId &&
            rate.billableServiceFrequencyId === customRate.billableServiceFrequencyId &&
            rate.billingCycle === customRate.billingCycle,
        );

        if (globalRate) {
          newPrice = calculateRateValue({
            globalPrice: Number(globalRate.price),
            currentRate: Number(customRate.price),
            calculation,
            value,
            source,
          });
        }
      }

      if (!Number.isNaN(newPrice) && newPrice > 0) {
        const isEffectiveDateGreater = compareDateAsc(effectiveDate, today) === 1;
        if (isEffectiveDateGreater) {
          customRate.nextPrice = newPrice;
          customRate.effectiveDate = effectiveDate;
        } else {
          customRate.price = newPrice;
          customRate.nextPrice = null;
          customRate.effectiveDate = today;
        }

        rowsToUpdate.push(omit(customRate, 'customRateGroupService'));
      }
    });

    return rowsToUpdate;
  }

  async getRatesForBatchUpdate(
    { serviceIds, materialIds, equipmentItemIds, customRateGroupIds, checkPendingUpdates },
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        this.knex.raw('to_json(??.*) as ??', [
          CustomRatesGroupServiceRepo.TABLE_NAME,
          'customRateGroupService',
        ]),
      ])
      .innerJoin(
        CustomRatesGroupServiceRepo.TABLE_NAME,
        `${CustomRatesGroupServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.customRatesGroupRecurringServiceId`,
      )
      .whereIn(`${CustomRatesGroupServiceRepo.TABLE_NAME}.billableServiceId`, serviceIds)
      .whereIn(`${CustomRatesGroupServiceRepo.TABLE_NAME}.materialId`, materialIds)
      .whereIn(`${CustomRatesGroupServiceRepo.TABLE_NAME}.equipmentItemId`, equipmentItemIds)
      .whereIn(`${CustomRatesGroupServiceRepo.TABLE_NAME}.customRatesGroupId`, customRateGroupIds);

    if (checkPendingUpdates) {
      query = query.where(`${this.tableName}.effectiveDate`, '>', startOfToday());
    }

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async batchRatesUpdate(
    {
      serviceIds,
      materialIds,
      equipmentItemIds,
      customRateGroupIds,
      checkPendingUpdates,
      overrideUpdates,
      ...data
    },
    trx,
  ) {
    this.ctxState.logger.debug(
      serviceIds,
      'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->serviceIds',
    );
    this.ctxState.logger.debug(
      materialIds,
      'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->materialIds',
    );
    this.ctxState.logger.debug(
      equipmentItemIds,
      'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->equipmentItemIds',
    );
    this.ctxState.logger.debug(
      customRateGroupIds,
      'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->customRateGroupIds',
    );
    this.ctxState.logger.debug(
      data,
      'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->data',
    );

    if (checkPendingUpdates) {
      const pendingUpdates = await this.getRatesForBatchUpdate(
        {
          serviceIds,
          materialIds,
          equipmentItemIds,
          customRateGroupIds,
          checkPendingUpdates,
        },
        trx,
      );

      return pendingUpdates;
    }

    const _trx = trx || (await this.knex.transaction());

    try {
      const [globalRates, customRates] = await Promise.all([
        GlobalRateRecurringServiceFreqRepo.getInstance(this.ctxState).getRatesForBatchUpdate(
          { serviceIds, materialIds, equipmentItemIds },
          _trx,
        ),
        this.getRatesForBatchUpdate(
          {
            serviceIds,
            materialIds,
            equipmentItemIds,
            customRateGroupIds,
          },
          _trx,
        ),
      ]);
      this.ctxState.logger.debug(
        globalRates,
        'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->globalRates',
      );
      this.ctxState.logger.debug(
        customRates,
        'customRatesGroupRecurringServiceFrequencyRepo->batchRatesUpdate->customRates',
      );

      if (customRates?.length) {
        const updates = this.getUpdatedServiceRates({
          globalRates,
          customRates,
          overrideUpdates,
          ...data,
        });

        if (updates?.length) {
          await this.upsertMany({ data: updates }, _trx);

          const today = endOfToday();
          if (compareDateAsc(data.effectiveDate, today) !== 1) {
            await mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
              customServiceRates: updates,
            });
          }
        }
      }

      if (!trx) {
        await _trx.commit();
      }
      return null;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  getAllForPriceUpdateToday(trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select('*')
      .whereNotNull('nextPrice')
      .where('effectiveDate', '>=', startOfToday())
      .andWhere('effectiveDate', '<=', endOfToday());
  }

  async getHistoricalRecords(
    {
      condition: {
        businessUnitId,
        businessLineId,
        billableServiceId,
        billingCycle,
        customRatesGroupId,
        equipmentItemId,
        frequencyId,
        materialId,
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
        CustomRatesGroupServiceRepo.TABLE_NAME,
        `${CustomRatesGroupServiceRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.customRatesGroupRecurringServiceId`,
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
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.businessUnitId`]: businessUnitId,
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.businessLineId`]: businessLineId,
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.customRatesGroupId`]: customRatesGroupId,
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.billableServiceId`]: billableServiceId,
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.equipmentItemId`]: equipmentItemId,
        [`${CustomRatesGroupServiceRepo.TABLE_NAME}.materialId`]: materialId,
      })
      .orderBy(`${this.historicalTableName}.createdAt`, 'desc');

    return items;
  }

  async getRateBySpecificDate({
    businessUnitId,
    businessLineId,
    billableServiceId,
    materialId,
    serviceFrequencyId,
    customRatesGroupId,
    specifiedDate,
  }) {
    const customRatesGroupServiceT = CustomRatesGroupServiceRepo.TABLE_NAME;
    const billableServiceFrequencyTable = BillableServiceFrequencyRepo.TABLE_NAME;
    const frequencyTable = FrequencyRepo.TABLE_NAME;

    const query = this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(
        customRatesGroupServiceT,
        `${this.historicalTableName}.customRatesGroupRecurringServiceId`,
        `${customRatesGroupServiceT}.id`,
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
        `${this.historicalTableName}.customRatesGroupRecurringServiceId
                    as customRatesGroupServicesId`,
        this.knex.raw(
          `coalesce(${this.historicalTableName}.effective_date,
                        ${this.historicalTableName}.created_at)::timestamp
                        as frequency_effective_date`,
        ),
      ])
      .where({
        [`${customRatesGroupServiceT}.businessUnitId`]: businessUnitId,
        [`${customRatesGroupServiceT}.businessLineId`]: businessLineId,
        [`${customRatesGroupServiceT}.customRatesGroupId`]: customRatesGroupId,
        [`${customRatesGroupServiceT}.billableServiceId`]: billableServiceId,
        [`${customRatesGroupServiceT}.materialId`]: materialId,
        [`${billableServiceFrequencyTable}.frequencyId`]: serviceFrequencyId,
      })
      .andWhereRaw(
        `coalesce(${this.historicalTableName}.effective_date,
                    ${this.historicalTableName}.created_at) <= ?`,
        [specifiedDate],
      )
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: 'frequencyEffectiveDate', order: 'desc' },
      ]);

    this.ctxState.logger.debug(
      `customRecurringServiceRatesRepo->getRateBySpecificDate->result: ${query.toString()}`,
    );
    const result = await query;
    this.ctxState.logger.debug(
      result,
      `customRecurringServiceRatesRepo->getRateBySpecificDate->result`,
    );
    return result;
  }
}

CustomGroupRatesRecurringServiceFrequencyRepository.TABLE_NAME = TABLE_NAME;

export default CustomGroupRatesRecurringServiceFrequencyRepository;
