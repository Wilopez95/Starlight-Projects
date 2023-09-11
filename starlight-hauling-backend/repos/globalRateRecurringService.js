import compose from 'lodash/fp/compose.js';

import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import MqSender from '../services/amqp/sender.js';
import RatesRepository from './_rates.js';
import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
import GlobalRatesRecurringServiceFrequencyRepo from './globalRateRecurringServiceFrequency.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'global_rates_recurring_services';

class GlobalRatesRecurringServiceRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            billable_service_id,
            coalesce(material_id, '-1'::integer),
            equipment_item_id
        `;
    // audit log needs
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'billableServiceId',
      'materialId',
      'equipmentItemId',
    ];
  }

  async upsertOne(
    { concurrentData, serviceFrqRepo, recurringServiceRatesRepo, trx },
    { frequencies, billingCycle, ...data },
  ) {
    this.ctxState.logger.debug(
      frequencies,
      'globalRateRecurringServiceRepo->upsertOne->frequencies',
    );
    this.ctxState.logger.debug(
      `globalRateRecurringServiceRepo->upsertOne->billingCycle: ${billingCycle}`,
    );
    this.ctxState.logger.debug(data, 'globalRateRecurringServiceRepo->upsertOne->data');
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
      'globalRateRecurringServiceRepo->upsertOne->globalRatesObj',
    );

    const { billableServiceId } = data;
    const reccurringServiceRates = await serviceFrqRepo.getByBillableServiceId(
      {
        condition: { billableServiceId },
        fields: ['id', 'billableServiceId'],
        nestedFields: ['times', 'type'],
      },
      trx,
    );
    this.ctxState.logger.debug(
      reccurringServiceRates,
      'globalRateRecurringServiceRepo->upsertOne->reccurringServiceRates',
    );
    // pre-pricing service refactor code (diff: https://d.pr/i/1VjRuz)
    // const filteredRates = reccurringServiceRates
    //   .filter(frequency =>
    //     frequencies.some(itemFrequency => {
    //       let isSame = itemFrequency.type === frequency.type;

    //       isSame && itemFrequency.times && (isSame = itemFrequency.times === frequency.times);
    //       isSame && (isSame = frequency.billableServiceId === billableServiceId);
    //       isSame &&
    //         (frequency.price = itemFrequency.price) &&
    //         (frequency.globalRateRecurringServiceId = globalRatesObj.id);
    // end pre-pricing service refactor code
    const filteredRates2 = reccurringServiceRates.filter(frequency =>
      frequencies.some(itemFrequency => {
        let isSame = itemFrequency.type === frequency.type;

        isSame && itemFrequency.times && (isSame = itemFrequency.times === frequency.times);
        isSame && (isSame = frequency.billableServiceId === billableServiceId);
        isSame &&
          (frequency.price = itemFrequency.price) &&
          (frequency.globalRateRecurringServiceId = globalRatesObj.id);

        return isSame;
      }),
    );

    const filteredRates = filteredRates2.map(
      ({ price, id: billableServiceFrequencyId, globalRateRecurringServiceId }) => ({
        price,
        globalRateRecurringServiceId: globalRateRecurringServiceId || globalRatesObj.id,
        billableServiceFrequencyId,
        billingCycle,
      }),
    );
    this.ctxState.logger.debug(
      filteredRates,
      'globalRateRecurringServiceRepo->upsertOne->filteredRates',
    );

    if (filteredRates?.length) {
      await Promise.all([
        recurringServiceRatesRepo.upsertMany({ data: filteredRates }, trx),
        mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
          globalServiceRates: filteredRates,
        }),
      ]);
    }
  }

  async upsertMany({ data, concurrentData }) {
    const serviceFrqRepo = BillableServiceFrequencyRepo.getInstance(this.ctxState);
    const recurringServiceRatesRepo = GlobalRatesRecurringServiceFrequencyRepo.getInstance(
      this.ctxState,
    );

    const trx = await this.knex.transaction();
    const inputObj = {
      concurrentData,
      serviceFrqRepo,
      recurringServiceRatesRepo,
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

  async getByIdToLog(id, trx = this.knex) {
    const reccurringServiceRate = await GlobalRatesRecurringServiceFrequencyRepo.getInstance(
      this.ctxState,
    ).getById(
      {
        id,
      },
      trx,
    );

    return reccurringServiceRate
      ? compose(
          super.mapNestedObjects.bind(this, []),
          super.mapFields,
          super.camelCaseKeys,
        )(reccurringServiceRate)
      : null;
  }
}

GlobalRatesRecurringServiceRepository.TABLE_NAME = TABLE_NAME;

export default GlobalRatesRecurringServiceRepository;
