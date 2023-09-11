/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable eqeqeq */

import pick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';
import map from 'lodash/map.js';
import compact from 'lodash/compact.js';
import groupBy from 'lodash/groupBy.js';
import differenceWith from 'lodash/differenceWith.js';
import omit from 'lodash/fp/omit.js';
import merge from 'lodash/merge.js';
import { differenceInMinutes, differenceInCalendarDays } from 'date-fns';
import { calculateTaxes } from '../services/orderTaxation.js';
import { calculateSurcharges } from '../services/orderSurcharges.js';
import { calcRates } from '../services/orderRates.js';
import { publishers } from '../services/routePlanner/publishers.js';
import { getCansData } from '../services/dispatch.js';
import { camelCaseKeys, unambiguousCondition, parseArrayOfEmails } from '../utils/dbHelpers.js';
import { mathRound2 } from '../utils/math.js';
import isNilOrNaN from '../utils/isNilOrNumeric.js';
import ApiError from '../errors/ApiError.js';
import fieldToLinkedTableMap from '../consts/fieldToLinkedTableMap.js';
import {
  nonLinkedFields as nonLinkedInputFields,
  linkedFields as linkedInputFields,
  recurrentTemplateFields,
} from '../consts/orderFields.js';
import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';
import { ORDER_STATUS, ORDER_STATUSES } from '../consts/orderStatuses.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { WO_STATUS, WEIGHT_UNIT } from '../consts/workOrder.js';
import { LINE_ITEM_TYPE } from '../consts/lineItemTypes.js';
import { NO_PAYMENT, PAYMENT_METHOD } from '../consts/paymentMethods.js';
import { ORDER_SORTING_ATTRIBUTE } from '../consts/orderSortingAttributes.js';
import { ACTION, ONE_TIME_ACTION } from '../consts/actions.js';
import { THRESHOLD_TYPE } from '../consts/thresholdTypes.js';
import { THRESHOLD_SETTING } from '../consts/thresholdSettings.js';
import { INDEPENDENT_WO_STATUS } from '../consts/independentWorkOrder.js';
import { LEVEL_APPLIED } from '../consts/purchaseOrder.js';
import { OPEN_ORDER_SORTING_ATTRIBUTE } from '../consts/jobSiteSortingAttributes.js';
import { ORDER_REQUEST_STATUS } from '../consts/orderRequestStatuses.js';
import { GENERATED_ORDERS_SORTING_ATTRIBUTE } from '../consts/generatedOrdersSortingAttributes.js';
import { weightToUnits } from '../utils/unitsConvertor.js';
import {
  pricingAddLineItems,
  pricingAddOrder,
  pricingAlterOrder,
  pricingAddOrderTaxDistrict,
  pricingAddThreshold,
  pricingAddSurcharge,
  pricingUpsertThreshold,
  pricingGetPriceOrder,
  pricingUpsertSurcharge,
  pricingDeleteOrder,
  pricingAlterOrderCascade,
  pricingAddRecurrentOrderTemplateOrder,
  pricingGetOrderByOrderTemplate,
  pricingUpsertLineItems,
  pricingDeleteThreshold,
  pricingGetOrderTaxDistrict,
  pricingGetPriceOrderQuery,
  pricingPutOrderState,
  pricingGetByOrderTaxDistrict,
  pricingDeleteLineItems,
  pricingGetLineItems,
  pricingGetThreshold,
} from '../services/pricing.js';
import BaseRepository from './_base.js';
import VersionedRepository from './_versioned.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import LineItemRepo from './lineItem.js';
import ThresholdItemRepo from './thresholdItem.js';
import ManifestItemRepo from './manifestItems.js';
import WorkOrderRepo from './workOrder.js';
import IndependentWorkOrderRepository from './independentWorkOrder.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import ProjectRepo from './project.js';
import BillableLineItemRepo from './billableLineItem.js';
import BillableServiceRepo from './billableService.js';
import BillableSurchargeRepo from './billableSurcharge.js';
import SurchargeItemRepo from './orderSurcharge.js';
import EquipmentItemRepo from './equipmentItem.js';
import OrderTaxDistrictRepo from './orderTaxDistrict.js';
import MediaFileRepo from './mediaFile.js';
import CustomerTaxExemptionsRepo from './customerTaxExemptions.js';
import BusinessUnitRepo from './businessUnit.js';
import BusinessLineRepo from './businessLine.js';
import MaterialRepo from './material.js';
import DisposalSiteRepo from './disposalSite.js';
import CustomGroupRatesServiceRepo from './customRatesGroupService.js';
import RecurrentOrderTemplateOrderRepo from './recurrentOrderTemplateOrder.js';
import OrderTaxDistrictTaxesRepo from './orderTaxDistrictTaxes.js';
import OrderRequestRepo from './orderRequest.js';
import PreInvoicedOrderDraftRepo from './preInvoicedOrderDraft.js';
import PermitRepo from './permit.js';
import PurchaseOrderRepo from './purchaseOrder.js';
import ContactRepo from './contact.js';
import ThresholdRepo from './threshold.js';
import GlobalRatesThresholdRepo from './globalRatesThreshold.js';
import CustomRatesGroupThresholdRepo from './customRatesGroupThreshold.js';
import GlobalThresholdsSettingRepo from './globalThresholdsSetting.js';
import IndependentWorkOrderMediaRepo from './independentWorkOrderMedia.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import CustomRatesGroupLineItemRepo from './customRatesGroupLineItem.js';
import LandfillOperationRepo from './landfillOperation.js';
import OriginDistrictRepo from './originDistrict.js';
import TenantRepo from './tenant.js';
import ServiceAreaRepo from './serviceArea.js';
import ThirdPartyHaulersRepository from './3rdPartyHaulers.js';
import CompanyRepo from './company.js';

import CustomRatesGroupRepository from './customRatesGroup.js';
import TaxDistrictRepository from './taxDistrict.js';
import GlobalRatesServiceRepo from './globalRatesService.js';

const TABLE_NAME = 'orders';

const getNonLinkedInputFields = pick(nonLinkedInputFields);
const getLinkedInputFields = pick(linkedInputFields);
const getSpecificFieldsFromRecurrentTemplate = pick(recurrentTemplateFields);

const fieldsForBilling = ['id', 'business_line_id'];

const hasWorkOrder = ({ billableServiceId, thirdPartyHaulerId }) =>
  !!(billableServiceId && !thirdPartyHaulerId);

// @NOTE: "priceToDisplay" was added to the list of omissions because of R16-18 a bug where the customer was unable
// to reschedule orders with a line item.
// https://starlightpro.atlassian.net/browse/R16-18
// price_to_display column is a generated column referencing multiple refactoring_* columns. The refactoring_* columns
// are a relic of the Eleks initial work into refactoring the pricing engine.
// This applies to rescheudling orders without a trip fee
const omitExtraTripChargeFields = omit([
  'billableLineItem',
  'globalRatesLineItem',
  'customRatesGroupLineItem',
  'material',
  'updatedAt',
  'priceToDisplay',
]);

class OrderRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        if (obj.customer) {
          obj.customer = CustomerRepo.getInstance(this.ctxState).mapFields(obj.customer);
          parseArrayOfEmails(obj.customer, 'invoiceEmails');
          parseArrayOfEmails(obj.customer, 'statementEmails');
          parseArrayOfEmails(obj.customer, 'notificationEmails');
        }
        if (obj.serviceArea) {
          obj.serviceArea = ServiceAreaRepo.getInstance(this.ctxState).mapFields(obj.serviceArea);
        }
        if (obj.customerJobSite) {
          obj.customerJobSite = CustomerJobSitePairRepo.getInstance(this.ctxState).mapFields(
            obj.customerJobSite,
          );
          parseArrayOfEmails(obj.customerJobSite, 'invoiceEmails');
        }
        if (obj.project) {
          obj.project = ProjectRepo.getInstance(this.ctxState).mapFields(obj.project);
        }
        if (obj.disposalSite) {
          obj.disposalSite = DisposalSiteRepo.getInstance(this.ctxState).mapFields(
            obj.disposalSite,
          );
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
    )(originalObj);
  }

  async createOne({ data, tenantId, linkedCjsPair, businessUnit } = {}, ctx) {
    data.status = ORDER_STATUS.completed;

    if ((hasWorkOrder(data) || data.deferredPayment) && !data.recycling) {
      data.status = ORDER_STATUS.inProgress;
    }

    const { payments, orderRequestId, customerId, businessLineId } = data;
    const { customer } = linkedCjsPair;
    let insertData;
    let order;
    let workOrder;
    let lineItemIds;
    let independentWorkOrder;
    let defaultFacilityJobSiteId;
    let purchaseOrder;

    const woIdToUpdate = {};
    const trx = await this.knex.transaction();

    const hasNoJobSite = !data.jobSiteId;

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

      insertData.taxDistricts = [];

      if (linkedCjsPair && !hasNoJobSite) {
        insertData.taxDistricts = linkedCjsPair.taxDistricts ?? [];
      }

      if (
        data.originDistrictId &&
        (hasNoJobSite || (!hasNoJobSite && isEmpty(insertData.taxDistricts)))
      ) {
        const taxDistrict = await OriginDistrictRepo.getInstance(
          this.ctxState,
        ).getTaxDistrictByOriginDistrict({ condition: { id: data.originDistrictId } }, trx);

        if (taxDistrict) {
          insertData.taxDistricts.push(taxDistrict);
        }
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
          permitRequired: data.permitRequired,
        };

        let newMediaFiles = [];
        if (data.orderRequestMediaUrls?.length) {
          // TODO pricing: call pricing api here
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
        billableServiceId,
        materialId,
        creditCardId,
        billableService,
        billableServicePrice,
        billableServiceApplySurcharges,
        businessUnitId,
        customRatesGroupId,
      } = data;

      let surchargesTotal = 0;
      let serviceTotalWithSurcharges = insertData.billableServiceTotal;
      let lineItemsWithSurcharges = data.lineItems;
      let orderSurcharges = [];

      if (data.applySurcharges) {
        const surcharges = await BillableSurchargeRepo.getInstance(this.ctxState).getAll(
          {
            condition: { active: true, businessLineId },
          },
          trx,
        );

        const { customRates, globalRates } = await calcRates(
          this.ctxState,
          {
            businessUnitId,
            businessLineId,
            customRatesGroupId,
            type: customRatesGroupId ? 'custom' : 'global',
          },
          trx,
        );

        // surcharges are not possible for recycling order thats why thresholds missed here
        ({ surchargesTotal, serviceTotalWithSurcharges, lineItemsWithSurcharges, orderSurcharges } =
          calculateSurcharges({
            globalRatesSurcharges: globalRates?.globalRatesSurcharges,
            customRatesSurcharges: customRates?.customRatesSurcharges,
            materialId,
            billableServiceId,
            billableService,
            billableServicePrice,
            billableServiceApplySurcharges,
            lineItems: data.lineItems,
            surcharges,
          }));
      }

      let notExemptedDistricts = taxDistricts;

      if (!isEmpty(taxDistricts)) {
        const exemptedTaxDistricts = await CustomerTaxExemptionsRepo.getInstance(
          this.ctxState,
        ).getExemptedDistricts(
          {
            customerId: data.customerId,
            customerJobSiteId: linkedCjsPair.id,
            taxDistrictIds: map(taxDistricts, 'id'),
            useCustomerJobSite: !hasNoJobSite,
          },
          trx,
        );

        notExemptedDistricts = notExemptedDistricts.filter(
          ({ id }) => !exemptedTaxDistricts.includes(id),
        );
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
        thresholds: data.thresholds?.map(threshold => ({
          id: threshold.id,
          thresholdId: threshold.thresholdId,
          price: Number(threshold.price),
          quantity: Number(threshold.quantity),
        })),
        billableServiceId,
        materialId,
        serviceTotal: serviceTotalWithSurcharges,
        businessLineId: insertData.businessLineId,
        commercial: insertData.commercialTaxesUsed,
      });
      insertData.surchargesTotal = Number(surchargesTotal) || 0;
      insertData.grandTotal = mathRound2(
        insertData.beforeTaxesTotal + surchargesTotal + (taxesTotal || 0),
      );

      insertData.initialGrandTotal = insertData.grandTotal;

      const onAccountPayment = payments.find(
        payment => payment.paymentMethod === PAYMENT_METHOD.onAccount,
      );

      if (payments.length === 1 && onAccountPayment) {
        insertData.onAccountTotal = insertData.grandTotal;
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
      const customerHisto = await CustomerRepo.getHistoricalInstance(this.ctxState).getRecentBy({
        condition: { originalId: customerId },
      });

      // pre-pricing service code:
      // Create order and set IDs to latest historical records.
      // order = await super.createOne(
      //   { data: insertData, fields: ['id', 'grandTotal', 'purchaseOrderId'] },
      //   trx,
      // );
      // end of pre-pricing service code
      if (insertData.billableServiceId) {
        const service = await BillableServiceRepo.getHistoricalInstance(ctx.state).getRecentBy({
          condition: { originalId: insertData.billableServiceId },
        });
        insertData.billableServiceId = service.id;
      }

      if (insertData.materialId) {
        const materials = await MaterialRepo.getHistoricalInstance(ctx.state).getRecentBy({
          condition: { originalId: insertData.materialId },
        });
        insertData.materialId = materials.id;
      }

      if (insertData.jobSiteId) {
        const jobSites = await JobSiteRepo.getHistoricalInstance(ctx.state).getRecentBy({
          condition: { originalId: insertData.jobSiteId },
        });
        insertData.jobSiteId = jobSites.id;
      }

      const newInsertData = {
        ...insertData,
        customerId: customerHisto.id,
        originalCustomerId: customerId,
        orderContactId: insertData.orderContactId > 0 ? insertData.orderContactId : null,
        jobSiteContactId: insertData.jobSiteContactId > 0 ? insertData.jobSiteContactId : null,
      };
      order = await pricingAddOrder(ctx, { data: newInsertData });

      // order = await super.createOne({ data: insertData, fields: ['id', 'grandTotal', 'purchaseOrderId'] }, trx);
      // end of post-pricing service code

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
          );
        }
      }

      const { id: orderId } = order;
      // TODO refactor wo id updates for order because now is duplicate for roll-off
      if (workOrder) {
        if (checkRollOffOrder) {
          woIdToUpdate.workOrderId = workOrder.id;
        } else {
          woIdToUpdate.independentWorkOrderId = workOrder.id;
          woData.woNumber = workOrder.woNumber;
        }

        await pricingAlterOrder(ctx, { data: woIdToUpdate }, orderId);
      }
      // Create order line items.
      if (!isEmpty(lineItems)) {
        const originalLineItems = data.lineItems;
        // pre-pricing service code:
        // const items = await LineItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        //     data: lineItems.map((item) => Object.assign(item, { orderId })),
        //     fields: ['id'],
        //   },
        //   trx,
        // );
        const items = await pricingAddLineItems(ctx, {
          data: { data: originalLineItems.map(item => Object.assign(item, { orderId })) },
        });
        lineItemIds = map(items, 'id');
      }

      if (!isEmpty(notExemptedDistricts)) {
        // await OrderTaxDistrictRepo.getInstance(this.ctxState).insertWithNonHistoricalIds(
        //  {
        //    orderId,
        //    taxDistrictIds: map(notExemptedDistricts, 'id'),
        //  },
        //  trx,
        // );
        const toInsert = await OrderTaxDistrictRepo.getInstance(
          this.ctxState,
        ).calcInsertWithNonHistoricalIds(
          {
            orderId,
            taxDistrictIds: map(notExemptedDistricts, 'id'),
          },
          trx,
        );

        await pricingAddOrderTaxDistrict(ctx, { data: { data: toInsert } });
      }

      if (!isEmpty(orderSurcharges)) {
        const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          orderSurcharges,
          { update: false },
          // pre-pricing service code:
          //   trx,
          // );

          // // TODO: pass there billable item ids
          // await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
          //   {
          //     data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
          //     fields: ['id'],
          //   },
          // end of pre-pricing service code
          trx,
        );
        await pricingAddSurcharge(ctx, {
          data: { data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })) },
        });
        // const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(orderSurcharges, { update: false }, trx);
        // TODO: search here
        // TODO: pass there billable item ids
        // await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
        // {
        //    data: updatedOrderSurcharges.map((item) => Object.assign(item, { orderId })),
        //    fields: ['id'],
        //  },
        //  trx,
        // );
      }

      if (!isEmpty(thresholds)) {
        // pre-pricing service code:
        //   await ThresholdItemRepo.getInstance(this.ctxState).insertMany(
        //     {
        //       data: thresholds?.length
        //         ? thresholds.map(item => Object.assign(item, { orderId }))
        //         : [],
        //       fields: ['id'],
        //     },
        //     trx,
        //   );
        // }

        // if (orderRequestId) {
        // end of pre-pricing service code
        await pricingAddThreshold(ctx, {
          data: { data: thresholds.map(item => Object.assign(item, { orderId })) },
        });
        // await ThresholdItemRepo.getInstance(this.ctxState).insertMany(
        //  {
        //    data:  thresholds.map((item) => Object.assign(item, { orderId })),
        //    fields: ['id'],
        //  },
        //  trx,
        // );
      }

      if (orderRequestId) {
        // TODO pricing: call pricing api here

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
        purchaseOrder = await PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
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
          independentWorkOrderId: woIdToUpdate.independentWorkOrderId,
          preferredRoute: data.route,
        };
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return order
      ? {
          insertData,
          id: order.id,
          grandTotal: Number(order.grandTotal),
          workOrderId: woIdToUpdate.workOrderId,
          lineItemIds,
          independentWorkOrder,
          defaultFacilityJobSiteId,
          poNumber: purchaseOrder?.poNumber ?? null,
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

    if ((!jobSiteId && businessUnit?.jobSiteId) || jobSiteId === businessUnit?.jobSiteId) {
      defaultData.jobSiteId = businessUnit.jobSiteId;
    }

    return defaultData;
  }

  // pre-pricing service code:
  // async createOneFromRecurrentOrderTemplate({
  //   data,
  //   tenantId,
  //   recurrentOrderTemplateId,
  //   linkedCjsPair,
  // } = {}) {
  // end of pre-pricing service code
  async createOneFromRecurrentOrderTemplate(
    ctx,
    { data, tenantId, recurrentOrderTemplateId, linkedCjsPair } = {},
  ) {
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
      const [{ id: pairHistoricalId }] = await Promise.all([
        CustomerJobSitePairRepo.getHistoricalInstance(this.ctxState, {
          schemaName: this.schemaName,
        }).getRecentBy(
          {
            condition: { originalId: data.customerJobSiteId },
            fields: ['id'],
          },
          trx,
        ),
        // RecurrentOrderTemplateRepo.getInstance(this.ctxState).getBy(
        //   {
        //     condition: { id: 34 },
        //     fields: [
        //       'id',
        //       'alleyPlacement',
        //       'cabOver',
        //       'signatureRequired',
        //       'billableServiceId',
        //       'equipmentItemId',
        //       'materialId',
        //       'lineItems',
        //       'customRatesGroupId',
        //     ],
        //   },
        //   trx,
        // ),
      ]);

      const billableServiceData = await BillableServiceRepo.getHistoricalInstance(
        this.ctxState,
      ).getBy({
        condition: { id: data.billableServiceId },
      });

      const customRatesGroupData = await CustomRatesGroupRepository.getHistoricalInstance(
        this.ctxState,
      ).getBy({
        condition: { id: data.customRatesGroupId },
      });

      const equipmentItemData = await EquipmentItemRepo.getHistoricalInstance(this.ctxState).getBy({
        condition: { id: data.equipmentItemId },
      });

      const materialData = await MaterialRepo.getHistoricalInstance(this.ctxState).getBy({
        condition: { id: data.materialId },
      });

      data.customRatesGroup = customRatesGroupData;
      data.billableService = billableServiceData;
      data.equipmentItem = equipmentItemData;
      data.material = materialData;

      for (let index = 0; index < data.lineItems.length; index++) {
        const billableLineItemData = await BillableLineItemRepo.getHistoricalInstance(
          this.ctxState,
        ).getBy({
          condition: { id: data.lineItems[index].billableLineItemId },
        });
        const materialDatas = await MaterialRepo.getHistoricalInstance(this.ctxState).getBy({
          condition: { id: data.lineItems[index].materialId },
        });
        const globalRatesLineItemDate = await GlobalRatesLineItemRepo.getHistoricalInstance(
          this.ctxState,
        ).getBy({
          condition: { id: data.lineItems[index].globalRatesLineItemsId },
        });

        data.lineItems[index].billableLineItem = billableLineItemData;
        data.lineItems[index].material = materialDatas;
        data.lineItems[index].globalRatesLineItem = globalRatesLineItemDate;
      }
      const roTemplate = data;

      insertData.customerJobSiteId = pairHistoricalId;
      insertData.taxDistricts = linkedCjsPair?.taxDistricts;

      // Create work order conditionally
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
        );
      }

      if (workOrder) {
        insertData.workOrderId = workOrder.id;
      }

      const { lineItems, taxDistricts } = insertData;
      delete insertData.lineItems;
      delete insertData.taxDistricts;

      let notExemptedDistricts = taxDistricts;
      // eslint-disable-next-line no-constant-binary-expression
      if (!isEmpty(linkedCjsPair) ?? !isEmpty(taxDistricts)) {
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

      const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
        condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
        fields: ['region'],
      });

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
      // order = await super.createOne({ data: insertData, fields: ['id', 'grandTotal'] }, trx);
      order = await pricingAddOrder(ctx, { data: insertData });

      const { id: orderId } = order;
      // Create order line items.
      if (!isEmpty(lineItems)) {
        lineItems.forEach(item => {
          delete item.id;
          delete item.recurrentOrderTemplateId;
        });

        // pre-pricing service code:
        // const items = await LineItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        //     data: lineItems.map(item => Object.assign(item, { orderId })),
        //     fields: ['id'],
        //   },
        //   trx,
        // );
        // end of pre-pricing service code
        const items = await pricingAddLineItems(ctx, {
          data: { data: lineItems.map(item => Object.assign(item, { orderId })) },
        });

        lineItemIds = map(items, 'id');
      }

      // let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        // pre-pricing service code:
        // updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
        //   orderSurcharges,
        //   { update: false },
        //   trx,
        // );
        // end of pre-pricing service code
        await pricingAddSurcharge(ctx, {
          data: { data: orderSurcharges.map(item => Object.assign(item, { orderId })) },
        });
        // updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(orderSurcharges, { update: false }, trx);
        // // TODO: pass there billable item ids
        // await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
        //   {
        //     data: updatedOrderSurcharges,
        //     condition: { orderId },
        //     fields: [],
        //   },
        //   trx,
        // );
      }

      // pre-pricing service code:
      // await RecurrentOrderTemplateOrderRepo.getInstance(this.ctxState).createOne(
      //   { data: { orderId, recurrentOrderTemplateId } },
      //   trx,
      // );
      // end of pre-pricing service code
      // await RecurrentOrderTemplateOrderRepo.getInstance(this.ctxState).createOne({ data: { orderId, recurrentOrderTemplateId } }, trx);

      await pricingAddRecurrentOrderTemplateOrder(ctx, {
        data: { orderId, recurrentOrderTemplateId },
      });

      if (!isEmpty(notExemptedDistricts)) {
        // await OrderTaxDistrictRepo.getInstance(this.ctxState).insertWithNonHistoricalIds(
        //   {
        //     orderId,
        //     taxDistrictIds: map(notExemptedDistricts, 'id'),
        //   },
        //   trx,
        // );
        const toInsert = await OrderTaxDistrictRepo.getInstance(
          this.ctxState,
        ).calcInsertWithNonHistoricalIds(
          {
            orderId,
            taxDistrictIds: map(notExemptedDistricts, 'id'),
          },
          trx,
        );

        await pricingAddOrderTaxDistrict(ctx, { data: { data: toInsert } });
      }

      Object.assign(insertData, {
        lineItems,
        taxDistricts: notExemptedDistricts,
        customerJobSite: {
          ...omit(['customer', 'jobSite', 'taxDistricts', 'purchaseOrders'])(linkedCjsPair),
          customerId: linkedCjsPair.customer.id,
          jobSiteId: linkedCjsPair.jobSite.id,
        },
      });

      await trx.commit();
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
    // const linkedFields = getLinkedInputFields(data);

    const update = !!orderId;
    // const historicalLinkedFields = await super.getLinkedHistoricalIds(
    //   linkedFields,
    //   {
    //     update,
    //     entityId: orderId,
    //     entityRepo: this,
    //   },
    //   trx,
    // );

    // TODO: Create a better logic
    Object.assign(result, data);

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
        'globalRatesSurchargesId',
        'customRatesGroupSurchargesId',
        // 'billableServiceId',
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

  // eslint-disable-next-line no-unused-vars
  async getLineItemHistoricalIds(lineItems, { update = false } = {}, trx = this.knex) {
    const lineItemArray = lineItems ? Array.from({ length: lineItems.length }) : [];
    let billableLineItemsTotal = 0;

    if (!isEmpty(lineItems)) {
      // pre-pricing service code:
      // const pickIds = pick([
      //   'billableLineItemId',
      //   'materialId',
      //   'globalRatesLineItemsId',
      //   'customRatesGroupLineItemsId',
      // ]);
      // end pre-pricing service code

      await Promise.all(
        lineItems.map(async (item, i) => {
          billableLineItemsTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
            // pre-pricing service code:
            // );

            // const updatedItem = await super.getLinkedHistoricalIds(
            //   pickIds(item),
            //   {
            //     update: !!(update && item?.id),
            //     entityId: item?.id,
            //     entityRepo,
            //   },
            //   trx,
            // );

            // lineItemArray[i] = { ...item, ...updatedItem };
            // end pre-pricing service code
          );
          let itemId;
          if (item.id) {
            const getLineItem = await pricingGetLineItems(this.getCtx(), { data: { id: item.id } });
            itemId = getLineItem[0].id;
          }
          lineItemArray[i] = { ...item, ...itemId };
          // end of added code
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
        'beforeTaxesTotal',
        'initialGrandTotal',
        'grandTotal',
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

        'customRatesGroupId',
        'globalRatesServicesId',
        'customRatesGroupServicesId',

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
        'customerJobSiteId',
        'notifyDayBefore',
        'serviceAreaId',
        'bestTimeToComeFrom',
        'bestTimeToComeTo',
      ],
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
    const result = await query.orderBy(`${this.tableName}.id`, SORT_ORDER.desc);
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
      // pre-pricing service code:
      // order.thresholds = await ThresholdItemRepo.getInstance(
      //   this.ctxState,
      // ).populateThresholdItemsByOrderIds([order.id], trx);
      // end pre-pricing service code
      // order.thresholds = await ThresholdItemRepo.getInstance(this.ctxState).populateThresholdItemsByOrderIds([order.id], trx);
      order.thresholds = await pricingGetThreshold(this.getCtx(), { data: { orderId: order.id } });
    }

    //re calculate thresholds total
    order.thresholdsTotal = order.thresholds?.reduce((prev, cur) => {
      const price = cur.price;
      const quantity = cur.quantity;
      const unit = cur.threshold.unit;
      // TODO: In case you need to use a different unit, add the necessary conversion logic
      if (unit === 'ton') {
        return prev + (Math.round((quantity * 0.001102 + Number.EPSILON) * 100) / 100) * price;
      } else {
        return prev + quantity * price;
      }
    }, 0);

    //re calculate before taxes total
    order.beforeTaxesTotal =
      order.thresholdsTotal + order.billableLineItemsTotal + order.billableServicePrice;
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

    const surchargesTotal = order?.surcharges
      ?.map(item => item.amount)
      .reduce((item1, item2) => item1 + item2, 0);

    //re calculate grand total
    order.grandTotal = !!order.grandTotal
      ? order.grandTotal
      : (order.thresholdsTotal || 0) +
        (order.billableLineItemsTotal || 0) +
        (order.surchargesTotal || surchargesTotal || 0) +
        (order.billableServicePrice || 0);

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
      'grandTotal',
      'createdAt',
      'csrEmail',
      'csrName',
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
    ];
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

    if (filters?.filterByHauler?.length) {
      query.leftJoin(
        ThirdPartyHaulersRepository.getHistoricalTableName(),
        `${ThirdPartyHaulersRepository.getHistoricalTableName()}.id`,
        `${this.tableName}.thirdPartyHaulerId`,
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
        'grandTotal',
        'materialId',
        'businessUnitId',
        'businessLineId',
        'independentWorkOrderId',
        'isRollOff',
      ],
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
      'grandTotal',
      'materialId',
      'businessUnitId',
      'businessLineId',
    ],
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
  // pricing service code:
  async getAllPaginatedByRecurrentOrderTemplatePricing(ctx, recurrentOrderTemplateId) {
    const items = await pricingGetOrderByOrderTemplate(ctx, {
      data: { id: recurrentOrderTemplateId },
    });

    for (let index = 0; index < items.length; index++) {
      const billableServiceData = await BillableServiceRepo.getInstance(ctx.state).getBy({
        condition: { id: items[index].billableServiceId },
      });

      const businessUnitData = await BusinessUnitRepo.getInstance(ctx.state).getBy({
        condition: { id: items[index].businessUnitId },
      });

      const businessLineData = await BusinessLineRepo.getInstance(ctx.state).getBy({
        condition: { id: items[index].businessLineId },
      });

      const workOrderData = await WorkOrderRepo.getInstance(ctx.state).getBy({
        condition: { id: items[index].workOrderId },
      });

      const materialData = await MaterialRepo.getInstance(ctx.state).getBy({
        condition: { id: items[index].materialId },
      });

      items[index].billableService = billableServiceData;
      items[index].businessUnit = businessUnitData;
      items[index].businessLine = businessLineData;
      items[index].workOrder = workOrderData;
      items[index].material = materialData;
    }

    return items?.map(this.mapFields.bind(this));
  }

  async populateDataQuery(
    fields,
    trx = this.knex,
    { pullSelects = false, includeDrafts = false, performSearch = false } = {},
  ) {
    let query = trx(this.tableName).withSchema(this.schemaName).where({ draft: includeDrafts });

    const linkedFields = [];
    const nonLinkedFields = ['callOnWayPhoneNumberId', 'textOnWayPhoneNumberId', 'purchaseOrderId'];
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
    ];

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

    if (filters?.filterByHauler?.length) {
      query.leftJoin(
        ThirdPartyHaulersRepository.getHistoricalTableName(),
        `${ThirdPartyHaulersRepository.getHistoricalTableName()}.id`,
        `${this.tableName}.thirdPartyHaulerId`,
      );
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
      // eslint-disable-next-line no-unused-vars
      fields = [],
      // eslint-disable-next-line no-unused-vars
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

    const [data] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });
    const originalOrder = { ...data };
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

    const unitSystem = await CompanyRepo.getInstance(this.ctxState).getWithTenant({
      condition: { tenantName: this.ctxState.user.schemaName },
      fields: ['unit'],
    });

    // Re-calculate thresholds sum since they are passed as [id, thresholdId, price, quantity].
    if (thresholds?.length) {
      // pre-pricing service code:
      // const thresholdTypesConvertable = {};
      // const ids = thresholds.map(i => i.threshold.originalId);
      // const loadThresholds = await ThresholdRepo.getInstance(this.ctxState).getAllByIds({ ids });
      // loadThresholds.forEach(t => {
      //   thresholdTypesConvertable[t.id] =
      //     t.type !== THRESHOLD_TYPE.demurrage && t.type !== THRESHOLD_TYPE.usageDays;
      // });

      // const getQuantity = (quantity, thresholdId) => {
      //   if (thresholdTypesConvertable[thresholdId]) {
      //     return weightToUnits(quantity, unitSystem.unit);
      //   }

      //   return quantity;
      // };

      // data.thresholdsTotal = mathRound2(
      //   thresholds.reduce(
      //     (sum, { price, quantity, threshold: t }) =>
      //       sum + price * getQuantity(quantity, t.originalId),
      //     0,
      //   ),
      // );
      // data.beforeTaxesTotal = mathRound2(data.beforeTaxesTotal + Math.round(data.thresholdsTotal));
      // end of pre-pricing service code
      data.thresholdsTotal = mathRound2(
        thresholds.reduce((sum, { price, quantity }) => sum + price * quantity, 0),
      );
      data.beforeTaxesTotal = mathRound2(data.beforeTaxesTotal + data.thresholdsTotal);
      // end of post-pricing service code
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
          unitSystem: unitSystem.unit,
        }));
      }

      const [taxDistricts, { region }] = await Promise.all([
        pricingGetOrderTaxDistrict(this.getCtx(), { data: { id } }),
        TenantRepo.getInstance(this.ctxState).getBy({
          condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
          fields: ['region'],
        }),
      ]);
      for (let index = 0; index < taxDistricts.length; index++) {
        const element = taxDistricts[index];
        // eslint-disable-next-line prefer-destructuring
        element.taxDistrict = (
          await TaxDistrictRepository.getHistoricalInstance(this.ctxState).getBy(
            { condition: { id: element.taxDistrictId } },
            trx,
          )
        )[0];
        element.businessConfiguration = element.taxDistrict.businessConfiguration;

        taxDistricts[index] = element;
      }

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
          quantity: weightToUnits(Number(threshold.quantity), unitSystem.unit),
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

      data.surchargesTotal = Number(surchargesTotal) || 0;
      data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);

      if (
        data.paymentMethod === PAYMENT_METHOD.onAccount ||
        (data.paymentMethod === PAYMENT_METHOD.mixed && data.onAccountTotal > 0)
      ) {
        data.onAccountTotal = data.grandTotal;
      }

      const condition = { id };
      status && (condition.status = status);

      if (rawData.oneTimePurchaseOrderNumber && originalOrder.customerId) {
        const { originalId: customerOriginalId } = await CustomerRepo.getInstance(
          this.ctxState,
        ).getHistoricalRecordById({ id: originalOrder.customerId, fields: ['originalId'] }, trx);

        // pre-pricing service code:
        // if (rawData.oneTimePurchaseOrderNumber && oldOrder.customerId) {
        //   const { originalId: customerOriginalId } = await CustomerRepo.getInstance(
        //     this.ctxState,
        //   ).getHistoricalRecordById({ id: oldOrder.customerId, fields: ['originalId'] }, trx);

        // end of pre-pricing service code
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
      data.status = ORDER_STATUS.completed;
      data.disposalSiteId = rawData.disposalSiteId;
      // throw ApiError.accessDenied('jajaja');
      order = await pricingAlterOrder(this.getCtx(), { data }, id);

      if (order) {
        const orderId = id;
        await Promise.all([
          pricingUpsertLineItems(this.getCtx(), {
            data: { data: lineItems?.length ? lineItems : orderId },
          }),
        ]);

        if (workOrder) {
          const { manifestFiles = [], woNumber } = workOrder;
          delete workOrder.manifestFiles;
          const disposalSite = workOrder.disposalSiteId;
          delete workOrder.disposalSiteId;

          if (woNumber && order.isRollOff) {
            // override WO-related fields if WO exists
            await WorkOrderRepo.getInstance(this.ctxState).updateWithImages(workOrder, _trx);
          }
          workOrder.disposalSiteId = disposalSite;

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
            const { truckId, ...independentWorkOrder } = workOrder;
            await IndependentWorkOrderRepository.getInstance(this.ctxState).updateOne(
              {
                condition: {
                  id: order.independentWorkOrderId,
                },
                data: {
                  ...independentWorkOrder,
                  truck: truckId,
                },
              },
              _trx,
            );
          }
        }

        if (!isEmpty(orderSurcharges)) {
          const updatedSurcharges = await this.getOrderSurchargeHistoricalIds(
            orderSurcharges,
            { update: false },
            // pre-pricing service code:
            //   _trx,
            // );

            // // TODO: pass there billable item ids
            // await SurchargeItemRepo.getInstance(this.ctxState).upsertItems(
            //   {
            //     data: updatedSurcharges,
            //     condition: { orderId },
            //     fields: [],
            //   },
            // end of pre-pricing service code
            _trx,
          );
          await pricingUpsertSurcharge(this.getCtx(), {
            data: updatedSurcharges.map(item => Object.assign(item, { orderId: order.id })),
          });
        }
      }

      // pre-pricing service code:
      // if (oldOrder.purchaseOrderId !== order.purchaseOrderId) {
      //   await PurchaseOrderRepo.getInstance(this.ctxState)
      //     .checkIfShouldRemoveLevelAppliedValue(oldOrder.purchaseOrderId, trx)
      // end of pre-pricing service code
      if (originalOrder.purchaseOrderId !== order.purchaseOrderId) {
        await PurchaseOrderRepo.getInstance(this.ctxState)
          .checkIfShouldRemoveLevelAppliedValue(data.purchaseOrderId, trx)
          // end of post-pricing service code
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

  async addTripCharge(
    order,
    { lineItems, surcharges, billableServiceTotal, billableServicePrice, isCancellation = false },
    trx,
  ) {
    const {
      // id: orderId,
      businessUnitId,
      businessLineId,
      billableService,
      material,
      workOrder,
      taxDistricts,
      thresholds,
      applySurcharges,
    } = order;
    const materialId = material?.originalId ?? null;
    const customRatesGroupId = order.customRatesGroup?.originalId ?? null;

    const tripChargeLineItem = await BillableLineItemRepo.getInstance(this.ctxState).getBy(
      {
        condition: {
          type: LINE_ITEM_TYPE.tripCharge,
          businessLineId,
        },
        fields: ['id', 'applySurcharges', 'materialBasedPricing'],
      },
      trx,
    );

    const billableLineItemId = tripChargeLineItem.id;
    const ratesObj = await calcRates(
      this.ctxState,
      {
        businessUnitId,
        businessLineId,
        type: customRatesGroupId ? 'custom' : 'global',
        customRatesGroupId,
        billableLineItems: [
          {
            lineItemId: billableLineItemId,
            materialId: tripChargeLineItem.materialBasedPricing ? materialId : null,
          },
        ],
        applySurcharges,
      },
      trx,
    );

    let globalRatesLineItemsId;
    let customRatesGroupLineItemsId;
    let price;
    if (!isEmpty(ratesObj.customRates) && !isEmpty(ratesObj.customRates.customRatesLineItems)) {
      const [item] = ratesObj.customRates.customRatesLineItems;
      ({ price } = item);
      customRatesGroupLineItemsId = item.id;
    }
    if (!isEmpty(ratesObj.globalRates) && !isEmpty(ratesObj.globalRates.globalRatesLineItems)) {
      const [item] = ratesObj.globalRates.globalRatesLineItems;
      price || ({ price } = item);
      globalRatesLineItemsId = item.id;
    }

    if (!price) {
      throw ApiError.notFound('Global rates for Trip Charge billable line item not found');
    }

    const tripCharge = {
      billableLineItem: { originalId: billableLineItemId },
      billableLineItemId,
      globalRatesLineItemsId,
      customRatesGroupLineItemsId,
      materialId: null,
      price,
      quantity: 1,
      applySurcharges: tripChargeLineItem.applySurcharges,
    };

    const {
      lineItems: [historicalTripCharge],
    } = await this.getLineItemHistoricalIds([tripCharge], { update: false }, trx);

    // push current trip charge in order to calculate surcharges & taxes
    lineItems.push(tripCharge);

    let surchargesTotal = 0;
    let serviceTotalWithSurcharges = Number(billableServiceTotal) || 0;
    let lineItemsWithSurcharges = lineItems;
    let thresholdsWithSurcharges = thresholds;
    let orderSurcharges = [];

    if (applySurcharges) {
      ({
        surchargesTotal,
        serviceTotalWithSurcharges,
        lineItemsWithSurcharges,
        thresholdsWithSurcharges,
        orderSurcharges,
      } = calculateSurcharges({
        materialId,
        billableServiceId: billableService?.originalId,
        billableServicePrice,
        billableServiceApplySurcharges: billableService?.applySurcharges,
        lineItems: lineItemsWithSurcharges.map(lineItem => ({
          id: lineItem.id,
          billableLineItemId: lineItem.billableLineItem?.originalId,
          materialId: null,
          price: Number(lineItem.price),
          quantity: Number(lineItem.quantity),
          applySurcharges: lineItem.applySurcharges,
        })),
        addedSurcharges: surcharges,
        thresholds,
      }));
    }

    const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
      condition: { name: this.ctxState.user.tenantName },
      fields: ['region'],
    });

    const { taxesTotal } = calculateTaxes({
      taxDistricts,
      region,
      includeServiceTax: !isCancellation || serviceTotalWithSurcharges > 0,
      lineItems: lineItemsWithSurcharges,
      thresholds: thresholdsWithSurcharges?.map(threshold => ({
        id: threshold.id,
        thresholdId: threshold.threshold.originalId,
        price: Number(threshold.price),
        quantity: Number(threshold.quantity),
      })),
      workOrder,
      billableServiceId: billableService?.originalId,
      materialId,
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
      // post pricing code
      await pricingUpsertSurcharge(this.getCtx(), {
        data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId: order.id })),
      });
    }

    // replace current trip charge with historical one to satisfy db constraints
    lineItems[lineItems.length - 1] = historicalTripCharge;

    return {
      price: Number(price),
      taxesTotal: Number(taxesTotal),
      surchargesTotal: Number(surchargesTotal),
    };
  }

  async cancelOne(
    {
      condition: { id },
      // eslint-disable-next-line no-unused-vars
      concurrentData,
      data: { reasonType, comment, addTripCharge } = {},
      // eslint-disable-next-line no-unused-vars
      fields = [],
      noSyncWithDispatch = false,
      fromRoutePlanner = false,
      log,
    } = {},
    originalTrx,
  ) {
    let updatedOrder;

    const cancelOne = async trx => {
      const lineItems = [];
      const newData = {
        status: ORDER_STATUS.canceled,

        cancellationReasonType: reasonType || null,
        cancellationComment: comment || null,

        // Set prices to zero.
        billableServicePrice: 0,
        billableServiceTotal: 0,
        grandTotal: 0,
        beforeTaxesTotal: 0,
        billableLineItemsTotal: 0,
        thresholdsTotal: 0,
        surchargesTotal: 0,
        onAccountTotal: 0,
      };

      if (addTripCharge) {
        const [order] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });

        const { price, taxesTotal, surchargesTotal } = await this.addTripCharge(
          order,
          {
            lineItems,
            surcharges: [],
            billableServiceTotal: 0,
            billableServicePrice: 0,
            isCancellation: true,
          },
          trx,
        );
        newData.billableLineItemsTotal = price;
        newData.beforeTaxesTotal = price;
        newData.surchargesTotal = Number(surchargesTotal) || 0;
        newData.grandTotal = mathRound2(price + surchargesTotal + taxesTotal);
        if (
          order.paymentMethod === PAYMENT_METHOD.onAccount ||
          (order.paymentMethod === PAYMENT_METHOD.mixed && order.onAccountTotal > 0)
        ) {
          newData.onAccountTotal = mathRound2(
            Math.max(order.onAccountTotal - (newData.grandTotal - order.initialGrandTotal), 0),
          );
        }
      }
      const condition = { id };

      if (!fromRoutePlanner) {
        condition.status = ORDER_STATUS.inProgress;
      }

      const orderId = id;
      lineItems.map(item => Object.assign(item, { orderId }));
      [updatedOrder] = await Promise.all([
        // Update main order-related fields only.
        pricingAlterOrder(this.getCtx(), { data: newData }, orderId),
        // remove all line items related to the order + added trip charge
        pricingUpsertLineItems(this.getCtx(), {
          data: { data: lineItems?.map(omitExtraTripChargeFields) ?? orderId },
        }),
        // remove all thresholds related to the order
        pricingDeleteThreshold(this.getCtx(), { data: { orderId } }),
      ]);
    };

    const _trx = originalTrx || (await this.knex.transaction());

    try {
      // update main order itself
      await cancelOne(_trx);

      // need to get some populated fields
      const [order] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });

      if (!order?.isRollOff) {
        merge(updatedOrder, order);
        const indWoRepo = IndependentWorkOrderRepository.getInstance(this.ctxState);

        await indWoRepo.updateBy(
          {
            condition: {
              id: order.workOrder?.id,
            },
            data: { status: INDEPENDENT_WO_STATUS.canceled },
          },
          _trx,
        );
      }

      if (order?.isRollOff) {
        // sync WO with Dispatch API if WO exists
        if (order?.workOrder?.woNumber >= 1) {
          const woRepo = WorkOrderRepo.getInstance(this.ctxState);
          const { woNumber } = order.workOrder;
          const data = { status: WO_STATUS.canceled };

          await Promise.all([
            noSyncWithDispatch
              ? woRepo.updateBy(
                  {
                    condition: { woNumber },
                    data,
                  },
                  _trx,
                )
              : woRepo.dispatchUpdates(
                  {
                    condition: { woNumber },
                    data,
                  },
                  _trx,
                ),
            woRepo.syncWoUpdatesWithRecycling({
              woNumber,
              haulingOrderId: order.id,
              eventName: 'canceled',
            }),
          ]);
        }

        // work order without wo_number is deferred payment case
        if (updatedOrder && order?.workOrder && !order.workOrder?.woNumber) {
          updatedOrder.wasDeferred = true;
        }
      }

      if (!originalTrx) {
        await _trx.commit();

        log && this.log({ id, action: this.logAction.modify });
      }
    } catch (error) {
      if (!originalTrx) {
        await _trx.rollback();
      }
      throw error;
    }

    return updatedOrder;
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
    let updatedOrder;

    const trx = await this.knex.transaction();

    try {
      if (!data.applySurcharges) {
        await SurchargeItemRepo.getInstance(this.ctxState).deleteBy(
          { condition: { orderId: id }, log: true },
          trx,
        );
      }
      // update main order itself + WO media files
      await this.updateOne(
        { condition: { id }, data, prevServiceId, fields: [], concurrentData },
        trx,
      );
      updatedOrder = await this.getBy({ condition: { id }, fields }, trx);

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
            const [nonHistoricalMaterial, nonHistoricalEquipmentItem] = await Promise.all([
              MaterialRepo.getInstance(this.ctxState).getById(
                { id: order.material.originalId },
                trx,
              ),
              order.equipmentItem?.originalId
                ? EquipmentItemRepo.getInstance(this.ctxState).getById(
                    { id: order.equipmentItem.originalId },
                    trx,
                  )
                : Promise.resolve(),
            ]);

            await woRepo.dispatchUpdates(
              {
                condition: { woNumber },
                data: await woRepo.getWorkOrderDataToEditOrder(
                  {
                    ...order,
                    material: nonHistoricalMaterial,
                    equipmentItem: nonHistoricalEquipmentItem,
                  },
                  trx,
                ),
              },
              trx,
            );
          }
        }

        await trx.commit();

        if (!order.isRollOff && order.workOrder) {
          await publishers.syncIndependentToDispatch(this.getCtx(), {
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

  async getThresholdObj(
    order,
    {
      existingThresholds,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      equipmentItemId,
      materialId,
      thresholdId,
      setting,
      currentValue,
      threshold: { applySurcharges, type },
    },
    trx,
  ) {
    const condition = {
      businessUnitId,
      businessLineId,
      thresholdId,
      materialId: null,
      equipmentItemId: null,
    };

    switch (setting) {
      case THRESHOLD_SETTING.global: {
        break;
      }
      case THRESHOLD_SETTING.canSize: {
        condition.equipmentItemId = equipmentItemId;
        break;
      }
      case THRESHOLD_SETTING.material: {
        condition.materialId = materialId;
        break;
      }
      case THRESHOLD_SETTING.canSizeAndMaterial: {
        condition.equipmentItemId = equipmentItemId;
        condition.materialId = materialId;
        break;
      }
      default: {
        break;
      }
    }

    const globalRate = await GlobalRatesThresholdRepo.getInstance(this.ctxState).getBy(
      { condition },
      trx,
    );

    let customRate;
    if (customRatesGroupId) {
      condition.customRatesGroupId = customRatesGroupId;
      customRate = await CustomRatesGroupThresholdRepo.getInstance(this.ctxState).getBy(
        { condition },
        trx,
      );
    }

    const price = !isNilOrNaN(customRate?.price)
      ? Number(customRate.price)
      : Number(globalRate?.price) || 0;
    // pre-pricing service code:

    // GET HISTORICAL GLOBAL RATE THRESHOLD FOR COMPLETED ORDER
    // const { schemaName } = this;
    // const globalRateThresholdIdByOrder = await ThresholdItemRepo.getGlobalRateThresholdIdByOrderId(
    //   {
    //     schemaName,
    //     condition: { orderId: order.id },
    //   },
    //   trx,
    // );
    // let globalRateHistorical;
    // if (globalRateThresholdIdByOrder) {
    //   const { globalRatesThresholdsId } = globalRateThresholdIdByOrder;
    //   globalRateHistorical = await GlobalRatesThresholdRepo.getInstance(
    //     this.ctxState,
    //   ).getHistoricalById({ condition: { id: globalRatesThresholdsId } }, trx);
    // }

    // const limit =
    //   Number(globalRateHistorical?.limit) || Number(customRate?.limit) || Number(globalRate?.limit);
    // end pre-pricing service code
    const limit = Number(customRate?.limit) || Number(globalRate?.limit);
    // end of post pricing service code
    if (globalRate && limit && currentValue > limit) {
      const objToUpsert = {
        thresholdId,
        price,
        applySurcharges,
        globalRatesThresholdsId: globalRate.id,
        customRatesGroupThresholdsId: customRate ? customRate.id : null,
        quantity: mathRound2(currentValue - limit),
      };

      existingThresholds?.some(item => {
        if (item.threshold.type === type) {
          objToUpsert.id = item.id;
          return true;
        }
        return false;
      });

      return objToUpsert;
    }
    return null;
  }

  async calculateThresholds(
    order,
    {
      arriveOnSiteDate,
      startServiceDate,
      weight,
      weightUnit,
      pickedUpEquipmentItem,
      // pre-pricing service code:
      // pickedUpEquipmentItemDate,
      // end pre-pricing service code
      completionDate,
    },
    trx,
  ) {
    const preConditions =
      +!!(arriveOnSiteDate && startServiceDate) +
      +!!(weight && weightUnit) +
      // pre-pricing service code:
      // +!!(pickedUpEquipmentItem && pickedUpEquipmentItemDate);
      // end pre-pricing service code
      +!!(pickedUpEquipmentItem && completionDate);

    if (!preConditions) {
      // insufficient data to start thresholds calculation
      return [];
    }

    const {
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      thresholds: existingThresholds = [],
    } = order;
    const thresholds = await ThresholdRepo.getInstance(this.ctxState).getAll(
      { condition: { businessLineId } },
      trx,
    );

    const resultingThresholds = [];
    let thresholdId;
    const { customRatesGroup, material, equipmentItem } = order;
    const {
      originalId: customRatesGroupId,
      overweightSetting,
      usageDaysSetting,
      demurrageSetting,
    } = customRatesGroup ?? {};
    const { originalId: materialId } = material ?? {};
    const { originalId: equipmentItemId } = equipmentItem ?? {};

    const upsertCondition = {
      existingThresholds,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      equipmentItemId,
      materialId,
    };

    const grsRepo = GlobalThresholdsSettingRepo.getInstance(this.ctxState);
    // Demurrage in mins
    const demurrageThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.demurrage);
    thresholdId = demurrageThreshold?.id;

    if (
      arriveOnSiteDate &&
      startServiceDate
      // && (String(arriveOnSiteDate) !== String(wo.arriveOnSiteDate) ||
      // String(startServiceDate) !== String(wo.startServiceDate))
    ) {
      const diff = differenceInMinutes(new Date(startServiceDate), new Date(arriveOnSiteDate));

      // TODO: for the testing purposes only!
      // diff -= 15;

      if (diff > 0) {
        const setting =
          demurrageSetting ||
          (
            await grsRepo.getBy({
              condition: { thresholdId, businessUnitId, businessLineId },
              fields: ['setting'],
            })
          )?.setting;

        const obj = await this.getThresholdObj(
          order,
          {
            ...upsertCondition,
            threshold: demurrageThreshold,
            thresholdId,
            setting,
            currentValue: diff,
          },
          trx,
        );

        obj && resultingThresholds.push(obj);
      }
    }

    // Overweight by tons (no threshold for yards)
    const overweightThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.overweight);
    thresholdId = overweightThreshold?.id;

    if (
      weight &&
      weightUnit === WEIGHT_UNIT.tons
      // && weight !== wo.weight
    ) {
      const setting =
        overweightSetting ||
        (
          await grsRepo.getBy({
            condition: { thresholdId, businessUnitId, businessLineId },
            fields: ['setting'],
          })
        )?.setting;
      const obj = await this.getThresholdObj(
        order,
        {
          ...upsertCondition,
          threshold: overweightThreshold,
          thresholdId,
          setting,
          currentValue: weight,
          type: 'overweight',
        },
        trx,
      );

      obj && resultingThresholds.push(obj);
    }

    // Overused in days
    const usageDaysThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.usageDays);
    thresholdId = usageDaysThreshold?.id;

    if (
      pickedUpEquipmentItem &&
      completionDate
      // && (String(pickedUpEquipmentItem) !== String(wo.pickedUpEquipmentItem) ||
      // String(pickedUpEquipmentItemDate) !== String(wo.pickedUpEquipmentItemDate))
    ) {
      // seek prev WO with such dropped equipment
      // const existingWo = await WorkOrderRepo.getInstance(this.ctxState)
      //  .getBy(
      //    {
      //      condition: { droppedEquipmentItem: pickedUpEquipmentItem },
      //      fields: ['droppedEquipmentItemDate'],
      //    },
      //    trx,
      //  )
      //  .orderBy('id', SORT_ORDER.desc);

      // pre-pricing service code:
      // if (existingWo) {
      //   const diff = dateFns.differenceInCalendarDays(
      //     new Date(pickedUpEquipmentItemDate),
      //     new Date(existingWo.droppedEquipmentItemDate),
      // end pre-pricing service code
      if (order) {
        const diff = differenceInCalendarDays(
          new Date(completionDate),
          new Date(order.serviceDate),
          // end added pricing code
        );
        if (diff > 0) {
          const setting =
            usageDaysSetting ||
            (
              await grsRepo.getBy({
                condition: { thresholdId, businessUnitId, businessLineId },
                fields: ['setting'],
              })
            )?.setting;

          const obj = await this.getThresholdObj(
            order,
            {
              ...upsertCondition,
              threshold: usageDaysThreshold,
              thresholdId,
              setting,
              currentValue: diff,
            },
            trx,
          );

          obj && resultingThresholds.push(obj);
        }
      }
    }

    return resultingThresholds;
  }

  // eslint-disable-next-line no-unused-vars
  async getThresholdHistoricalIds(thresholdsItems, getHistoricalIds, trx) {
    const thresholdsArray = thresholdsItems ? Array.from({ length: thresholdsItems.length }) : [];
    let thresholdsTotal = 0;

    if (!isEmpty(thresholdsItems)) {
      // pre-pricing service code:
      // const pickIds = pick([
      //   'thresholdId',
      //   'globalRatesThresholdsId',
      //   'customRatesGroupThresholdsId',
      // ]);
      // await Promise.all(
      //   thresholdsItems.map(async (item, i) => {
      //     thresholdsTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

      //     const updatedItem = await getHistoricalIds(
      //       pickIds(item),
      //       { update: false, entityId: item?.id, entityRepo },
      //       trx,
      //     );

      //     thresholdsArray[i] = { ...item, ...updatedItem };
      // end pre-pricing service code
      await Promise.all(
        thresholdsItems.map(async (item, i) => {
          thresholdsTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));
          let itemId;
          if (item.id) {
            const getThreholdItem = await pricingGetThreshold(this.getCtx(), {
              data: { id: item.id },
            });
            itemId = getThreholdItem[0].id;
          }
          thresholdsArray[i] = { ...item, ...itemId };
          // end added post-pricing service code
        }, this),
      );
    }

    return { thresholds: thresholdsArray, thresholdsTotal };
  }

  async getCurrentGlobalThresholdIdByOrder(thresholdsItems, order, trx) {
    let thresholdsArray = thresholdsItems ? Array.from({ length: thresholdsItems.length }) : [];
    let thresholdsTotal = 0;

    const { schemaName } = this;
    const getGlobalRateThresholdId = await ThresholdItemRepo.getGlobalRateThresholdIdByOrderId(
      {
        schemaName,
        condition: { orderId: order.id },
      },
      trx,
    );
    thresholdsArray = thresholdsItems.map(item => {
      thresholdsTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));
      item.globalRatesThresholdsId = getGlobalRateThresholdId.globalRatesThresholdsId;
      return item;
    });
    return { thresholds: thresholdsArray, thresholdsTotal };
  }

  async reCalculateThresholds(order, workOrder, trx) {
    const thresholdsItems = await this.calculateThresholds(order, workOrder, trx);
    // pre-pricing service code:

    // let thresholdsToUpsert, thresholdsTotal;
    // if (thresholdsItems?.length) {
    //   if (isSyncWithDispatch) {
    //     ({ thresholds: thresholdsToUpsert, thresholdsTotal } =
    //       await this.getCurrentGlobalThresholdIdByOrder(thresholdsItems, order, trx));
    //   } else {
    //     ({ thresholds: thresholdsToUpsert, thresholdsTotal } = await this.getThresholdHistoricalIds(
    //       thresholdsItems,
    //       super.getLinkedHistoricalIds.bind(this),
    //       trx,
    //     ));
    //   }
    // end pre-pricing service code
    if (thresholdsItems) {
      thresholdsItems.map(item => Object.assign(item, { orderId: order.id }));
      // end post-pricing service code
    }

    const updateItems = await pricingUpsertThreshold(this.getCtx(), {
      data: { data: thresholdsItems?.length ? thresholdsItems : order.id },
    });

    thresholdsItems.forEach((item, i) => (item.id = updateItems[i].id));

    let thresholdsTotal = 0;
    thresholdsItems.map(item => (thresholdsTotal += item.price));

    return { thresholdsTotal: thresholdsTotal || 0, thresholdsItems };
  }

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
      // pre-pricing service code:
      // const woManifests = manifests.map(
      //   ({ url, quantity, unitType, manifestNumber, dispatchId, csrName }) => ({
      //     url,
      //     unitType,
      // end pre-pricing service code
      const unitTypeMap = { TONS: WEIGHT_UNIT.tons, YARDS: WEIGHT_UNIT.yards };
      const woManifests = manifests.map(
        ({ picture, quantity, unittype, manifestNumber, dispatchId, csrName }) => ({
          url: picture,
          unitType: unitTypeMap[unittype],
          // end of post-pricing service code
          materialId: order.material.id,
          quantity: Number(quantity),
          workOrderId: id,
          manifestNumber,
          dispatchId,
          csrName,
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

  // eslint-disable-next-line no-unused-vars
  async completeOne(
    {
      condition: { id, status },
      data,
      prevServiceId,
      originalOrder,
      // eslint-disable-next-line no-unused-vars
      fields = [],
      concurrentData,
      log,
    },
    trx,
  ) {
    const woRepo = WorkOrderRepo.getInstance(this.ctxState);
    let order;

    const _trx = trx || (await this.knex.transaction());

    try {
      const { thresholdsItems } = await this.reCalculateThresholds(
        originalOrder,
        data.workOrder,
        _trx,
      );
      // pre-pricing service code:

      // data.thresholds = thresholdsItems.map(
      //   ({ id: _id, price, quantity, thresholdId, applySurcharges }) => ({
      //     id: _id,
      //     price,
      //     quantity,
      //     thresholdId,
      //     applySurcharges,
      //     threshold: { id: _id, originalId: thresholdId },
      //   }),
      // );
      // end pre-pricing service code

      data.thresholds = thresholdsItems.map(
        ({ id: _id, price, quantity, thresholdId, applySurcharges, orderId }) => ({
          id: _id,
          price,
          quantity,
          thresholdId,
          orderId,
          applySurcharges,
          threshold: { id: _id, originalId: thresholdId },
        }),
      );
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
      const [orders] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });
      order = orders;

      // sync WO with Dispatch API if WO exists
      if (order?.isRollOff && order?.workOrder?.woNumber >= 1) {
        const { woNumber } = order.workOrder;
        const [nonHistoricalMaterial, nonHistoricalEquipmentItem] = await Promise.all([
          MaterialRepo.getInstance(this.ctxState).getById({ id: order.material.originalId }, trx),
          order.equipmentItem?.originalId
            ? EquipmentItemRepo.getInstance(this.ctxState).getById(
                { id: order.equipmentItem.originalId },
                trx,
              )
            : Promise.resolve(),
        ]);

        await woRepo.dispatchUpdates(
          {
            condition: { woNumber },
            data: woRepo.getWorkOrderDataToCompleteOrder({
              ...order,
              material: nonHistoricalMaterial,
              equipmentItem: nonHistoricalEquipmentItem,
            }),
          },
          _trx,
        );
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

  async rescheduleOne({
    // eslint-disable-next-line no-unused-vars
    condition: { id, status },
    data: { addTripCharge, ...updatesData },
    // eslint-disable-next-line no-unused-vars
    fields = [],
    log,
  } = {}) {
    const trx = await this.knex.transaction();

    let updatedOrder;
    try {
      const [order] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });

      const { lineItems = [], thresholds = [], surcharges = [] } = order;

      Object.assign(
        updatesData,
        pick(['billableLineItemsTotal', 'beforeTaxesTotal', 'grandTotal', 'onAccountTotal'])(order),
      );
      updatesData.billableLineItemsTotal = Number(updatesData.billableLineItemsTotal) || 0;
      updatesData.beforeTaxesTotal = Number(updatesData.beforeTaxesTotal) || 0;
      updatesData.grandTotal = Number(updatesData.grandTotal) || 0;
      let orderSurcharges = [];
      if (addTripCharge) {
        let incremented = false;
        // check case when trip charge was added previously
        lineItems?.forEach(item => {
          delete item.priceToDisplay;
          const { billableLineItem } = item;
          if (!incremented && billableLineItem.type === LINE_ITEM_TYPE.tripCharge) {
            incremented = true;
            item.quantity++;

            const price = Number(item.price) || 0;
            updatesData.billableLineItemsTotal += price;
            updatesData.beforeTaxesTotal += price;
            updatesData.grandTotal += price;
          }
        });

        const { workOrder, taxDistricts } = order;
        const billableServiceId = order.billableService?.originalId;
        const materialId = order.material?.originalId;
        let { beforeTaxesTotal } = updatesData;
        beforeTaxesTotal = Number(beforeTaxesTotal) || 0;
        if (incremented) {
          let surchargesTotal = 0;
          let serviceTotalWithSurcharges = Number(order.billableServiceTotal) || 0;
          let lineItemsWithSurcharges = lineItems;
          let thresholdsWithSurcharges = thresholds;

          if (order.applySurcharges) {
            ({
              surchargesTotal,
              serviceTotalWithSurcharges,
              lineItemsWithSurcharges,
              thresholdsWithSurcharges,
              orderSurcharges,
            } = calculateSurcharges({
              materialId,
              billableServiceId,
              billableServicePrice: Number(order.billableServicePrice) || 0,
              billableServiceApplySurcharges: order.billableService?.applySurcharges,
              lineItems:
                lineItems?.map(lineItem => ({
                  id: lineItem.id,
                  billableLineItemId: lineItem.billableLineItem?.originalId,
                  materialId: lineItem.material?.originalId || null,
                  price: Number(lineItem.price),
                  quantity: Number(lineItem.quantity),
                  applySurcharges: lineItem.applySurcharges,
                })) ?? [],
              thresholds,
              addedSurcharges: surcharges,
            }));
          }

          const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
            condition: { name: this.ctxState.user.tenantName },
            fields: ['region'],
          });

          const { taxesTotal } = calculateTaxes({
            taxDistricts,
            workOrder,
            region,
            lineItems: lineItemsWithSurcharges,
            thresholds: thresholdsWithSurcharges?.map(threshold => ({
              id: threshold.id,
              thresholdId: threshold.threshold.originalId,
              price: Number(threshold.price),
              quantity: Number(threshold.quantity),
            })),
            billableServiceId,
            materialId,
            serviceTotal: serviceTotalWithSurcharges,
            businessLineId: order.businessLine.id,
            commercial: order.commercialTaxesUsed,
          });

          updatesData.surchargesTotal = Number(surchargesTotal) || 0;
          updatesData.grandTotal = mathRound2(beforeTaxesTotal + surchargesTotal + taxesTotal);

          let updatedOrderSurcharges = [];
          if (!isEmpty(orderSurcharges)) {
            updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
              orderSurcharges,
              { update: false },
              trx,
            );
            // post pricing code
            await pricingUpsertSurcharge(this.getCtx(), {
              data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId: order.id })),
            });
            // end post pricing code
          }
        } else {
          const { price, taxesTotal, surchargesTotal } = await this.addTripCharge(
            order,
            {
              lineItems,
              surcharges,
              billableServiceTotal: order.billableServiceTotal,
              billableServicePrice: order.billableServicePrice,
            },
            trx,
          );

          updatesData.billableLineItemsTotal = mathRound2(
            updatesData.billableLineItemsTotal + price,
          );
          updatesData.beforeTaxesTotal = mathRound2(updatesData.beforeTaxesTotal + price);
          updatesData.surchargesTotal = Number(surchargesTotal) || 0;
          updatesData.grandTotal = mathRound2(
            updatesData.beforeTaxesTotal + surchargesTotal + taxesTotal,
          );
        }
      }

      if (
        order.paymentMethod === PAYMENT_METHOD.onAccount &&
        updatesData.grandTotal !== order.grandTotal
      ) {
        updatesData.onAccountTotal = updatesData.grandTotal;
      }

      lineItems.map(item => {
        delete item.billableLineItem;
        return item;
      });
      updatedOrder = await pricingAlterOrderCascade(
        this.getCtx(),
        {
          data: {
            order: updatesData,
            lineItem: lineItems,
          },
          // pre-pricing service code:
          //     trx,
          //   ),
          //   // ! See the note at the top of the file above "omitExtraTripChargeFields"
          //   // append trip charge line item related to the order
          //   LineItemRepo.getInstance(this.ctxState).upsertItems(
          //     {
          //       data: lineItems?.map(omitExtraTripChargeFields) ?? [],
          //       condition: { orderId: id },
          //       fields: [],
          //     },
          //     trx,
          //   ),
          // ]);
          // end pre-pricing service code
        },
        id,
      );
      // end post pricing code

      // sync WO with Dispatch API if WO exists
      if (order?.isRollOff && order?.workOrder?.woNumber >= 1) {
        const woRepo = WorkOrderRepo.getInstance(this.ctxState);
        const { woNumber } = order.workOrder;

        await woRepo.dispatchUpdates(
          {
            condition: { woNumber },
            data: woRepo.getWorkOrderDataToRescheduleOrder(updatesData),
          },
          trx,
        );
      }

      await trx.commit();

      if (!order?.isRollOff && order.workOrder) {
        await publishers.syncIndependentToDispatch(this.getCtx(), {
          schemaName: this.schemaName,
          userId: this.userId,
          independentWorkOrders: [
            {
              orderId: order.id,
              ...updatesData,
              woNumber: order.workOrder.woNumber,
              preferredRoute: updatesData.route || updatesData.preferredRoute,
              independentWorkOrderId: order.workOrder.id,
              billableServiceId: order.billableService.id,
              customerJobSiteId: order.customerJobSite.originalId,
            },
          ],
        });
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return updatedOrder;
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
      query = query.whereIn(
        `${ThirdPartyHaulersRepository.getHistoricalTableName()}.originalId`,
        filterByHauler,
      );
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
    const defaultTotal = { total: 0 };
    // by default billing type for order is arrears ( according to business logic)
    // but there is no field in db
    // so in such case back should return 0
    if (condition.arrears !== undefined && !condition.arrears) {
      return defaultTotal;
    }
    // just to reuse this method in case subscription and orders count
    if (condition.isWithSubs && !condition.filterByBusinessLine?.length) {
      return defaultTotal;
    }

    if (!businessUnitId) {
      return defaultTotal;
    }

    const invoicedOrderList = await this.getInvocedOrder(condition, businessUnitId);
    return { total: invoicedOrderList.length || 0 };
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
        ? WorkOrderRepo.checkRequiredFields(
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
              ? WorkOrderRepo.checkRequiredFields(
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

  async markOrdersInvoiced({ orderIds }) {
    const trx = await this.knex.transaction();
    try {
      await pricingPutOrderState(this.getCtx(), {
        data: {
          ids: orderIds,
          status: ORDER_STATUS.invoiced,
          invoiceDate: new Date(),
        },
      });

      // pre-pricing service code:
      // await PreInvoicedOrderDraftRepo.getInstance(this.ctxState).insertMany(
      //   { data: preInvoicedOrderDrafts },
      //   trx,
      // );

      // end of pre-pricing service code
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
      await pricingPutOrderState(this.getCtx(), {
        data: {
          ids: finalized,
          status: ORDER_STATUS.finalized,
        },
      });
      await pricingPutOrderState(this.getCtx(), {
        data: {
          ids: canceled,
          status: ORDER_STATUS.canceled,
        },
      });

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
    // pre-pricing service code:
    // let orderTaxDistricts = await OrderTaxDistrictRepo.getInstance(this.ctxState).getAll(
    //   {
    //     condition: qb => qb.whereIn('orderId', ids),
    //     fields: ['id', 'orderId', 'taxDistrictId'],
    //   },
    //   trx,
    // );
    // end of pre-pricing service code
    let orderTaxDistricts = await pricingGetByOrderTaxDistrict(this.getCtx(), { data: { ids } });
    // post-pricing service code:
    const orderTaxDistrictIds = orderTaxDistricts?.map(({ id }) => id);
    if (isEmpty(orderTaxDistrictIds)) {
      return taxList;
    }
    orderTaxDistricts = groupBy(orderTaxDistricts, 'orderId');
    await Promise.all(
      ids.map(async orderId => {
        const [taxDistricts, workOrder, order] = await Promise.all([
          // pre-pricing service code:
          // OrderTaxDistrictRepo.getInstance(this.ctxState).getByOrderId(orderId, trx),
          // WorkOrderRepo.getInstance(this.ctxState).getByOrderId(
          //   orderId,
          //   ['id', 'weight', 'weightUnit'],
          //   trx,
          // ),
          // this.getBy(
          //   {
          //     condition: { id: orderId },
          //     fields: [
          //       'id',
          //       'billableServiceId',
          //       'materialId',
          //       'lineItems',
          //       'thresholds',
          //       'businessLineId',
          //       'billableServiceTotal',
          //       'billableLineItemsTotal',
          //       'applySurcharges',
          //       'billableServicePrice',
          //       'beforeTaxesTotal',
          //       'commercialTaxesUsed',
          //     ],
          //   },
          // end of pre-pricing service code
          pricingGetByOrderTaxDistrict(this.getCtx(), { data: { id: orderId } })[0],
          WorkOrderRepo.getInstance(this.ctxState).getByOrderId(
            orderId,
            ['id', 'weight', 'weightUnit'],
            // end of post-pricing service code
            trx,
          ),
          pricingGetPriceOrder(this.getCtx(), { data: { id: orderId } })[0],
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

        if (order?.applySurcharges) {
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
          order?.status === ORDER_STATUS.canceled &&
          order?.beforeTaxesTotal === 0 &&
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
            billableServiceId: order?.billableService?.originalId,
            materialId: order?.material?.originalId,

            lineItems: lineItemsWithSurcharges,
            thresholds: thresholdsWithSurcharges?.map(threshold => ({
              id: threshold.id,
              thresholdId: threshold.threshold.originalId,
              price: Number(threshold.price),
              quantity: Number(threshold.quantity),
            })),
            includeServiceTax: !!order.billableService?.originalId,

            serviceTotal: serviceTotalWithSurcharges,
            businessLineId: order?.businessLine.id,
            commercial: order?.commercialTaxesUsed,
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

  async getOrdersMapForDrafts({ businessUnitId, ...condition } = {}) {
    const orders = await this.getInvocedOrder(condition, businessUnitId);

    // pre-pricing service code:
    //     'beforeTaxesTotal',
    //     'grandTotal',
    //     'billableServiceTotal',
    //     'billableLineItemsTotal',
    //     'thresholdsTotal',

    //     'workOrderId',
    //     'billableServiceId',
    //     'paymentMethod',
    //     'surchargesTotal',
    //   ],
    //   trx,
    //   { pullSelects: true },
    // );

    // let { query } = populatedQuery;
    // const { selects } = populatedQuery;

    // if (businessUnitId) {
    //   query = query.where(`${this.tableName}.businessUnitId`, businessUnitId);
    // }

    // const jobSitesHT = JobSiteRepo.getHistoricalTableName();
    // const customersHT = CustomerRepo.getHistoricalTableName();
    // const joinedTableColumns = await JobSiteRepo.getInstance(this.ctxState).getColumnsToSelect(
    //   'jobSite',
    // );
    // selects.push(...joinedTableColumns);

    // selects.push(trx.raw('??.?? as ??', [CustomerRepo.TABLE_NAME, 'id', 'currentCustomerId']));

    // query = query
    //   .innerJoin(jobSitesHT, `${jobSitesHT}.id`, `${this.tableName}.jobSiteId`)
    //   .innerJoin(JobSiteRepo.TABLE_NAME, `${JobSiteRepo.TABLE_NAME}.id`, `${jobSitesHT}.originalId`)
    //   .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
    //   .innerJoin(
    //     CustomerRepo.TABLE_NAME,
    //     `${CustomerRepo.TABLE_NAME}.id`,
    //     `${customersHT}.originalId`,
    //   );

    // // Filter invoicing orders by input params
    // query = this.applyFiltersToQuery(query, {
    //   ...condition,
    //   filterByServiceDateTo: condition?.endingDate,
    //   status: [ORDER_STATUS.canceled, ORDER_STATUS.finalized],
    //   prepaid: !!condition.prepaid,
    // }).select(...selects);

    // const orders = await query;
    // end of pre-pricing service code

    if (!orders?.length) {
      return {};
    }

    const orderIds = orders.map(order => order.id);
    const mappedOrdersMap = new Map();
    const customersSet = new Set();
    // pre-pricing service code:
    // orders.forEach(order => {
    // end of pre-pricing service code

    for await (const order of orders) {
      const { id } = order;
      const { lineItems, billableLineItems } = await LineItemRepo.getInstance(
        this.ctxState,
      ).getLineItemsData(id);
      const { thresholdItems, thresholds } = await ThresholdItemRepo.getInstance(
        this.ctxState,
      ).getThresholdItemData(id);
      // end of post-pricing service code
      order.lineItems = [];
      order.thresholds = [];
      order.billableLineItems = [];
      order.thresholdItems = [];
      lineItems.billableLineItem = camelCaseKeys(billableLineItems);
      order.lineItems.push(lineItems);
      thresholdItems.threshold = camelCaseKeys(thresholds);
      order.thresholds.push(thresholdItems);
      mappedOrdersMap.set(order.id, order);
      // pre-pricing service code:
      //   customersSet.add(order.currentCustomerId);
      // });
      // orders.length = 0;

      // lineItems?.forEach(item => {
      //   const order = mappedOrdersMap.get(item.orderId);
      //   item.billableLineItem = camelCaseKeys(item.billableLineItem);
      //   order.lineItems.push(item);
      // });
      // thresholds?.forEach(item => {
      //   const order = mappedOrdersMap.get(item.orderId);
      //   item.threshold = camelCaseKeys(item.threshold);
      //   order.thresholds.push(item);
      // });

      // end of pre-pricing service code
      customersSet.add(order.customer.originalId);
    }
    // end of post-pricing service code
    return { ordersMap: mappedOrdersMap, customersSet, orderIds };
  }

  async getOrderDataForInvoicing(orderIds) {
    if (!orderIds?.length) {
      return [];
    }
    // pre-pricing service code:

    // const selects = ['id', 'workOrderId', 'paymentMethod', 'status'].map(
    //   field => `${this.tableName}.${field}`,
    // );

    // const joinedTableColumns = await CustomerJobSitePairRepo.getInstance(
    //   this.ctxState,
    // ).getColumnsToSelect('customerJobSite');
    // selects.push(...joinedTableColumns);

    // const woTable = WorkOrderRepo.TABLE_NAME;
    // const customerJobSitesTable = CustomerJobSitePairRepo.TABLE_NAME;
    // const customerJobSitesHT = CustomerJobSitePairRepo.getHistoricalTableName();

    // selects.push(`${woTable}.ticket`);

    // const orders = await this.knex(this.tableName)
    //   .withSchema(this.schemaName)
    //   .whereIn(`${this.tableName}.id`, ids)
    //   .select(selects)
    //   .innerJoin(
    //     customerJobSitesHT,
    //     `${customerJobSitesHT}.id`,
    //     `${this.tableName}.customerJobSiteId`,
    //   )
    //   .innerJoin(
    //     customerJobSitesTable,
    //     `${customerJobSitesTable}.id`,
    //     `${customerJobSitesHT}.originalId`,
    //   )
    //   .leftJoin(woTable, `${woTable}.id`, `${this.tableName}.workOrderId`)
    //   .orderBy(`${this.tableName}.id`);
    // end of pre-pricing service code
    const orders = await pricingGetPriceOrder(this.getCtx(), { data: { orderIds } });
    // end of post-pricing service code

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
      .where(`${this.tableName}.status`, ORDER_STATUS.inProgress)
      .andWhere({ serviceDate: date.toUTCString() });

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

    cans?.forEach(({ name, size }) => {
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

  // eslint-disable-next-line no-unused-vars
  async postSyncWithDispatchUpdate({
    order,
    thresholdsTotal,
    newLineItemsTotal,
    woOrder,
    orderData,
    // eslint-disable-next-line no-unused-vars
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
        updatedOrder = await this.cancelOne(
          {
            condition: { id },
            fields: ['grandTotal'],
            noSyncWithDispatch: true,
          },
          trx,
        );
      }

      // read data from DB because service or line items can be edited during transaction
      const [orders] = await pricingGetPriceOrder(this.getCtx(), { data: { id } });
      // eslint-disable-next-line no-param-reassign
      order = orders;
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

        const equipmentItem = await EquipmentItemRepo.getHistoricalInstance(this.ctxState, {
          schemaName,
        }).getRecentBy({ condition: { originalId: billableService.equipmentItemId } }, trx);

        if (equipmentItem) {
          equipmentItemId = equipmentItem.originalId;
          data.equipmentItemId = equipmentItem.id;
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
      if (order.applySurcharges && order.status !== ORDER_STATUS.canceled) {
        ({
          surchargesTotal,
          orderSurcharges,
          serviceTotalWithSurcharges,
          lineItemsWithSurcharges,
          thresholdsWithSurcharges,
          // pre-pricing service code:
          // } = calculateSurcharges({
          //   materialId: mat?.originalId,
          //   billableServiceId: order.billableService?.originalId,
          //   billableServicePrice: Number(order.billableServicePrice) || 0,
          //   billableServiceApplySurcharges: order.billableService?.applySurcharges,
          //   addedSurcharges: order.surcharges,
          //   lineItems,
          //   thresholds,
          // }));
          // end of pre-pricing service code
        } =
          // search here
          calculateSurcharges({
            materialId: mat?.originalId,
            billableServiceId: order.billableService?.originalId,
            billableServicePrice: Number(data.billableServiceTotal) || 0,
            billableServiceApplySurcharges: order.billableService?.applySurcharges,
            addedSurcharges: order.surcharges,
            lineItems,
            thresholds,
          }));
        // end of post-pricing service code
      }

      let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
          orderSurcharges,
          { update: false },
          trx,
        );
        // post-pricing service code:
        // TODO: pass there billable item ids
        await pricingUpsertSurcharge(this.getCtx(), {
          data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId: order.id })),
        });
      }

      const { region } = await TenantRepo.getInstance(this.ctxState).getBy({
        condition: { name: this.ctxState?.user?.tenantName ?? this.schemaName },
        fields: ['region'],
      });

      data.beforeTaxesTotal = mathRound2(
        (data.billableServiceTotal || order.billableServiceTotal) +
          data.billableLineItemsTotal +
          thresholdsTotal,
      );

      data.surchargesTotal = Number(surchargesTotal) || 0;

      if (order.status !== ORDER_STATUS.canceled) {
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
        data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);
      }

      if (order.paymentMethod === PAYMENT_METHOD.onAccount) {
        data.onAccountTotal = order.grandTotal;
      }

      updatedOrder = await pricingAlterOrder(this.getCtx(), { data }, id);

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
    try {
      if (cjsPairId) {
        await CustomerJobSitePairRepo.getInstance(this.ctxState).deleteBy({
          condition: { id: cjsPairId },
        });
      }

      // Delete the created order and WO + mediaFiles (lineItems and thresholds also)
      // All need to be done manually to keep history recorded correctly (w\o cascade)
      await pricingDeleteOrder(this.getCtx(), { data: orderId });

      if (independentWorkOrder?.id) {
        await IndependentWorkOrderRepository.getInstance(this.ctxState).deleteById({
          id: independentWorkOrder.id,
        });
      }

      if (orderRequestId) {
        await OrderRequestRepo.getInstance(this.ctxState).updateBy({
          condition: { id: orderRequestId },
          data: { status: ORDER_REQUEST_STATUS.requested },
          fields: ['id'],
        });
      }

      if (workOrderId) {
        await Promise.allSettled([
          MediaFileRepo.getInstance(this.ctxState).deleteBy({ condition: { workOrderId } }),
          ManifestItemRepo.getInstance(this.ctxState).deleteBy({ condition: { workOrderId } }),
        ]);

        await WorkOrderRepo.getInstance(this.ctxState)
          // no historical record if workOrderId === null or workOrderId === -1
          .deleteById(workOrderId, undefined, { noRecord: workOrderId <= 0 });
      }
    } catch (error) {
      this.ctxState.logger.error(error);
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

    // This code is not necessary after the pricing refactor
    // const options = {
    //   update: true,
    //   entityId: id,
    //   entityRepo: this,
    // };

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

    const data = { materialId: mappedMaterialId ?? material?.id ?? null };
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

    // This code is not necessary after the pricing refactor
    // const historicalIdsObj = await super.getLinkedHistoricalIds(
    //   {
    //     materialId: data.materialId,
    //     globalRatesServicesId: data.globalRatesServicesId,
    //     customRatesGroupServicesId: data.customRatesGroupServicesId || null,
    //   },
    //   options,
    //   trx,
    // );
    // Object.assign(data, historicalIdsObj);

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

    if (!isEmpty(orderSurcharges)) {
      // pre-pricing service code:
      // updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
      //   orderSurcharges,
      //   { update: false },
      //   trx,
      // );
      // end of pre-pricing service code
      // This code is not necessary after the pricing refactor
      // updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(orderSurcharges, { update: false }, trx);
      // TODO: pass there billable item ids
      await pricingUpsertSurcharge(this.getCtx(), {
        data: orderSurcharges.map(item => Object.assign(item, { orderId: order.id })),
      });
      // end of post-pricing service code
    }
    data.surchargesTotal = Number(surchargesTotal) || 0;
    data.beforeTaxesTotal = mathRound2(
      data.billableServiceTotal + order.billableLineItemsTotal + order.thresholdsTotal,
    );
    data.grandTotal = mathRound2(data.beforeTaxesTotal + surchargesTotal + taxesTotal);

    await pricingAlterOrder(this.getCtx(), { data }, id);

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
    this.ctxState.logger.info(`Add MiscLine Items, orderId: ${orderId}`);
    const materialId = mappedMaterialId ?? order.material?.originalId;
    // pre-pricing service code:

    // const liRepo = LineItemRepo.getInstance(this.ctxState);
    // const wasRemoved = await liRepo.deleteBy(
    //   { condition: { orderId, landfillOperation: true } },
    //   trx,
    // );
    // end of pre-pricing service code
    const wasRemoved = await pricingDeleteLineItems(this.getCtx(), {
      data: { orderId, landfillOperation: true },
    });
    // end of post-pricing service code

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

      // let updatedOrderSurcharges = [];
      if (!isEmpty(orderSurcharges)) {
        // pre-pricing service code:
        //   updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
        //     orderSurcharges,
        //     { update: false },
        //     trx,
        //   );
        // }
        // // TODO: pass there billable item ids
        // await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        //     data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
        //     fields: ['id'],
        //   },
        //   trx,
        // );
        // end of pre-pricing service code
        // updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(orderSurcharges, { update: false }, trx);
        await pricingUpsertSurcharge(this.getCtx(), {
          data: orderSurcharges.map(item => Object.assign(item, { orderId })),
        });
      }
      // TODO: pass there billable item ids
      // await SurchargeItemRepo.getInstance(this.ctxState).insertMany(
      //   {
      //     data: updatedOrderSurcharges.map((item) => Object.assign(item, { orderId })),
      //     fields: ['id'],
      //   },
      //   trx,
      // );
      // end of post-pricing service code

      if (!isEmpty(lineItemsWithHistoricalIds)) {
        await pricingAddLineItems(this.getCtx(), {
          data: {
            data: lineItemsWithHistoricalIds.map(item =>
              Object.assign(item, { orderId, landfillOperation: true }),
            ),
          },
        });
      }
      await Promise.all([
        // pre-pricing service code:
        // liRepo.insertMany(
        //   {
        //     data: lineItemsWithHistoricalIds.map(item => ({
        //       ...item,
        //       orderId,
        //       landfillOperation: true,
        //     })),
        //   },
        //   trx,
        // ),
        // super.updateBy(
        //   {
        //     condition: { id: orderId },
        //     data,
        //     fields: [],
        //   },
        //   trx,
        // ),
        // end of pre-pricing service code
        // pricingAddLineItems(this.getCtx(), {
        //   data: {
        //     data: lineItemsWithHistoricalIds.map((item) =>
        //       Object.assign(item, { orderId, landfillOperation: true }),
        //     ),
        //   },
        // }),
        // liRepo.insertMany(
        //   {
        //     data: lineItemsWithHistoricalIds.map((item) => ({
        //       ...item,
        //       orderId,
        //       landfillOperation: true,
        //     })),
        //   },
        //   trx,
        // ),
        pricingAlterOrder(this.getCtx(), { data }, orderId),
        // super.updateBy(
        //   {
        //     condition: { id: orderId },
        //     data,
        //     fields: [],
        //   },
        //   trx,
        // ),
        // end of
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

    this.ctxState.logger.debug(`Line items length: ${lineItemsToAdd.length}`);
    await recalculateTotals({ newLineItems: lineItemsToAdd });

    return !!wasRemoved || wasAdded;
  }

  getStream(ordersIds = []) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.id`, ordersIds)
      .select(fieldsForBilling.map(field => `${this.tableName}.${field}`))
      .stream();
  }

  getByIdsAndStatuses(
    { condition = {}, ids = [], statuses = ORDER_STATUSES, fields = ['*'] },
    trx = this.knex,
  ) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('id', ids)
      .whereIn('status', statuses)
      .andWhere(condition)
      .select(fields);
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

  async getInvocedOrder(condition, businessUnitId) {
    const {
      endingDate,
      customerId,
      isWithSubs,
      billingCycles,
      customerGroupId,
      prepaid,
      onAccount,
    } = condition;
    const filterQuery = `?businessUnitId=${businessUnitId}&status=finalized&finalizedOnly=false`;

    const data = {};
    if (endingDate) {
      data.serviceDate = endingDate;
    }
    if (customerId) {
      data.originalCustomerId = customerId;
    }

    const orders = await pricingGetPriceOrderQuery(this.getCtx(), { data, filterQuery });

    return orders.filter(order => {
      if (isWithSubs) {
        if (this.validateBilling(billingCycles, order)) {
          return null;
        }
      }
      if (customerGroupId && customerGroupId !== order.customer.customerGroupId) {
        return null;
      }
      if (prepaid !== undefined || onAccount !== undefined) {
        const isBothFalse = !prepaid && !onAccount;
        if (!isBothFalse) {
          if (!onAccount && prepaid && order.customer.onAccount === true) {
            return null;
          }
          if (!prepaid && onAccount && order.customer.onAccount === false) {
            return null;
          }
          if (this.validateBilling(billingCycles, order)) {
            return null;
          }
        }
      }
      return order;
    });
  }

  validateBilling(billingCycles, order) {
    if (!isEmpty(billingCycles) && !billingCycles.includes(order.customer.billingCycle)) {
      return true;
    }

    if (isEmpty(billingCycles) && order.customer.billingCycle) {
      return true;
    }
    return false;
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
