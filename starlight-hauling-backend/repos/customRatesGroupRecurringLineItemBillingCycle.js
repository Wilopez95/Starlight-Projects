import compose from 'lodash/fp/compose.js';
import { endOfToday, startOfToday } from 'date-fns';
import omit from 'lodash/omit.js';

import { compareDateAsc } from '../utils/dateTime.js';
import { camelCaseKeys, unambiguousSelect } from '../utils/dbHelpers.js';
import { calculateRateValue } from '../services/batchRates.js';
import { BATCH_RATES_SOURCE } from '../consts/batchRates.js';

import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import MqSender from '../services/amqp/sender.js';
import BillableLineItemBillingCycleRepo from './billableLineItemBillingCycle.js';
import GlobalRatesRecurringLineItemRepo from './globalRateRecurringLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';
import VersionedRepository from './_versioned.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'custom_rates_group_recurring_line_item_billing_cycle';

class CustomGroupRatesRecurringLineItemBillingCycleRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = [
      'customRatesGroupRecurringLineItemId',
      'billableLineItemBillingCycleId',
    ];
  }

  mapFields(originalObj, { skipNested } = {}) {
    return compose(
      obj => {
        if (!skipNested) {
          if (obj.customRateGroupLineItem) {
            obj.customRateGroupLineItem = camelCaseKeys(obj.customRateGroupLineItem);
          }
        }
        return obj;
      },
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  getUpdatedLineItemRates({
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
          rate => rate.lineItemId === customRate.customRateGroupLineItem.lineItemId,
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

        rowsToUpdate.push(omit(customRate, 'customRateGroupLineItem'));
      }
    });

    return rowsToUpdate;
  }

  async getRatesForBatchUpdate(
    { lineItemIds, customRateGroupIds, checkPendingUpdates },
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        this.knex.raw('to_json(??.*) as ??', [
          CustomRatesGroupLineItemRepo.TABLE_NAME,
          'customRateGroupLineItem',
        ]),
      ])
      .innerJoin(
        CustomRatesGroupLineItemRepo.TABLE_NAME,
        `${CustomRatesGroupLineItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.customRatesGroupRecurringLineItemId`,
      )
      .whereIn(`${CustomRatesGroupLineItemRepo.TABLE_NAME}.lineItemId`, lineItemIds)
      .whereIn(`${CustomRatesGroupLineItemRepo.TABLE_NAME}.customRatesGroupId`, customRateGroupIds);

    if (checkPendingUpdates) {
      query = query.where(`${this.tableName}.effectiveDate`, '>', startOfToday());
    }

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async batchRatesUpdate(
    { lineItemIds, customRateGroupIds, checkPendingUpdates, overrideUpdates, ...data },
    trx,
  ) {
    this.ctxState.logger.debug(
      lineItemIds,
      'customRatesGroupRecurringLineItemBillingCycleRepo->batchRatesUpdate->lineItemIds',
    );
    this.ctxState.logger.debug(
      customRateGroupIds,
      'customRatesGroupRecurringLineItemBillingCycleRepo->batchRatesUpdate->customRateGroupIds',
    );

    if (checkPendingUpdates) {
      const pendingUpdates = await this.getRatesForBatchUpdate(
        {
          lineItemIds,
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
        _trx(GlobalRatesRecurringLineItemRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .whereIn('lineItemId', lineItemIds),
        this.getRatesForBatchUpdate(
          {
            lineItemIds,
            customRateGroupIds,
          },
          _trx,
        ),
      ]);
      this.ctxState.logger.debug(
        globalRates,
        'customRatesGroupRecurringLineItemBillingCycleRepo->batchRatesUpdate->globalRates',
      );
      this.ctxState.logger.debug(
        customRates,
        'customRatesGroupRecurringLineItemBillingCycleRepo->batchRatesUpdate->customRates',
      );

      if (customRates?.length) {
        const updates = this.getUpdatedLineItemRates({
          globalRates,
          customRates,
          overrideUpdates,
          ...data,
        });
        this.ctxState.logger.debug(
          updates,
          'customRatesGroupRecurringLineItemBillingCycleRepo->batchRatesUpdate->updates',
        );

        if (updates?.length) {
          await this.upsertMany({ data: updates }, _trx);

          const today = endOfToday();
          if (compareDateAsc(data.effectiveDate, today) !== 1) {
            await mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
              customLineItemsRates: updates,
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
      condition: { businessUnitId, businessLineId, billingCycle, customRatesGroupId, lineItemId },
      fields = ['*'],
    },
    trx = this.knex,
  ) {
    const selects = unambiguousSelect(this.historicalTableName, fields);

    const items = await trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        CustomRatesGroupLineItemRepo.TABLE_NAME,
        `${CustomRatesGroupLineItemRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.customRatesGroupRecurringLineItemId`,
      )
      .innerJoin(
        BillableLineItemBillingCycleRepo.TABLE_NAME,
        `${BillableLineItemBillingCycleRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.billableLineItemBillingCycleId`,
      )
      .where({
        [`${BillableLineItemBillingCycleRepo.TABLE_NAME}.billingCycle`]: billingCycle,
        [`${BillableLineItemBillingCycleRepo.TABLE_NAME}.billableLineItemId`]: lineItemId,
        [`${CustomRatesGroupLineItemRepo.TABLE_NAME}.businessUnitId`]: businessUnitId,
        [`${CustomRatesGroupLineItemRepo.TABLE_NAME}.businessLineId`]: businessLineId,
        [`${CustomRatesGroupLineItemRepo.TABLE_NAME}.customRatesGroupId`]: customRatesGroupId, // eslint-disable-line max-len
        [`${CustomRatesGroupLineItemRepo.TABLE_NAME}.lineItemId`]: lineItemId,
      })
      .orderBy(`${this.historicalTableName}.createdAt`, 'desc');

    return items;
  }

  async getRateBySpecificDate({
    billingCycle,
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    billableLineItemId,
    specifiedDate,
  }) {
    const billableLineItemBillingCycleHT =
      BillableLineItemBillingCycleRepo.getHistoricalTableName();
    const customRatesGroupLineItemHT = CustomRatesGroupLineItemRepo.getHistoricalTableName();

    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(
        customRatesGroupLineItemHT,
        `${this.historicalTableName}.customRatesGroupRecurringLineItemId`,
        `${customRatesGroupLineItemHT}.originalId`,
      )
      .innerJoin(
        billableLineItemBillingCycleHT,
        `${this.historicalTableName}.billableLineItemBillingCycleId`,
        `${billableLineItemBillingCycleHT}.originalId`,
      )
      .first([
        `${this.historicalTableName}.price`,
        `${this.historicalTableName}.originalId
                    as customRatesGroupRecurringLineItemBillingCycleId`,
        this.knex.raw(
          `coalesce(${this.historicalTableName}.effective_date,
                        ${this.historicalTableName}.created_at)::timestamp
                        as price_effective_date`,
        ),
        this.knex.raw(
          `coalesce(${customRatesGroupLineItemHT}.effective_date,
                        ${customRatesGroupLineItemHT}.created_at)::timestamp
                        as line_item_effective_date`,
        ),
      ])
      .where({
        [`${customRatesGroupLineItemHT}.businessUnitId`]: businessUnitId,
        [`${customRatesGroupLineItemHT}.businessLineId`]: businessLineId,
        [`${customRatesGroupLineItemHT}.customRatesGroupId`]: customRatesGroupId,
        [`${customRatesGroupLineItemHT}.lineItemId`]: billableLineItemId,
        [`${billableLineItemBillingCycleHT}.billingCycle`]: billingCycle,
      })
      .andWhereRaw(
        `coalesce(${this.historicalTableName}.effective_date,
                    ${this.historicalTableName}.created_at) <= ?`,
        [specifiedDate],
      )
      .andWhereRaw(
        `coalesce(${customRatesGroupLineItemHT}.effective_date,
                    ${customRatesGroupLineItemHT}.created_at) <= ?`,
        [specifiedDate],
      )
      .andWhere(`${billableLineItemBillingCycleHT}.createdAt)`, '<=', specifiedDate)
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: 'priceEffectiveDate', order: 'desc' },
        { column: 'lineItemEffectiveDate', order: 'desc' },
        { column: `${billableLineItemBillingCycleHT}.createdAt)`, order: 'desc' },
      ]);

    return result;
  }
}

CustomGroupRatesRecurringLineItemBillingCycleRepository.TABLE_NAME = TABLE_NAME;

export default CustomGroupRatesRecurringLineItemBillingCycleRepository;
