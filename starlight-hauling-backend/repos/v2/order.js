/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable eqeqeq, no-constant-binary-expression */
import EventEmitter from 'events';

import pick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import flow from 'lodash/flow.js';
import compact from 'lodash/compact.js';
import groupBy from 'lodash/groupBy.js';
import differenceWith from 'lodash/differenceWith.js';
import omit from 'lodash/fp/omit.js';

import BaseRepository from '../_base.js';
import VersionedRepository from '../_versioned.js';
import CustomerJobSitePairRepo from '../customerJobSitePair.js';
import ManifestItemRepo from '../manifestItems.js';
import IndependentWorkOrderRepository from '../independentWorkOrder.js';
import CustomerRepo from '../customer.js';
import JobSiteRepo from '../jobSite.js';
import ProjectRepo from '../project.js';
import BillableLineItemRepo from '../billableLineItem.js';
import BillableServiceRepo from '../billableService.js';
import BillableSurchargeRepo from '../billableSurcharge.js';
import EquipmentItemRepo from '../equipmentItem.js';
import OrderTaxDistrictRepo from '../orderTaxDistrict.js';
import MediaFileRepo from '../mediaFile.js';
import CustomerTaxExemptionsRepo from '../customerTaxExemptions.js';
import BusinessUnitRepo from '../businessUnit.js';
import BusinessLineRepo from '../businessLine.js';
import MaterialRepo from '../material.js';
import DisposalSiteRepo from '../disposalSite.js';
import GlobalRatesServiceRepo from '../globalRatesService.js';
import CustomGroupRatesServiceRepo from '../customRatesGroupService.js';
import RecurrentOrderTemplateRepo from '../recurrentOrderTemplate.js';
import RecurrentOrderTemplateOrderRepo from '../recurrentOrderTemplateOrder.js';
import OrderTaxDistrictTaxesRepo from '../orderTaxDistrictTaxes.js';
import PreInvoicedOrderDraftRepo from '../preInvoicedOrderDraft.js';
import PricesRepo from '../prices.js';
import PermitRepo from '../permit.js';
import PurchaseOrderRepo from '../purchaseOrder.js';
import ContactRepo from '../contact.js';
import IndependentWorkOrderMediaRepo from '../independentWorkOrderMedia.js';
import GlobalRatesLineItemRepo from '../globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from '../customRatesGroupLineItem.js';
import LandfillOperationRepo from '../landfillOperation.js';
import TenantRepo from '../tenant.js';

import { calculateTaxes } from '../../services/orderTaxation.js';
import { calculateSurcharges } from '../../services/v2/orderSurcharges.js';
import { calcRates } from '../../services/v2/orderRates.js';
import { publishers } from '../../services/routePlanner/publishers.js';
import { getCansData } from '../../services/dispatch.js';
import calculatePrices from '../../services/pricesCalculation/order/calculatePrices.js';
import { cancelIndependentOrder } from '../../services/independentOrders/cancelIndependentOrder.js';
import getMissingWorkOrderFields from '../../services/independentOrders/utils/getMissingWorkOrderFields.js';
import reCalculateThresholds from '../../services/independentOrders/reCalculateThresholds.js';
import getWorkOrderDataToEditOrder from '../../services/independentOrders/getWorkOrderDataToEditOrder.js';

import { camelCaseKeys, unambiguousCondition } from '../../utils/dbHelpers.js';
import { mathRound2 } from '../../utils/math.js';
import isNilOrNaN from '../../utils/isNilOrNumeric.js';
import { prefixKeyWithRefactored } from '../../utils/priceRefactoring.js';

import ApiError from '../../errors/ApiError.js';

import fieldToLinkedTableMap from '../../consts/fieldToLinkedTableMap.js';
import {
  nonLinkedFields as nonLinkedInputFields,
  linkedFields as linkedInputFields,
  recurrentTemplateFields,
} from '../../consts/orderFields.js';
import { BUSINESS_UNIT_TYPE } from '../../consts/businessUnitTypes.js';
import { ORDER_STATUS, ORDER_STATUSES } from '../../consts/orderStatuses.js';
import { SORT_ORDER } from '../../consts/sortOrders.js';
import { WO_STATUS, WEIGHT_UNIT } from '../../consts/workOrder.js';
import { LINE_ITEM_TYPE } from '../../consts/lineItemTypes.js';
import { NO_PAYMENT, PAYMENT_METHOD } from '../../consts/paymentMethods.js';
import { ORDER_SORTING_ATTRIBUTE } from '../../consts/orderSortingAttributes.js';
import { ACTION, ONE_TIME_ACTION } from '../../consts/actions.js';
import { INDEPENDENT_WO_STATUS } from '../../consts/independentWorkOrder.js';
import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import { OPEN_ORDER_SORTING_ATTRIBUTE } from '../../consts/jobSiteSortingAttributes.js';
import { ORDER_REQUEST_STATUS } from '../../consts/orderRequestStatuses.js';
import { GENERATED_ORDERS_SORTING_ATTRIBUTE } from '../../consts/generatedOrdersSortingAttributes.js';
import { pricingGetThreshold } from '../../services/pricing.js';
import OrderRequestRepo from './orderRequest.js';
import SurchargeItemRepo from './orderSurcharge.js';
import WorkOrderRepo from './workOrder.js';
import ThresholdItemRepo from './thresholdItem.js';
import LineItemRepo from './lineItem.js';

const TABLE_NAME = 'orders';

const getNonLinkedInputFields = pick(nonLinkedInputFields);
const getLinkedInputFields = pick(linkedInputFields);
const getSpecificFieldsFromRecurrentTemplate = pick(recurrentTemplateFields);

const fieldsForBilling = ['id', 'business_line_id'];

const hasWorkOrder = ({ billableServiceId, thirdPartyHaulerId }) =>
  !!(billableServiceId && !thirdPartyHaulerId);

class OrderRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return flow(
      obj => {
        if (obj.customer) {
          obj.customer = CustomerRepo.getInstance(this.ctxState).mapFields(obj.customer);
        }
        if (obj.jobSite) {
          obj.jobSite = JobSiteRepo.getInstance(this.ctxState).mapFields(obj.jobSite);
        }
        if (obj.jobSiteTwo) {
          obj.jobSite2 = obj.jobSiteTwo;
          delete obj.jobSiteTwo;
        }
        if (obj.jobSite2) {
          obj.jobSite2 = JobSiteRepo.getInstance(this.ctxState).mapFields(obj.jobSite2);
        }
        if (obj.disposalSite) {
          obj.disposalSite = DisposalSiteRepo.getInstance(this.ctxState).mapFields(
            obj.disposalSite,
          );
        }

        if (obj.workOrder) {
          obj.deferred = !obj.workOrder?.woNumber;

          const { mediaFiles } = obj.workOrder;
          obj.workOrder.mediaFiles = []; // FE defect
          if (mediaFiles?.[0] == null) {
            obj.workOrder.mediaFiles = [];
          } else if (!isEmpty(mediaFiles)) {
            obj.workOrder.mediaFiles = mediaFiles?.map(camelCaseKeys) ?? [];
          }
        }

        if (obj.independentWorkOrder) {
          obj.workOrder = camelCaseKeys(obj.independentWorkOrder);
          delete obj.independentWorkOrder;
          const { mediaFiles } = obj.workOrder;
          obj.workOrder.mediaFiles = []; // FE defect

          if (mediaFiles?.[0] == null) {
            obj.workOrder.mediaFiles = [];
          } else if (!isEmpty(mediaFiles)) {
            obj.workOrder.mediaFiles = mediaFiles?.map(camelCaseKeys) ?? [];
          }
        }

        return obj;
      },
      super.mapNestedObjects.bind(this, [
        'lineItems',
        'thresholds',
        'thresholdItems',
        'bbox',
        'mixedPaymentMethods',
        'taxDistricts',
        'businessConfiguration',

        'customer',
        'jobSite',
        'jobSite2',
        'disposalSite',
      ]),
      super.mapJoinedFields,
      camelCaseKeys,
      super.mapFields,
      super.mapFieldsWithPrefixRefactored,
    )(originalObj);
  }

  async createOne({ data, tenantId, linkedCjsPair, businessUnit } = {}) {
    data.status = ORDER_STATUS.completed;

    if ((hasWorkOrder(data) || data.deferredPayment) && !data.recycling) {
      data.status = ORDER_STATUS.inProgress;
    }

    const { payments, orderRequestId, customerId, jobSiteId, businessLineId } = data;
    const { customer } = linkedCjsPair;

    let insertData;
    let order;
    let workOrder;
    let lineItemIds;
    let independentWorkOrder;
    let defaultFacilityJobSiteId;

    const updData = {};
    const trx = await this.knex.transaction();

    try {
      if (data.recycling) {
        const defaultRecyclingData = await this.getRecyclingDefaultData(
          {
            condition: {
              businessLineId,
              jobSiteId: data.jobSiteId,
              isWalkupCustomer: customer.walkup,
            },
            businessUnit,
          },
          trx,
        );

        Object.assign(data, defaultRecyclingData);

        if (
          data.recycling &&
          businessUnit.type !== BUSINESS_UNIT_TYPE.recyclingFacility &&
          data.thresholds?.length
        ) {
          throw ApiError.badRequest('Thresholds are allowed only for recycling facility');
        }

        if (defaultRecyclingData.jobSiteId) {
          defaultFacilityJobSiteId = defaultRecyclingData.jobSiteId;
        }
      }

      if (linkedCjsPair) {
        data.customerJobSiteId = linkedCjsPair.id;
      }

      insertData = await this.prepHistoricalAndComputedFields(data, null, trx);

      if (linkedCjsPair) {
        insertData.taxDistricts = linkedCjsPair.taxDistricts;
      }

      if (data.popupNote) {
        insertData.jobSiteNote = data.popupNote;
      }

      insertData.isRollOff = false;

      let woRepo;
      let woData;

      const checkRollOffOrder = await BusinessLineRepo.getInstance(this.ctxState).isRollOff(
        businessLineId,
        trx,
      );

      const woEe = new EventEmitter();
      if (checkRollOffOrder) {
        woRepo = WorkOrderRepo.getInstance(this.ctxState);
        insertData.isRollOff = true;

        // Create work order conditionally
        woData = {
          ...insertData,
          tenantId,
          signatureRequired: data.signatureRequired,
          customerOriginalId: data.customerId,
          businessUnitId: data.businessUnitId,
        };

        let newMediaFiles = [];
        if (data.orderRequestMediaUrls?.length) {
          const orderRequest = await OrderRequestRepo.getInstance(this.ctxState).getBy({
            condition: { id: orderRequestId },
            fields: ['createdAt'],
          });

          newMediaFiles = data.orderRequestMediaUrls.map(url => ({
            url,
            author: customer.name,
            timestamp: orderRequest.createdAt,
            fileName: url.split('/').reverse()[0],
          }));
        }
        if (data.workOrder?.mediaFiles?.length) {
          newMediaFiles = newMediaFiles.concat(data.workOrder.mediaFiles);
        }
        woData.mediaUrls = newMediaFiles?.map(({ url }) => url) ?? [];
        if (data.deferredPayment) {
          // TODO: complement cia extending WO table
          workOrder = await woRepo.createDeferredOne(
            {
              data: woData,
              fields: ['id'],
            },
            trx,
          );
        } else if (hasWorkOrder(data)) {
          workOrder = await woRepo.createOne(
            {
              data: woData,
              newMediaFiles,
              fields: ['id'],
            },
            trx,
            woEe,
          );
        }

        if (workOrder) {
          insertData.workOrderId = workOrder.id;
        }
      } else {
        woRepo = IndependentWorkOrderRepository.getInstance(this.ctxState);
      }

      const { lineItems, taxDistricts, thresholds } = insertData;
      delete insertData.lineItems;
      delete insertData.taxDistricts;
      delete insertData.thresholds;

      const {
        creditCardId,
        businessUnitId,
        customerJobSiteId,
        applySurcharges,
        applyTaxes = true,
      } = data;

      let notExemptedDistricts = taxDistricts;

      if (!isEmpty(taxDistricts)) {
        const exemptedTaxDistricts = await CustomerTaxExemptionsRepo.getInstance(
          this.ctxState,
        ).getExemptedDistricts(
          {
            customerId: data.customerId,
            customerJobSiteId: linkedCjsPair.id,
            taxDistrictIds: map(taxDistricts, 'id'),
          },
          trx,
        );

        notExemptedDistricts = notExemptedDistricts.filter(
          ({ id }) => !exemptedTaxDistricts.includes(id),
        );
      }

      const ordersSurcharges = {};
      data.needRecalculatePrice = true;
      data.needRecalculateSurcharges = true;
      data.price = data.billableServicePrice;
      data.lineItems?.length &&
        data.lineItems.forEach(item => {
          item.needRecalculatePrice = true;
          item.needRecalculateSurcharges = true;
        });
      data.thresholds?.length &&
        data.lineItems.forEach(item => {
          item.needRecalculatePrice = true;
          item.needRecalculateSurcharges = true;
        });
      data.quantity = 1;

      // TODO: move all pre-calculations into controller or better service
      const {
        summary: {
          servicesTotal,
          lineItemsTotal,
          thresholdsTotal,
          total,
          surchargesTotal,
          grandTotal,
        },
        prices: [{ price: billableServicePrice }],
      } = await calculatePrices(this.getCtx(), {
        businessUnitId,
        businessLineId,
        customerId,
        jobSiteId,
        customerJobSiteId,
        applySurcharges,
        applyTaxes,
        orders: [data],
        ordersSurcharges, // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
      });

      // TODO: rename this fields after release:
      insertData.refactoredPriceId = data.priceId;
      insertData.refactoredPriceGroupId = data.priceGroupHistoricalId;
      insertData.refactoredBillableServicePrice = billableServicePrice;
      insertData.refactoredOverrideServicePrice = data.unlockOverrides;
      insertData.refactoredOverriddenServicePrice = data.unlockOverrides
        ? billableServicePrice
        : null;
      insertData.refactoredBillableServiceTotal = servicesTotal;
      insertData.refactoredBillableLineItemsTotal = lineItemsTotal;
      insertData.refactoredThresholdsTotal = thresholdsTotal;
      insertData.refactoredSurchargesTotal = surchargesTotal;
      insertData.refactoredBeforeTaxesTotal = total;
      insertData.refactoredGrandTotal = grandTotal;
      insertData.refactoredInitialGrandTotal = grandTotal;
      insertData.refactoredOnAccountTotal = grandTotal;

      const onAccountPayment = payments.find(
        payment => payment.paymentMethod === PAYMENT_METHOD.onAccount,
      );

      if (payments.length === 1 && onAccountPayment) {
        insertData.refactoredOnAccountTotal = insertData.refactoredGrandTotal;
      } else if (payments.length > 1) {
        insertData.paymentMethod = PAYMENT_METHOD.mixed;
        insertData.mixedPaymentMethods = payments.map(({ paymentMethod }) => paymentMethod);
      }

      insertData.createdBy = this.userId;

      if (data.oneTimePurchaseOrderNumber) {
        const { id } = await PurchaseOrderRepo.getInstance(this.ctxState).softUpsert(
          {
            data: {
              customerId,
              poNumber: data.oneTimePurchaseOrderNumber,
              isOneTime: true,
              active: true,
            },
          },
          trx,
        );

        insertData.purchaseOrderId = id;
      }

      this.ctxState.logger.debug(
        `orderRepo->createOne->insertData: ${JSON.stringify(insertData, null, 2)}`,
      );

      // Create order and set IDs to latest historical records.
      order = await super.createOne(
        { data: insertData, fields: ['id', 'refactoredGrandTotal', 'purchaseOrderId'] },
        trx,
      );

      this.ctxState.logger.debug(`orderRepo->createOne->order: ${JSON.stringify(order, null, 2)}`);

      if (!insertData.isRollOff && businessUnit.type !== BUSINESS_UNIT_TYPE.recyclingFacility) {
        // Create work order conditionally
        woData = {
          ...omit(['earlyPick', 'isRollOff'])(insertData),
          ...pick(['alleyPlacement', 'signatureRequired'])(data),
          tenantId,
          customerOriginalId: data.customerId,
          businessUnitId: data.businessUnitId,
          orderId: order.id,
          route: data.route,
        };
        if (data.deferredPayment) {
          workOrder = await woRepo.createDeferredOne(
            {
              data: woData,
              fields: ['id'],
            },
            trx,
          );
        } else if (data.billableServiceId) {
          workOrder = await woRepo.createOne(
            {
              data: woData,
              fields: ['id', 'woNumber'],
            },
            trx,
            woEe,
          );
        }
      }

      const { id: orderId } = order;
      if (workOrder) {
        if (checkRollOffOrder) {
          updData.workOrderId = workOrder.id;
        } else {
          updData.independentWorkOrderId = workOrder.id;
          woData.woNumber = workOrder.woNumber;
        }
        await super.updateBy(
          {
            condition: { id: orderId },
            data: updData,
          },
          trx,
        );
      }
      // Create order line items.
      if (!isEmpty(lineItems)) {
        const items = await LineItemRepo.getInstance(this.ctxState).insertMany(
          {
            data: lineItems.map(item =>
              Object.assign(omit(['priceId', 'price'])(item), {
                orderId,
                refactoredPriceId: item.priceId,
                refactoredPrice: item.price,
              }),
            ),
            fields: ['id'],
          },
          trx,
        );
        lineItemIds = map(items, 'id');
      }

      if (!isEmpty(notExemptedDistricts)) {
        await OrderTaxDistrictRepo.getInstance(this.ctxState).insertWithNonHistoricalIds(
          {
            orderId,
            taxDistrictIds: map(notExemptedDistricts, 'id'),
          },
          trx,
        );
      }

      if (!isEmpty(ordersSurcharges[orderId])) {
        const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          ordersSurcharges[orderId],
          { update: false },
          trx,
        );

        // TODO: pass there billable item ids
        await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
          {
            data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
            fields: ['id'],
          },
          trx,
        );
      }

      if (!isEmpty(thresholds)) {
        await ThresholdItemRepo.getInstance(this.ctxState).insertMany(
          {
            data: thresholds?.length
              ? thresholds.map(item =>
                  Object.assign(omit(['priceId', 'price'])(item), {
                    orderId,
                    refactoredPriceId: item.priceId,
                    refactoredPrice: item.price,
                  }),
                )
              : [],
            fields: ['id'],
          },
          trx,
        );
      }

      if (orderRequestId) {
        await OrderRequestRepo.getInstance(this.ctxState).markAsConfirmed(
          orderRequestId,
          orderId,
          trx,
        );
      }

      Object.assign(insertData, {
        lineItems,
        taxDistricts: notExemptedDistricts,
        creditCardId,
        customerJobSite: {
          ...omit(['customer', 'jobSite', 'taxDistricts', 'purchaseOrders'])(linkedCjsPair),
          customerId: linkedCjsPair.customer.id,
          jobSiteId: linkedCjsPair.jobSite.id,
        },
      });

      if (order.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
          {
            id: order.purchaseOrderId,
            applicationLevel: LEVEL_APPLIED.order,
          },
          trx,
        );
      }

      await trx.commit();

      if (!checkRollOffOrder && workOrder) {
        independentWorkOrder = {
          ...woData,
          status: INDEPENDENT_WO_STATUS.scheduled,
          independentWorkOrderId: updData.independentWorkOrderId,
          preferredRoute: data.route,
        };
      }

      workOrder?.id && woEe?.emit(`work-order-create-${workOrder.id}`);
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return order
      ? {
          insertData,
          id: order.id,
          refactoredGrandTotal: order.refactoredGrandTotal,
          workOrderId: updData.workOrderId?.id,
          lineItemIds,
          independentWorkOrder,
          defaultFacilityJobSiteId,
        }
      : null;
  }

  async getRecyclingDefaultData(
    { condition: { businessLineId, jobSiteId, isWalkupCustomer }, businessUnit },
    trx,
  ) {
    const equipmentItem = await EquipmentItemRepo.getInstance(this.ctxState).getBy(
      {
        condition: {
          businessLineId,
          recyclingDefault: true,
        },
      },
      trx,
    );

    if (!equipmentItem) {
      throw ApiError.notFound('Default recycling equipment not found');
    }

    const defaultData = {
      equipmentItemId: equipmentItem.id,
    };

    if (isWalkupCustomer) {
      defaultData.status = ORDER_STATUS.finalized;
    }

    if (!jobSiteId && businessUnit?.jobSiteId) {
      defaultData.jobSiteId = businessUnit.jobSiteId;
    }

    return defaultData;
  }

  async createOneFromRecurrentOrderTemplate({ data, tenantId, recurrentOrderTemplateId } = {}) {
    data.status = hasWorkOrder(data) ? ORDER_STATUS.inProgress : ORDER_STATUS.completed;

    const insertData = {
      ...getNonLinkedInputFields(data),
      ...getLinkedInputFields(data),
      ...getSpecificFieldsFromRecurrentTemplate(data),
    };

    insertData.isRollOff = true;

    let order;
    let workOrder;
    let lineItemIds;
    const trx = await this.knex.transaction();

    try {
      const [{ id: pairHistoricalId }, linkedPair, roTemplate] = await Promise.all([
        CustomerJobSitePairRepo.getHistoricalInstance(this.ctxState, {
          schemaName: this.schemaName,
        }).getRecentBy(
          {
            condition: {
              originalId: data.customerJobSiteId,
            },
            fields: ['id'],
          },
          trx,
        ),
        CustomerJobSitePairRepo.getInstance(this.ctxState).getBy(
          { condition: { id: data.customerJobSiteId } },
          trx,
        ),
        RecurrentOrderTemplateRepo.getInstance(this.ctxState).getBy(
          {
            condition: { id: recurrentOrderTemplateId },
            fields: [
              'id',
              'alleyPlacement',
              'cabOver',
              'signatureRequired',
              'billableServiceId',
              'equipmentItemId',
              'materialId',
              'lineItems',
              'customRatesGroupId',
            ],
          },
          trx,
        ),
      ]);

      insertData.customerJobSiteId = pairHistoricalId;
      insertData.taxDistricts = linkedPair?.taxDistricts;

      // Create work order conditionally
      const woEe = new EventEmitter();
      const woRepo = WorkOrderRepo.getInstance(this.ctxState);
      const pairBooleans = {
        alleyPlacement: roTemplate?.alleyPlacement,
        cabOver: roTemplate?.cabOver,
        signatureRequired: roTemplate?.signatureRequired,
      };

      if (data.createDeferredWorkOrder && hasWorkOrder(data)) {
        workOrder = await woRepo.createDeferredOne(
          {
            data: { ...insertData, ...pairBooleans },
            fields: ['id'],
          },
          trx,
        );
      } else if (hasWorkOrder(data)) {
        workOrder = await woRepo.createOne(
          {
            data: {
              ...insertData,
              ...pairBooleans,
              tenantId,
            },
            fields: ['id'],
          },
          trx,
          woEe,
        );
      }

      if (workOrder) {
        insertData.workOrderId = workOrder.id;
      }

      const { lineItems, taxDistricts } = insertData;
      delete insertData.lineItems;
      delete insertData.taxDistricts;

      let notExemptedDistricts = taxDistricts;
      if (!isEmpty(linkedPair) ?? !isEmpty(taxDistricts)) {
        const exemptedTaxDistricts = await CustomerTaxExemptionsRepo.getInstance(
          this.ctxState,
        ).getExemptedDistricts(
          {
            customerId: data.customerId,
            customerJobSiteId: linkedPair.id,
            taxDistrictIds: map(taxDistricts, 'id'),
          },
          trx,
        );

        notExemptedDistricts = notExemptedDistricts.filter(
          ({ id }) => !exemptedTaxDistricts.includes(id),
        );
      }

      let surchargesTotal = 0;
      let serviceTotalWithSurcharges = insertData.billableServiceTotal;

      let orderSurcharges = [];

      const {
        material,
        billableService,
        customRatesGroup,
        lineItems: roLineItems = [],
      } = roTemplate;

      let lineItemsWithSurcharges = roLineItems.map(lineItem => ({
        ...lineItem,
        price: Number(lineItem.price),
        quantity: Number(lineItem.quantity),
        billableLineItemId: lineItem.billableLineItem?.originalId,
        globalRatesLineItemsId: lineItem.globalRatesLineItem?.originalId,
        customRatesGroupLineItemsId: lineItem.customRatesGroupLineItem?.originalId,
        materialId: lineItem.material?.originalId,
        applySurcharges: lineItem.applySurcharges,
      }));

      if (data.applySurcharges) {
        const surcharges = await BillableSurchargeRepo.getInstance(this.ctxState).getAll(
          {
            condition: { active: true, businessLineId: data.businessLineId },
          },
          trx,
        );

        const { customRates, globalRates } = await calcRates(
          this.ctxState,
          {
            businessUnitId: data.businessUnitId,
            businessLineId: data.businessLineId,
            customRatesGroupId: customRatesGroup?.originalId,
            type: customRatesGroup ? 'custom' : 'global',
          },
          trx,
        );

        ({ surchargesTotal, serviceTotalWithSurcharges, lineItemsWithSurcharges, orderSurcharges } =
          calculateSurcharges({
            globalRatesSurcharges: globalRates?.globalRatesSurcharges,
            customRatesSurcharges: customRates?.customRatesSurcharges,
            materialId: material?.originalId ?? null,
            billableServiceId: billableService?.originalId ?? null,
            billableServicePrice: data.billableServicePrice,
            billableServiceApplySurcharges: billableService?.applySurcharges,
            lineItems: lineItemsWithSurcharges,
            addedSurcharges: data.surcharges,
            surcharges,
            thresholds: data.thresholds,
          }));
      }

      const { region } = await TenantRepo.getInstance(this.ctxState).getBy(
        {
          condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
          fields: ['region'],
        },
        trx,
      );

      const { taxesTotal } = calculateTaxes({
        taxDistricts: notExemptedDistricts,
        workOrder,
        region,
        lineItems: lineItemsWithSurcharges,
        billableServiceId: billableService?.originalId ?? null,
        materialId: material?.originalId ?? null,
        serviceTotal: serviceTotalWithSurcharges,
        businessLineId: insertData.businessLineId,
        commercial: insertData.commercialTaxesUsed,
      });

      insertData.grandTotal = mathRound2(
        insertData.beforeTaxesTotal + surchargesTotal + taxesTotal,
      );
      insertData.initialGrandTotal = insertData.grandTotal;
      insertData.onAccountTotal = insertData.grandTotal;
      insertData.paymentMethod = PAYMENT_METHOD.onAccount;
      insertData.surchargesTotal = Number(surchargesTotal) || 0;
      insertData.draft = data.createDeferredWorkOrder;

      insertData.createdBy = this.userId;

      // Create order and set IDs to latest historical records.
      order = await super.createOne({ data: insertData, fields: ['id', 'grandTotal'] }, trx);

      const { id: orderId } = order;
      // Create order line items.
      if (!isEmpty(lineItems)) {
        lineItems.forEach(item => {
          delete item.id;
          delete item.recurrentOrderTemplateId;
        });

        const items = await LineItemRepo.getInstance(this.ctxState).insertMany(
          {
            data: lineItems.map(item => Object.assign(item, { orderId })),
            fields: ['id'],
          },
          trx,
        );
        lineItemIds = map(items, 'id');
      }

      let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          orderSurcharges,
          { update: false },
          trx,
        );
      }
      // TODO: pass there billable item ids
      await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
        {
          data: updatedOrderSurcharges,
          condition: { orderId },
          fields: [],
        },
        trx,
      );

      await RecurrentOrderTemplateOrderRepo.getInstance(this.ctxState).createOne(
        { data: { orderId, recurrentOrderTemplateId } },
        trx,
      );

      if (!isEmpty(notExemptedDistricts)) {
        await OrderTaxDistrictRepo.getInstance(this.ctxState).insertWithNonHistoricalIds(
          {
            orderId,
            taxDistrictIds: map(notExemptedDistricts, 'id'),
          },
          trx,
        );
      }

      Object.assign(insertData, {
        lineItems,
        taxDistricts: notExemptedDistricts,
        customerJobSite: linkedPair,
      });

      await trx.commit();

      workOrder?.id && woEe?.emit(`work-order-create-${workOrder.id}`);
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return order
      ? {
          insertData,
          id: order.id,
          grandTotal: Number(order.grandTotal),
          workOrderId: workOrder?.id,
          lineItemIds,
        }
      : null;
  }

  async prepHistoricalAndComputedFields(data, orderId, trx = this.knex) {
    const result = getNonLinkedInputFields(data);
    const linkedFields = getLinkedInputFields(data);

    const update = !!orderId;
    const historicalLinkedFields = await super.getLinkedHistoricalIds(
      linkedFields,
      {
        update,
        entityId: orderId,
        entityRepo: this,
      },
      trx,
    );

    Object.assign(result, historicalLinkedFields);

    result.lineItems = [];
    result.billableLineItemsTotal = 0;
    if (data.lineItems?.length) {
      const { lineItems, billableLineItemsTotal } = await this.getLineItemHistoricalIds(
        data.lineItems,
        { update },
        trx,
      );

      result.lineItems = lineItems;
      result.billableLineItemsTotal = billableLineItemsTotal;
    }

    if (data.newManifestItems?.length) {
      const { manifestItems } = await this.getManifestItemsHistoricalIds(
        data.newManifestItems,
        trx,
      );

      result.newManifestItems = manifestItems;
    }

    result.thresholdsTotal = 0;
    if (!update && data.thresholds?.length) {
      const { thresholds, thresholdsTotal } = await this.getThresholdHistoricalIds(
        data.thresholds,
        super.getLinkedHistoricalIds.bind(this),
        trx,
      );

      result.thresholds = thresholds;
      result.thresholdsTotal = thresholdsTotal;
    }

    result.billableServiceTotal = Number(data.billableServicePrice || 0);
    result.beforeTaxesTotal = mathRound2(
      result.billableServiceTotal + result.billableLineItemsTotal + result.thresholdsTotal,
    );
    result.onAccountTotal = data.onAccountTotal;

    result.status = ORDER_STATUS[data.status];

    return result;
  }

  async getOrderSurchargeHistoricalIds(orderSurcharges, { update = false } = {}, trx = this.knex) {
    const surchargeArray = orderSurcharges ? Array.from({ length: orderSurcharges.length }) : [];
    const entityRepo = SurchargeItemRepo.getInstance(this.ctxState);

    if (!isEmpty(orderSurcharges)) {
      const pickIds = pick([
        'surchargeId',
        'materialId',
        'billableServiceId',
        'billableLineItemId',
        'thresholdId',
      ]);
      await Promise.all(
        orderSurcharges.map(async (item, i) => {
          const updatedItem = await super.getLinkedHistoricalIds(
            pickIds(item),
            {
              update: !!(update && item?.id),
              entityId: item?.id,
              entityRepo,
            },
            trx,
          );

          surchargeArray[i] = { ...item, ...updatedItem };
        }, this),
      );
    }

    return surchargeArray;
  }

  async getLineItemHistoricalIds(lineItems, { update = false } = {}, trx = this.knex) {
    const lineItemArray = lineItems ? Array.from({ length: lineItems.length }) : [];
    let billableLineItemsTotal = 0;
    const entityRepo = LineItemRepo.getInstance(this.ctxState);

    if (!isEmpty(lineItems)) {
      const pickIds = pick(
        ['billableLineItemId', 'materialId', 'priceId'].map(prefixKeyWithRefactored),
      );
      await Promise.all(
        lineItems.map(async (item, i) => {
          billableLineItemsTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          const updatedItem = await super.getLinkedHistoricalIds(
            pickIds(item),
            {
              update: !!(update && item?.id),
              entityId: item?.id,
              entityRepo,
            },
            trx,
          );

          lineItemArray[i] = { ...item, ...updatedItem };
        }, this),
      );
    }

    return { lineItems: lineItemArray, billableLineItemsTotal };
  }

  async getManifestItemsHistoricalIds(manifestItems, trx = this.knex) {
    const manifestsArray = manifestItems ? Array.from({ length: manifestItems.length }) : [];
    const materialRepo = MaterialRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    });

    if (!isEmpty(manifestItems)) {
      await Promise.all(
        manifestItems.map(async (item, i) => {
          const historicalMaterial = await materialRepo.getRecentBy(
            {
              condition: { originalId: item.materialId },
            },
            trx,
          );

          manifestsArray[i] = { ...item, materialId: historicalMaterial.id };
        }, this),
      );
    }

    return { manifestItems: manifestsArray };
  }

  async getBy(
    {
      condition,
      fields = [
        'id',
        'businessUnitId',
        'businessLineId',
        'workOrderId',
        'independentWorkOrderId',
        'serviceDate',
        'status',
        'jobSiteId',
        'jobSite2Id',
        'customerId',
        'billableServiceId',
        'equipmentItemId',
        'materialId',
        'createdAt',
        'updatedAt',
        'csrEmail',
        'projectId',
        'driverInstructions',
        'invoiceNotes',
        'purchaseOrderId',

        'billableServicePrice',
        'billableServiceTotal',
        'billableLineItemsTotal',
        'disposalSiteId',
        'thirdPartyHaulerId',
        'jobSiteNote',
        'promoId',

        'cancellationReasonType',
        'cancellationComment',
        'unapprovedComment',
        'unfinalizedComment',
        'rescheduleComment',

        'lineItems',
        'thresholds',
        'manifestItems',
        'thresholdsTotal',

        'taxDistricts',
        'callOnWayPhoneNumber',
        'callOnWayPhoneNumberId',
        'textOnWayPhoneNumber',
        'textOnWayPhoneNumberId',

        'paymentMethod',
        'applySurcharges',
        'surchargesTotal',
        'commercialTaxesUsed',

        'priceId',
        'priceGroupId',

        'billableServicePrice',
        'billableServiceTotal',
        'billableLineItemsTotal',
        'initialGrandTotal',
        'thresholdsTotal',
        'surchargesTotal',
        'beforeTaxesTotal',
        'grandTotal',
      ].map(prefixKeyWithRefactored), // TODO: remove after refactoring
    } = {},
    trx = this.knex,
  ) {
    const { id, businessUnitId, businessLineId, woNumber, draft = false } = condition;

    let bindings = [];
    if (id) {
      bindings = [this.tableName, 'id', id];
    } else if (woNumber) {
      bindings = [WorkOrderRepo.TABLE_NAME, 'woNumber', woNumber];
    }

    let { query } = await this.populateDataQuery(fields, trx, { includeDrafts: draft });

    query = query.whereRaw('??.?? = ?', bindings).first();

    if (businessUnitId) {
      query = query.andWhere(`${this.tableName}.businessUnitId`, businessUnitId);
    }
    if (businessLineId) {
      query = query.andWhere(`${this.tableName}.businessLineId`, businessLineId);
    }

    // TODO: solve asap! it's workaround to query WO by number since it could be duplicated
    query = query.orderBy(`${this.tableName}.id`, SORT_ORDER.desc);
    // this.ctxState.logger.debug(`getOrderById->query: ${query.toString()}`);
    const result = await query;
    if (isEmpty(result)) {
      return null;
    }

    const mapFields = this.mapFields.bind(this);
    const order = mapFields(result);

    // + fields: ['lineItems'] - fetch populated line items
    if (fields.includes('lineItems')) {
      order.lineItems = await LineItemRepo.getInstance(this.ctxState).populateLineItemsByOrderIds(
        [order.id],
        trx,
      );
    }

    // + fields: ['thresholds'] - fetch populated threshold items
    if (fields.includes('thresholds')) {
      order.thresholds = await ThresholdItemRepo.getInstance(
        this.ctxState,
      ).populateThresholdItemsByOrderIds([order.id], trx);
    }

    // + fields: ['manifestItems'] - fetch populated threshold items
    if (fields.includes('manifestItems') && order.workOrder) {
      order.manifestItems = await ManifestItemRepo.getInstance(
        this.ctxState,
      ).populateManifestItemsByWorkOrderId(order.workOrder.id, trx);
    }

    if (fields.includes('taxDistricts')) {
      const taxDistricts = await OrderTaxDistrictRepo.getInstance(this.ctxState).getByOrderId(
        order.id,
        trx,
      );

      order.taxDistricts = isEmpty(taxDistricts) ? undefined : taxDistricts.map(mapFields);
    }

    if (fields.includes('applySurcharges') && order.applySurcharges) {
      const surcharges = await SurchargeItemRepo.getInstance(
        this.ctxState,
      ).populateSurchargesByOrderId(order.id, trx);

      order.surcharges = isEmpty(surcharges) ? undefined : surcharges.map(mapFields);
    }

    // + fields: ['workOrderId'] - fetch media fields since too expensive on large dataset
    if (fields.includes('workOrderId') && order.workOrder) {
      order.workOrder.mediaFiles =
        (await MediaFileRepo.getInstance(this.ctxState).getAll(
          { condition: { workOrderId: order.workOrder.id } },
          trx,
        )) || [];
    }
    if (fields.includes('isRollOff') && order.workOrder && !order.isRollOff) {
      order.workOrder.mediaFiles =
        (await IndependentWorkOrderMediaRepo.getInstance(this.ctxState).getAll(
          { condition: { independentWorkOrderId: order.workOrder.id } },
          trx,
        )) || [];
    }

    return order;
  }

  static getOrderGridFields() {
    return [
      'id',
      'businessUnitId',
      'businessLineId',
      'workOrderId',
      'independentWorkOrderId',
      'serviceDate',
      'status',
      'jobSiteId',
      'customerId',
      'billableServiceId',
      'createdAt',
      'csrEmail',
      'materialId',
      'equipmentItemId',
      'driverInstructions',
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
      'taxDistricts',
      'paymentMethod',
      'serviceAreaId',
      'isRollOff',
      'purchaseOrderId',
      'landfillOperationId',

      'grandTotal',
    ].map(prefixKeyWithRefactored); // TODO: remove after refactoring
  }

  getAllPrepaidByIds(ids, fields = ['*']) {
    const customersHT = CustomerRepo.getHistoricalTableName(CustomerRepo.TABLE_NAME);
    const selects = fields.map(field => `${this.tableName}.${field}`);

    selects.push(`${customersHT}.originalId as customerOriginalId`);

    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(customersHT, `${this.tableName}.customerId`, `${customersHT}.id`)
      .where(builder =>
        builder.where('paymentMethod', '!=', PAYMENT_METHOD.onAccount).orWhereNull('paymentMethod'),
      )
      .whereIn(`${this.tableName}.id`, ids)
      .select(selects);
  }

  async getAllPaginated(
    {
      condition: {
        status,
        csrEmail,
        ids,
        businessUnitId,
        filters,
        searchId,
        searchQuery,
        ...condition
      } = {},
      skip = 0,
      limit = 25,
      sortBy = ORDER_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.desc,
      fields = OrderRepository.getOrderGridFields(),
    } = {},
    trx = this.knex,
  ) {
    let { query } = await this.populateDataQuery(fields, trx, {
      performSearch: searchId || searchQuery?.length >= 3,
    });

    const performTextSearch = searchQuery?.length >= 3;
    if (filters?.filterByBroker || performTextSearch) {
      query.leftJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.getHistoricalTableName()}.originalId`,
        `${CustomerRepo.TABLE_NAME}.id`,
      );
    }

    if (filters?.filterByService) {
      query.leftJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.getHistoricalTableName()}.originalId`,
        `${BillableServiceRepo.TABLE_NAME}.id`,
      );
    }

    if (searchQuery && (!fields.includes('*') || !fields.includes('permitId'))) {
      query.leftJoin(
        PermitRepo.getHistoricalTableName(),
        `${PermitRepo.getHistoricalTableName()}.id`,
        `${this.tableName}.permitId`,
      );
    }

    if (csrEmail) {
      query = query.andWhere({ csrEmail });
    }

    query = query.limit(limit).offset(skip);

    query = this.applySearchToQuery(query, {
      searchId,
      searchQuery,
      performTextSearch,
      fields,
    });
    query = this.applyFiltersToQuery(query, { status, ids, businessUnitId, ...filters });

    if (!isEmpty(condition)) {
      query = query.andWhere(unambiguousCondition(this.tableName, condition));
    }
    const sortField = this.ordersSortBy(sortBy);
    query = query.orderBy(sortField, sortOrder);

    const items = await query;

    if (isEmpty(items)) {
      return [];
    }

    const taxDistricts = await OrderTaxDistrictRepo.getInstance(
      this.ctxState,
    ).getDescriptionsByOrderIds(map(items, 'id'), trx);

    if (taxDistricts) {
      items.forEach(order => {
        order.taxDistricts = taxDistricts[order.id];
      });
    }

    const mappedItems = items?.map(this.mapFields.bind(this)) ?? [];

    // + fields: ['workOrderId'] - count media files
    if (mappedItems?.length && fields.includes('workOrderId')) {
      const mediaRepo = MediaFileRepo.getInstance(this.ctxState);
      const independentOrderMediaRepo = IndependentWorkOrderMediaRepo.getInstance(this.ctxState);

      await Promise.all(
        mappedItems.map(async ({ workOrder, isRollOff }) => {
          if (workOrder?.id) {
            if (isRollOff) {
              workOrder.mediaFilesCount = await mediaRepo.count(
                { condition: { workOrderId: workOrder.id } },
                trx,
              );
            } else {
              workOrder.mediaFilesCount = await independentOrderMediaRepo.count(
                { condition: { independentWorkOrderId: workOrder.id } },
                trx,
              );
            }
          }
        }),
      );
    }
    return mappedItems;
  }

  async getAllPaginatedByCustomerJobSitePair(
    {
      condition: { status, customerId, jobSiteId, projectId } = {},
      skip = 0,
      limit = 25,
      fields = [
        'id',
        'workOrderId',
        'serviceDate',
        'status',
        'billableServiceId',
        'materialId',
        'businessUnitId',
        'businessLineId',
        'independentWorkOrderId',
        'isRollOff',

        'grandTotal',
      ].map(prefixKeyWithRefactored), // TODO: remove after refactoring
      sortBy = OPEN_ORDER_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.desc,
    } = {},
    trx = this.knex,
  ) {
    const customersHT = CustomerRepo.getHistoricalTableName();
    const jobSitesHT = JobSiteRepo.getHistoricalTableName();

    let { query } = await this.populateDataQuery(fields, trx);
    query = query
      .whereIn('orders.status', status)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .innerJoin(jobSitesHT, `${jobSitesHT}.id`, `${this.tableName}.jobSiteId`)
      .andWhere({
        [`${customersHT}.originalId`]: customerId,
        [`${jobSitesHT}.originalId`]: jobSiteId,
      });

    if (projectId) {
      const projectsHT = ProjectRepo.getHistoricalTableName();
      query = query
        .leftJoin(projectsHT, `${projectsHT}.id`, `${this.tableName}.projectId`)
        .andWhere(`${projectsHT}.originalId`, projectId);
    }

    query = query.limit(limit).offset(skip);

    const sortField = this.customerJobSitePairSortBy(sortBy, sortOrder);
    const items = await query.orderByRaw(`${sortField} ${sortOrder} nulls last`);

    const mappedItems = items?.map(this.mapFields.bind(this)) ?? [];

    // + fields: ['workOrderId'] - count media files
    if (mappedItems?.length && fields.includes('workOrderId')) {
      const mediaRepo = MediaFileRepo.getInstance(this.ctxState);
      const independentOrderMediaRepo = IndependentWorkOrderMediaRepo.getInstance(this.ctxState);

      await Promise.all(
        mappedItems.map(async ({ workOrder, isRollOff }) => {
          if (workOrder?.id) {
            if (isRollOff) {
              workOrder.mediaFilesCount = await mediaRepo.count(
                { condition: { workOrderId: workOrder.id } },
                trx,
              );
            } else {
              workOrder.mediaFilesCount = await independentOrderMediaRepo.count(
                { condition: { independentWorkOrderId: workOrder.id } },
                trx,
              );
            }
          }
        }),
      );
    }
    return mappedItems;
  }

  async getAllPaginatedByRecurrentOrderTemplate({
    condition: { recurrentOrderTemplateId } = {},
    skip = 0,
    limit = 25,
    sortBy = GENERATED_ORDERS_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    fields = [
      'id',
      'workOrderId',
      'serviceDate',
      'status',
      'billableServiceId',
      'materialId',
      'businessUnitId',
      'businessLineId',

      'grandTotal',
    ].map(prefixKeyWithRefactored), // TODO: remove after refactoring
  } = {}) {
    let { query } = await this.populateDataQuery(fields);
    query = query.limit(limit).offset(skip);
    if (fields.includes('serviceDate')) {
      query = query.orderBy(sortBy, sortOrder);
    }

    query.whereIn(
      `${this.tableName}.id`,
      this.knex(RecurrentOrderTemplateOrderRepo.TABLE_NAME)
        .withSchema(this.schemaName)
        .where({ recurrentOrderTemplateId })
        .select(['orderId']),
    );

    const items = await query.orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this));
  }

  async populateDataQuery(
    fields,
    trx = this.knex,
    { pullSelects = false, includeDrafts = false, performSearch = false } = {},
  ) {
    let query = trx(this.tableName).withSchema(this.schemaName).where({ draft: includeDrafts });

    const linkedFields = [];
    // TODO: remove mapping after refactoring
    const nonLinkedFields = [
      'callOnWayPhoneNumberId',
      'textOnWayPhoneNumberId',
      'purchaseOrderId',
      'priceId',
      'priceGroupId',
    ].map(prefixKeyWithRefactored);
    const fieldsToExclude = [
      'lineItems',
      'thresholds',
      'manifestItems',
      'taxDistricts',
      'workOrderId',
      'independentWorkOrderId',
      'businessUnitId',
      'businessLineId',
      'orderRequestId',
      'callOnWayPhoneNumberId',
      'textOnWayPhoneNumberId',
      'landfillOperationId',
      'purchaseOrderId',
      'priceId',
      'priceGroupId',
    ].map(prefixKeyWithRefactored); // TODO: remove after refactoring

    let bothContactsJoinCase = false;
    if (fields.includes('jobSiteContactId') && fields.includes('orderContactId')) {
      bothContactsJoinCase = true;
      fieldsToExclude.push('jobSiteContactId', 'orderContactId');
    }

    let bothJobSitesJoinCase = false;
    if (fields.includes('jobSiteId') && fields.includes('jobSite2Id')) {
      bothJobSitesJoinCase = true;
      fieldsToExclude.push('jobSiteId', 'jobSite2Id');
    }

    fields
      .filter(field => !fieldsToExclude.includes(field))
      .forEach(field =>
        field.endsWith('Id') ? linkedFields.push(field) : nonLinkedFields.push(field),
      );

    performSearch && fields[0] === 'id' && fields.shift();
    const selects = nonLinkedFields.map(field => `${this.tableName}.${field}`);
    performSearch && selects.unshift(trx.raw('distinct(??.id)', [this.tableName]));

    for (const field of linkedFields) {
      const jtName = BaseRepository.getHistoricalTableName(fieldToLinkedTableMap[field]);
      const alias = field.slice(0, -2);

      const joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias,
        tableName: jtName,
        schemaName: this.schemaName,
      });

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.${field}`);
    }

    if (fields.includes('businessUnitId')) {
      const jtName = BusinessUnitRepo.TABLE_NAME;
      const joinedTableColumns = await BusinessUnitRepo.getInstance(
        this.ctxState,
      ).getColumnsToSelect('businessUnit');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.businessUnitId`);
    }

    if (fields.includes('businessLineId')) {
      const jtName = BusinessLineRepo.TABLE_NAME;
      const joinedTableColumns = await BusinessLineRepo.getInstance(
        this.ctxState,
      ).getColumnsToSelect('businessLine');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.businessLineId`);
    }

    if (fields.includes('workOrderId')) {
      const woTable = WorkOrderRepo.TABLE_NAME;
      const joinedTableColumns = await WorkOrderRepo.getInstance(this.ctxState).getColumnsToSelect(
        'workOrder',
      );

      selects.push(...joinedTableColumns);
      query = query.leftJoin(woTable, `${woTable}.id`, `${this.tableName}.workOrderId`);
    }

    if (fields.includes('independentWorkOrderId')) {
      const indepWoTable = IndependentWorkOrderRepository.TABLE_NAME;
      const joinedTableColumns = await IndependentWorkOrderRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('independentWorkOrder');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(
        indepWoTable,
        `${indepWoTable}.id`,
        `${this.tableName}.independentWorkOrderId`,
      );
    }

    if (fields.includes('orderRequestId')) {
      const jtName = OrderRequestRepo.TABLE_NAME;
      const joinedTableColumns = await OrderRequestRepo.getInstance(
        this.ctxState,
      ).getColumnsToSelect('orderRequest');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.orderRequestId`);
    }

    if (fields.includes('purchaseOrderId')) {
      const jtName = PurchaseOrderRepo.TABLE_NAME;
      const joinedTableColumns = await PurchaseOrderRepo.getInstance(
        this.ctxState,
      ).getColumnsToSelect('purchaseOrder');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.purchaseOrderId`);
    }

    if (fields.includes('refactoredPriceId')) {
      const pricesJTName = PricesRepo.TABLE_NAME;
      const joinedPricesTableColumns = await PricesRepo.getInstance(
        this.ctxState,
      ).getColumnsToSelect('price');

      selects.push(...joinedPricesTableColumns);
      query = query.leftJoin(
        pricesJTName,
        `${pricesJTName}.id`,
        `${this.tableName}.refactoredPriceId`,
      );
    }

    if (bothContactsJoinCase) {
      const contactsHt = ContactRepo.getHistoricalTableName();
      let alias = 'jsc';
      let joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias: 'jobSiteContact',
        tableName: contactsHt,
        schemaName: this.schemaName,
        tnPrefix: alias,
      });
      selects.push(...joinedTableColumns);

      const jsSelects = await BaseRepository.getInstance(this.ctxState).getColumns({
        tableName: contactsHt,
      });
      query = query.joinRaw(
        `
                    left join (
                        select ${jsSelects.join(',')} from "${this.schemaName}"."${contactsHt}"
                    ) as "${alias}"
                        on "${alias}".id = "${this.tableName}".job_site_contact_id
                `,
      );

      alias = 'oc';
      joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias: 'orderContact',
        tableName: contactsHt,
        schemaName: this.schemaName,
        tnPrefix: alias,
      });
      selects.push(...joinedTableColumns);

      query = query.joinRaw(
        `
                    left join (
                        select ${jsSelects.join(',')} from "${this.schemaName}"."${contactsHt}"
                    ) as "${alias}"
                        on "${alias}".id = "${this.tableName}".order_contact_id
                `,
      );
    }

    if (bothJobSitesJoinCase) {
      const jobSitesHt = JobSiteRepo.getHistoricalTableName();
      let alias = 'jsone';
      let joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias: 'jobSite',
        tableName: jobSitesHt,
        schemaName: this.schemaName,
        tnPrefix: alias,
      });
      selects.push(...joinedTableColumns);

      const jsSelects = await BaseRepository.getInstance(this.ctxState).getColumns({
        tableName: jobSitesHt,
      });
      query = query.joinRaw(
        `
                    left join (
                        select ${jsSelects.join(',')} from "${this.schemaName}"."${jobSitesHt}"
                    ) as "${alias}"
                        on "${alias}".id = "${this.tableName}".job_site_id
                `,
      );

      alias = 'jstwo';
      joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias: 'jobSiteTwo',
        tableName: jobSitesHt,
        schemaName: this.schemaName,
        tnPrefix: alias,
      });
      selects.push(...joinedTableColumns);

      query = query.joinRaw(
        `
                    left join (
                        select ${jsSelects.join(',')} from "${this.schemaName}"."${jobSitesHt}"
                    ) as "${alias}"
                        on "${alias}".id = "${this.tableName}".job_site_2_id
                `,
      );
    }

    if (fields.includes('landfillOperationId')) {
      const jtName = LandfillOperationRepo.TABLE_NAME;
      selects.push(`${jtName}.id as landfillOperationId`);
      query = query.leftJoin(jtName, `${jtName}.orderId`, `${this.tableName}.id`);
    }

    return pullSelects ? { query, selects } : { query: query.select(...selects) };
  }

  async ordersCount({
    condition: { customerId, businessUnitId, filters, searchQuery, searchId, ...condition } = {},
  } = {}) {
    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .andWhere({ draft: false });

    const performTextSearch = searchQuery?.length >= 3;
    if (
      customerId ||
      filters?.filterByBroker ||
      filters?.filterByPaymentTerms ||
      performTextSearch
    ) {
      const customersHT = CustomerRepo.getHistoricalTableName();

      query = query.leftJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`);

      if (customerId) {
        query = query.andWhere(`${customersHT}.originalId`, customerId);
      }

      if (filters?.filterByBroker || performTextSearch) {
        query.leftJoin(
          CustomerRepo.TABLE_NAME,
          `${CustomerRepo.getHistoricalTableName()}.originalId`,
          `${CustomerRepo.TABLE_NAME}.id`,
        );
      }
    }

    if (filters?.filterByService) {
      const servicesHT = BillableServiceRepo.getHistoricalTableName();

      query.leftJoin(servicesHT, `${servicesHT}.id`, `${this.tableName}.billableServiceId`);

      if (filters?.filterByService) {
        query = query.leftJoin(
          BillableServiceRepo.TABLE_NAME,
          `${servicesHT}.originalId`,
          `${BillableServiceRepo.TABLE_NAME}.id`,
        );
      }
    }

    if (filters?.filterByMaterials) {
      query = query.leftJoin(
        MaterialRepo.getHistoricalTableName(),
        `${MaterialRepo.getHistoricalTableName()}.id`,
        `${this.tableName}.materialId`,
      );
    }

    if (searchId || filters?.filterByWeightTicket != undefined) {
      query.leftJoin(
        WorkOrderRepo.TABLE_NAME,
        `${WorkOrderRepo.TABLE_NAME}.id`,
        `${this.tableName}.workOrderId`,
      );
    }

    if (searchQuery) {
      query = query.leftJoin(
        PermitRepo.getHistoricalTableName(),
        `${PermitRepo.getHistoricalTableName()}.id`,
        `${this.tableName}.permitId`,
      );
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery, performTextSearch });
    query = this.applyFiltersToQuery(query, { ...filters, businessUnitId });

    query = performTextSearch
      ? query.countDistinct(`${this.tableName}.id`)
      : query.count(`${this.tableName}.id`);

    const result = await query;

    return Number(result?.[0]?.count) || 0;
  }

  async count({ condition = {}, skipFilteredTotal = false } = {}) {
    // TODO: rewrite using group by with rollup
    const [total, filteredTotal, ...countByStatus] = await Promise.all([
      this.ordersCount({ condition: { ...condition, filters: {} } }),
      skipFilteredTotal ? Promise.resolve(undefined) : this.ordersCount({ condition }),
      ...ORDER_STATUSES.map(
        status => this.ordersCount({ condition: { ...condition, status } }),
        this,
      ),
    ]);

    return {
      total,
      filteredTotal,
      statuses: ORDER_STATUSES.reduce(
        (obj, status, i) => Object.assign(obj, { [status]: countByStatus[i] }),
        {},
      ),
    };
  }

  async updateOne(
    {
      condition: { id, status },
      data: rawData,
      prevServiceId = -1,
      fields = [],
      concurrentData,
      log,
    } = {},
    trx,
  ) {
    let order;
    const _trx = trx || (await this.knex.transaction());

    if ('billableServiceId' in rawData && rawData.billableServiceId !== prevServiceId) {
      rawData.equipmentItemId = (
        await BillableServiceRepo.getInstance(this.ctxState).getById(
          {
            id: rawData.billableServiceId,
            fields: ['equipmentItemId'],
          },
          _trx,
        )
      )?.equipmentItemId;
    }

    const data = await this.prepHistoricalAndComputedFields(rawData, id, _trx);

    const {
      businessUnitId,
      businessLineId,
      materialId,
      billableServiceId,
      billableServiceApplySurcharges,
      billableServicePrice,
      workOrder,
      thresholds = [],
      manifestItems = [],
    } = rawData;

    // Re-calculate thresholds sum since they are passed as [id, thresholdId, price, quantity].
    if (thresholds?.length) {
      data.thresholdsTotal = mathRound2(
        thresholds.reduce((sum, { price, quantity }) => sum + price * quantity, 0),
      );
      data.beforeTaxesTotal = mathRound2(data.beforeTaxesTotal + data.thresholdsTotal);
    }

    try {
      const { lineItems = [] } = data;
      delete data.lineItems;

      let surchargesTotal = 0;
      let serviceTotalWithSurcharges = data.billableServiceTotal;
      let lineItemsWithSurcharges = rawData.lineItems;
      let thresholdsWithSurcharges = rawData.thresholds;

      let orderSurcharges = [];

      if (rawData.applySurcharges) {
        const surcharges = await BillableSurchargeRepo.getInstance(this.ctxState).getAll(
          { condition: { active: true, businessLineId } },
          trx,
        );

        // TODO: get rid of old pricing
        const { customRates, globalRates } = await calcRates(
          this.ctxState,
          {
            businessUnitId,
            businessLineId,
            customRatesGroupId: rawData.customRatesGroupId,
            type: rawData.customRatesGroupId ? 'custom' : 'global',
          },
          trx,
        );

        // TODO: get rid of old pricing
        ({
          surchargesTotal,
          serviceTotalWithSurcharges,
          lineItemsWithSurcharges,
          thresholdsWithSurcharges,
          orderSurcharges,
        } = calculateSurcharges({
          globalRatesSurcharges: globalRates?.globalRatesSurcharges,
          customRatesSurcharges: customRates?.customRatesSurcharges,
          materialId,
          billableServiceId,
          billableServicePrice,
          billableServiceApplySurcharges,
          lineItems: rawData.lineItems,
          addedSurcharges: rawData.surcharges,
          surcharges,
          thresholds: rawData.thresholds,
        }));
      }

      const [taxDistricts, { region }] = await Promise.all([
        OrderTaxDistrictRepo.getInstance(this.ctxState).getByOrderId(id, _trx),
        TenantRepo.getInstance(this.ctxState).getBy({
          condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
          fields: ['region'],
        }),
      ]);

      // TODO: get rid of old pricing
      const { taxesTotal } = calculateTaxes({
        taxDistricts,
        workOrder,
        region,
        billableServiceId,
        materialId,
        thresholds: thresholdsWithSurcharges?.map(threshold => ({
          id: threshold.id,
          thresholdId: threshold.threshold.originalId,
          price: Number(threshold.price),
          quantity: Number(threshold.quantity),
        })),

        lineItems: lineItemsWithSurcharges,
        serviceTotal: serviceTotalWithSurcharges,
        businessLineId: data.businessLineId ?? data.businessLine?.id,
        commercial: data.commercialTaxesUsed,
      });

      thresholds.forEach(threshold => {
        delete threshold.thresholdId;
        delete threshold.threshold;
      });

      // TODO: get rid of old pricing
      data.surchargesTotal = Number(surchargesTotal) || 0;
      data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);

      if (data.paymentMethod === PAYMENT_METHOD.onAccount) {
        data.onAccountTotal = data.grandTotal;
      }

      const condition = { id };
      status && (condition.status = status);

      const oldOrder = await this.getById(
        {
          id,
          fields: ['purchaseOrderId', 'customerId'],
        },
        _trx,
      );

      if (rawData.oneTimePurchaseOrderNumber && oldOrder.customerId) {
        const { originalId: customerOriginalId } = await CustomerRepo.getInstance(
          this.ctxState,
        ).getHistoricalRecordById({ id: oldOrder.customerId, fields: ['originalId'] }, trx);

        const { id: purchaseOrderId } = await PurchaseOrderRepo.getInstance(
          this.ctxState,
        ).softUpsert(
          {
            data: {
              customerId: customerOriginalId,
              poNumber: rawData.oneTimePurchaseOrderNumber,
              isOneTime: true,
              active: true,
            },
          },
          trx,
        );

        data.purchaseOrderId = purchaseOrderId;
      }

      const { newManifestItems = [] } = data;
      delete data.newManifestItems;

      // update main order-related fields only
      order = await super.updateBy(
        {
          condition,
          data,
          fields: ['id', 'independentWorkOrderId', 'isRollOff', 'purchaseOrderId'].concat(fields),
          concurrentData,
        },
        _trx,
      );

      if (order) {
        const orderId = id;
        await Promise.all([
          LineItemRepo.getInstance(this.ctxState).upsertItems(
            {
              data: lineItems?.length ? lineItems : [],
              condition: { orderId },
              fields: [],
            },
            _trx,
          ),
          ThresholdItemRepo.getInstance(this.ctxState).upsertItems(
            {
              data: thresholds?.length ? thresholds : [],
              condition: { orderId },
              fields: [],
            },
            _trx,
          ),
        ]);

        if (workOrder) {
          const { manifestFiles = [], woNumber } = workOrder;
          delete workOrder.manifestFiles;

          if (woNumber && order.isRollOff) {
            // override WO-related fields if WO exists
            await WorkOrderRepo.getInstance(this.ctxState).updateWithImages(workOrder, _trx);
          }

          const manifestsRepo = ManifestItemRepo.getInstance(this.ctxState);
          // just delete missing
          await manifestsRepo.filterOut(
            {
              data: manifestItems,
              orderId,
            },
            _trx,
          );

          if (newManifestItems.length) {
            await manifestsRepo.insertMany(
              {
                data: newManifestItems.map(
                  (
                    {
                      workOrderId,
                      // eslint-disable-next-line no-shadow
                      materialId,
                      manifestNumber,
                      quantity,
                      unitType,
                    },
                    index,
                  ) => ({
                    workOrderId,
                    materialId,
                    manifestNumber,
                    quantity,
                    unitType: unitType.endsWith('s') ? unitType : `${unitType}s`,
                    url: manifestFiles[index].url,
                    csrName: manifestFiles[index].csrName,
                    dispatchId: null,
                  }),
                ),
              },
              _trx,
            );
          }

          if (order.independentWorkOrderId) {
            await IndependentWorkOrderRepository.getInstance(this.ctxState).updateOne(
              {
                condition: {
                  id: order.independentWorkOrderId,
                },
                data: workOrder,
              },
              _trx,
            );
          }
        }

        if (!isEmpty(orderSurcharges)) {
          const updatedSurcharges = await this.getOrderSurchargeHistoricalIds(
            orderSurcharges,
            { update: false },
            _trx,
          );

          // TODO: pass there billable item ids
          await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
            {
              data: updatedSurcharges,
              condition: { orderId },
              fields: [],
            },
            _trx,
          );
        }
      }

      if (oldOrder.purchaseOrderId !== order.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState)
          .checkIfShouldRemoveLevelAppliedValue(oldOrder.purchaseOrderId, trx)
          .order();
      }

      if (order.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
          {
            id: order.purchaseOrderId,
            applicationLevel: LEVEL_APPLIED.order,
          },
          trx,
        );
      }

      if (!trx) {
        await _trx.commit();

        log && this.log({ id, action: this.logAction.modify });
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return order;
  }

  async editOne({
    condition: { id },
    data,
    prevServiceId,
    independentWorkOrder = {},
    recycling,
    route,
    fields = [],
    concurrentData,
    log,
  }) {
    const ctx = this.getCtx();
    let updatedOrder;

    const trx = await this.knex.transaction();

    try {
      // update main order itself + WO media files
      updatedOrder = await this.updateOne(
        { condition: { id }, data, prevServiceId, fields, concurrentData },
        trx,
      );

      // need to get some populated fields
      const order = await this.getBy(
        {
          condition: { id },
          fields: [
            'id',
            'jobSite2Id',
            'workOrderId',
            'independentWorkOrderId',
            'orderContactId',
            'permitId',
            'purchaseOrderId',
            'serviceDate',
            'disposalSiteId',
            'billableServiceId',
            'equipmentItemId',
            'materialId',
            'customerJobSiteId',
            'businessLineId',
            'isRollOff',
          ],
        },
        trx,
      );

      if (recycling) {
        await trx.commit();
      } else {
        let woRepo;
        if (order.isRollOff) {
          woRepo = WorkOrderRepo.getInstance(this.ctxState);
        } else {
          woRepo = IndependentWorkOrderRepository.getInstance(this.ctxState);
        }

        const woData = pick(woRepo.initialWoFields)(data);

        if (!order.isRollOff) {
          woData.route = route;
        }

        Object.assign(order, woData);

        // sync WO with Dispatch API if WO exists
        if (order?.workOrder?.woNumber >= 1) {
          const { woNumber, id: woId } = order.workOrder;

          await woRepo.updateBy({ condition: { id: woId }, data: woData }, trx);

          if (order.isRollOff) {
            // TODO: refactor it and merge with an update above
            const woInput = await getWorkOrderDataToEditOrder(ctx, order, trx);
            if (woInput?.status) {
              // TODO: refactor it and merge with an update above
              await woRepo.updateBy(
                {
                  condition: { woNumber },
                  data: { status: woInput.status },
                  fields: [],
                },
                trx,
              );
            }
            await woRepo.dispatchUpdates({
              condition: { woNumber },
              data: woInput,
            });
          }
        }

        await trx.commit();

        if (!order.isRollOff && order.workOrder) {
          await publishers.syncIndependentToDispatch(ctx, {
            schemaName: this.schemaName,
            userId: this.userId,
            independentWorkOrders: [
              {
                orderId: order.id,
                ...data,
                ...independentWorkOrder,
                status: order.workOrder.status,
                woNumber: order.workOrder.woNumber,
                independentWorkOrderId: order.workOrder.id,
                billableServiceId: order.billableService.id,
                customerJobSiteId: order.customerJobSite.originalId,
                lineItems: data.lineItems,
                preferredRoute: data.route || data.preferredRoute || null,
              },
            ],
          });
        }
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return updatedOrder;
  }

  // eslint-disable-next-line no-unused-vars
  async getThresholdHistoricalIds(thresholdsItems, getHistoricalIds, trx) {
    const thresholdsArray = thresholdsItems ? Array.from({ length: thresholdsItems.length }) : [];
    let thresholdsTotal = 0;
    // const entityRepo = ThresholdItemRepo.getInstance(this.ctxState);

    if (!isEmpty(thresholdsItems)) {
      // pre-pricing service code:
      // const pickIds = pick(['thresholdId', 'globalRatesThresholdsId', 'customRatesGroupThresholdsId']);
      await Promise.all(
        thresholdsItems.map(async (item, i) => {
          thresholdsTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

          // TODO: make sure that only original IDs always comes here
          //  (this means that any request from FE replaces reference to the latest historical record)
          // pre-pricing service code:
          // const updatedItem = await getHistoricalIds(
          //   pickIds(item),
          //   { update: false, entityId: item?.id, entityRepo },
          //   trx,
          // );

          const getThresholdItem = await pricingGetThreshold(this.getCtx(), {
            data: { id: item.id },
          });
          const updatedItem = getThresholdItem[0].id;
          thresholdsArray[i] = { ...item, ...updatedItem };
        }, this),
      );
    }

    return { thresholds: thresholdsArray, thresholdsTotal };
  }

  // TODO: integrate new pricing engine
  async calculateManifestLineItemsPrice(order, trx) {
    const {
      id: orderId,
      material,
      customRatesGroup,
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
    } = order;

    const billableLineItemRepo = BillableLineItemRepo.getInstance(this.ctxState);
    const globalRatesLineItemRepo = GlobalRatesLineItemRepo.getInstance(this.ctxState);
    const customRatesGroupLineItemRepo = CustomRatesGroupLineItemRepo.getInstance(this.ctxState);

    const billableLineItemCondition = type => ({
      condition: { type, businessLineId, active: true },
      fields: ['id', 'materialBasedPricing'],
    });
    const rateCondition = lineItemId => ({ lineItemId, businessUnitId, businessLineId });
    const buildUnitTypeObj = (tons, yards) => ({
      [WEIGHT_UNIT.tons]: tons,
      [WEIGHT_UNIT.yards]: yards,
    });

    const [bliByTon, bliByYard] = await Promise.all([
      billableLineItemRepo.getBy(
        billableLineItemCondition(LINE_ITEM_TYPE.manifestedDisposalByTon),
        trx,
      ),
      billableLineItemRepo.getBy(
        billableLineItemCondition(LINE_ITEM_TYPE.manifestedDisposalByYard),
        trx,
      ),
    ]);
    if (!bliByTon || !bliByYard) {
      this.ctxState.logger.error('No billable line items for manifests');
      // eslint-disable-next-line no-empty-function
      return () => {};
    }

    const billableLineItemsObj = buildUnitTypeObj(bliByTon, bliByYard);

    const { originalId: customRatesGroupId } = customRatesGroup ?? {};
    const { originalId: serviceMaterialId } = material ?? {};

    const [globalRateByTon, globalRateByYard] = await Promise.all([
      globalRatesLineItemRepo.getAll({ condition: rateCondition(bliByTon.id) }, trx),
      globalRatesLineItemRepo.getAll({ condition: rateCondition(bliByYard.id) }, trx),
    ]);
    if (!globalRateByTon?.length || !globalRateByYard?.length) {
      this.ctxState.logger.error('No global rates for manifest billable line items');
      // eslint-disable-next-line no-empty-function
      return () => {};
    }
    const globalRatesObj = buildUnitTypeObj(globalRateByTon, globalRateByYard);

    let customRateByTon;
    let customRateByYard;
    if (customRatesGroupId) {
      [customRateByTon, customRateByYard] = await Promise.all([
        customRatesGroupLineItemRepo.getAll(
          {
            condition: { ...rateCondition(bliByTon.id), customRatesGroupId },
          },
          trx,
        ),
        customRatesGroupLineItemRepo.getAll(
          {
            condition: { ...rateCondition(bliByYard.id), customRatesGroupId },
          },
          trx,
        ),
      ]);
    }

    const customRatesObj = buildUnitTypeObj(customRateByTon, customRateByYard);

    return (unitType, quantity, manifestNumber) => {
      const priceMaterialId = billableLineItemsObj[unitType].materialBasedPricing
        ? serviceMaterialId
        : null;
      const billableLineItemId = billableLineItemsObj[unitType].id;

      const globalPrice = globalRatesObj[unitType].find(
        ({ materialId }) => materialId === priceMaterialId,
      );

      if (!globalPrice) {
        this.ctxState.logger.error(
          `No global rates for manifest billable line items with mId ${priceMaterialId}`,
        );
        return null;
      }

      let customPrice;
      let customRatesGroupLineItemsId;
      if (!isEmpty(customRatesObj[unitType])) {
        customPrice = customRatesObj[unitType].find(
          ({ materialId }) => materialId === priceMaterialId,
        );
        customRatesGroupLineItemsId = customPrice?.id;
      }

      return {
        orderId,
        price: customPrice?.price ?? globalPrice.price,
        quantity,
        manifestNumber,
        billableLineItemId,
        globalRatesLineItemsId: globalPrice.id,
        customRatesGroupLineItemsId,
        materialId: serviceMaterialId,
      };
    };
  }

  async getManifestsAndLineItems(order, { manifests, id }, trx) {
    let lineItems = [];
    const manifestItems = [];
    if (!isEmpty(manifests)) {
      const unitTypeMap = { TONS: WEIGHT_UNIT.tons, YARDS: WEIGHT_UNIT.yards };
      const woManifests = manifests.map(
        ({ picture, quantity, unittype, manifestNumber, dispatchId }) => ({
          url: picture,
          unitType: unitTypeMap[unittype],
          materialId: order.material.id,
          quantity: Number(quantity),
          workOrderId: id,
          manifestNumber,
          dispatchId,
        }),
      );
      const existingManifests = await ManifestItemRepo.getInstance(this.ctxState).getAll(
        { condition: { workOrderId: id } },
        trx,
      );
      manifestItems.push(
        ...differenceWith(woManifests, existingManifests, (a, b) => a.dispatchId === b.dispatchId),
      );

      if (!isEmpty(manifestItems)) {
        const getLineItemObj = await this.calculateManifestLineItemsPrice(order, trx);
        lineItems.push(
          ...manifestItems.map(({ unitType, quantity, manifestNumber }) =>
            getLineItemObj(unitType, quantity, manifestNumber),
          ),
        );
      }

      lineItems = lineItems.filter(Boolean).filter(({ price }) => price);
    }

    return { lineItems, manifestItems };
  }

  // TODO: integrate new pricing engine
  async reCalculateManifestsAndLineItems(order, workOrder, trx) {
    const { lineItems: newLineItems, manifestItems } = await this.getManifestsAndLineItems(
      order,
      workOrder,
      trx,
    );

    let lineItemsToUpdate;
    let billableLineItemsTotal;
    if (manifestItems?.length) {
      ({ lineItems: lineItemsToUpdate, billableLineItemsTotal } =
        await this.getLineItemHistoricalIds(newLineItems, { update: false }, trx));

      await Promise.all([
        isEmpty(newLineItems)
          ? Promise.resolve()
          : LineItemRepo.getInstance(this.ctxState).insertMany({ data: lineItemsToUpdate }, trx),
        ManifestItemRepo.getInstance(this.ctxState).insertMany({ data: manifestItems }, trx),
      ]);
    }

    return billableLineItemsTotal || 0;
  }

  async completeOne(
    {
      condition: { id, status },
      data,
      prevServiceId,
      originalOrder,
      fields = [],
      concurrentData,
      log,
    },
    trx,
  ) {
    const ctx = this.getCtx();
    const woRepo = WorkOrderRepo.getInstance(this.ctxState);
    let order;

    const _trx = trx || (await this.knex.transaction());

    try {
      const { thresholdsItems } = await reCalculateThresholds(
        ctx,
        { order: originalOrder, workOrder: data.workOrder },
        _trx,
      );

      data.thresholds = thresholdsItems.map(({ id: _id, price, quantity, thresholdId }) => ({
        id: _id,
        price,
        quantity,
        thresholdId,
        threshold: { id: _id, originalId: thresholdId },
      }));

      // update completion details to main order and WO locally
      await this.updateOne(
        {
          condition: { id, status },
          data,
          prevServiceId,
          fields: [],
          concurrentData,
          log: false,
        },
        _trx,
      );

      // need to get some populated fields
      order = await this.getBy(
        {
          condition: { id },
          fields: [
            'id',
            'workOrderId',
            'billableServiceId',
            'jobSite2Id',
            'disposalSiteId',
            'materialId',
            'isRollOff',
          ].concat(fields),
        },
        _trx,
      );

      // sync WO with Dispatch API if WO exists
      if (order?.isRollOff && order?.workOrder?.woNumber >= 1) {
        const { woNumber } = order.workOrder;

        const woInput = await getWorkOrderDataToEditOrder(ctx, order, _trx);
        if (woInput?.status) {
          // TODO: refactor it
          await woRepo.updateBy(
            {
              condition: { woNumber },
              data: { status: woInput.status },
              fields: [],
            },
            _trx,
          );
        }
        await woRepo.dispatchUpdates({
          condition: { woNumber },
          data: woInput,
        });
        await woRepo.syncWoUpdatesWithRecycling({
          woNumber,
          haulingOrderId: order.id,
          eventName: 'completed',
        });
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return order;
  }

  applySearchToQuery(
    originalQuery,
    { searchId, searchQuery, performTextSearch = false, fields = [] } = {},
  ) {
    const disposalHT = DisposalSiteRepo.getHistoricalTableName();
    const jobSiteHT = JobSiteRepo.getHistoricalTableName();

    let query = originalQuery;
    if (performTextSearch) {
      if (!fields.includes('disposalSiteId')) {
        query.leftJoin(disposalHT, `${disposalHT}.id`, `${this.tableName}.disposalSiteId`);
      }

      query.leftJoin(
        DisposalSiteRepo.TABLE_NAME,
        `${disposalHT}.originalId`,
        `${DisposalSiteRepo.TABLE_NAME}.id`,
      );

      if (!fields.includes('jobSiteId')) {
        query.innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${this.tableName}.jobSiteId`);
      }

      query.innerJoin(
        JobSiteRepo.TABLE_NAME,
        `${jobSiteHT}.originalId`,
        `${JobSiteRepo.TABLE_NAME}.id`,
      );
    }

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
        builder.orWhere(`${WorkOrderRepo.TABLE_NAME}.woNumber`, searchId);
        builder.orWhere(`${WorkOrderRepo.TABLE_NAME}.droppedEquipmentItem`, searchId);
        builder.orWhere(`${WorkOrderRepo.TABLE_NAME}.pickedUpEquipmentItem`, searchId);
        builder.orWhere(`${this.tableName}.purchaseOrderId`, searchId);
      }

      if (searchQuery) {
        builder.orWhere(`${PermitRepo.getHistoricalTableName()}.number`, searchQuery);
      }

      if (performTextSearch) {
        builder
          .orWhereRaw('??.name % ?', [CustomerRepo.TABLE_NAME, searchQuery])
          .orderByRaw('??.name <-> ?', [CustomerRepo.TABLE_NAME, searchQuery]);

        builder
          .orWhereRaw('??.description % ?', [DisposalSiteRepo.TABLE_NAME, searchQuery])
          .orderByRaw('??.description <-> ?', [DisposalSiteRepo.TABLE_NAME, searchQuery]);

        builder
          .orWhereRaw('? <% ??.full_address', [searchQuery, JobSiteRepo.TABLE_NAME])
          .orderByRaw('? <<-> ??.full_address', [searchQuery, JobSiteRepo.TABLE_NAME]);
      }

      return builder;
    });

    return query;
  }

  applyFiltersToQuery(
    originalQuery,
    {
      ids,
      customerId,
      customerGroupId,
      businessUnitId,
      billingCycles,
      prepaid,
      status,
      filterByServiceDateFrom,
      filterByServiceDateTo,
      filterByMaterials,
      filterByPaymentTerms,
      filterByWeightTicket,
      filterByBusinessLine,
      filterByHauler,
      filterByCsr,
      filterByBroker,
      filterByPaymentMethod,
      filterByService,
      onAccount,
      isWithSubs,
    } = {},
  ) {
    const customersTable = CustomerRepo.TABLE_NAME;

    let query = originalQuery;

    if (!isEmpty(ids)) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }

    if (!isEmpty(status)) {
      query = query.whereIn(`${this.tableName}.status`, Array.isArray(status) ? status : [status]);
    }

    if (businessUnitId) {
      query = query.andWhere(`${this.tableName}.businessUnitId`, businessUnitId);
    }

    if (filterByServiceDateFrom) {
      query = query.andWhere('serviceDate', '>=', filterByServiceDateFrom);
    }

    if (filterByServiceDateTo) {
      query = query.andWhere('serviceDate', '<=', filterByServiceDateTo);
    }

    if (filterByBusinessLine?.length) {
      query = query.whereIn(`${this.tableName}.businessLineId`, filterByBusinessLine);
    }

    if (filterByWeightTicket != undefined) {
      if (filterByWeightTicket) {
        query = query.whereNotNull(`${WorkOrderRepo.TABLE_NAME}.ticket`);
      } else {
        query = query.whereNull(`${WorkOrderRepo.TABLE_NAME}.ticket`);
      }
    }

    if (filterByHauler?.length) {
      query = query.whereIn('thirdPartyHaulerId', filterByHauler);
    }

    if (filterByCsr?.length) {
      query = query.whereIn(`${this.tableName}.createdBy`, filterByCsr);
    }

    if (filterByBroker?.length) {
      query = query.whereIn(`${customersTable}.ownerId`, filterByBroker);
    }

    if (filterByService?.length) {
      query = query.whereIn(`${BillableServiceRepo.TABLE_NAME}.id`, filterByService);
    }

    if (filterByPaymentMethod?.length) {
      const paymentMethods = filterByPaymentMethod.filter(method => method !== NO_PAYMENT);

      query = query.andWhere(builder => {
        let qb = builder
          .whereIn('paymentMethod', paymentMethods)
          .orWhereRaw(`?? && ?`, ['mixedPaymentMethods', `{${paymentMethods.join(',')}}`]);

        const hasNoPayment = paymentMethods.length !== filterByPaymentMethod.length;

        if (hasNoPayment) {
          qb = qb.orWhereNull('paymentMethod');
        }

        return qb;
      });
    }

    if (customerId) {
      query = query.andWhere(`${customersTable}.id`, customerId);
      if (isWithSubs) {
        if (!isEmpty(billingCycles)) {
          query = query.where(q =>
            q
              .whereIn(`${customersTable}.billingCycle`, billingCycles)
              .orWhereNull(`${customersTable}.billingCycle`),
          );
        } else {
          query = query.whereNull(`${customersTable}.billingCycle`);
        }
      }
    } else {
      if (customerGroupId) {
        query = query.andWhere(`${customersTable}.customerGroupId`, customerGroupId);
      }

      if (prepaid !== undefined || onAccount !== undefined) {
        query = this.applyCustomerBillingFilter(query, {
          prepaid,
          onAccount,
          billingCycles,
        });
      }
    }

    if (filterByPaymentTerms?.length) {
      query = this.applyCustomerPaymentTermsFilter(query, filterByPaymentTerms);
    }

    if (filterByMaterials?.length) {
      query = this.applyMaterialsFilter(query, filterByMaterials);
    }
    return query;
  }

  applyCustomerBillingFilter(originalQuery, { prepaid, onAccount, billingCycles }) {
    // For customer filters, current values matter.
    const customersTable = CustomerRepo.TABLE_NAME;
    return originalQuery.where(qb => {
      const isBothFalse = !prepaid && !onAccount;
      let builder = qb;
      if (!isBothFalse) {
        builder = builder.where(q => {
          let subQuery;
          if (prepaid) {
            subQuery = q.where(`${customersTable}.onAccount`, false);
          }
          if (onAccount) {
            // when we want see both variant
            subQuery = q.orWhere(`${customersTable}.onAccount`, true);
          }
          return subQuery;
        });
        // we should always include empty billing cycle
        if (!isEmpty(billingCycles)) {
          builder = builder.where(q =>
            q
              .whereIn(`${customersTable}.billingCycle`, billingCycles)
              .orWhereNull(`${customersTable}.billingCycle`),
          );
        } else {
          builder = builder.whereNull(`${customersTable}.billingCycle`);
        }
      } else {
        // there are not any customers without prepaid or onAccount
        builder = builder.where(`${customersTable}.onAccount`, true);
        builder = builder.where(`${customersTable}.onAccount`, false);
      }

      return builder;
    });
  }

  applyMaterialsFilter(originalQuery, filter) {
    // For material filters, historical values matter.
    const materialsHT = MaterialRepo.getHistoricalTableName();

    const materialFilters = Array.isArray(filter) ? filter : [filter];
    const manifestedOnly = materialFilters.includes('manifested');
    const materialIds = manifestedOnly
      ? materialFilters.filter(value => value !== 'manifested')
      : materialFilters;

    return originalQuery.andWhere(builder => {
      if (!isEmpty(materialIds)) {
        builder.whereIn(`${materialsHT}.originalId`, materialIds);
      }

      if (manifestedOnly) {
        builder.orWhere(`${materialsHT}.manifested`, true);
      }
    });
  }

  applyCustomerPaymentTermsFilter(originalQuery, filter) {
    // For payment terms filters, historical values matter.
    const customersHT = CustomerRepo.getHistoricalTableName();

    const paymentTermsFilters = Array.isArray(filter) ? filter : [filter];

    return originalQuery.andWhere(builder =>
      builder.whereIn(`${customersHT}.paymentTerms`, paymentTermsFilters),
    );
  }

  async invoicingCount({ businessUnitId, ...condition } = {}) {
    const customersTable = CustomerRepo.TABLE_NAME;
    const customersHT = CustomerRepo.getHistoricalTableName();

    // by default billing type for order is arrears ( according to business logic)
    // but there is no field in db
    // so in such case back should return 0
    if (condition.arrears !== undefined && !condition.arrears) {
      return {
        total: 0,
      };
    }
    // just to reuse this method in case subscription and orders count
    if (condition.isWithSubs && !condition.filterByBusinessLine?.length) {
      return {
        total: 0,
      };
    }

    const query = this.applyFiltersToQuery(
      this.knex(this.tableName)
        .withSchema(this.schemaName)
        .where(`${this.tableName}.businessUnitId`, businessUnitId)
        .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
        .innerJoin(customersTable, `${customersTable}.id`, `${customersHT}.originalId`),
      {
        ...condition,
        filterByServiceDateTo: condition?.endingDate,
        status: [ORDER_STATUS.finalized, ORDER_STATUS.canceled],
        prepaid: !!condition.prepaid,
      },
    );

    const result = await query.count(`${this.tableName}.id`);

    return { total: Number(result?.[0]?.count) || 0 };
  }

  async validateOrders({ condition } = {}) {
    const orders = await this.getAllPaginated({
      condition,
      fields: ['id', 'workOrderId', 'billableServiceId', 'disposalSiteId'],
      limit: false,
    });

    if (isEmpty(orders)) {
      return 0;
    }

    const invalidsTotal = orders.reduce((count, order) => {
      const fields = order.workOrder?.id
        ? getMissingWorkOrderFields(
            order.workOrder,
            order.billableService.action,
            !!order.disposalSite,
          )
        : false;

      return fields ? count + 1 : count;
    }, 0);

    return invalidsTotal;
  }

  async updateOrdersToStatus({ condition = {}, newStatus, validOnly, log } = {}) {
    const trx = await this.knex.transaction();

    let orderIds = [];
    try {
      if (validOnly) {
        const orders = await this.getAllPaginated(
          {
            condition,
            fields: [
              'id',
              'workOrderId',
              'billableServiceId',
              'disposalSiteId',
              'independentWorkOrderId',
            ],
            limit: false,
          },
          trx,
        );

        if (isEmpty(orders)) {
          return false;
        }

        orderIds = compact(
          orders.map(order => {
            const fields = order.workOrder?.id
              ? getMissingWorkOrderFields(
                  order.workOrder,
                  order.billableService.action,
                  !!order.disposalSite,
                )
              : false;

            return fields ? null : order.id;
          }),
        );
      } else {
        const { ids, ...restCondition } = condition;

        let query = trx(this.tableName).withSchema(this.schemaName);
        if (!isEmpty(ids)) {
          query = query.whereIn('id', ids);
        }

        const orders = await query.andWhere(restCondition).select(['id']);
        if (isEmpty(orders)) {
          return false;
        }

        orderIds = map(orders, 'id');
      }

      if (log && orderIds?.length) {
        await super.updateByIds({ ids: orderIds, data: { status: newStatus } }, trx);
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (orderIds?.length) {
      const action = this.logAction.modify;
      orderIds.forEach(id => this.log({ id, action }), this);
    }

    return true;
  }

  async markOrdersInvoiced({ orderIds, preInvoicedOrderDrafts }) {
    const trx = await this.knex.transaction();

    try {
      super.updateByIds({
        ids: orderIds,
        data: { status: ORDER_STATUS.invoiced, invoiceDate: new Date() },
      });

      await PreInvoicedOrderDraftRepo.getInstance(this.ctxState).insertMany(
        { data: preInvoicedOrderDrafts },
        trx,
      );

      await this.upsertTaxes({ ids: orderIds }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async unmarkOrdersInvoiced({ canceled = [], finalized = [], orderIds = [] }) {
    const trx = await this.knex.transaction();

    try {
      super.updateByIds({ ids: finalized, data: { status: ORDER_STATUS.finalized } });
      super.updateByIds({ ids: canceled, data: { status: ORDER_STATUS.canceled } });

      await PreInvoicedOrderDraftRepo.getInstance(this.ctxState).deleteByOrderIds(
        { condition: { orderIds } },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async upsertTaxes({ ids }, trx) {
    const taxList = [];
    let orderTaxDistricts = await OrderTaxDistrictRepo.getInstance(this.ctxState).getAll(
      {
        condition: qb => qb.whereIn('orderId', ids),
        fields: ['id', 'orderId', 'taxDistrictId'],
      },
      trx,
    );
    const orderTaxDistrictIds = orderTaxDistricts?.map(({ id }) => id);
    if (isEmpty(orderTaxDistrictIds)) {
      return taxList;
    }
    orderTaxDistricts = groupBy(orderTaxDistricts, 'orderId');
    await Promise.all(
      ids.map(async orderId => {
        const [taxDistricts, workOrder, order] = await Promise.all([
          OrderTaxDistrictRepo.getInstance(this.ctxState).getByOrderId(orderId, trx),
          WorkOrderRepo.getInstance(this.ctxState).getByOrderId(
            orderId,
            ['id', 'weight', 'weightUnit'],
            trx,
          ),
          this.getBy(
            {
              condition: { id: orderId },
              fields: [
                'id',
                'billableServiceId',
                'materialId',
                'lineItems',
                'thresholds',
                'businessLineId',
                'billableServiceTotal',
                'billableLineItemsTotal',
                'applySurcharges',
                'billableServicePrice',
                'beforeTaxesTotal',
                'commercialTaxesUsed',
              ],
            },
            trx,
          ),
        ]);

        const lineItems =
          order?.lineItems?.map(item => ({
            id: item.id,
            billableLineItemId: item.billableLineItem.originalId,
            materialId: item.material?.originalId,
            globalRatesLineItemsId: item.globalRatesLineItem.originalId,
            customRatesGroupLineItemsId: item?.customRatesGroupLineItem?.originalId,
            price: Number(item.price),
            quantity: Number(item.quantity),
            applySurcharges: item.applySurcharges,
          })) ?? [];

        let serviceTotalWithSurcharges = Number(order?.billableServiceTotal) || 0;
        let lineItemsWithSurcharges = lineItems;
        let thresholdsWithSurcharges = order?.thresholds;
        let surchargesTotal = 0;

        if (order.applySurcharges) {
          ({
            serviceTotalWithSurcharges,
            thresholdsWithSurcharges,
            lineItemsWithSurcharges,
            surchargesTotal,
          } = calculateSurcharges({
            materialId: order.material?.originalId,
            billableServiceId: order.billableService?.originalId,
            billableServicePrice: Number(order.billableServicePrice) || 0,
            billableServiceApplySurcharges: order.billableService?.applySurcharges,
            lineItems,
            thresholds: order.thresholds,
            addedSurcharges: order.surcharges,
          }));
        }

        if (
          order.status === ORDER_STATUS.canceled &&
          order.beforeTaxesTotal === 0 &&
          surchargesTotal === 0
        ) {
          return;
        }

        if (!isEmpty(taxDistricts)) {
          const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
            condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
            fields: ['region'],
          });

          const { taxDistrictValues } = calculateTaxes({
            taxDistricts,
            workOrder,
            region,
            billableServiceId: order.billableService?.originalId,
            materialId: order.material?.originalId,

            lineItems: lineItemsWithSurcharges,
            thresholds: thresholdsWithSurcharges?.map(threshold => ({
              id: threshold.id,
              thresholdId: threshold.threshold.originalId,
              price: Number(threshold.price),
              quantity: Number(threshold.quantity),
            })),
            includeServiceTax: !!order.billableService?.originalId,

            serviceTotal: serviceTotalWithSurcharges,
            businessLineId: order.businessLine.id,
            commercial: order.commercialTaxesUsed,
          });
          if (!isEmpty(taxDistrictValues)) {
            Object.entries(taxDistrictValues).forEach(([taxDistrictId, taxes]) => {
              const actualTaxes = taxes.filter(item => item.amount);

              if (!isEmpty(actualTaxes)) {
                const orderTaxDistrictId = orderTaxDistricts[orderId].find(
                  taxDistrict => taxDistrict.taxDistrictId === +taxDistrictId,
                ).id;

                taxList.push(
                  ...actualTaxes.map(item => ({
                    orderTaxDistrictId,
                    ...item,
                    amount: mathRound2(item.amount),
                  })),
                );
              }
            });
          }
        }
      }),
    );
    if (!isEmpty(taxList)) {
      await OrderTaxDistrictTaxesRepo.getInstance(this.ctxState).insertMany(
        { data: taxList, orderTaxDistrictIds },
        trx,
      );
    }

    return taxList;
  }

  async addPaymentMethodToOrders({ orderIds, paymentMethod }) {
    await super.updateByIds({
      ids: orderIds,
      data: {
        mixedPaymentMethods: this.knex.raw('array_append(??,?)', [
          'mixedPaymentMethods',
          paymentMethod,
        ]),
      },
    });
  }

  async getOrdersMapForDrafts({ businessUnitId, ...condition } = {}, trx = this.knex) {
    const populatedQuery = await this.populateDataQuery(
      [
        'id',
        'status',
        'createdAt',
        'serviceDate',
        'invoiceNotes',

        'beforeTaxesTotal',
        'grandTotal',
        'billableServiceTotal',
        'billableLineItemsTotal',
        'thresholdsTotal',

        'workOrderId',
        'billableServiceId',
        'paymentMethod',
        'surchargesTotal',
      ],
      trx,
      { pullSelects: true },
    );

    let { query } = populatedQuery;
    const { selects } = populatedQuery;

    if (businessUnitId) {
      query = query.where(`${this.tableName}.businessUnitId`, businessUnitId);
    }

    const jobSitesHT = JobSiteRepo.getHistoricalTableName();
    const customersHT = CustomerRepo.getHistoricalTableName();
    const joinedTableColumns = await JobSiteRepo.getInstance(this.ctxState).getColumnsToSelect(
      'jobSite',
    );
    selects.push(...joinedTableColumns);

    selects.push(trx.raw('??.?? as ??', [CustomerRepo.TABLE_NAME, 'id', 'currentCustomerId']));

    query = query
      .innerJoin(jobSitesHT, `${jobSitesHT}.id`, `${this.tableName}.jobSiteId`)
      .innerJoin(JobSiteRepo.TABLE_NAME, `${JobSiteRepo.TABLE_NAME}.id`, `${jobSitesHT}.originalId`)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${customersHT}.originalId`,
      );

    // Filter invoicing orders by input params
    query = this.applyFiltersToQuery(query, {
      ...condition,
      filterByServiceDateTo: condition?.endingDate,
      status: [ORDER_STATUS.canceled, ORDER_STATUS.finalized],
      prepaid: !!condition.prepaid,
    }).select(...selects);

    const orders = await query;
    if (!orders?.length) {
      return {};
    }

    const orderIds = map(orders, 'id');
    const [lineItems, thresholds] = await Promise.all([
      LineItemRepo.getInstance(this.ctxState).populateLineItemsByOrderIds(orderIds, trx),
      ThresholdItemRepo.getInstance(this.ctxState).populateThresholdItemsByOrderIds(orderIds, trx),
    ]);

    const mappedOrdersMap = new Map();
    const customersSet = new Set();
    orders.forEach(order => {
      order.lineItems = [];
      order.thresholds = [];

      order.billableLineItems = [];
      order.thresholdItems = [];

      mappedOrdersMap.set(order.id, order);
      customersSet.add(order.currentCustomerId);
    });
    orders.length = 0;

    lineItems?.forEach(item => {
      const order = mappedOrdersMap.get(item.orderId);
      item.billableLineItem = camelCaseKeys(item.billableLineItem);
      order.lineItems.push(item);
    });
    thresholds?.forEach(item => {
      const order = mappedOrdersMap.get(item.orderId);
      item.threshold = camelCaseKeys(item.threshold);
      order.thresholds.push(item);
    });

    return { ordersMap: mappedOrdersMap, customersSet, orderIds };
  }

  async getOrderDataForInvoicing(ids) {
    if (!ids?.length) {
      return [];
    }

    const selects = ['id', 'workOrderId', 'paymentMethod', 'status'].map(
      field => `${this.tableName}.${field}`,
    );

    const joinedTableColumns = await CustomerJobSitePairRepo.getInstance(
      this.ctxState,
    ).getColumnsToSelect('customerJobSite');
    selects.push(...joinedTableColumns);

    const woTable = WorkOrderRepo.TABLE_NAME;
    const customerJobSitesTable = CustomerJobSitePairRepo.TABLE_NAME;
    const customerJobSitesHT = CustomerJobSitePairRepo.getHistoricalTableName();

    selects.push(`${woTable}.ticket`);

    const orders = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.id`, ids)
      .select(selects)
      .innerJoin(
        customerJobSitesHT,
        `${customerJobSitesHT}.id`,
        `${this.tableName}.customerJobSiteId`,
      )
      .innerJoin(
        customerJobSitesTable,
        `${customerJobSitesTable}.id`,
        `${customerJobSitesHT}.originalId`,
      )
      .leftJoin(woTable, `${woTable}.id`, `${this.tableName}.workOrderId`)
      .orderBy(`${this.tableName}.id`);

    const workOrderOrderMap = new Map();
    const workOrderIds = [];

    orders.forEach(({ id, workOrderId }) => {
      workOrderIds.push(workOrderId);
      workOrderOrderMap.set(workOrderId, id);
    });

    const [mediaFiles, ticketFiles] = await Promise.all([
      MediaFileRepo.getInstance(this.ctxState).getAllGroupedByWorkOrder(workOrderIds),
      WorkOrderRepo.getInstance(this.ctxState).getTicketMediaFiles(workOrderIds),
    ]);

    return {
      orders: orders.map(this.mapFields.bind(this)),
      mediaFilesGroups:
        mediaFiles?.map(group => ({
          ...group,
          orderId: workOrderOrderMap.get(group.workOrderId),
        })) ?? [],
      ticketFiles: ticketFiles.map(group => ({
        ...group,
        orderId: workOrderOrderMap.get(group.workOrderId),
      })),
    };
  }

  async getOrdersToNotifyAbout({
    condition: { date, businessUnitIds },
    fields = OrderRepository.getOrderGridFields(),
  }) {
    let { query } = await this.populateDataQuery(fields);
    query = query
      .whereIn(`${this.tableName}.businessUnitId`, businessUnitIds)
      .whereNotNull('notifyDayBefore')
      .andWhere({ status: ORDER_STATUS.inProgress, serviceDate: date.toUTCString() });

    const items = await query;

    return isEmpty(items) ? [] : items.map(this.mapFields.bind(this));
  }

  async findDroppedEquipmentItemLocations({
    condition: { customerId, jobSiteId, equipmentItemSize, ...tenancyCondition },
  } = {}) {
    const customersHT = CustomerRepo.getHistoricalTableName();
    const jobSitesHT = JobSiteRepo.getHistoricalTableName();
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();
    const woTable = WorkOrderRepo.TABLE_NAME;

    const allCustomerWorkOrders = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${woTable}.woNumber`,
        'billableService.action as action',
        'jobSite1.originalId as jobSiteFrom',
        'jobSite2.originalId as jobSiteTo',
      ])
      .where(unambiguousCondition(this.tableName, tenancyCondition))
      .whereNotNull(`${woTable}.woNumber`)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .innerJoin(`${jobSitesHT} as jobSite1`, 'jobSite1.id', `${this.tableName}.jobSiteId`)
      .leftJoin(`${jobSitesHT} as jobSite2`, 'jobSite2.id', `${this.tableName}.jobSite2Id`)
      .innerJoin(
        `${billableServiceHT} as billableService`,
        'billableService.id',
        `${this.tableName}.billableServiceId`,
      )
      .andWhere(`${customersHT}.originalId`, customerId)
      .andWhere(builder =>
        builder
          .where(qb =>
            qb
              .where('jobSite2.originalId', jobSiteId)
              .andWhere('billableService.action', ACTION.relocate),
          )
          .orWhere('jobSite1.originalId', jobSiteId),
      )
      .leftJoin(woTable, `${woTable}.id`, `${this.tableName}.workOrderId`);

    if (!allCustomerWorkOrders?.length) {
      return [];
    }

    const allDroppedCans = await WorkOrderRepo.getAllDroppedCans(
      this.getCtx(),
      allCustomerWorkOrders.map(({ woNumber, jobSiteFrom, jobSiteTo }) => ({
        woNumber,
        // If it is a relocate from job site, ignore dropCan action for this work order.
        isRelocateFromJobSite: Boolean(
          jobSiteTo && jobSiteTo !== jobSiteFrom && jobSiteId === jobSiteFrom,
        ),
      })),
    );

    const allCanIds = Array.from(allDroppedCans.values(), ({ canId }) => canId);

    if (allCanIds.length === 0) {
      return [];
    }

    const cans = await getCansData(this.getCtx(), allCanIds);

    cans.forEach(({ name, size }) => {
      if (name && String(size) !== String(equipmentItemSize)) {
        allDroppedCans.delete(String(name));
      }
    });

    const filteredCanNames = Array.from(allDroppedCans.keys());

    if (filteredCanNames.length === 0) {
      return [];
    }

    const usedEquipment = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(['id', 'droppedEquipmentItem as canName'])
      .whereIn('droppedEquipmentItem', filteredCanNames);

    if (usedEquipment?.length >= 1) {
      for (const { id, canName } of usedEquipment) {
        // This is necessary because `droppedEquipmentItem` comes from order, NOT from WO.
        if (allDroppedCans.has(canName)) {
          allDroppedCans.get(canName).orderId = id;
        }
      }
    }

    return Array.from(allDroppedCans.entries(), ([name, { point, orderId }]) => ({
      id: name,
      orderId,
      point,
    }));
  }

  // TODO: integrate new pricing engine
  async postSyncWithDispatchUpdate({
    order,
    thresholdsTotal,
    newLineItemsTotal,
    woOrder,
    orderData,
    fields = ['id'],
    log,
  }) {
    // case 1 when auto-complete cron job hadn't updated yet Order based on WO status -
    //  to complete its original order and yes: just like auto-complete flow - skip validation
    // case 2: when sync appeared WO is not inProgress anymore -
    //  perform autoComplete/Cancel of its original order
    const { status: orderStatus, id } = order;
    const autoCompleteOrder =
      orderStatus === ORDER_STATUS.inProgress && woOrder.status === WO_STATUS.completed;
    const autoCancelOrder =
      orderStatus === ORDER_STATUS.inProgress && woOrder.status === WO_STATUS.canceled;

    let updatedOrder = null;

    const trx = await this.knex.transaction();

    try {
      if (autoCancelOrder) {
        updatedOrder = await cancelIndependentOrder(this.getCtx(), {
          data: {
            id,
          },
          fields: ['grandTotal'],
          noSyncWithDispatch: true,
        });
      }

      // read data from DB because service or line items can be edited during transaction
      // eslint-disable-next-line no-param-reassign
      order = await this.getBy({ condition: { id } }, trx);

      const data = {
        thresholdsTotal,
        billableLineItemsTotal: mathRound2(order.billableLineItemsTotal + newLineItemsTotal),
      };
      if (autoCompleteOrder) {
        data.status = ORDER_STATUS.completed;
      }

      const { haulingBillableServiceId, haulingMaterialId, haulingDisposalSiteId } = orderData;
      const { schemaName } = this;
      const [billableService, material, disposalSite] = await Promise.all([
        haulingBillableServiceId
          ? BillableServiceRepo.getHistoricalInstance(this.ctxState, {
              schemaName,
            }).getRecentBy({ condition: { originalId: haulingBillableServiceId } }, trx)
          : Promise.resolve(),
        haulingMaterialId
          ? MaterialRepo.getHistoricalInstance(this.ctxState, {
              schemaName,
            }).getRecentBy({ condition: { originalId: haulingMaterialId } }, trx)
          : Promise.resolve(),
        haulingDisposalSiteId
          ? DisposalSiteRepo.getHistoricalInstance(this.ctxState, {
              schemaName,
            }).getRecentBy({ condition: { originalId: haulingDisposalSiteId } }, trx)
          : Promise.resolve(),
      ]);

      let updatePrices = false;
      let equipmentItemId = order.equipmentItem?.originalId;
      if (
        billableService &&
        Number(billableService.originalId) !== Number(order.billableService.originalId)
      ) {
        data.billableServiceId = billableService.id;
        updatePrices = true;

        const equipmentItem = await EquipmentItemRepo.getInstance(this.ctxState).getById(
          {
            id: billableService.equipmentItemId,
            fields: ['id'],
          },
          trx,
        );
        if (equipmentItem) {
          equipmentItemId = equipmentItem.id;
        }
      }
      let mat = order.material;
      if (material && Number(material.originalId) !== Number(order.material.originalId)) {
        data.materialId = material.id;
        mat = material;
        updatePrices = true;
      }

      // no disposal setup in case of following service actions
      if (
        disposalSite &&
        ![ONE_TIME_ACTION.delivery, ONE_TIME_ACTION.reposition, ONE_TIME_ACTION.relocate].includes(
          billableService.action,
        )
      ) {
        // if there was no disposal before
        if (!order?.disposalSite) {
          data.disposalSiteId = disposalSite.id;
        } else if (Number(disposalSite.originalId) !== Number(order?.disposalSite?.originalId)) {
          data.disposalSiteId = disposalSite.id;
        }
      } else {
        data.disposalSiteId = null;
      }

      const billableServiceId = billableService?.originalId || order.billableService.originalId;

      if (updatePrices) {
        const businessUnitId = order.businessUnit?.id ?? order.businessUnitId;
        const businessLineId = order.businessLine?.id ?? order.businessLineId;
        const materialId = (billableService || order.billableService).materialBasedPricing
          ? mat.originalId
          : null;

        const { originalId: customRatesGroupId } = order?.customRatesGroup ?? {};

        const [globalRatesService, customRatesService] = await Promise.all([
          GlobalRatesServiceRepo.getHistoricalInstance(this.ctxState, {
            schemaName,
          }).getRecentBy(
            {
              condition: {
                businessUnitId,
                businessLineId,
                billableServiceId,
                equipmentItemId,
                materialId,
              },
              fields: ['id', 'price'],
            },
            trx,
          ),
          customRatesGroupId
            ? CustomGroupRatesServiceRepo.getHistoricalInstance(this.ctxState, {
                schemaName,
              }).getRecentBy(
                {
                  condition: {
                    businessUnitId,
                    businessLineId,
                    customRatesGroupId,
                    billableServiceId,
                    equipmentItemId,
                    materialId,
                  },
                  fields: ['id', 'price'],
                },
                trx,
              )
            : Promise.resolve(),
        ]);

        if (isNilOrNaN(globalRatesService?.price)) {
          throw ApiError.notFound('Global rates for billable service item not found');
        }

        const globalPrice = Number(globalRatesService.price);
        if (customRatesService) {
          const billableServicePrice = customRatesService.price
            ? Number(customRatesService.price)
            : globalPrice;

          Object.assign(data, {
            customRatesGroupServicesId: customRatesService.id,
            billableServicePrice,
            billableServiceTotal: billableServicePrice,
          });
        } else {
          const billableServicePrice = globalPrice;
          Object.assign(data, {
            globalRatesServicesId: globalRatesService.id,
            billableServicePrice,
            billableServiceTotal: billableServicePrice,
          });
        }
      }

      const lineItems =
        order?.lineItems?.map(item => ({
          billableLineItemId: item.billableLineItem.originalId,
          globalRatesLineItemsId: item.globalRatesLineItem.originalId,
          customRatesGroupLineItemsId: item?.customRatesGroupLineItem?.originalId,
          materialId: item.material?.originalId,
          price: Number(item.price),
          quantity: Number(item.quantity),
          applySurcharges: item.applySurcharges,
        })) ?? [];
      const thresholds = order?.thresholds?.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      let surchargesTotal = 0;
      let serviceTotalWithSurcharges =
        Number(data.billableServiceTotal || order.billableServiceTotal) || 0;

      let lineItemsWithSurcharges = lineItems;
      let thresholdsWithSurcharges = thresholds;
      let orderSurcharges = [];

      if (order.applySurcharges) {
        ({
          surchargesTotal,
          orderSurcharges,
          serviceTotalWithSurcharges,
          lineItemsWithSurcharges,
          thresholdsWithSurcharges,
        } = calculateSurcharges({
          materialId: mat?.originalId,
          billableServiceId: order.billableService?.originalId,
          billableServicePrice: Number(order.billableServicePrice) || 0,
          billableServiceApplySurcharges: order.billableService?.applySurcharges,
          addedSurcharges: order.surcharges,
          lineItems,
          thresholds,
        }));
      }

      let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          orderSurcharges,
          { update: false },
          trx,
        );
      }
      // TODO: pass there billable item ids
      await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
        {
          data: updatedOrderSurcharges,
          condition: { orderId: order.id },
          fields: [],
        },
        trx,
      );

      const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
        condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
        fields: ['region'],
      });

      const { taxesTotal } = calculateTaxes({
        taxDistricts: order.taxDistricts,
        workOrder: woOrder,
        region,
        billableServiceId,
        materialId: mat?.originalId,

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

      data.beforeTaxesTotal = mathRound2(
        (data.billableServiceTotal || order.billableServiceTotal) +
          data.billableLineItemsTotal +
          thresholdsTotal,
      );

      data.surchargesTotal = Number(surchargesTotal) || 0;
      data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);

      if (order.paymentMethod === PAYMENT_METHOD.onAccount) {
        data.onAccountTotal = order.grandTotal;
      }

      updatedOrder = await this.updateBy({ condition: { id }, data, fields }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return updatedOrder;
  }

  async deleteOrderAndRelatedEntities({
    cjsPairId,
    orderId,
    workOrderId,
    independentWorkOrder,
    orderRequestId,
  }) {
    const trx = await this.knex.transaction();

    try {
      if (cjsPairId) {
        await CustomerJobSitePairRepo.getInstance(this.ctxState).deleteBy(
          { condition: { id: cjsPairId } },
          trx,
        );
      }

      if (workOrderId) {
        await Promise.all([
          MediaFileRepo.getInstance(this.ctxState).deleteBy({ condition: { workOrderId } }, trx),
          ManifestItemRepo.getInstance(this.ctxState).deleteBy({ condition: { workOrderId } }, trx),
        ]);

        await WorkOrderRepo.getInstance(this.ctxState)
          // no historical record if workOrderId === null or workOrderId === -1
          .deleteById(workOrderId, trx, { noRecord: workOrderId <= 0 });
      }

      // Delete the created order and WO + mediaFiles (lineItems and thresholds also)
      // All need to be done manually to keep history recorded correctly (w\o cascade)
      await Promise.allSettled([
        OrderTaxDistrictRepo.getInstance(this.ctxState).deleteBy({ condition: { orderId } }, trx),
        LineItemRepo.getInstance(this.ctxState).deleteBy({ condition: { orderId } }, trx),
        ThresholdItemRepo.getInstance(this.ctxState).deleteBy({ condition: { orderId } }, trx),
      ]);

      await this.deleteBy({ condition: { id: orderId } }, trx);

      if (independentWorkOrder?.id) {
        await IndependentWorkOrderRepository.getInstance(this.ctxState).deleteById(
          { id: independentWorkOrder.id },
          trx,
        );
      }

      if (orderRequestId) {
        await OrderRequestRepo.getInstance(this.ctxState).updateBy(
          {
            condition: { id: orderRequestId },
            data: { status: ORDER_REQUEST_STATUS.requested },
            fields: ['id'],
          },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      this.ctxState.logger.error(error);
      await trx.rollback();
    }
  }

  async getAllRequestsOriginated(
    {
      condition: { historical, jobSiteId, customerId } = {},
      skip = 0,
      limit = 25,
      fields = [
        'id',
        'orderRequestId',
        'status',
        'workOrderId',
        'serviceDate',
        'billableServicePrice',
        'grandTotal',
        'billableServiceId',
        'equipmentItemId',
        'materialId',
        'driverInstructions',
        'customerJobSiteId',
        'jobSiteId',
        'jobSite2Id',
        'purchaseOrderId',
      ],
    } = {},
    trx = this.knex,
  ) {
    const jsHt = JobSiteRepo.getHistoricalTableName();
    const customerHt = CustomerRepo.getHistoricalTableName();

    const { query } = await this.populateDataQuery(fields, trx);

    const items = await query
      .whereNotNull(`${this.tableName}.orderRequestId`)
      .whereIn(
        `${this.tableName}.status`,
        historical
          ? [ORDER_STATUS.invoiced]
          : ORDER_STATUSES.filter(s => s !== ORDER_STATUS.invoiced),
      )
      .innerJoin(jsHt, `${jsHt}.id`, `${this.tableName}.jobSiteId`)
      .innerJoin(customerHt, `${customerHt}.id`, `${this.tableName}.customerId`)
      .andWhere(`${jsHt}.originalId`, jobSiteId)
      .andWhere(`${customerHt}.originalId`, customerId)
      .orderBy(`${this.tableName}.id`, 'desc')
      .limit(limit)
      .offset(skip);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async countOrdersFromRequests({ historical, jobSiteId } = {}, trx = this.knex) {
    const jsHt = JobSiteRepo.getHistoricalTableName();
    const [result] = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(
        OrderRequestRepo.TABLE_NAME,
        `${OrderRequestRepo.TABLE_NAME}.id`,
        `${this.tableName}.orderRequestId`,
      )
      .innerJoin(jsHt, `${jsHt}.id`, `${this.tableName}.jobSiteId`)
      .whereIn(
        `${this.tableName}.status`,
        historical
          ? [ORDER_STATUS.invoiced]
          : ORDER_STATUSES.filter(s => s !== ORDER_STATUS.invoiced),
      )
      .andWhere(`${jsHt}.originalId`, jobSiteId)
      .count(`${this.tableName}.id`);

    return Number(result?.count) || 0;
  }

  async changeMaterial(order, mappedMaterialId, trx) {
    const {
      id,
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      billableService: { originalId: billableServiceId, materialBasedPricing },
      material,
      equipmentItem: { originalId: equipmentItemId },
      lineItems,
      thresholds,
      workOrder,
      taxDistricts,
      applySurcharges,
    } = order;

    const options = {
      update: true,
      entityId: id,
      entityRepo: this,
    };

    // TODO: integrate new pricing here below
    const customRatesGroupId = order?.customRatesGroup?.originalId ?? null;

    let globalRatesService;
    let customRatesService;
    try {
      const ratesObj = await calcRates(
        this.ctxState,
        {
          businessUnitId,
          businessLineId,
          type: customRatesGroupId ? 'custom' : 'global',
          customRatesGroupId,

          billableService: {
            billableServiceId,
            equipmentItemId,
            materialId: materialBasedPricing ? mappedMaterialId : null,
          },
          applySurcharges,
        },
        trx,
      );

      const { globalRates, customRates } = ratesObj;
      ({ globalRatesService } = globalRates || {});
      ({ customRatesService } = customRates || {});

      if (!globalRatesService) {
        throw ApiError.notFound('Global rates for billable service item not found');
      }
    } catch (error) {
      this.ctxState.logger.error(error);
      return false;
    }

    const data = { materialId: mappedMaterialId ?? material?.originalId ?? null };
    const globalPrice = Number(globalRatesService.price);
    if (customRatesService) {
      const billableServicePrice = customRatesService.price
        ? Number(customRatesService.price)
        : globalPrice;

      Object.assign(data, {
        customRatesGroupServicesId: customRatesService.id,
        billableServicePrice,
        billableServiceTotal: billableServicePrice,
      });
    } else {
      const billableServicePrice = globalPrice;
      Object.assign(data, {
        globalRatesServicesId: globalRatesService.id,
        billableServicePrice,
        billableServiceTotal: billableServicePrice,
      });
    }

    const historicalIdsObj = await super.getLinkedHistoricalIds(
      {
        materialId: mappedMaterialId,
        globalRatesServicesId: data.globalRatesServicesId,
        customRatesGroupServicesId: data.customRatesGroupServicesId || null,
      },
      options,
      trx,
    );
    Object.assign(data, historicalIdsObj);

    let surchargesTotal = 0;
    let serviceTotalWithSurcharges = data.billableServiceTotal;
    let lineItemsWithSurcharges = lineItems;
    let thresholdsWithSurcharges = thresholds;
    let orderSurcharges = [];

    if (order.applySurcharges) {
      ({
        surchargesTotal,
        orderSurcharges,
        serviceTotalWithSurcharges,
        lineItemsWithSurcharges,
        thresholdsWithSurcharges,
      } = calculateSurcharges({
        materialId: mappedMaterialId,
        billableServiceId: order.billableService?.originalId,
        billableServicePrice: order.billableServicePrice,
        billableServiceApplySurcharges: order.billableService?.applySurcharges,
        lineItems:
          lineItems?.map(item => ({
            id: item.id,
            billableLineItemId: item.billableLineItem.originalId,
            materialId: item.material?.originalId,
            price: Number(item.price),
            quantity: Number(item.quantity),
            applySurcharges: item.applySurcharges,
          })) ?? [],
        addedSurcharges: order.surcharges,
        thresholds: order.thresholds?.map(threshold => ({
          ...threshold,
          price: Number(threshold.price),
          quantity: Number(threshold.quantity),
        })),
      }));
    }
    // TODO: integrate new pricing here above

    // TODO: integrate new pricing here below
    const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
      condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
      fields: ['region'],
    });

    const { taxesTotal } = calculateTaxes({
      taxDistricts,
      region,
      lineItems: lineItemsWithSurcharges,
      thresholds: thresholdsWithSurcharges?.map(threshold => ({
        id: threshold.id,
        thresholdId: threshold.threshold.originalId,
        price: Number(threshold.price),
        quantity: Number(threshold.quantity),
      })),
      workOrder,
      billableServiceId,
      materialId: mappedMaterialId,
      serviceTotal: serviceTotalWithSurcharges,
      businessLineId,
      commercial: order.commercialTaxesUsed,
    });

    let updatedOrderSurcharges = [];
    if (!isEmpty(orderSurcharges)) {
      updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
        orderSurcharges,
        { update: false },
        trx,
      );
    }
    // TODO: pass there billable item ids
    await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
      {
        data: updatedOrderSurcharges,
        condition: { orderId: order.id },
        fields: [],
      },
      trx,
    );

    data.surchargesTotal = Number(surchargesTotal) || 0;
    data.beforeTaxesTotal = mathRound2(
      data.billableServiceTotal + order.billableLineItemsTotal + order.thresholdsTotal,
    );
    data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);
    // TODO: integrate new pricing here above

    await super.updateBy(
      {
        condition: { id },
        data,
        fields: [],
      },
      trx,
    );
    return true;
  }

  async addMiscLineItems({ order, mappedMaterialId, miscLineItems }, trx = this.knex) {
    const {
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      billableService: { originalId: billableServiceId, materialBasedPricing },
      equipmentItem: { originalId: equipmentItemId },
      lineItems: prevLineItems,
      thresholdsTotal,
      workOrder,
      taxDistricts,
      id: orderId,
      applySurcharges,
    } = order;
    const materialId = mappedMaterialId ?? order.material?.originalId;

    const liRepo = LineItemRepo.getInstance(this.ctxState);
    const wasRemoved = await liRepo.deleteBy(
      { condition: { orderId, landfillOperation: true } },
      trx,
    );

    const recalculateTotals = async ({ newLineItems = [] } = {}) => {
      const {
        lineItems: lineItemsWithHistoricalIds = [],
        billableLineItemsTotal: newLineItemsTotal = 0,
      } = await this.getLineItemHistoricalIds(newLineItems, { update: false }, trx);

      let billableLineItemsTotal = +newLineItemsTotal;
      // since order was formed earlier so need to filter out recently removed line items
      const nonLoLineItems = prevLineItems?.filter(li => !li.landfillOperation) || [];
      if (nonLoLineItems.length) {
        const otherLineItemsTotal = mathRound2(
          nonLoLineItems.reduce((sum, { price, quantity }) => sum + price * quantity, 0),
        );

        billableLineItemsTotal = mathRound2(billableLineItemsTotal + otherLineItemsTotal);
      }

      let surchargesTotal = 0;
      let serviceTotalWithSurcharges = Number(order.billableServiceTotal) || 0;
      let lineItemsWithSurcharges = newLineItems.concat(
        nonLoLineItems.map(lineItem => ({
          id: lineItem.id,
          billableLineItemId: lineItem.billableLineItem?.originalId,
          materialId: lineItem.material?.originalId || null,
          price: Number(lineItem.price),
          quantity: Number(lineItem.quantity),
          applySurcharges: lineItem.applySurcharges,
        })),
      );
      let thresholdsWithSurcharges = order.thresholds;
      let orderSurcharges = [];

      if (order.applySurcharges) {
        ({
          surchargesTotal,
          orderSurcharges,
          serviceTotalWithSurcharges,
          lineItemsWithSurcharges,
          thresholdsWithSurcharges,
        } = calculateSurcharges({
          materialId,
          billableServiceId: order.billableService?.originalId,
          billableServicePrice: serviceTotalWithSurcharges,
          billableServiceApplySurcharges: order.billableService?.applySurcharges,
          lineItems: lineItemsWithSurcharges,
          addedSurcharges: order.surcharges,
          thresholds: order.thresholds,
        }));
      }

      const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
        condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
        fields: ['region'],
      });

      const { taxesTotal } = calculateTaxes({
        taxDistricts,
        region,
        lineItems: lineItemsWithSurcharges,
        thresholds: thresholdsWithSurcharges?.map(threshold => ({
          id: threshold.id,
          thresholdId: threshold.threshold.originalId,
          price: Number(threshold.price),
          quantity: Number(threshold.quantity),
        })),
        workOrder,
        billableServiceId,
        materialId,
        serviceTotal: serviceTotalWithSurcharges,
        businessLineId,
        commercial: order.commercialTaxesUsed,
      });

      const data = { billableLineItemsTotal };
      data.beforeTaxesTotal = mathRound2(
        order.billableServiceTotal + billableLineItemsTotal + thresholdsTotal,
      );
      data.surchargesTotal = Number(surchargesTotal) || 0;
      data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);

      let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          orderSurcharges,
          { update: false },
          trx,
        );
      }
      // TODO: pass there billable item ids
      await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
        {
          data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
          fields: ['id'],
        },
        trx,
      );

      await Promise.all([
        liRepo.insertMany(
          {
            data: lineItemsWithHistoricalIds.map(item => ({
              ...item,
              orderId,
              landfillOperation: true,
            })),
          },
          trx,
        ),
        super.updateBy(
          {
            condition: { id: orderId },
            data,
            fields: [],
          },
          trx,
        ),
      ]);
    };

    if (!miscLineItems.length) {
      await recalculateTotals();
      return false;
    }

    // bcz of active flag miscLineItems might be not equal to billableLineItems further
    const billableLineItems = await BillableLineItemRepo.getInstance(this.ctxState).getAllByIds(
      {
        ids: map(miscLineItems, 'billableLineItemId'),
        condition: { businessLineId, active: true },
        fields: ['id', 'materialBasedPricing'],
      },
      trx,
    );
    if (!billableLineItems?.length) {
      this.ctxState.logger.info('None billable line item not found for misc items');
      return false;
    }

    const customRatesGroupId = order?.customRatesGroup?.originalId ?? null;
    let globalRates;
    let customRates;
    try {
      // re-calc order prices for all line items
      const ratesObj = await calcRates(
        this.ctxState,
        {
          businessUnitId,
          businessLineId,

          type: customRatesGroupId ? 'custom' : 'global',
          customRatesGroupId,

          billableService: {
            billableServiceId,
            equipmentItemId,
            materialId: materialBasedPricing ? materialId : null,
          },

          billableLineItems: miscLineItems.map(
            ({ billableLineItemId: lineItemId, materialId: matId }) => ({
              lineItemId,
              materialId: billableLineItems.some(item =>
                item.id === lineItemId ? item.materialBasedPricing : false,
              )
                ? matId
                : null,
            }),
          ),
          applySurcharges,
        },
        trx,
      );

      ({ globalRates, customRates } = ratesObj);
    } catch (error) {
      this.ctxState.logger.error(error);
      return false;
    }

    const lineItemsToAdd = [];
    miscLineItems.forEach(({ billableLineItemId, materialId: matId, quantity }) => {
      const globalRate = globalRates?.globalRatesLineItems?.find(
        ({ lineItemId }) => lineItemId === billableLineItemId,
      );
      const customRate = customRates?.customRatesLineItems?.find(
        ({ lineItemId }) => lineItemId === billableLineItemId,
      );

      if (!isNilOrNaN(customRate?.price ?? globalRate?.price)) {
        lineItemsToAdd.push({
          billableLineItemId,
          materialId: matId || null,
          globalRatesLineItemsId: globalRate.id,
          customRatesGroupLineItemsId: customRate?.id,
          price: !isNilOrNaN(customRate?.price)
            ? Number(customRate.price)
            : Number(globalRate.price) || 0,
          quantity,
        });
      }
    });

    const wasAdded = lineItemsToAdd.length > 0;

    if (!wasAdded) {
      return false;
    }

    await recalculateTotals({ newLineItems: lineItemsToAdd });

    return wasRemoved || wasAdded;
  }

  getStream(ordersIds = []) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.id`, ordersIds)
      .select(fieldsForBilling.map(field => `${this.tableName}.${field}`))
      .stream();
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy(
      {
        condition: { id },
        fields: [
          'id',
          'status',
          'draft',
          ...nonLinkedInputFields,
          ...linkedInputFields,
          'workOrderId',
          'lineItems',
          'thresholds',
          'manifestItems',
          'taxDistricts',
          'applySurcharges',
        ],
      },
      trx,
    );

    return item || null;
  }

  ordersSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      serviceDate: `${this.tableName}.serviceDate`,
      total: `${this.tableName}.grandTotal`,
      woNumber: `${WorkOrderRepo.TABLE_NAME}.woNumber`,
      lineOfBusiness: `${BusinessLineRepo.TABLE_NAME}.name`,
      customerName: `${CustomerRepo.getHistoricalTableName()}.name`,
      jobSite: `${JobSiteRepo.getHistoricalTableName()}.fullAddress`,
      service: `${BillableServiceRepo.getHistoricalTableName()}.description`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }

  customerJobSitePairSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      serviceDate: `${this.tableName}.service_date`,
      order: `${this.tableName}.id`,
      status: `${this.tableName}.status`,
      total: `${this.tableName}.grand_total`,
      lineOfBusiness: `${BusinessLineRepo.TABLE_NAME}.name`,
      woNumber: `coalesce(${WorkOrderRepo.TABLE_NAME}.wo_number, ${IndependentWorkOrderRepository.TABLE_NAME}.wo_number)`,
      service: `${BillableServiceRepo.getHistoricalTableName()}.description`,
      material: `${MaterialRepo.getHistoricalTableName()}.description`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

OrderRepository.TABLE_NAME = TABLE_NAME;

export default OrderRepository;
