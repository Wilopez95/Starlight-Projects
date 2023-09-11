import { unambiguousSelect } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemBillingCycleRepo from './billableLineItemBillingCycle.js';
import GlobalRateRecurringLineItemRepo from './globalRateRecurringLineItem.js';

const TABLE_NAME = 'global_rates_recurring_line_items_billing_cycle';

class GlobalRatesRecurringServiceBillableCycleRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = [
      'billable_line_item_billing_cycle_id',
      'global_rates_recurring_line_item_id',
    ];
  }

  async getHistoricalRecords(
    { condition: { businessUnitId, businessLineId, billingCycle, lineItemId }, fields = ['*'] },
    trx = this.knex,
  ) {
    const selects = unambiguousSelect(this.historicalTableName, fields);

    const items = await trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(
        GlobalRateRecurringLineItemRepo.TABLE_NAME,
        `${GlobalRateRecurringLineItemRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.globalRatesRecurringLineItemId`,
      )
      .innerJoin(
        BillableLineItemBillingCycleRepo.TABLE_NAME,
        `${BillableLineItemBillingCycleRepo.TABLE_NAME}.id`,
        `${this.historicalTableName}.billableLineItemBillingCycleId`,
      )
      .where({
        [`${BillableLineItemBillingCycleRepo.TABLE_NAME}.billingCycle`]: billingCycle,
        [`${BillableLineItemBillingCycleRepo.TABLE_NAME}.billableLineItemId`]: lineItemId,
        [`${GlobalRateRecurringLineItemRepo.TABLE_NAME}.businessUnitId`]: businessUnitId,
        [`${GlobalRateRecurringLineItemRepo.TABLE_NAME}.businessLineId`]: businessLineId,
        [`${GlobalRateRecurringLineItemRepo.TABLE_NAME}.lineItemId`]: lineItemId,
      })
      .orderBy(`${this.historicalTableName}.createdAt`, 'desc');

    return items;
  }

  async getRateBySpecificDate({
    billingCycle,
    businessUnitId,
    businessLineId,
    billableLineItemId,
    specifiedDate,
  }) {
    const globalRateRecurringLineItemHT = GlobalRateRecurringLineItemRepo.getHistoricalTableName();

    const billableLineItemBillingCycleHT =
      BillableLineItemBillingCycleRepo.getHistoricalTableName();

    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(
        globalRateRecurringLineItemHT,
        `${this.historicalTableName}.globalRatesRecurringLineItemId`,
        `${globalRateRecurringLineItemHT}.originalId`,
      )
      .innerJoin(
        billableLineItemBillingCycleHT,
        `${this.historicalTableName}.billableLineItemBillingCycleId`,
        `${billableLineItemBillingCycleHT}.originalId`,
      )
      .first([
        `${this.historicalTableName}.price`,
        `${this.historicalTableName}.originalId
                    as globalRatesRecurringLineItemsBillingCycleId`,
      ])
      .where({
        [`${globalRateRecurringLineItemHT}.businessUnitId`]: businessUnitId,
        [`${globalRateRecurringLineItemHT}.businessLineId`]: businessLineId,
        [`${globalRateRecurringLineItemHT}.lineItemId`]: billableLineItemId,
        [`${billableLineItemBillingCycleHT}.billingCycle`]: billingCycle,
      })
      .andWhere(`${this.historicalTableName}.createdAt`, '<=', specifiedDate)
      .andWhere(`${globalRateRecurringLineItemHT}.createdAt`, '<=', specifiedDate)
      .andWhere(`${billableLineItemBillingCycleHT}.createdAt`, '<=', specifiedDate)
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: `${globalRateRecurringLineItemHT}.createdAt`, order: 'desc' },
        { column: `${billableLineItemBillingCycleHT}.createdAt`, order: 'desc' },
      ]);

    return result;
  }
}

GlobalRatesRecurringServiceBillableCycleRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesRecurringServiceBillableCycleRepository;
