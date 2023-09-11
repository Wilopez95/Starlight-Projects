import compose from 'lodash/fp/compose.js';

import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import MqSender from '../services/amqp/sender.js';
import RatesRepository from './_rates.js';
import BillableLineItemBillingCycleRepo from './billableLineItemBillingCycle.js';
import GlobalRateRecurrLineItemCycleRepo from './globalRateRecurringLineItemBillingCycle.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'global_rates_recurring_line_items';

class GlobalRatesRecurringLineItemRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'lineItemId'];
  }

  async upsertOne(
    { concurrentData, lineItemCycleRepo, recuringLineItemRatesRepo, trx },
    { billingCycles, ...data },
  ) {
    this.ctxState.logger.debug(
      billingCycles,
      'globalRateRecurringLineItemRepo->upsertOne->billingCycles',
    );
    this.ctxState.logger.debug(data, 'globalRateRecurringLineItemRepo->upsertOne->data');
    const globalRatesObj = await super.upsert(
      {
        data,
        concurrentData,
        fields: ['id'],
      },
      trx,
    );
    this.ctxState.logger.debug(
      globalRatesObj,
      'globalRateRecurringLineItemRepo->upsertOne->globalRatesObj',
    );

    const recurringLineItemRates = await lineItemCycleRepo.getBillingCyclesByLineItemId(
      {
        condition: { billableLineItemId: data.lineItemId },
      },
      trx,
    );
    this.ctxState.logger.debug(
      recurringLineItemRates,
      'globalRateRecurringLineItemRepo->upsertOne->recurringLineItemRates',
    );

    const filteredRates = recurringLineItemRates
      .filter(rateCycle =>
        billingCycles.some(cycle => {
          if (rateCycle.billingCycle === cycle.billingCycle) {
            rateCycle.price = cycle.price;
            return true;
          }
          return false;
        }),
      )
      .map(({ price, id: billableLineItemBillingCycleId }) => ({
        billableLineItemBillingCycleId,
        globalRatesRecurringLineItemId: globalRatesObj.id,
        price,
      }));
    this.ctxState.logger.debug(
      filteredRates,
      'globalRateRecurringLineItemRepo->upsertOne->filteredRates',
    );

    if (filteredRates?.length) {
      await Promise.all([
        recuringLineItemRatesRepo.upsertMany({ data: filteredRates }, trx),
        mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
          globalLineItemsRates: filteredRates,
        }),
      ]);
    }
  }

  async upsertMany({ data, concurrentData }) {
    const lineItemCycleRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);
    const recuringLineItemRatesRepo = GlobalRateRecurrLineItemCycleRepo.getInstance(this.ctxState);

    const trx = await this.knex.transaction();
    const inputObj = {
      concurrentData,
      lineItemCycleRepo,
      recuringLineItemRatesRepo,
      trx,
    };

    try {
      await Promise.all(data.map(this.upsertOne.bind(this, inputObj)));

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getByRecurringLineItemIds(
    { condition: { businessUnitId, businessLineId, billingCycle }, ids = [], fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const allRates = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('lineItemId', ids)
      .andWhere({ businessUnitId, businessLineId })
      .select(fields);

    if (allRates?.length) {
      await Promise.all(
        allRates.map(async rate => {
          const billingCyclesRate = await BillableLineItemBillingCycleRepo.getInstance(
            this.ctxState,
          ).getBillingCyclesByLineItemId(
            {
              condition: {
                billableLineItemId: rate.lineItemId,
                globalRatesRecurringLineItemId: rate.id,
                billingCycle,
              },
              fields: ['billingCycle'],
            },
            trx,
          );

          rate.price = billingCyclesRate.price;
          rate.id = billingCyclesRate.id;
        }),
      );
    }

    return allRates ?? [];
  }

  async getAll({ condition } = {}, trx = this.knex) {
    const allRates = await super.getAll({ condition }, trx);

    if (allRates?.length) {
      await Promise.all(
        allRates.map(async rate => {
          const billingCyclesRate = await BillableLineItemBillingCycleRepo.getInstance(
            this.ctxState,
          ).getBillingCyclesByLineItemId(
            {
              condition: {
                billableLineItemId: rate.lineItemId,
                globalRatesRecurringLineItemId: rate.id,
              },
              fields: ['billingCycle'],
            },
            trx,
          );

          rate.billingCycles = billingCyclesRate.map(item => ({
            ...item,
            price: +item.price,
          }));
        }),
      );
    }

    return allRates ?? [];
  }

  async getByIdToLog(id, trx = this.knex) {
    const recurringLineItemRates = await GlobalRateRecurrLineItemCycleRepo.getInstance(
      this.ctxState,
    ).getById({ id }, trx);

    return recurringLineItemRates
      ? compose(super.mapFields, super.camelCaseKeys)(recurringLineItemRates)
      : null;
  }
}

GlobalRatesRecurringLineItemRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesRecurringLineItemRepository;
