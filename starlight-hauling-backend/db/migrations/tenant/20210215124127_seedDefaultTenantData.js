import map from 'lodash/map.js';
import isEmpty from 'lodash/isEmpty.js';

import { DEFAULT_BUSINESS_LINES_SEED_DATA } from '../../../consts/businessLineTypes.js';
import { CUSTOMER_GROUP_TYPE } from '../../../consts/customerGroups.js';
import { THRESHOLD_TYPES, THRESHOLD_TYPE } from '../../../consts/thresholdTypes.js';
import { THRESHOLD_UNIT, LINE_ITEM_UNIT, UNIT } from '../../../consts/units.js';
import { LINE_ITEM_TYPE } from '../../../consts/lineItemTypes.js';
import { EVENT_TYPE } from '../../../consts/historicalEventType.js';
import { ONE_TIME_ACTION } from '../../../consts/actions.js';
import { LOAD_THRESHOLD_DESCRIPTION } from '../../../consts/recycling.js';

const billableServiceData = {
  active: true,
  one_time: true,
  action: ONE_TIME_ACTION.notService,
  unit: UNIT.none,
  description: 'not a service',
};

export const up = async (migrationBuilder, schema) => {
  /**
   *  DEFAULT BUSINESS LINES
   */
  const businessLines = await migrationBuilder
    .knex('business_lines')
    .withSchema(schema)
    .insert(DEFAULT_BUSINESS_LINES_SEED_DATA)
    .returning(['id']);
  const businessLinesIds = map(businessLines, 'id');

  /**
   *  DEFAULT CUSTOMER GROUPS
   */

  const customerGroups = await migrationBuilder
    .knex('customer_groups')
    .insert([
      {
        active: true,
        description: 'Contractor',
        type: CUSTOMER_GROUP_TYPE.commercial,
      },
      {
        active: true,
        description: 'Residential',
        type: CUSTOMER_GROUP_TYPE.nonCommercial,
      },
    ])
    .returning(['id', 'description']);

  // There are no guarantees about the auto-generated numbers
  const commercialId = customerGroups.find(group => group.description === 'Contractor').id;
  const residentialId = customerGroups.find(group => group.description === 'Residential').id;

  if (customerGroups && customerGroups.length) {
    await migrationBuilder.knex('customer_groups_historical').insert([
      {
        active: true,
        description: 'Contractor',
        type: CUSTOMER_GROUP_TYPE.commercial,
        originalId: commercialId,
        eventType: 'created',
      },
      {
        active: true,
        description: 'Residential',
        type: CUSTOMER_GROUP_TYPE.nonCommercial,
        originalId: residentialId,
        eventType: 'created',
      },
    ]);
  }

  /**
   *  DEFAULT THRESHOLDS
   */

  const getThresholdUnit = type =>
    ({
      [THRESHOLD_TYPE.overweight]: THRESHOLD_UNIT.ton,
      [THRESHOLD_TYPE.usageDays]: THRESHOLD_UNIT.day,
      [THRESHOLD_TYPE.demurrage]: THRESHOLD_UNIT.min,
    }[type]);

  // exclude recycling thresholds
  const thresholdsData = THRESHOLD_TYPES.filter(
    type => ![THRESHOLD_TYPE.dump, THRESHOLD_TYPE.load].includes(type),
  ).map(type => ({
    type,
    description: type === THRESHOLD_TYPE.load ? LOAD_THRESHOLD_DESCRIPTION : type,
    unit: getThresholdUnit(type),
  }));

  const thresholds = (
    await Promise.all(
      businessLinesIds.map(businessLineId =>
        migrationBuilder.knex('thresholds').insert(
          thresholdsData.map(data => ({ ...data, businessLineId })),
          ['*'],
        ),
      ),
    )
  ).flat(Number.POSITIVE_INFINITY);

  if (!isEmpty(thresholds)) {
    await migrationBuilder.knex('thresholds_historical').insert(
      thresholds.map(threshold =>
        Object.assign(
          threshold,
          { originalId: threshold.id, eventType: EVENT_TYPE.created },
          { id: undefined }, // to filter out
        ),
      ),
    );
  }

  /**
   *  DEFAULT LINE ITEMS
   */

  const tripChargeLI = {
    active: true,
    description: 'Trip Charge',
    type: LINE_ITEM_TYPE.tripCharge,
    unit: LINE_ITEM_UNIT.each,
    applySurcharges: true,
    oneTime: true,
  };

  const filteredLoBs = await migrationBuilder
    .knex('business_lines')
    .select('id')
    .whereNotIn('id', builder => {
      builder.select('business_line_id').from('billable_line_items').where({ type: 'tripCharge' });
    });

  if (filteredLoBs?.length) {
    const insertedItems = (
      await migrationBuilder.knex('billable_line_items').insert(
        filteredLoBs.map(item => ({ ...tripChargeLI, businessLineId: item.id })),
        ['id', 'businessLineId'],
      )
    ).flat(Number.POSITIVE_INFINITY);

    if (!isEmpty(insertedItems)) {
      await migrationBuilder.knex('billable_line_items_historical').insert(
        insertedItems.map(item => ({
          original_id: item.id,
          event_type: EVENT_TYPE.created,
          businessLineId: item.businessLineId,
          ...tripChargeLI,
        })),
      );
    }
  }

  const [businessLine, equipmentItem] = await Promise.all([
    migrationBuilder.knex('business_lines').select('id').first(),
    migrationBuilder.knex('equipment_items').select('id').first(),
  ]);

  if (businessLine?.id && equipmentItem?.id) {
    const fullBillableServiceData = {
      ...billableServiceData,
      equipment_item_id: equipmentItem.id,
      businessLineId: businessLine.id,
    };
    const billableService = await migrationBuilder
      .knex('billable_services')
      .insert(fullBillableServiceData)
      .returning(['id']);

    const billableServiceHT = await migrationBuilder
      .knex('billable_services_historical')
      .insert({
        ...fullBillableServiceData,
        originalId: billableService[0].id,
        eventType: 'created',
      })
      .returning(['id']);

    const subscriptions = await migrationBuilder.knex('subscriptions').select(['id']);
    if (subscriptions?.length) {
      await Promise.all(
        subscriptions.map(({ id: subscriptionId }) =>
          migrationBuilder.knex('subscription_service_item').insert({
            billableServiceId: billableServiceHT[0].id,
            quantity: 0,
            price: 0,
            subscriptionId,
          }),
        ),
      );
    }
  }
};
