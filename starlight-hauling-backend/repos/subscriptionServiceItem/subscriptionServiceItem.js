import { startOfToday } from 'date-fns';

import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';

import VersionedRepository from '../_versioned.js';
import SubscriptionRepo from '../subscription/subscription.js';
import SubscriptionOrderRepo from '../subscriptionOrder/subscriptionOrder.js';
import BillableServiceRepo from '../billableService.js';
import SubscriptionLineItemRepo from '../subscriptionLineItem.js';
import FrequencyRepo from '../frequency.js';
import BillableServiceBillingCycleRepo from '../billableServiceBillingCycle.js';
import EquipmentItemsRepo from '../equipmentItem.js';
import GlobalRateRecurringServicesRepo from '../globalRateRecurringService.js';
import CustomRatesGroupServicesRepo from '../customRatesGroupService.js';
import MaterialRepo from '../material.js';
import ServiceAreaRepo from '../serviceArea.js';
import BillableLineItemRepo from '../billableLineItem.js';
import JobSitesRepo from '../jobSite.js';
import CustomersRepo from '../customer.js';
import ContactRepo from '../contact.js';
import ThirdPartyHaulersRepo from '../3rdPartyHaulers.js';
// pricing service code:
import {
  pricingAlterSubscriptionServiceItem,
  pricingAddSubscriptionServiceItem,
  // pricingGetSubscriptionOrderDetailsForRoutePlanner,
  pricingGetSubscriptionsServiceItems,
  subscriptionNextServiceItemsBySpecificDate,
  subscriptionServiceItemsBySpecificDate,
  pricingGetSubscriptionsDetailsForRoutePlanner,
} from '../../services/pricing.js';

import { updateBasedOnSnapshot as updateServiceItem } from '../../services/subscriptionServiceItems/updateBasedOnSnapshot.js';
import { getNestedEntitiesIds } from '../../services/subscriptionServiceItems/utils/getNestedEntitiesIds.js';
import { mapNestedEntitiesIdsToHistorical } from '../../services/subscriptionServiceItems/utils/mapNestedEntitiesIdsToHistorical.js';

// import { unambiguousSelect } from '../../utils/dbHelpers.js';

import {
  TABLE_NAME,
  serviceItemDetailsFields,
  serviceItemGridFields,
  subscriptionsServiceItemsFields,
} from '../../consts/subscriptionServiceItems.js';
import { ONE_TIME_ACTION } from '../../consts/actions.js';
import { UNIT } from '../../consts/units.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING } from '../../consts/subscriptionAttributes.js';
import { SORT_ORDER } from '../../consts/sortOrders.js';
import { PHONE_TYPE } from '../../consts/phoneTypes.js';
import { mapServiceItemsFromDb } from './utils/mapServiceItemsFromDb.js';
import { getPaginatedSortedListQuery } from './queries/getPaginatedSortedListQuery.js';
import { getListQuery } from './queries/getListQuery.js';

class SubscriptionServiceItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  async getAllStream(options) {
    const {
      businessUnitId,
      businessLineIds,
      thirdPartyHaulerId,
      frequencyIds,
      status,
      serviceDaysOfWeek,
      serviceAreaIds,
      materialIds,
      equipmentIds,
      serviceIds,
      sortBy,
      sortOrder,
      skip,
      limit,
      onlyServices,
      routePlannerIdsToSort
    } = options;

    const trx = this.knex;
    // pre-pricing service code:
    // let query = trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .select([
    //     `${this.tableName}.*`,
    //     trx.raw('to_json(??.*) as ??', [SubscriptionRepo.TABLE_NAME, 'subscription']),
    //     trx.raw('to_json(??.*) as ??', [jobSiteHT, 'jobSite']),
    //     trx.raw('to_json(??.*) as ??', [billableServicesHT, 'billableService']),
    //     trx.raw('to_json(??.*) as ??', [EquipmentItemsRepo.TABLE_NAME, 'equipment']),
    //     trx.raw('to_json(??.*) as ??', [customerHT, 'customer']),
    //     trx.raw('to_json(??.*) as ??', [materialsHT, 'material']),
    //     trx.raw('to_json(??.*) as ??', [serviceAreaHT, 'serviceArea']),
    //   ])
    //   .innerJoin(
    //     SubscriptionRepo.TABLE_NAME,
    //     `${SubscriptionRepo.TABLE_NAME}.id`,
    //     `${this.tableName}.subscriptionId`,
    //   )
    //   .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${SubscriptionRepo.TABLE_NAME}.jobSiteId`)
    //   .innerJoin(
    //     billableServicesHT,
    //     `${billableServicesHT}.id`,
    //     `${this.tableName}.billableServiceId`,
    //   )
    //   .innerJoin(
    //     EquipmentItemsRepo.TABLE_NAME,
    //     `${EquipmentItemsRepo.TABLE_NAME}.id`,
    //     `${billableServicesHT}.equipmentItemId`,
    //   )
    //   .innerJoin(customerHT, `${customerHT}.id`, `${SubscriptionRepo.TABLE_NAME}.customerId`)
    //   .innerJoin(materialsHT, `${materialsHT}.id`, `${this.tableName}.materialId`)
    //   .innerJoin(
    //     serviceAreaHT,
    //     `${serviceAreaHT}.id`,
    //     `${SubscriptionRepo.TABLE_NAME}.serviceAreaId`,
    //   );

    // businessUnitId && query.where(`${SubscriptionRepo.TABLE_NAME}.businessUnitId`, businessUnitId);
    // businessLineIds &&
    //   query.whereIn(`${SubscriptionRepo.TABLE_NAME}.businessLineId`, businessLineIds);
    // serviceAreaIds && query.whereIn(`${serviceAreaHT}.originalId`, serviceAreaIds);
    // materialIds && query.whereIn(`${materialsHT}.originalId`, materialIds);
    // equipmentIds && query.whereIn(`${EquipmentItemsRepo.TABLE_NAME}.id`, equipmentIds);
    // frequencyIds && query.whereIn(`${TABLE_NAME}.serviceFrequencyId`, frequencyIds);
    // serviceTypes && query.whereIn(`${billableServicesHT}.action`, serviceTypes);
    // end of pre-pricing service code
    const billableServicesHT = BillableServiceRepo.getHistoricalInstance(this.ctxState);
    const materialsHT = MaterialRepo.getHistoricalInstance(this.ctxState);
    const jobSiteHT = JobSitesRepo.getHistoricalInstance(this.ctxState);
    const customerHT = CustomersRepo.getHistoricalInstance(this.ctxState);
    const serviceAreaHT = ServiceAreaRepo.getHistoricalInstance(this.ctxState);
    const equipmentHT = EquipmentItemsRepo.getHistoricalInstance(this.ctxState);
    const materialsRepo = MaterialRepo.getInstance(this.ctxState);
    const serviceAreaRepo = ServiceAreaRepo.getInstance(this.ctxState);
    let idsToSort = routePlannerIdsToSort? JSON.parse(routePlannerIdsToSort) : [];
    let onlyServicesList = [];
    if (onlyServices) {
      onlyServicesList = await BillableServiceRepo.getInstance(this.ctxState)
        .getAll({ fields: ['id'] }, trx)
        .whereNot('description', 'not a service');
    }
    if (sortBy === 'materialName') {
      idsToSort = await materialsRepo
        .getAll({ fields: ['id'] }, trx)
        .orderBy('description', sortOrder);
    }
    if (sortBy === 'customerName') {
      idsToSort = await CustomersRepo.getInstance(this.ctxState)
        .getAll({ fields: ['id'] }, trx)
        .orderBy('name', sortOrder);
    }
    if (sortBy === 'jobSiteName') {
      idsToSort = await JobSitesRepo.getInstance(this.ctxState)
        .getAll({ fields: ['id'] }, trx)
        .orderBy('fullAddress', sortOrder);
    }
    if (sortBy === 'equipmentSize') {
      idsToSort = await BillableServiceRepo.getInstance(this.ctxState)
        .getAll({ fields: [`${BillableServiceRepo.TABLE_NAME}.id`] }, trx)
        .leftJoin(
          EquipmentItemsRepo.TABLE_NAME,
          `${EquipmentItemsRepo.TABLE_NAME}.id`,
          `${BillableServiceRepo.TABLE_NAME}.equipmentItemId`,
        )
        .orderBy(`${EquipmentItemsRepo.TABLE_NAME}.description`, sortOrder);
    }
    if (sortBy === 'serviceName') {
      idsToSort = await BillableServiceRepo.getInstance(this.ctxState)
        .getAll({ fields: ['id'] }, trx)
        .whereNot('description', 'not a service')
        .orderBy(`description`, sortOrder);
    }
    let pricingSubscriptionServiceItems = await pricingGetSubscriptionsServiceItems(
      { state: this.ctxState },
      {
        data: {
          businessUnitId,
          businessLineIds,
          thirdPartyHaulerId,
          frequencyIds,
          serviceIds,
          status,
          sortOrder,
          sortBy,
          skip,
          limit,
          idsToSort: idsToSort.map(item => item.id),
          onlyServices: onlyServicesList.map(item => item.id),
        },
      },
    );

    if (serviceDaysOfWeek && serviceDaysOfWeek.length < 7) {
      pricingSubscriptionServiceItems = pricingSubscriptionServiceItems.filter(
        element =>
          element.serviceDaysOfWeek != null &&
          Object.keys(element.serviceDaysOfWeek)
            .map(day => Number(day))
            .some(serviceDay => serviceDaysOfWeek.includes(serviceDay)),
      );
    }
    // pre-pricing service code:
    // if (serviceDaysOfWeek?.length) {
    //   const jsonbSearchArray = serviceDaysOfWeek.map(el => `'${el}'`);

    //   // Due to knex docs see {@link http://knexjs.org/#Builder-whereRaw}
    //   // we should use the escape sequence \\ to prevent replacement of ? in jsonb search
    //   query = query.whereRaw(
    //     `"${TABLE_NAME}".service_days_of_week \\?| array[${jsonbSearchArray}]`,
    if (serviceAreaIds) {
      const historicalServiceAreas = await serviceAreaRepo.convertToHistorical(
        { ids: serviceAreaIds, fields: ['id', 'originalId'] },
        trx,
      );

      pricingSubscriptionServiceItems = pricingSubscriptionServiceItems.filter(
        element =>
          element.subscription.serviceAreaId != null &&
          historicalServiceAreas
            .map(serviceArea => serviceArea.id)
            .includes(element.subscription.serviceAreaId),
      );
    }

    if (materialIds) {
      const historicalMaterials = await materialsRepo.convertToHistorical(
        { ids: materialIds, fields: ['id', 'originalId'] },
        trx,
      );

      pricingSubscriptionServiceItems = pricingSubscriptionServiceItems.filter(
        element =>
          element.materialId != null &&
          historicalMaterials.map(material => material.id).includes(element.materialId),
      );
    }

    const response = [];
    for (let index = 0; index < pricingSubscriptionServiceItems.length; index++) {
      const subscriptionServiceItem = pricingSubscriptionServiceItems[index];

      subscriptionServiceItem.jobSite = await jobSiteHT.getBy({
        condition: { id: subscriptionServiceItem.subscription.jobSiteId },
      });

      subscriptionServiceItem.jobSite.location = JSON.stringify(
        subscriptionServiceItem.jobSite.location,
      );

      subscriptionServiceItem.billableService = await billableServicesHT.getBy({
        condition: { id: subscriptionServiceItem.billableServiceId },
      });
      subscriptionServiceItem.equipment = await equipmentHT.getBy({
        condition: { id: subscriptionServiceItem.billableService.equipmentItemId },
      });
      subscriptionServiceItem.customer = await customerHT.getRecentBy({
        condition: { originalId: subscriptionServiceItem.subscription.customerId },
      });
      subscriptionServiceItem.material = await materialsHT.getBy({
        condition: { id: subscriptionServiceItem.materialId },
      });
      subscriptionServiceItem.serviceArea = await serviceAreaHT.getBy({
        condition: { id: subscriptionServiceItem.subscription.serviceAreaId },
      });

      if (subscriptionServiceItem !== null) {
        response.push(subscriptionServiceItem);
      }
    }

    if (equipmentIds) {
      return response.filter(
        element =>
          element.billableService != null &&
          equipmentIds.includes(element.billableService.equipmentItemId),
      );
    }

    return response;
  }

  async getAllPaginated(
    {
      condition: {
        businessUnitId,
        businessLineIds,
        serviceAreaIds,
        materialIds,
        equipmentIds,
        frequencyIds,
        serviceTypes,
        serviceDaysOfWeek,
        resolveOriginalEntities,
        ids,
        thirdPartyHaulerId,
        ...condition
      } = {},
      fields = serviceItemGridFields,
      skip = 0,
      limit = 25,
      sortBy = SUBSCRIPTION_SERVICE_ITEMS_DEFAULT_SORTING,
      sortOrder = SORT_ORDER.desc,
    } = {},
    trx = this.knex,
  ) {
    const extraJoins = [];
    (businessUnitId || businessLineIds?.length || serviceAreaIds?.length) &&
      extraJoins.push(SubscriptionRepo.TABLE_NAME);
    (equipmentIds?.length || serviceTypes?.length) && extraJoins.push('serviceItemService');
    equipmentIds?.length && extraJoins.push(EquipmentItemsRepo.TABLE_NAME);
    serviceAreaIds?.length && extraJoins.push('serviceAreaOriginalId');
    materialIds?.length && extraJoins.push('materialOriginalId');

    resolveOriginalEntities &&
      extraJoins.push('customerOriginalId', 'serviceAreaOriginalId', 'materialOriginalId');

    let query = getPaginatedSortedListQuery(trx, this.ctxState, this.schemaName, {
      condition,
      fields,
      extraJoins: new Set(extraJoins),
      resolveOriginalEntities,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const materialsHT = MaterialRepo.getHistoricalTableName();
    const serviceAreaHT = ServiceAreaRepo.getHistoricalTableName();

    if (businessLineIds) {
      query = query.whereIn(`${SubscriptionRepo.TABLE_NAME}.businessLineId`, businessLineIds);
    }

    if (businessUnitId) {
      query = query.where(`${SubscriptionRepo.TABLE_NAME}.businessUnitId`, businessUnitId);
    }

    if (thirdPartyHaulerId !== undefined) {
      query = query.where(`${SubscriptionRepo.TABLE_NAME}.thirdPartyHaulerId`, thirdPartyHaulerId);
    }

    if (serviceAreaIds) {
      query = query.whereIn(`${serviceAreaHT}.originalId`, serviceAreaIds);
    }

    if (materialIds) {
      query = query.whereIn(`${materialsHT}.originalId`, materialIds);
    }

    if (equipmentIds) {
      query = query.whereIn(`${EquipmentItemsRepo.TABLE_NAME}.id`, equipmentIds);
    }

    if (frequencyIds) {
      query = query.whereIn(`${TABLE_NAME}.serviceFrequencyId`, frequencyIds);
    }

    if (serviceTypes) {
      query = query.whereIn(`serviceItemService.action`, serviceTypes);
    }

    if (ids) {
      query = query.whereIn(`${TABLE_NAME}.id`, ids);
    }

    if (serviceDaysOfWeek?.length) {
      const jsonbSearchArray = serviceDaysOfWeek.map(el => `'${el}'`);

      // Due to knex docs see {@link http://knexjs.org/#Builder-whereRaw}
      // we should use the escape sequence \\ to prevent replacement of ? in jsonb search
      query = query.whereRaw(
        `"${TABLE_NAME}".service_days_of_week \\?| array[${jsonbSearchArray}]`,
      );
    }

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getBySubscriptionId(
    {
      subscriptionId,
      condition = {},
      ids,
      extraJoins,
      excludeNotService = true,
      excludeEnded = true,
      fields = serviceItemGridFields,
    },
    trx = this.knex,
  ) {
    const query = getListQuery(trx, this.ctxState, this.schemaName, {
      condition: { ids, subscriptionId, ...condition },
      extraJoins,
      excludeNotService,
      excludeEnded,
      fields,
    }).orderBy(`${this.tableName}.id`);
    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async convertNestedEntitiesToHistorical({ serviceItems, skipIfExists = false }, trx = this.knex) {
    const billableServicesRepo = BillableServiceRepo.getInstance(this.ctxState);
    const billableLineItemsRepo = BillableLineItemRepo.getInstance(this.ctxState);
    const materialsRepo = MaterialRepo.getInstance(this.ctxState);
    const { materialsIds, billableServicesIds, billableLineItemsIds } =
      getNestedEntitiesIds(serviceItems);

    const historicalMaterials = materialsIds?.length
      ? await materialsRepo.convertToHistorical(
          { ids: materialsIds, fields: ['id', 'originalId'] },
          trx,
        )
      : [];
    const historicalBillableServices = materialsIds?.length
      ? await billableServicesRepo.convertToHistorical(
          { ids: billableServicesIds, fields: ['id', 'originalId'] },
          trx,
        )
      : [];
    const historicalBillableLineItems = materialsIds?.length
      ? await billableLineItemsRepo.convertToHistorical(
          { ids: billableLineItemsIds, fields: ['id', 'originalId'] },
          trx,
        )
      : [];

    return mapNestedEntitiesIdsToHistorical({
      serviceItems,
      historicalMaterials,
      historicalBillableLineItems,
      historicalBillableServices,
      skipIfExists,
    });
  }

  async getBySubscriptionDraftId(subscriptionDraftId, trx = this.knex) {
    const billableServicesTable = BillableServiceRepo.getHistoricalTableName();
    const materialTable = MaterialRepo.getHistoricalTableName();
    const billableLineItem = BillableLineItemRepo.getHistoricalTableName();

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw('to_json(??.*) as ??', [billableServicesTable, 'billableService']),
        trx.raw('to_json(??.*) as ??', [materialTable, 'material']),
        trx.raw('json_agg(distinct ??.*) as ??', [
          SubscriptionOrderRepo.TABLE_NAME,
          'subscriptionOrders',
        ]),
        trx.raw('json_agg(distinct ??.*) as ??', ['orderService', 'subscriptionOrdersServices']),
        trx.raw('json_agg(distinct ??.*) as ??', [
          SubscriptionLineItemRepo.TABLE_NAME,
          'lineItems',
        ]),
        trx.raw('json_agg(distinct ??.*) as ??', [billableLineItem, 'billableLineItems']),

        trx.raw('to_json(??.*) as ??', [FrequencyRepo.TABLE_NAME, 'serviceFrequency']),
      ])
      .innerJoin(
        billableServicesTable,
        `${billableServicesTable}.id`,
        `${this.tableName}.billable_service_id`,
      )
      .leftJoin(materialTable, `${materialTable}.id`, `${this.tableName}.material_id`)
      .leftJoin(
        SubscriptionLineItemRepo.TABLE_NAME,
        `${SubscriptionLineItemRepo.TABLE_NAME}.subscriptionServiceItemId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        billableLineItem,
        `${billableLineItem}.id`,
        `${SubscriptionLineItemRepo.TABLE_NAME}.billableLineItemId`,
      )
      .leftJoin(
        SubscriptionOrderRepo.TABLE_NAME,
        `${SubscriptionOrderRepo.TABLE_NAME}.subscriptionServiceItemId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        `"${billableServicesTable}" as orderService`,
        'orderService.id',
        `${SubscriptionOrderRepo.TABLE_NAME}.billableServiceId`,
      )
      .leftJoin(
        FrequencyRepo.TABLE_NAME,
        `${this.tableName}.serviceFrequencyId`,
        `${FrequencyRepo.TABLE_NAME}.id`,
      )
      .where(`${this.tableName}.subscriptionId`, subscriptionDraftId)
      .groupBy(
        `${this.tableName}.id`,
        `${billableServicesTable}.id`,
        `${materialTable}.id`,
        `${FrequencyRepo.TABLE_NAME}.id`,
      )
      .orderBy(`${this.tableName}.id`);

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getById({ id, condition, fields = serviceItemDetailsFields }, trx = this.knex) {
    const query = getListQuery(trx, this.ctxState, this.schemaName, {
      condition: { ids: [id], ...condition },
      fields,
    }).first();
    const item = await query;

    return isEmpty(item) ? null : this.mapFields(item);
  }

  async getBySubscriptionIds(
    { condition = {}, ids, fields = subscriptionsServiceItemsFields },
    trx = this.knex,
  ) {
    const query = getListQuery(trx, this.ctxState, this.schemaName, {
      condition: { subscriptionsIds: ids, ...condition },
      fields,
    });
    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getByRate(
    {
      globalRateRecurringServiceId,
      customRatesGroupServicesId,
      billableServiceFrequencyId,
      billingCycle,
    },
    trx = this.knex,
  ) {
    const globalRateRecurringServicesHT = GlobalRateRecurringServicesRepo.getHistoricalTableName();
    const customRatesGroupServicesHT = CustomRatesGroupServicesRepo.getHistoricalTableName();

    let query = getListQuery(trx, this.ctxState, this.schemaName, {
      condition: {
        billingCycle,
        serviceFrequencyId: billableServiceFrequencyId,
        [`${SubscriptionRepo.TABLE_NAME}.unlockOverrides`]: false,
      },
      fields: ['*', 'subscription'],
      extraJoins: new Set(['nextBillingPeriodFrom']),
    });

    if (globalRateRecurringServiceId) {
      query = query
        .innerJoin(
          globalRateRecurringServicesHT,
          `${globalRateRecurringServicesHT}.id`,
          `${this.tableName}.globalRatesRecurringServicesId`,
        )
        .where(`${globalRateRecurringServicesHT}.originalId`, globalRateRecurringServiceId);
    }
    if (customRatesGroupServicesId) {
      query = query
        .innerJoin(
          customRatesGroupServicesHT,
          `${customRatesGroupServicesHT}.id`,
          `${this.tableName}.customRatesGroupServicesId`,
        )
        .where(`${customRatesGroupServicesHT}.originalId`, customRatesGroupServicesId);
    }

    const items = await query;
    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async updateServiceItemsByRateChanges(
    {
      globalRateRecurringServiceId,
      customRatesGroupServicesId,
      billableServiceFrequencyId,
      billingCycle,
      price,
      impactedSubscriptionIdsSet,
    },
    trx = this.knex,
  ) {
    const serviceItems = await this.getByRate(
      {
        globalRateRecurringServiceId,
        customRatesGroupServicesId,
        billableServiceFrequencyId,
        billingCycle,
      },
      trx,
    );

    if (serviceItems?.length) {
      const updatePromises = serviceItems.map(
        // TODO: test that nextBillingPeriodFrom on subs always has proper value
        ({ id, subscriptionId, nextBillingPeriodFrom, subscription }) => {
          if (impactedSubscriptionIdsSet) {
            impactedSubscriptionIdsSet.add(subscriptionId);
          }
          return updateServiceItem(
            this.getCtx(),
            {
              // TODO: link with new historical globalRateRecurringService record
              // TODO: link with new historical customRatesGroupServices record
              subscription: {
                businessUnitId: subscription.businessUnitId,
                businessLineId: subscription.businessLineId,
                billingCycle,
              },
              id,
              price,
              recalculate: true,
              effectiveDate: nextBillingPeriodFrom,
            },
            trx,
          );
        },
      );

      await Promise.all(updatePromises);
    }
  }

  async updateByIds({ ids, insertData }) {
    if (!ids.length) {
      return [];
    }

    const subscriptionServicesItems = [];
    for (const id of ids) {
      const servicesItem = await pricingAlterSubscriptionServiceItem(
        this.getCtx(),
        { data: insertData },
        id,
      );
      subscriptionServicesItems.push(servicesItem);
    }

    return subscriptionServicesItems;
  }

  async getNextServiceDatesBySubscriptionIds(ids = [], trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        trx.raw(`${this.tableName}.subscription_id AS id`),
        trx.raw(`
                    MIN(${SubscriptionOrderRepo.TABLE_NAME}.service_date) AS next_service_date
                `),
      ])
      .leftJoin(
        SubscriptionOrderRepo.TABLE_NAME,
        `${TABLE_NAME}.id`,
        `${SubscriptionOrderRepo.TABLE_NAME}.subscriptionServiceItemId`,
      )
      .whereIn(`${this.tableName}.subscriptionId`, ids)
      .where(`${SubscriptionOrderRepo.TABLE_NAME}.status`, SUBSCRIPTION_ORDER_STATUS.scheduled)
      .whereNull(`${SubscriptionOrderRepo.TABLE_NAME}.deletedAt`)
      .whereRaw(`??.?? >= CURRENT_DATE::TIMESTAMP AT TIME ZONE 'UTC'`, [
        SubscriptionOrderRepo.TABLE_NAME,
        'service_date',
      ])
      .groupBy([`${this.tableName}.subscriptionId`]);

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  mapFields(originalObj, { skipNested } = {}) {
    return mapServiceItemsFromDb(originalObj, {
      skipNested,
      // in case if will be copy-pasted and `this` will be used in parent
      parentMapper: super.mapFields.bind(this),
      instance: this,
    });
  }

  async collectSubscriptionBillableServices(serviceItemsInput) {
    const bsRepo = BillableServiceRepo.getInstance(this.ctxState);
    const bsHT = BillableServiceRepo.getHistoricalTableName();

    const { subscriptionServicesHistoricalIds, ordersServicesHistoricalIds } =
      serviceItemsInput?.reduce(
        (res, serviceItem) => {
          res.subscriptionServicesHistoricalIds.push(serviceItem.billableServiceId);
          if (!isEmpty(serviceItem.subscriptionOrders)) {
            res.ordersServicesHistoricalIds.push(
              ...Array.from(
                new Set(
                  serviceItem.subscriptionOrders
                    .filter(Boolean)
                    .map(item => item.billableServiceId),
                ),
              ),
            );
          }
          return res;
        },
        { subscriptionServicesHistoricalIds: [], ordersServicesHistoricalIds: [] },
      ) || { subscriptionServicesHistoricalIds: [], ordersServicesHistoricalIds: [] };

    const subscriptionServices = await bsRepo.getAllWithIncludedByHistoricalIds({
      ids: subscriptionServicesHistoricalIds,
      fields: [
        `${bsHT}.id as historicalId`,
        'id',
        'equipmentItemId',
        'action',
        'description',
        'oneTime',
      ],
    });

    // Key list of subscription services by historicalId
    const subscriptionBillableServicesMap = subscriptionServices.reduce((map, item) => {
      map[item.historicalId] = item;
      return map;
    }, {});

    let oneTimeBillableServicesMap = {};
    if (!isEmpty(ordersServicesHistoricalIds)) {
      const ordersServices = await bsRepo.getAllByHistoricalIds({
        ids: ordersServicesHistoricalIds,
        fields: [
          `${bsHT}.id as historicalId`,
          'id',
          'equipmentItemId',
          'action',
          'description',
          'oneTime',
        ],
      });

      // Key list of one time subscription orders by id)
      oneTimeBillableServicesMap = ordersServices.reduce((map, item) => {
        map[item.historicalId] = item;
        return map;
      }, {});
    }

    return { subscriptionBillableServicesMap, oneTimeBillableServicesMap };
  }

  getByDate({ condition: { ...condition }, fields = ['*'] }, trx = this.knex) {
    return getListQuery(trx, this.ctxState, this.schemaName, {
      condition,
      fields,
    }).andWhere(`${TABLE_NAME}.effectiveDate`, '<=', startOfToday());
  }

  async getHistoricalRecords(id) {
    const subscriptionTable = SubscriptionRepo.TABLE_NAME;

    const frequencyTable = FrequencyRepo.TABLE_NAME;
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();
    const billableServiceBillingCycleTable = BillableServiceBillingCycleRepo.TABLE_NAME;
    const select = [
      `${this.historicalTableName}.*`,
      `${frequencyTable}.times`,
      `${frequencyTable}.type`,
      `${billableServiceHT}.prorationType`,
      `${subscriptionTable}.startDate`,
      `${subscriptionTable}.endDate`,
      `${billableServiceBillingCycleTable}.billingCycle`,
    ];

    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .where(`${this.historicalTableName}.originalId`, id)
      .select(select)
      .leftJoin(
        frequencyTable,
        `${this.historicalTableName}.serviceFrequencyId`,
        `${frequencyTable}.id`,
      )
      .innerJoin(
        billableServiceHT,
        `${billableServiceHT}.id`,
        `${this.historicalTableName}.billableServiceId`,
      )
      .innerJoin(
        billableServiceBillingCycleTable,
        `${this.historicalTableName}.billableServiceId`,
        `${billableServiceBillingCycleTable}.billableServiceId`,
      )
      .innerJoin(
        subscriptionTable,
        `${this.historicalTableName}.subscriptionId`,
        `${subscriptionTable}.id`,
      )
      .orderBy(`${this.historicalTableName}.id`);

    return result;
  }

  async initStubData({ data, subscriptionId }, trx = this.knex, ctx) {
    const equipmentItem = await EquipmentItemsRepo.getInstance(this.ctxState).getFirstSorted(
      {
        fields: ['id'],
        condition: {
          businessLineId: data.businessLineId,
        },
      },
      trx,
    );

    const billableService = await BillableServiceRepo.getInstance(this.ctxState).upsert(
      {
        data: {
          businessLineId: data.businessLineId,
          active: true,
          one_time: true,
          equipment_item_id: equipmentItem.id,
          action: ONE_TIME_ACTION.notService,
          unit: UNIT.none,
          description: 'not a service',
        },
      },
      trx,
    );

    const billableServiceHT = await BillableServiceRepo.getHistoricalInstance(
      this.ctxState,
    ).getRecentBy(
      {
        condition: { originalId: billableService.id },
        fields: ['id', 'originalId'],
      },
      trx,
    );
    // Add a new Subscription Service Item into the new pricing backend
    await pricingAddSubscriptionServiceItem(ctx, {
      data: {
        billableServiceId: billableServiceHT.id,
        quantity: 0,
        price: 0,
        subscriptionId,
      },
    });
    // This is the origil code created by Eleks
    // await SubscriptionServiceItemRepository.getInstance(this.ctxState).createOne(
    //   {
    //     data: {
    //       billableServiceId: billableServiceHT.id,
    //       quantity: 0,
    //       price: 0,
    //       subscriptionId,
    //     },
    //   },
    //   trx,
    // );
  }

  async getHistoryRecordForProration({ serviceItemIds, lineBillableItemIds }) {
    const subscriptionLineItemHt = SubscriptionLineItemRepo.getHistoricalTableName();
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();

    const select = [
      `${billableServiceHT}.prorationType`,

      `${this.historicalTableName}.originalId as serviceItemId`,
      `${this.historicalTableName}.effectiveDate as effectiveDate`,
      `${this.historicalTableName}.price as price`,
      `${this.historicalTableName}.quantity as quantity`,
      `${this.historicalTableName}.serviceFrequencyId`,

      this.knex.raw(
        `json_agg(json_build_object(
                    'lineItemId', ${subscriptionLineItemHt}.original_id,
                    'price', ${subscriptionLineItemHt}.price,
                    'quantity', ${subscriptionLineItemHt}.quantity,
                    'effectiveDate', ${subscriptionLineItemHt}.effective_date,
                    'billableLineItemId', ${subscriptionLineItemHt}.billable_line_item_id
                )
            ) as ??`,
        'lineItems',
      ),
    ];

    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)

      // .where(`${this.historicalTableName}.effectiveDate`, '>=', startOfToday)
      .whereNotNull(`${this.historicalTableName}.effectiveDate`)
      .whereIn(`${this.historicalTableName}.originalId`, serviceItemIds)
      .whereIn(`${subscriptionLineItemHt}.billableLineItemId`, lineBillableItemIds)

      .select(select)

      .leftJoin(
        subscriptionLineItemHt,
        `${subscriptionLineItemHt}.subscriptionServiceItemId`,
        `${this.historicalTableName}.originalId`,
      )
      .innerJoin(
        billableServiceHT,
        `${billableServiceHT}.id`,
        `${this.historicalTableName}.billableServiceId`,
      )
      .groupBy([
        `${billableServiceHT}.prorationType`,
        `${this.historicalTableName}.originalId`,
        `${this.historicalTableName}.effectiveDate`,
        `${this.historicalTableName}.price`,
        `${this.historicalTableName}.quantity`,
        `${this.historicalTableName}.serviceFrequencyId`,
      ]);
    return result ?? [];
  }
  // pre-pricing service code:
  // async getItemBySpecificDate({
  //   serviceItemId,
  //   specifiedDate,
  //   fields = ['*'],
  //   withOriginalIds = false,
  // }) {
  //   const frequencyTable = FrequencyRepo.TABLE_NAME;
  //   const selects = [
  //     ...unambiguousSelect(this.historicalTableName, fields),
  //     `${frequencyTable}.times as frequencyTimes`,
  //     `${frequencyTable}.type as frequencyType`,
  //     this.knex.raw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp as effective_date`,
  //     ),
  //   ];
  //   let query = this.knex(this.historicalTableName)
  //     .withSchema(this.schemaName)
  //     .leftJoin(
  //       frequencyTable,
  //       `${this.historicalTableName}.serviceFrequencyId`,
  //       `${frequencyTable}.id`,
  //     )
  //     .where(`${this.historicalTableName}.originalId`, serviceItemId)
  //     .andWhereRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp <= ?`,
  //       [specifiedDate],
  //     )
  //     .orderByRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp desc`,
  //     );
  //   if (withOriginalIds) {
  //     const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
  //     const materialsHT = MaterialRepo.getHistoricalTableName();
  //     const customRatesGroupServiceHT = CustomRatesGroupServicesRepo.getHistoricalTableName();
  //     const globalRateRecurringServicesHT =
  //       GlobalRateRecurringServicesRepo.getHistoricalTableName();
  //     query = query
  //       .innerJoin(
  //         billableServicesHT,
  //         `${this.historicalTableName}.billableServiceId`,
  //         `${billableServicesHT}.id`,
  //       )
  //       .leftJoin(materialsHT, `${this.historicalTableName}.materialId`, `${materialsHT}.id`)
  //       .leftJoin(
  //         customRatesGroupServiceHT,
  //         `${this.historicalTableName}.customRatesGroupServicesId`,
  //         `${customRatesGroupServiceHT}.id`,
  //       )
  //       .leftJoin(
  //         globalRateRecurringServicesHT,
  //         `${globalRateRecurringServicesHT}.id`,
  //         `${this.historicalTableName}.globalRatesRecurringServicesId`,
  //       );
  //     selects.push(
  //       `${billableServicesHT}.originalId as billableServiceOriginalId`,
  //       `${materialsHT}.originalId as materialOriginalId`,
  //       `${globalRateRecurringServicesHT}.originalId as globalRatesRecurringServicesOriginalId`,
  //       `${customRatesGroupServiceHT}.originalId as customRatesGroupServicesOriginalId`,
  //       `${customRatesGroupServiceHT}.customRatesGroupId as customRatesGroupOriginalId`,
  //     );
  //   }
  //   query = query.first(selects);
  //   this.ctxState.logger.debug(
  //     `subsServiceRepo->getItemBySpecificDate->query: ${query.toString()}`,
  //   );
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 26/09/2022
  async getItemBySpecificDate({ serviceItemId, specifiedDate, withOriginalIds = false }) {
    const subsServiceItems = await subscriptionServiceItemsBySpecificDate(this.getCtx(), {
      data: { serviceItemId, specifiedDate },
    });
    if (withOriginalIds) {
      const billableServicesHT = BillableServiceRepo.getHistoricalInstance(this.getCtx(), {
        schemaName: this.ctxState.user.schemaName,
        tableName: BillableServiceRepo.getHistoricalTableName(),
      });
      const materialsHT = MaterialRepo.getHistoricalInstance(this.getCtx(), {
        schemaName: this.ctxState.user.schemaName,
        tableName: MaterialRepo.getHistoricalTableName(),
      });
      const customRatesGroupServiceHT = CustomRatesGroupServicesRepo.getHistoricalInstance(
        this.getCtx(),
        {
          schemaName: this.ctxState.user.schemaName,
          tableName: CustomRatesGroupServicesRepo.getHistoricalTableName(),
        },
      );
      const globalRateRecurringServicesHT = GlobalRateRecurringServicesRepo.getHistoricalInstance(
        this.getCtx(),
        {
          schemaName: this.ctxState.user.schemaName,
          tableName: GlobalRateRecurringServicesRepo.getHistoricalTableName(),
        },
      );

      if (subsServiceItems.billable_service_id) {
        const billableService = await billableServicesHT.getBy({
          condition: { id: subsServiceItems.billable_service_id },
        });
        subsServiceItems.billableServiceOriginalId = billableService.originalId;
        subsServiceItems.billableServiceId = billableService.id;
      }
      if (subsServiceItems.material_id) {
        const material = await materialsHT.getBy({
          condition: { id: subsServiceItems.material_id },
        });
        subsServiceItems.materialOriginalId = material.originalId;
      }
      if (subsServiceItems.custom_rates_group_services_id) {
        const customRatesGroupService = await customRatesGroupServiceHT.getBy({
          condition: { id: subsServiceItems.custom_rates_group_services_id },
        });
        subsServiceItems.customRatesGroupServicesOriginalId = customRatesGroupService.originalId;
        subsServiceItems.customRatesGroupOriginalId = customRatesGroupService.customRatesGroupId;
      }
      if (subsServiceItems.global_rates_recurring_services_id) {
        const globalRateRecurringServices = await globalRateRecurringServicesHT.getBy({
          condition: { id: subsServiceItems.global_rates_recurring_services_id },
        });
        subsServiceItems.globalRatesRecurringServicesOriginalId =
          globalRateRecurringServices.originalId;
      }
    }

    const result = subsServiceItems;
    this.ctxState.logger.debug(result, 'subsServiceRepo->getItemBySpecificDate->result');
    return result;
  }
  // pre-pricing service code
  // async getNextItemBySpecificDate({ serviceItemId, specifiedDate, fields = ['*'] }) {
  //   const query = this.knex(this.historicalTableName)
  //     .withSchema(this.schemaName)
  //     .first([
  //       ...unambiguousSelect(this.historicalTableName, fields),
  //       this.knex.raw(
  //         `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp as effective_date`,
  //       ),
  //     ])
  //     .where(`${this.historicalTableName}.originalId`, serviceItemId)
  //     .andWhereRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp > ?`,
  //       [specifiedDate],
  //     )
  //     .orderByRaw(
  //       `coalesce(${this.historicalTableName}.effective_date, ${this.historicalTableName}.created_at)::timestamp asc`,
  //     );
  //   this.ctxState.logger.debug(
  //     `subsServiceRepo->getNextItemBySpecificDate->query: ${query.toString()}`,
  //   );
  // ToDo: Updated this endpoint to obtain data from pricing backend
  // By: Esteban Navarro | Ticket: PS-339 | Date: 16/09/2022
  // Done | Date: 26/09/2022
  async getNextItemBySpecificDate({ serviceItemId, specifiedDate }) {
    const subsServiceItems = await subscriptionNextServiceItemsBySpecificDate(this.getCtx(), {
      data: { serviceItemId, specifiedDate },
    });

    const result = subsServiceItems;
    this.ctxState.logger.debug(result, 'subsServiceRepo->getNextItemBySpecificDate->result');
    return result;
  }

  async getDetailsForRoutePlanner({ serviceItemId, thirdPartyHaulerId }, ctx) {
    // This is the origil code created by Eleks
    // const subscriptionTable = SubscriptionRepo.TABLE_NAME;
    // const equipmentItemTable = EquipmentItemsRepo.TABLE_NAME;
    // const materialsHT = MaterialRepo.getHistoricalTableName();
    // const jobSiteHT = JobSitesRepo.getHistoricalTableName();
    // const contactsHT = ContactRepo.getHistoricalTableName();
    // const customerHT = CustomersRepo.getHistoricalTableName();
    // const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
    // const serviceAreasHT = ServiceAreaRepo.getHistoricalTableName();

    // const query = trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .select([
    //     `${subscriptionTable}.businessUnitId`,
    //     `${subscriptionTable}.businessLineId`,
    //     `${subscriptionTable}.jobSiteNote`,
    //     `${subscriptionTable}.id as subscriptionId`,
    //     `${subscriptionTable}.jobSiteContactId`,
    //     // serviceItem material, not subscriptionOrder - because we need this
    //     // details exactly of service item here
    //     `${materialsHT}.originalId as materialId`,
    //     `${contactsHT}.originalId as jobSiteContactId`,
    //     `${customerHT}.originalId as customerId`,
    //     `${jobSiteHT}.originalId as jobSiteId`,
    //     `${serviceAreasHT}.originalId as serviceAreaId`,

    // pre-pricing service code:
    //   `${this.tableName}.billableServiceId`,
    //   `${billableServicesHT}.equipmentItemId`,
    //   `${equipmentItemTable}.size as equipmentItemSize`,
    //   `${billableServicesHT}.description as billableServiceDescription`,
    //   `${this.tableName}.id as serviceItemId`,
    // ])
    // .innerJoin(subscriptionTable, `${subscriptionTable}.id`, `${this.tableName}.subscriptionId`)
    // .innerJoin(
    //   billableServicesHT,
    //   ` ${billableServicesHT}.id`,
    //   // serviceItem billableService, not subscriptionOrder - because we need this
    //   // details exactly of service item here
    //   `${this.tableName}.billableServiceId`,
    // )
    // .leftJoin(serviceAreasHT, `${serviceAreasHT}.id`, `${subscriptionTable}.serviceAreaId`)
    // .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${subscriptionTable}.jobSiteId`)
    // .innerJoin(customerHT, `${customerHT}.id`, `${subscriptionTable}.customerId`)
    // .innerJoin(contactsHT, `${contactsHT}.id`, `${subscriptionTable}.jobSiteContactId`)
    // // serviceItem material, not subscriptionOrder - because we need this
    // // details exactly of service item here
    // .leftJoin(materialsHT, `${materialsHT}.id`, `${this.tableName}.materialId`)
    // .leftJoin(
    //   equipmentItemTable,
    //   `${equipmentItemTable}.id`,
    //   `${billableServicesHT}.equipmentItemId`,
    // )
    // .where(`${this.tableName}.id`, serviceItemId)
    // .first();
    //     `${this.tableName}.billableServiceId`,
    //     `${billableServicesHT}.equipmentItemId`,
    //     `${equipmentItemTable}.size as equipmentItemSize`,
    //     `${billableServicesHT}.description as billableServiceDescription`,
    //     `${this.tableName}.id as serviceItemId`,
    //   ])
    //   .innerJoin(subscriptionTable, `${subscriptionTable}.id`, `${this.tableName}.subscriptionId`)
    //   .innerJoin(
    //     billableServicesHT,
    //     ` ${billableServicesHT}.id`,
    //     // serviceItem billableService, not subscriptionOrder - because we need this
    //     // details exactly of service item here
    //     `${this.tableName}.billableServiceId`,
    //   )
    //   .leftJoin(serviceAreasHT, `${serviceAreasHT}.id`, `${subscriptionTable}.serviceAreaId`)
    //   .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${subscriptionTable}.jobSiteId`)
    //   .innerJoin(customerHT, `${customerHT}.id`, `${subscriptionTable}.customerId`)
    //   .innerJoin(contactsHT, `${contactsHT}.id`, `${subscriptionTable}.jobSiteContactId`)
    //   // serviceItem material, not subscriptionOrder - because we need this
    //   // details exactly of service item here
    //   .leftJoin(materialsHT, `${materialsHT}.id`, `${this.tableName}.materialId`)
    //   .leftJoin(equipmentItemTable, `${equipmentItemTable}.id`, `${billableServicesHT}.equipmentItemId`)
    //   .where(`${this.tableName}.id`, serviceItemId)
    //   .first();

    // const item = await query;

    // Get all the information for the new pricing backend
    // const item = await pricingGetSubscriptionOrderDetailsForRoutePlanner(ctx, {
    const item = await pricingGetSubscriptionsDetailsForRoutePlanner(ctx, {
      data: { id: serviceItemId },
    });
    const contact = await ContactRepo.getInstance(this.ctxState).getBy({
      condition: { id: item.jobSiteContactId },
    });

    item.mainPhoneNumber = contact.phoneNumbers?.find(
      phoneNumber => phoneNumber.type === PHONE_TYPE.main,
    )?.number;

    if (thirdPartyHaulerId) {
      const thirdPartyHauler = await ThirdPartyHaulersRepo.getHistoricalInstance(
        this.ctxState,
      ).getById({
        id: thirdPartyHaulerId,
        fields: ['originalId', 'description'],
      });
      item.thirdPartyHaulerId = thirdPartyHauler.originalId;
      item.thirdPartyHaulerDescription = thirdPartyHauler.description;
    }

    return isEmpty(item) ? null : this.mapFields(item);
  }

  async getServiceItemsByIds({ ids }, trx) {
    const subscriptionTable = SubscriptionRepo.TABLE_NAME;
    const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
    const materialHT = MaterialRepo.getHistoricalTableName();
    const globalRateRecurringServicesHT = GlobalRateRecurringServicesRepo.getHistoricalTableName();

    const customRatesGroupServicesHT = CustomRatesGroupServicesRepo.getHistoricalTableName();

    const selects = [
      `${this.tableName}.*`,
      trx.raw('to_json(??.*) as ??', [subscriptionTable, 'subscription']),
      `${billableServicesHT}.originalId as billableServiceOriginalId`,
      `${materialHT}.originalId as materialOriginalId`,
      `${globalRateRecurringServicesHT}.originalId as globalRatesRecurringServicesId`,
      `${customRatesGroupServicesHT}.originalId as customRatesGroupServicesId`,
    ];

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.id`, ids)
      .innerJoin(subscriptionTable, `${this.tableName}.subscriptionId`, `${subscriptionTable}.id`)
      .innerJoin(
        billableServicesHT,
        `${this.tableName}.billableServiceId`,
        `${billableServicesHT}.id`,
      )
      .leftJoin(
        customRatesGroupServicesHT,
        `${this.tableName}.customRatesGroupServicesId`,
        `${customRatesGroupServicesHT}.id`,
      )
      .leftJoin(
        globalRateRecurringServicesHT,
        `${this.tableName}.globalRatesRecurringServicesId`,
        `${globalRateRecurringServicesHT}.id`,
      )
      .leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`)
      .select(selects);

    const items = await query;

    return items?.length ? items : [];
  }

  async getByIdToLog(id, trx = this.knex) {
    const subsServiceItem = await super.getById({ id }, trx);

    return subsServiceItem ? compose(super.mapFields, super.camelCaseKeys)(subsServiceItem) : null;
  }
}

SubscriptionServiceItemRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionServiceItemRepository;
