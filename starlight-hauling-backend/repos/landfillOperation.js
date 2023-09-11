import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import { calculateTaxes } from '../services/orderTaxation.js';
import { calculateSurcharges } from '../services/orderSurcharges.js';
import reCalculateThresholds from '../services/independentOrders/reCalculateThresholds.js';
import { mathRound2 } from '../utils/math.js';
import { unambiguousCondition } from '../utils/dbHelpers.js';
import ApiError from '../errors/ApiError.js';
import { WEIGHT_UNIT } from '../consts/workOrder.js';
import { ORDER_STATUS } from '../consts/orderStatuses.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { LANDFILL_OPERATIONS_SORTING_ATTRIBUTE } from '../consts/loSortingAttributes.js';
import {
  pricingGetPriceOrder,
  pricingUpsertSurcharge,
  pricingAlterOrder,
} from '../services/pricing.js';
import VersionedRepository from './_versioned.js';
import OrderRepo from './order.js';
import DisposalSiteRepo from './disposalSite.js';
import WorkOrderRepo from './workOrder.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import BillableServiceRepo from './billableService.js';
import MaterialRepo from './material.js';
import BusinessUnitRepo from './businessUnit.js';
import MaterialCodeRepo from './materialCode.js';
import TenantRepo from './tenant.js';

const TABLE_NAME = 'landfill_operations';

class LandfillOperationRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        if (obj.customer) {
          obj.customer = CustomerRepo.getInstance(this.ctxState).mapFields(obj.customer);
        }
        if (obj.jobSite) {
          obj.jobSite = JobSiteRepo.getInstance(this.ctxState).mapFields(obj.jobSite);
        }
        if (obj.recyclingFacility) {
          obj.recyclingFacility = DisposalSiteRepo.getInstance(this.ctxState).mapFields(
            obj.recyclingFacility,
          );
        }
        if (obj.landfill) {
          obj.landfill = BusinessUnitRepo.getInstance(this.ctxState).mapFields(obj.landfill);
        }

        if (!obj.mediaFiles?.length) {
          obj.mediaFiles = [];
        }
        const { materials, miscellaneousItems } = obj;
        try {
          if (materials) {
            obj.materials = JSON.parse(materials);
          }
          if (miscellaneousItems) {
            obj.miscellaneousItems = JSON.parse(miscellaneousItems);
          }
        } catch (error) {
          this.ctxState.logger.error(error);
        }

        return obj;
      },
      super.mapNestedObjects.bind(this, ['customer', 'jobSite', 'recyclingFacility']),
      super.mapJoinedFields,
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async populateDataQuery(originalQuery, fields, trx = this.knex, { performSearch = false } = {}) {
    let query = originalQuery;

    performSearch && fields[0] === 'id' && fields.shift();
    const selects = fields.map(field => `${this.tableName}.${field}`);
    performSearch && selects.unshift(trx.raw('distinct(??.id) as id', [this.tableName]));

    const disposalSiteHt = DisposalSiteRepo.getHistoricalTableName();
    let joinedTableColumns = await DisposalSiteRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('recyclingFacility');

    selects.push(...joinedTableColumns);
    query = query
      .innerJoin(disposalSiteHt, `${disposalSiteHt}.id`, `${OrderRepo.TABLE_NAME}.disposalSiteId`)
      .whereNotNull(`${disposalSiteHt}.businessUnitId`);

    joinedTableColumns = await WorkOrderRepo.getInstance(this.ctxState).getColumnsToSelect(
      'workOrder',
    );

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
      WorkOrderRepo.TABLE_NAME,
      `${WorkOrderRepo.TABLE_NAME}.id`,
      `${OrderRepo.TABLE_NAME}.workOrderId`,
    );

    const customerHt = CustomerRepo.getHistoricalTableName();
    joinedTableColumns = await CustomerRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('customer');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(customerHt, `${customerHt}.id`, `${OrderRepo.TABLE_NAME}.customerId`);

    const jobSiteHt = JobSiteRepo.getHistoricalTableName();
    joinedTableColumns = await JobSiteRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('jobSite');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jobSiteHt, `${jobSiteHt}.id`, `${OrderRepo.TABLE_NAME}.jobSiteId`);

    const serviceHt = BillableServiceRepo.getHistoricalTableName();
    joinedTableColumns = await BillableServiceRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('billableService');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(
      serviceHt,
      `${serviceHt}.id`,
      `${OrderRepo.TABLE_NAME}.billableServiceId`,
    );

    const materialHt = MaterialRepo.getHistoricalTableName();
    joinedTableColumns = await MaterialRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getColumnsToSelect('material');

    selects.push(...joinedTableColumns);
    query = query.innerJoin(materialHt, `${materialHt}.id`, `${OrderRepo.TABLE_NAME}.materialId`);

    // edit screen only
    const materialsTn = MaterialRepo.TABLE_NAME;
    joinedTableColumns = await MaterialRepo.getInstance(this.ctxState).getColumnsToSelect(
      'mappedMaterial',
    );

    selects.push(...joinedTableColumns);
    query = query.leftJoin(materialsTn, `${materialsTn}.id`, `${this.tableName}.mappedMaterialId`);

    return { query: query.select(selects) };
  }

  async getAllPopulated(
    {
      condition: { filters } = {},
      skip = 0,
      sortBy = LANDFILL_OPERATIONS_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.asc,
      limit = 25,
    },
    trx = this.knex,
  ) {
    const sortField = this.landfillOperationsSortBy(sortBy);
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .offset(skip)
      .limit(limit)
      .orderBy(sortField, sortOrder);

    query = this.applyFiltersToQuery(query, { ...filters });
    const items = await query;

    if (!items) {
      return [];
    }
    const newItems = await this.getPopulateData(items, { ...filters });

    return newItems?.map(this.mapFields.bind(this)) ?? [];
  }

  // pre-pricing service refactor code:
  // async count({ condition: { filters, searchId, searchQuery } = {} } = {}, trx = this.knex) {
  //   const disposalSiteHt = DisposalSiteRepo.getHistoricalTableName();
  //   const performTextSearch = searchQuery?.length >= 3;

  //   let query = trx(this.tableName)
  //     .withSchema(this.schemaName)
  //     .innerJoin(OrderRepo.TABLE_NAME, `${OrderRepo.TABLE_NAME}.id`, `${this.tableName}.orderId`)
  //     .whereNotNull(`${OrderRepo.TABLE_NAME}.disposalSiteId`)
  //     .innerJoin(disposalSiteHt, `${disposalSiteHt}.id`, `${OrderRepo.TABLE_NAME}.disposalSiteId`)
  //     .whereNotNull(`${disposalSiteHt}.businessUnitId`);

  //   if (searchId) {
  //     query = query.innerJoin(
  //       WorkOrderRepo.TABLE_NAME,
  //       `${WorkOrderRepo.TABLE_NAME}.id`,
  //       `${OrderRepo.TABLE_NAME}.workOrderId`,
  //     );
  //   }
  //   if (performTextSearch) {
  //     const customerHt = CustomerRepo.getHistoricalTableName();
  //     query = query.innerJoin(customerHt, `${customerHt}.id`, `${OrderRepo.TABLE_NAME}.customerId`);
  //   }

  //   query = this.applySearchToQuery(query, { searchId, searchQuery, performTextSearch });
  //   query = this.applyFiltersToQuery(query, { ...filters });

  //   query = performTextSearch
  //     ? query.countDistinct(`${this.tableName}.id`)
  //     : query.count(`${this.tableName}.id`);
  // end of pre-pricing service refactor code
  // added by pricing service refactor
  // eslint-disable-next-line no-unused-vars
  async count({ condition: { filters, searchQuery } = {} } = {}, trx = this.knex) {
    let query = trx(this.tableName).withSchema(this.schemaName);
    query = this.applyFiltersToQuery(query, {});
    const result = await query;
    const newResult = await this.getPopulateData(result, { ...filters });
    return Number(newResult?.length) || 0;
  }
  // end of added by pricing service refactor
  async landfillOperationsCount(
    { condition = {}, skipFilteredTotal = false } = {},
    trx = this.knex,
  ) {
    const { businessUnitId } = condition?.filters ?? {};

    const [total, filteredTotal] = await Promise.all([
      this.count({ condition: { filters: { businessUnitId } } }, trx),
      skipFilteredTotal ? Promise.resolve(undefined) : this.count({ condition }, trx),
    ]);

    return { total, filteredTotal };
  }

  applySearchToQuery(originalQuery, { searchId, searchQuery, performTextSearch }) {
    let query = originalQuery;

    const customerHt = CustomerRepo.getHistoricalTableName();
    const disposalSiteHt = DisposalSiteRepo.getHistoricalTableName();

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
        builder.orWhere(`${this.tableName}.orderId`, searchId);
        builder.orWhere(`${WorkOrderRepo.TABLE_NAME}.woNumber`, searchId);
      }

      if (searchQuery) {
        builder.orWhere(`${this.tableName}.truck`, searchQuery);
        if (searchQuery.includes(',')) {
          builder.orWhere(_builder =>
            _builder.whereIn(
              `${this.tableName}.ticketNumber`,
              searchQuery.split(',').map(tn => tn.trim()),
            ),
          );
        } else {
          builder.orWhere(`${this.tableName}.ticketNumber`, searchQuery);
        }
      }

      if (performTextSearch) {
        builder
          .orWhereRaw('??.name % ?', [customerHt, searchQuery])
          .orderByRaw('??.name <-> ?', [customerHt, searchQuery]);

        builder
          .orWhereRaw('??.description % ?', [disposalSiteHt, searchQuery])
          .orderByRaw('??.description <-> ?', [disposalSiteHt, searchQuery]);
      }

      return builder;
    });

    return query;
  }

  applyFiltersToQuery(
    originalQuery,
    {
      ids,
      filterByDateFrom,
      filterByDateTo,
      filterByNetWeightFrom,
      filterByNetWeightTo,
      filterByTimeInFrom,
      filterByTimeInTo,
      filterByTimeOutFrom,
      filterByTimeOutTo,
    } = {},
  ) {
    let query = originalQuery;

    if (ids?.length) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }

    if (filterByDateFrom) {
      query = query.andWhere(`${this.tableName}.createdAt`, '>=', filterByDateFrom);
    }

    if (filterByDateTo) {
      query = query.andWhere(`${this.tableName}.createdAt`, '<=', filterByDateTo);
    }

    if (typeof filterByNetWeightFrom === 'number') {
      query = query.andWhere(`${this.tableName}.netWeight`, '>=', filterByNetWeightFrom);
    }

    if (typeof filterByNetWeightTo === 'number') {
      query = query.andWhere(`${this.tableName}.netWeight`, '<=', filterByNetWeightTo);
    }

    if (filterByTimeInFrom) {
      query = query.andWhere(`${this.tableName}.timeIn`, '>=', filterByTimeInFrom);
    }

    if (filterByTimeInTo) {
      query = query.andWhere(`${this.tableName}.timeIn`, '<=', filterByTimeInTo);
    }

    if (filterByTimeOutFrom) {
      query = query.andWhere(`${this.tableName}.timeOut`, '>=', filterByTimeOutFrom);
    }

    if (filterByTimeOutTo) {
      query = query.andWhere(`${this.tableName}.timeOut`, '<=', filterByTimeOutTo);
    }

    return query;
  }

  async changeOrderMaterial(
    { data, order, lo },
    { matCodeRepo, orderRepo, woRepo },
    trx = this.knex,
  ) {
    const {
      material,
      disposalSite: { originalId: disposalSiteId },
      businessLine: { id: businessLineId },
      workOrder,
    } = order;
    const { materialCode } = data;

    const mappedMaterial = await matCodeRepo.getByWithMaterial(
      {
        condition: {
          disposalSiteId,
          businessLineId,
          // materialId: data.mappedMaterialId,
          recyclingMaterialCode: materialCode,
        },
        fields: ['id'],
      },
      trx,
    );

    const { material: _material } = mappedMaterial || {};
    // const mappedMaterialId = _material?.id || null;
    const mappedMaterialId = mappedMaterial.material.id || null;
    // nullify in case if map by mat code results nothing
    data.mappedMaterialId = mappedMaterialId;
    // update Hauling Order material & prices
    if (
      mappedMaterialId &&
      (lo ? mappedMaterialId !== lo.mappedMaterialId : true) &&
      material.landfillCanOverride &&
      [ORDER_STATUS.inProgress, ORDER_STATUS.completed, ORDER_STATUS.approved].includes(
        order.status,
      )
    ) {
      const materialUpdated = await orderRepo.changeMaterial(order, mappedMaterialId, trx);

      if (materialUpdated) {
        await woRepo.dispatchUpdates(
          {
            condition: { woNumber: workOrder.woNumber },
            data: {
              haulingMaterialId: mappedMaterialId,
              material: _material?.description,
            },
          },
          trx,
        );
      }

      return materialUpdated ? mappedMaterialId : false;
    }
    return null;
  }

  async mapLoMaterials({ data, order }, { matCodeRepo }, trx = this.knex) {
    const {
      disposalSite: { originalId: disposalSiteId },
      businessLine: { id: businessLineId },
    } = order;

    const { materials } = data;
    const codes = [];

    materials.forEach(item => {
      item.mapped = false;
      item.code && codes.push(item.code);
    });

    if (codes.length) {
      const mappedMaterials = await matCodeRepo.getAllByCodes(
        { condition: { disposalSiteId, businessLineId }, codes },
        trx,
      );

      mappedMaterials?.length &&
        materials?.forEach(item => {
          item.mapped = mappedMaterials.some(
            ({ recyclingMaterialCode }) => item.code === recyclingMaterialCode,
          );
        });
    }

    return JSON.stringify(materials);
  }

  async mapLoMiscMaterials(
    { data, order, mappedMaterialId },
    { matCodeRepo, orderRepo },
    trx = this.knex,
  ) {
    const {
      disposalSite: { originalId: disposalSiteId },
      businessLine: { id: businessLineId },
    } = order;

    const { miscellaneousItems: miscItems } = data;
    let lineItemsUpdated = false;
    const codes = [];

    miscItems.forEach(item => {
      item.mapped = false;
      item.code && codes.push(item.code);
    });

    if (codes.length) {
      const mappedMaterials = await matCodeRepo.getAllByCodes(
        { condition: { disposalSiteId, businessLineId }, codes },
        trx,
      );

      const mappedMiscItems = [];
      mappedMaterials?.length &&
        miscItems.forEach(item => {
          const { code } = item;
          const quantity = Number(item.quantity);

          const mappedItem = mappedMaterials.find(
            ({ recyclingMaterialCode }) => code === recyclingMaterialCode,
          );

          item.mapped = !!mappedItem;
          if (mappedItem) {
            const { billableLineItemId, materialId } = mappedItem;
            billableLineItemId &&
              quantity > 0 &&
              mappedMiscItems.push({
                billableLineItemId,
                materialId,
                quantity,
              });
          }
        });

      lineItemsUpdated = await orderRepo.addMiscLineItems(
        { order, mappedMaterialId, miscLineItems: mappedMiscItems },
        trx,
      );
    }

    return { miscellaneousItems: JSON.stringify(miscItems), lineItemsUpdated };
  }

  // pre-pricing service refactor code:
  // async calculateThresholds({ order, workOrder }, { orderRepo }, trx) {
  //   const { thresholdsTotal } = await reCalculateThresholds(
  //     this.getCtx(),
  //     { order, workOrder },
  //     trx,
  //   );

  //   const updatedOrder = await orderRepo.getBy(
  //     {
  //       condition: { id: order.id },
  //       fields: [
  //         'id',
  //         'workOrderId',
  //         'billableLineItemsTotal',
  //         'beforeTaxesTotal',
  //         'paymentMethod',
  //         'grandTotal',
  //         'onAccountTotal',
  //         'lineItems',
  //         'thresholds',
  //         'billableServiceId',
  //         'materialId',
  //         'billableServiceTotal',
  //         'serviceDate',
  //         'bestTimeToComeFrom',
  //         'bestTimeToComeTo',
  //         'businessLineId',
  //         'taxDistricts',
  //         'applySurcharges',
  //         'billableServicePrice',
  //       ],
  //     },
  // added by pricing service
  async calculateThresholds({ order, workOrder }, trx) {
    const { thresholdsTotal } = await reCalculateThresholds(
      this.getCtx(),
      { order, workOrder },
      trx,
    );
    // const orderRepo = OrderRepo.getInstance(this.ctxState);
    const updatedOrder = await pricingGetPriceOrder(this.getCtx(), { data: { id: order.id } });

    if (!updatedOrder[0]) {
      throw ApiError.unknown('Error while getting order');
    }

    const data = {};

    // TODO: integrate new pricing here below
    const lineItems =
      // pre-pricing service refactor code:
      // updatedOrder.lineItems?.map(item => ({
      updatedOrder[0].lineItems?.map(item => ({
        id: item.id,
        billableLineItemId: item.billableLineItem.originalId,
        globalRatesLineItemsId: item.globalRatesLineItem.originalId,
        customRatesGroupLineItemsId: item?.customRatesGroupLineItem?.originalId,
        materialId: item.material?.originalId ?? item.materialId ?? null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        applySurcharges: item.applySurcharges,
      })) ?? [];

    let surchargesTotal = 0;
    let serviceTotalWithSurcharges = Number(updatedOrder.billableServiceTotal);
    let lineItemsWithSurcharges = lineItems;
    let thresholdsWithSurcharges = updatedOrder.thresholds;
    let orderSurcharges = [];
    // pre-pricing service refactor code:
    // if (updatedOrder.applySurcharges) {
    if (updatedOrder[0].applySurcharges) {
      ({
        surchargesTotal,
        orderSurcharges,
        serviceTotalWithSurcharges,
        lineItemsWithSurcharges,
        thresholdsWithSurcharges,
      } = calculateSurcharges({
        materialId: updatedOrder.material?.originalId,
        billableServiceId: updatedOrder.billableService?.originalId,
        billableServicePrice: updatedOrder.billableServicePrice,
        billableServiceApplySurcharges: updatedOrder.billableService?.applySurcharges,
        lineItems,
        addedSurcharges: updatedOrder.surcharges,
        thresholds: updatedOrder.thresholds,
      }));
    }
    // TODO: integrate new pricing here below

    const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
      condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
      fields: ['region'],
    });

    // TODO: integrate new pricing here below
    const { taxesTotal } = calculateTaxes({
      taxDistricts: order.taxDistricts,
      workOrder,
      region,
      billableServiceId: order.billableService.originalId,
      materialId: order.material.originalId,
      lineItems: lineItemsWithSurcharges,
      thresholds: thresholdsWithSurcharges?.map(threshold => ({
        id: threshold.id,
        thresholdId: threshold.threshold.originalId,
        price: Number(threshold.price),
        quantity: Number(threshold.quantity),
      })),
      serviceTotal: serviceTotalWithSurcharges,
      businessLineId: order.businessLine.id,
      commercial: order.commercialTaxesUsed,
    });

    // let updatedOrderSurcharges = [];
    if (!isEmpty(orderSurcharges)) {
      // updatedOrderSurcharges = await orderRepo.getOrderSurchargeHistoricalIds(orderSurcharges);
      // TODO: pass there billable item ids
      await pricingUpsertSurcharge(this.getCtx(), {
        data: orderSurcharges.map(item => Object.assign(item, { orderId: order.id })),
      });
    }

    data.thresholdsTotal = Number(thresholdsTotal) || 0;
    data.surchargesTotal = Number(surchargesTotal) || 0;

    data.beforeTaxesTotal = mathRound2(
      Number(order.billableServiceTotal) +
        Number(order.billableLineItemsTotal) +
        data.thresholdsTotal,
    );
    data.grandTotal = mathRound2(data.beforeTaxesTotal + data.surchargesTotal + taxesTotal);
    await pricingAlterOrder(this.getCtx(), { data }, order.id);
  }

  async preUpdateOps({ data, lo, order, images, editOnly, log }, trx) {
    const matCodeRepo = MaterialCodeRepo.getInstance(this.ctxState);
    const orderRepo = OrderRepo.getInstance(this.ctxState);
    const woRepo = WorkOrderRepo.getInstance(this.ctxState);

    // auto-mapping material from Recycling on sync
    let materialUpdated = false;
    let mappedMaterialId;

    if (!editOnly && (lo ? lo.mappedMaterialId !== data.mappedMaterialId : true)) {
      mappedMaterialId = await this.changeOrderMaterial(
        { data, order, lo },
        { matCodeRepo, orderRepo, woRepo },
        trx,
      );
      materialUpdated = !!mappedMaterialId;
    }

    // mark materials distribution with mapped flag
    if (data.materials) {
      data.materials = await this.mapLoMaterials({ data, order }, { matCodeRepo }, trx);
    }

    // mark misc materials distribution with mapped flag and auto add line items
    let lineItemsUpdated = false;
    if (data.miscellaneousItems) {
      let miscellaneousItems;
      ({ miscellaneousItems, lineItemsUpdated } = await this.mapLoMiscMaterials(
        { data, order, mappedMaterialId },
        { matCodeRepo, orderRepo },
        trx,
      ));
      data.miscellaneousItems = miscellaneousItems || null;
    }

    const { id: orderId } = order;
    let { workOrder } = order;
    const { mediaFiles, ticketUrl, netWeight } = data;
    if (editOnly) {
      // sync updated weight value or ticket number to Dispatch
      if (
        workOrder &&
        netWeight != null &&
        (lo ? mathRound2(netWeight) !== mathRound2(lo.netWeight) : true)
      ) {
        workOrder = await woRepo.updateBy(
          {
            condition: { id: workOrder.id },
            data: {
              ticket: data.ticketNumber,
              weight: netWeight,
              // truck,
            },
            fields: ['*'],
          },
          trx,
        );
      }
    } else if (
      !lo
        ? true
        : (mediaFiles?.length && mediaFiles?.length !== lo.mediaFiles?.length) ||
          (ticketUrl && ticketUrl !== lo.ticketUrl) ||
          (netWeight != null && mathRound2(netWeight) !== mathRound2(lo.netWeight))
    ) {
      // sync weight ticket & media files to Dispatch
      workOrder = await woRepo.updateWithImages(
        {
          id: workOrder.id,
          mediaFiles:
            images?.map(({ url, filename }) => ({
              url,
              fileName: filename,
              // TODO: extend Recycling images
              author: 'recycling',
            })) ?? null,

          ticket: data.ticketNumber,
          ticketUrl,
          ticketAuthor: data.ticketAuthor,
          ticketDate: data.ticketDate,
          weight: netWeight,
          weightUnit: data.weightUnit,
          // truck,
        },
        trx,
      );
    }
    delete data.ticketAuthor;

    const thresholdsUpdated = await this.addOverweightThreshold(
      {
        data,
        orderId,
        order,
        workOrder,
        lo,
        netWeight,
        editOnly,
        materialUpdated,
        lineItemsUpdated,
      },
      trx,
    );

    if (log && (materialUpdated || lineItemsUpdated || thresholdsUpdated)) {
      orderRepo.log({ id: orderId, action: orderRepo.logAction.modify });
    }

    return data;
  }

  async addOverweightThreshold(
    { data, orderId, order, workOrder, lo, netWeight, editOnly, materialUpdated, lineItemsUpdated },
    trx,
  ) {
    // pre-pricing service refactor code:
    // const orderRepo = OrderRepo.getInstance(this.ctxState);

    const weightUnit = editOnly ? lo.weightUnit : data.weightUnit;
    let thresholdsUpdated = false;
    if (
      workOrder &&
      netWeight != null &&
      weightUnit === WEIGHT_UNIT.tons &&
      (lo ? mathRound2(netWeight) !== mathRound2(lo.netWeight) : true)
    ) {
      thresholdsUpdated = true;
      let _order = order;
      if (materialUpdated || lineItemsUpdated) {
        const getOrderData = await pricingGetPriceOrder(this.getCtx(), { data: { id: orderId } });
        _order = { ...getOrderData[0] };
        if (!_order) {
          throw ApiError.unknown('Error while getting Orders');
        }
      }
      await this.calculateThresholds({ order: _order, workOrder }, trx);
    }
    return thresholdsUpdated;
  }

  async upsertOne({ data: rawData, order, images, log }) {
    const trx = await this.knex.transaction();

    let item;
    let lo;
    try {
      const { id: orderId } = order;
      // landfill operation is absent when sync first time
      lo = await super.getBy({ condition: { orderId } }, trx);

      const data = await this.preUpdateOps(
        { data: rawData, lo, order, images, editOnly: false, log },
        trx,
      );
      item = await super.upsert(
        {
          constraints: ['order_id'],
          data,
          fields: ['id'],
        },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: item.id, action: lo ? this.logAction.modify : this.logAction.create });

    return item;
  }

  async updateOne({ condition: { id }, data: rawData, concurrentData, log }) {
    const trx = await this.knex.transaction();
    let item;
    let logId;
    try {
      const lo = await super.getBy({ condition: { orderId: id } }, trx);

      const { orderId, ticketUrl, ticketDate } = lo;
      // pre-pricing service refactor code:
      // const order = await OrderRepo.getInstance(this.ctxState).getBy(
      //   { condition: { id: orderId } },
      //   trx,
      // );
      // added by pricing service
      const getOrder = await pricingGetPriceOrder(this.getCtx(), { data: { id: orderId } });
      const order = { ...getOrder[0] };
      // end added by pricing service
      if (!order) {
        throw ApiError.unknown('Error while getting Orders');
      }
      const data = await this.preUpdateOps(
        {
          data: { ...rawData, ticketUrl, ticketDate },
          lo,
          order,
          editOnly: true,
          log,
        },
        trx,
      );
      item = await super.updateBy(
        {
          condition: { id: lo.id },
          data,
          concurrentData,
          fields: ['id'],
        },
        trx,
      );
      logId = lo.id;

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: logId, action: this.logAction.modify });

    return item;
  }

  async getBy({ condition } = {}, trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .orderBy(`${this.tableName}.id`)
      .first();

    const item = await query;
    const newItems = await this.getPopulateData([item], { businessUnitId: null });
    const response = newItems ? this.mapFields(newItems[0]) : null;
    return response;
  }

  async getByOrderId({ orderId } = {}, trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where('orderId', orderId)
      .orderBy(`${this.tableName}.id`)
      .first();

    const item = await query;

    return item;
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy({ condition: { id }, fields: ['*'] }, trx);

    return item || null;
  }

  // eslint-disable-next-line require-await
  async getPopulateData(items, { businessUnitId }) {
    const response = [];
    // leave comment here

    // const response = items.filter(async (landfill) => {
    if (items) {
      for await (const landfill of items) {
        const filter = { id: landfill.orderId };
        if (businessUnitId) {
          filter.businessUnitId = businessUnitId;
        }
        if (!filter.id) {
          return null;
        }
        const order = await pricingGetPriceOrder(this.getCtx(), { data: { ...filter } });

        if (!order[0]) {
          return null;
        }
        if (!order[0].disposalSiteId || !order[0].disposalSite.active) {
          return null;
        }

        const site = await DisposalSiteRepo.getInstance(this.ctxState).getBy({
          condition: { id: order[0].disposalSite.originalId },
        });
        response.push({
          ...landfill,
          ...order[0],
          mappedMaterialId: order[0].material.id,
          recyclingFacility: site,
          purchaseOrder: order[0].purchaseOrder.poNumber,
        });
      }
    }

    return response;
  }

  landfillOperationsSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      date: `${this.tableName}.createdAt`,
      ticket: `${this.tableName}.ticketNumber`,
      order: `${this.tableName}.orderId`,
      truck: `${this.tableName}.truck`,
      timeIn: `${this.tableName}.timeIn`,
      timeOut: `${this.tableName}.timeOut`,
      netWeight: `${this.tableName}.netWeight`,
      facility: `${DisposalSiteRepo.getHistoricalTableName()}.description`,
      customer: `${CustomerRepo.getHistoricalTableName()}.name`,
      woNumber: `${WorkOrderRepo.TABLE_NAME}.id`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

LandfillOperationRepository.TABLE_NAME = TABLE_NAME;

export default LandfillOperationRepository;
