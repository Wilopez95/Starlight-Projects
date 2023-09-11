/* eslint-disable complexity */
import httpStatus from 'http-status';
import map from 'lodash/fp/map.js';
import pick from 'lodash/fp/pick.js';
import sumBy from 'lodash/fp/sumBy.js';
import { differenceInCalendarDays, isEqual, isPast, isToday, isFuture } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import OrderRepo from '../../../repos/order.js';
import PermitRepository from '../../../repos/permit.js';
import BillableSurchargeRepository from '../../../repos/billableSurcharge.js';
import PhoneNumberRepo from '../../../repos/phoneNumber.js';
import MediaFileRepo from '../../../repos/mediaFile.js';
import OrderRequestRepo from '../../../repos/orderRequest.js';
import IndependentWorkOrderMediaRepo from '../../../repos/independentWorkOrderMedia.js';
import CustomerRepo from '../../../repos/customer.js';
import CustomerJobSiteRepo from '../../../repos/customerJobSitePair.js';
import BusinessUnitRepo from '../../../repos/businessUnit.js';
import BusinessLineRepo from '../../../repos/businessLine.js';
import WorkOrderRepo from '../../../repos/v2/workOrder.js';

import { publishers, syncWosMedia } from '../../../services/routePlanner/publishers.js';
import { deleteWorkOrderNote } from '../../../services/dispatch.js';
import { deleteFileByUrl } from '../../../services/mediaStorage.js';
import * as billingProcessor from '../../../services/billingProcessor.js';
import * as billingService from '../../../services/billing.js';
import { getHistoricalRecords } from '../../../services/orderHistory.js';

import { calculateGcd, mathRound2 } from '../../../utils/math.js';
import { parseSearchQuery } from '../../../utils/search.js';
import validateBestTimeToComeRange from '../../../utils/validateBestTimeToComeRange.js';

import ApiError from '../../../errors/ApiError.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { ORDER_SORTING_ATTRIBUTE } from '../../../consts/orderSortingAttributes.js';
import { ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { PAYMENT_TYPE } from '../../../consts/paymentType.js';
import { ORDER_REQUEST_STATUS } from '../../../consts/orderRequestStatuses.js';
import { PAYMENT_STATUS } from '../../../consts/paymentStatus.js';
import { checkPermissions } from '../../../middlewares/authorized.js';
import { CUSTOMER_STATUS } from '../../../consts/customerStatuses.js';
import { SYNC_WOS_MEDIA_ACTION } from '../../../consts/workOrderMedia.js';
import { cjsPairFields } from '../../../consts/orderFields.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import JobSiteRepository from '../../../repos/jobSite.js';
import BillableServiceRepository from '../../../repos/billableService.js';
import MaterialRepository from '../../../repos/material.js';
import EquipmentItemRepository from '../../../repos/equipmentItem.js';
import ServiceAreaRepository from '../../../repos/serviceArea.js';
import PurchaseOrderRepository from '../../../repos/purchaseOrder.js';
import TaxDistrictRepository from '../../../repos/taxDistrict.js';
import {
  pricingApproveOrder,
  pricingGetOrderReduced,
  pricingGetPriceOrder,
  pricingAlterOrder,
} from '../../../services/pricing.js';
import GlobalRatesSurchargeRepository from '../../../repos/globalRatesSurcharge.js';
import CustomRatesGroupServiceRepository from '../../../repos/customRatesGroupService.js';
import CustomRatesGroupRepository from '../../../repos/customRatesGroup.js';
import ContactRepository from '../../../repos/contact.js';
import BillableLineItemRepository from '../../../repos/billableLineItem.js';
import CustomRatesGroupLineItemRepository from '../../../repos/customRatesGroupLineItem.js';
import GlobalRatesLineItemRepository from '../../../repos/globalRatesLineItem.js';
import DisposalSiteRepository from '../../../repos/disposalSite.js';
import MaterialProfileRepository from '../../../repos/materialProfile.js';
import GlobalRatesServiceRepository from '../../../repos/globalRatesService.js';
import ProjectRepository from '../../../repos/project.js';
import ThirdPartyHaulersRepository from '../../../repos/3rdPartyHaulers.js';
import PromoRepository from '../../../repos/promo.js';
import ThresholdRepository from '../../../repos/threshold.js';
import GlobalRatesThresholdRepository from '../../../repos/globalRatesThreshold.js';
import CustomRatesGroupThresholdRepository from '../../../repos/customRatesGroupThreshold.js';
import CustomRatesGroupSurchargeRepository from '../../../repos/customRatesGroupSurcharge.js';
import ManifestItems from '../../../repos/manifestItems.js';
import LandfillOperationRepository from '../../../repos/landfillOperation.js';
import FrequencyRepository from '../../../repos/frequency.js';

const ORDERS_PER_PAGE = 25;
// const ORDERS_CHUNKING_SIZE = 8;
const { zonedTimeToUtc, utcToZonedTime } = dateFnsTz;

const sumTotals = sumBy('grandTotal');
const sumAmounts = sumBy('amount');
const getCustomerJobSitePairInputFields = pick(cjsPairFields);

const noOrdersToApprove = (ids, status) =>
  ApiError.notFound(
    'There are no Orders to be approved',
    `None completed Orders by ids ${ids} and status ${status} found`,
  );

const noOrdersToFinalize = (ids, status) =>
  ApiError.notFound(
    'There are no Orders to be finalized',
    `None approved Orders by ids ${ids} and status ${status} found`,
  );

const orderNotFound = (id, status) =>
  ApiError.notFound('Order not found', `Order doesn't exist with id ${id} and status ${status}`);

const getFiltersData = pick([
  'filterByServiceDateFrom',
  'filterByServiceDateTo',
  'filterByMaterials',
  'filterByPaymentTerms',
  'filterByWeightTicket',
  'filterByBusinessLine',
  'filterByHauler',
  'filterByCsr',
  'filterByBroker',
  'filterByPaymentMethod',
  'filterByService',
]);

// pre-pricing service code:
// const editOrderFields = [
//   'id',
//   'createdAt',
//   'updatedAt',

//   'businessUnitId',
//   'businessLineId',
//   'serviceAreaId',
//   'status',
//   'csrEmail',
//   'csrName',
//   'serviceDate',

//   'workOrderId',
//   'independentWorkOrderId',
//   'customerId',
//   'jobSiteId',
//   'jobSite2Id',
//   'customerJobSiteId',

//   'billableServiceId',
//   'equipmentItemId',
//   'materialId',

//   'projectId',
//   'jobSiteContactId',
//   'permitId',
//   'purchaseOrderId',
//   'thirdPartyHaulerId',
//   'orderContactId',
//   'materialProfileId',
//   'disposalSiteId',
//   'customRatesGroupId',
//   'promoId',
//   'landfillOperationId',

//   'lineItems',
//   'thresholds',
//   'manifestItems',

//   'billableServicePrice',
//   'billableServiceTotal',
//   'billableLineItemsTotal',
//   'initialGrandTotal',
//   'thresholdsTotal',
//   'surchargesTotal',
//   'beforeTaxesTotal',
//   'grandTotal',

//   'jobSiteNote',
//   'callOnWayPhoneNumber',
//   'callOnWayPhoneNumberId',
//   'textOnWayPhoneNumber',
//   'textOnWayPhoneNumberId',
//   'driverInstructions',
//   'invoiceNotes',

//   'bestTimeToComeFrom',
//   'bestTimeToComeTo',
//   'someoneOnSite',
//   'toRoll',
//   'highPriority',
//   'earlyPick',
//   'alleyPlacement',
//   'cabOver',

//   'globalRatesServicesId',
//   'customRatesGroupServicesId',

//   'droppedEquipmentItem',
//   'notifyDayBefore',

//   'paymentMethod',

//   'taxDistricts',

//   'cancellationReasonType',
//   'cancellationComment',
//   'unapprovedComment',
//   'unfinalizedComment',
//   'rescheduleComment',
//   'isRollOff',
//   'applySurcharges',
//   'commercialTaxesUsed',
//   'grandTotal',
// ];

// end pre-pricing service code
export const getOrders = async ctx => {
  const { email } = ctx.state.user;
  const {
    skip = 0,
    limit = ORDERS_PER_PAGE,
    sortBy = ORDER_SORTING_ATTRIBUTE.serviceDate,
    sortOrder = SORT_ORDER.desc,
    status,
    finalizedOnly,
    mine,
    businessUnitId,
    query,
  } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();

  condition.filters = getFiltersData(ctx.request.validated.query);

  if (mine) {
    condition.csrEmail = email;
  }

  if (!mine && !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  if (status === ORDER_STATUS.finalized) {
    condition.status = finalizedOnly
      ? ORDER_STATUS.finalized
      : [ORDER_STATUS.finalized, ORDER_STATUS.canceled];
  } else {
    condition.status = status;
  }

  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  Object.assign(condition, parseSearchQuery(query));

  const orders = await OrderRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ORDERS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};

export const getOrderData = async ctx => {
  const {
    businessLineId,
    workOrderId,
    jobSiteId,
    jobSiteId_Histo,
    isRollOff,
    customerId,
    customerId_Histo,
    billableServiceId,
    billableServiceId_Histo,
    materialId,
    materialIds,
    materialId_Histo,
    equipmentItemId,
    serviceAreaId,
    serviceAreaId_Histo,
    businessUnitId,
    purchaseOrderId,
    taxDistricts,
    permitId,
    surchargeId,
    surchargeId_Histo,
    globalRatesSurchargesId,
    globalRatesSurchargesId_Histo,
    globalRatesServicesId,
    customRatesGroupServicesId,
    customRatesGroupId,
    customerJobSiteId,
    jobSiteContactId,
    jobSiteContactIdHisto,
    jobSiteContactIdHistoById,
    orderContactId,
    orderContactIdHisto,
    orderContactIdHistoById,
    billableLineItemId,
    billableLineItemIdHisto,
    customRatesGroupLineItemsId,
    globalRatesLineItemsId,
    disposalSiteId,
    materialProfileId,
    projectId,
    thirdPartyHaulerId,
    promoId,
    thresholdId,
    globalRatesThresholdsId,
    customRatesGroupThresholdsId,
    customRatesGroupSurchargesId,
    customRatesGroupSurchargesId_Histo,
    landfillOperationId,
    billableServiceByBusinessLineId,
    frequencyIds,
    paymentTermsIds,
  } = ctx.request.body;
  try {
    const response = {};

    const [
      businessLines,
      jobSites,
      customers,
      customers_Histo,
      billableServices,
      billableServicesHisto,
      materialHisto,
      materials,
      equipmentItems,
      serviceAreas,
      globalRatesServices,
      businessUnits,
      purchaseOrders,
      taxes,
      promos,
      permits,
      projects,
      surcharges,
      surchargesHisto,
      globalRatesSurcharge,
      globalRatesSurchargesHisto,
      customRatesGroupServices,
      customRatesGroups,
      jobSiteContacts,
      orderContacts,
      jobSiteContactsHisto,
      jobSiteContactsHistoById,
      orderContactsHisto,
      orderContactsHistoById,
      customerJobSites,
      billableLineItems,
      billableLineItemHisto,
      customRatesGroupLineItems,
      globalRatesLineItems,
      hauler,
      disposalSites,
      materialProfiles,
      threshold,
      globalRatesThreshold,
      customRatesGroupThreshold,
      customRatesGroupSurcharge,
      customRatesGroupSurchargeHisto,
      landfillOperation,
      frequencies,
      serviceAreaHisto,
      jobSiteHisto,
      materialIdList,
      paymentTermsIdList,
    ] = await Promise.all([
      businessLineId
        ? BusinessLineRepo.getInstance(ctx.state).getById({ id: businessLineId })
        : null,
      jobSiteId
        ? JobSiteRepository.getHistoricalInstance(ctx.state).getBy({ condition: { id: jobSiteId } })
        : null,
      customerId
        ? CustomerRepo.getHistoricalInstance(ctx.state).getBy({ condition: { id: customerId } })
        : null,
      customerId_Histo
        ? CustomerRepo.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: customerId_Histo },
          })
        : null,
      billableServiceId
        ? BillableServiceRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: billableServiceId },
          })
        : null,
      billableServiceId_Histo
        ? BillableServiceRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: billableServiceId_Histo },
          })
        : null,
      materialId_Histo
        ? MaterialRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: materialId_Histo },
          })
        : null,
      materialId
        ? MaterialRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: materialId },
          })
        : null,
      equipmentItemId
        ? EquipmentItemRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: equipmentItemId },
          })
        : null,
      serviceAreaId
        ? ServiceAreaRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: serviceAreaId },
          })
        : null,
      globalRatesServicesId
        ? GlobalRatesServiceRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: globalRatesServicesId },
          })
        : null,
      businessUnitId
        ? BusinessUnitRepo.getInstance(ctx.state).getBy({ condition: { id: businessUnitId } })
        : null,
      purchaseOrderId
        ? PurchaseOrderRepository.getInstance(ctx.state).getBy({
            condition: { id: purchaseOrderId },
          })
        : null,
      taxDistricts
        ? TaxDistrictRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { ids: taxDistricts },
          })
        : null,
      promoId
        ? PromoRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: promoId },
          })
        : null,
      permitId
        ? PermitRepository.getHistoricalInstance(ctx.state).getBy({ condition: { id: permitId } })
        : null,
      projectId
        ? ProjectRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: projectId },
          })
        : null,
      surchargeId_Histo
        ? BillableSurchargeRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: surchargeId_Histo },
          })
        : null,
      surchargeId
        ? BillableSurchargeRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: surchargeId },
          })
        : null,
      globalRatesSurchargesId_Histo
        ? GlobalRatesSurchargeRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: globalRatesSurchargesId_Histo },
          })
        : null,
      globalRatesSurchargesId
        ? GlobalRatesSurchargeRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: globalRatesSurchargesId },
          })
        : null,
      customRatesGroupServicesId
        ? CustomRatesGroupServiceRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: customRatesGroupServicesId },
          })
        : null,
      customRatesGroupId
        ? CustomRatesGroupRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: customRatesGroupId },
          })
        : null,
      jobSiteContactId
        ? ContactRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: jobSiteContactId },
          })
        : null,
      orderContactId
        ? ContactRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: orderContactId },
          })
        : null,
      jobSiteContactIdHisto
        ? ContactRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: jobSiteContactIdHisto },
          })
        : null,
      jobSiteContactIdHistoById
        ? ContactRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { id: jobSiteContactIdHistoById },
          })
        : null,
      orderContactIdHisto
        ? ContactRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: orderContactIdHisto },
          })
        : null,
      orderContactIdHistoById
        ? ContactRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { id: orderContactIdHistoById },
          })
        : null,
      customerJobSiteId
        ? CustomerJobSiteRepo.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: customerJobSiteId },
          })
        : null,
      billableLineItemId
        ? BillableLineItemRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: billableLineItemId },
          })
        : null,
      billableLineItemIdHisto
        ? BillableLineItemRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: billableLineItemIdHisto },
          })
        : null,
      customRatesGroupLineItemsId
        ? CustomRatesGroupLineItemRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: customRatesGroupLineItemsId },
          })
        : null,
      globalRatesLineItemsId
        ? GlobalRatesLineItemRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: globalRatesLineItemsId },
          })
        : null,
      thirdPartyHaulerId
        ? ThirdPartyHaulersRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: thirdPartyHaulerId },
          })
        : null,
      disposalSiteId
        ? DisposalSiteRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: disposalSiteId },
          })
        : null,
      materialProfileId
        ? MaterialProfileRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: materialProfileId },
          })
        : null,
      thresholdId
        ? ThresholdRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: thresholdId },
          })
        : null,
      globalRatesThresholdsId
        ? GlobalRatesThresholdRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: globalRatesThresholdsId },
          })
        : null,
      customRatesGroupThresholdsId
        ? CustomRatesGroupThresholdRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: customRatesGroupThresholdsId },
          })
        : null,
      customRatesGroupSurchargesId_Histo
        ? CustomRatesGroupSurchargeRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: customRatesGroupSurchargesId_Histo },
          })
        : null,
      customRatesGroupSurchargesId
        ? CustomRatesGroupSurchargeRepository.getHistoricalInstance(ctx.state).getBy({
            condition: { id: customRatesGroupSurchargesId },
          })
        : null,
      landfillOperationId
        ? LandfillOperationRepository.getInstance(ctx.state).getByOrderId({
            orderId: landfillOperationId,
          })
        : null,
      frequencyIds
        ? FrequencyRepository.getInstance(ctx.state).getAllByIds({
            condition: { ids: frequencyIds },
          })
        : null,
      serviceAreaId_Histo
        ? ServiceAreaRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: serviceAreaId_Histo },
          })
        : null,
      jobSiteId_Histo
        ? JobSiteRepository.getHistoricalInstance(ctx.state).getRecentBy({
            condition: { originalId: jobSiteId_Histo },
          })
        : null,
      materialIds
        ? MaterialRepository.getHistoricalInstance(ctx.state).getBy_All({
            condition: { originalId: materialIds },
            fields: ['id'],
          })
        : null,
      paymentTermsIds
        ? CustomerRepo.getHistoricalInstance(ctx.state).getBy_All({
            condition: { paymentTerms: paymentTermsIds },
            fields: ['id'],
          })
        : null,
    ]);
    if (materialIdList) {
      response.materialIdList = materialIdList;
    }
    if (paymentTermsIdList) {
      response.paymentTermsIdList = paymentTermsIdList;
    }
    if (customRatesGroupSurchargeHisto) {
      response.customRatesGroupSurcharge = customRatesGroupSurchargeHisto;
    }
    if (customRatesGroupSurcharge) {
      response.customRatesGroupSurcharge = customRatesGroupSurcharge;
    }

    if (businessLines) {
      response.businessLine = businessLines;
    }
    if (jobSites) {
      response.jobSite = jobSites;
    }
    if (jobSiteHisto) {
      console.log(
        '🚀 ~ file: controller.js ~ line 508 ~ getOrderData ~ jobSiteHisto',
        jobSiteHisto,
      );
      response.jobSite = jobSiteHisto;
    }
    if (customers) {
      response.customer = customers;
    }
    if (customers_Histo) {
      response.customer = customers_Histo;
    }
    if (billableServicesHisto) {
      response.billableService = billableServicesHisto;
    }
    if (billableServices) {
      response.billableService = billableServices;
    } else if (billableServiceByBusinessLineId) {
      const billableServicesByLine = await BillableServiceRepository.getHistoricalInstance(
        ctx.state,
      ).getBy({
        condition: { businessLineId: billableServiceByBusinessLineId },
      });
      response.billableService = billableServicesByLine;
    }
    if (materialHisto) {
      response.material = materialHisto;
    }
    if (materials) {
      response.material = materials;
    }
    if (equipmentItems) {
      response.equipmentItem = equipmentItems;
    }
    if (serviceAreas) {
      response.serviceArea = serviceAreas;
    }
    if (serviceAreaHisto) {
      response.serviceArea = serviceAreaHisto;
    }
    if (globalRatesServices) {
      response.globalRatesServices = globalRatesServices;
    }
    if (businessUnits) {
      response.businessUnit = businessUnits;
    }
    if (purchaseOrders) {
      response.purchaseOrder = purchaseOrders;
    }
    if (taxes) {
      response.taxDistricts = taxes;
    }
    if (promos) {
      response.promo = promos;
    }
    if (permits) {
      response.permit = permits;
    }
    if (projects) {
      response.project = projects;
    }
    if (surchargesHisto) {
      response.surcharge = surchargesHisto;
    }
    if (surcharges) {
      response.surcharge = surcharges;
    }
    if (globalRatesSurchargesHisto) {
      response.globalRatesSurcharge = globalRatesSurchargesHisto;
    }
    if (globalRatesSurcharge) {
      response.globalRatesSurcharge = globalRatesSurcharge;
    }
    if (customRatesGroupServices) {
      response.customRatesGroupServices = customRatesGroupServices;
    }
    if (customRatesGroups) {
      response.customRatesGroup = customRatesGroups;
    }
    if (jobSiteContacts) {
      response.jobSiteContact = jobSiteContacts;
    }
    if (orderContacts) {
      response.orderContact = orderContacts;
    }
    if (jobSiteContactsHisto) {
      response.jobSiteContact = jobSiteContactsHisto;
    }
    if (jobSiteContactsHistoById) {
      response.jobSiteContact = jobSiteContactsHistoById;
      response.jobSiteContactId = jobSiteContactsHistoById.originalId;
    }
    if (orderContactsHisto) {
      response.orderContact = orderContactsHisto;
    }
    if (orderContactsHistoById) {
      response.orderContact = orderContactsHistoById;
      response.orderContactId = orderContactsHistoById.originalId;
    }
    if (customerJobSites) {
      response.customerJobSite = customerJobSites;
    }
    if (billableLineItems) {
      response.billableLineItem = billableLineItems;
    }
    if (billableLineItemHisto) {
      response.billableLineItem = billableLineItemHisto;
    }
    if (customRatesGroupLineItems) {
      response.customRatesGroupLineItem = customRatesGroupLineItems;
    }
    if (globalRatesLineItems) {
      response.globalRatesLineItem = globalRatesLineItems;
    }
    if (hauler) {
      response.thirdPartyHauler = hauler;
    }
    if (disposalSites) {
      response.disposalSite = disposalSites;
    }
    if (materialProfiles) {
      response.materialProfile = materialProfiles;
    }

    if (threshold) {
      response.threshold = threshold;
    }

    if (globalRatesThreshold) {
      response.globalRatesThreshold = globalRatesThreshold;
    }

    if (customRatesGroupThreshold) {
      response.customRatesGroupThreshold = customRatesGroupThreshold;
    }

    if (landfillOperation) {
      response.landfillOperation = landfillOperation;
      response.landfillOperationId = landfillOperation.id;
    }

    let workOrders = {};
    if (workOrderId) {
      workOrders = await WorkOrderRepo.getInstance(ctx.state).getBy({
        condition: { id: workOrderId },
      });
      if (workOrders) {
        const mediaRepo = MediaFileRepo.getInstance(ctx.state);
        const independentOrderMediaRepo = IndependentWorkOrderMediaRepo.getInstance(ctx.state);
        if (isRollOff) {
          workOrders.mediaFiles = await mediaRepo.getAll({
            condition: { workOrderId: workOrders.id },
          });
          if (!workOrders.mediaFiles) {
            workOrders.mediaFiles = [];
          }
          workOrders.mediaFilesCount = workOrders.mediaFiles.length;
        } else {
          workOrders.mediaFiles = await independentOrderMediaRepo.getAll({
            condition: { independentWorkOrderId: workOrders.id },
          });
          if (!workOrders.mediaFiles) {
            workOrders.mediaFiles = [];
          }
          workOrders.mediaFilesCount = workOrders.mediaFiles.length;
        }
        response.workOrder = workOrders;
        const manifestItems = await ManifestItems.getInstance(
          ctx.state,
        ).populateManifestItemsByWorkOrderId(workOrderId);
        response.manifestItems = manifestItems;
      }
    }
    if (frequencies) {
      response.frequencies = frequencies;
    }

    ctx.sendObj(response);
  } catch (error) {
    ctx.logger.error(`error. ${error}`);
    throw ApiError.invalidRequest(`error. ${error}`);
  }
};

export const getOrdersCount = async ctx => {
  const { email } = ctx.state.user;
  const { mine, finalizedOnly, customerId, businessUnitId, query } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();

  if (!mine && !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  if (mine) {
    condition.csrEmail = email;
  }

  if (customerId) {
    condition.customerId = customerId;
  }

  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  condition.filters = getFiltersData(ctx.request.validated.query);

  Object.assign(condition, parseSearchQuery(query));

  const total = await OrderRepo.getInstance(ctx.state).count({ condition });

  if (total && total.statuses) {
    if (!finalizedOnly) {
      total.statuses.finalized += total.statuses.canceled;
    }
    delete total.statuses.canceled;
  }

  ctx.sendObj(total);
};

export const getDroppedEquipmentItems = async ctx => {
  const condition = ctx.getRequestCondition();

  const equipmentItems = await OrderRepo.getInstance(ctx.state).findDroppedEquipmentItemLocations({
    condition: Object.assign(condition, ctx.request.validated.query),
  });

  ctx.sendArray(equipmentItems);
};

export const getOrderById = async ctx => {
  // pre-pricing service code:
  // const { edit = false, quickView = false } = ctx.request.validated.query;
  // end pre-pricing service code
  const { edit = false } = ctx.request.validated.query;
  const { id } = ctx.params;
  const orders = await pricingGetPriceOrder(ctx, { data: { id } });
  if (!orders) {
    throw ApiError.notFound('Order not found', `Order doesn't exist with id ${id}`);
  }
  const [order] = orders;

  if (!order) {
    throw ApiError.notFound('Order not found', `Order doesn't exist with id ${id}`);
  } else if (
    !ctx.state.serviceToken &&
    order.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  order.payments = [];
  if (edit) {
    if (!(order.paymentMethod === PAYMENT_METHOD.onAccount || order.paymentMethod === null)) {
      // needs to fetch data of related prepaid or deferred payment
      const { id: orderId } = order;

      const payments = await billingService.getPrepaidOrDeferredPaymentsByOrder(ctx, {
        orderId,
      });

      order.payments = payments.map(payment => ({
        ...payment,
        amount: payment.assignedAmount,
      }));
    }
    if (order?.orderContact) {
      const phoneNumbers = await PhoneNumberRepo.getInstance(ctx.state).getAll({
        condition: {
          contactId: order.orderContact.originalId,
        },
      });
      if (phoneNumbers) {
        order.orderContact.phoneNumbers = phoneNumbers;
      }
    }
  }

  ctx.sendObj(order);
};

export const getWoMediaFiles = async ctx => {
  const { workOrderId, id } = ctx.params;

  const order = await pricingGetPriceOrder(ctx, { data: { id } });

  if (!order) {
    throw ApiError.notFound('Order not found', `Order doesn't exist with id ${id}`);
  }

  if (
    order.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  const mediaFiles = await MediaFileRepo.getInstance(ctx.state).getAll({
    condition: { workOrderId },
  });

  ctx.sendArray(mediaFiles);
};

const assertServiceDateValid = (serviceDate, deferredUntil) => {
  const date1 = zonedTimeToUtc(serviceDate, 'UTC');
  const date2 = zonedTimeToUtc(deferredUntil, 'UTC');
  if (
    !(
      isFuture(date1) &&
      isFuture(date2) &&
      // differenceInCalendarDays returns signed value
      differenceInCalendarDays(date1, date2) >= 1
    )
  ) {
    throw ApiError.conflict(`Service date must be later deferredUntil date at least in 1 day`);
  }
};

const splitOnAccountAmount = (orders, onAccountPayment) => {
  if (onAccountPayment) {
    // gcd used here to split onAccount payment proportionally between orders
    const gcd = calculateGcd(orders.map(order => order.grandTotal));

    let remainingAmount = onAccountPayment.amount;

    const ratio = orders.map(order => order.grandTotal / gcd);
    const totalRatio = ratio.reduce((acc, cur) => acc + cur, 0);

    orders.forEach((order, index) => {
      const assignedAmount = mathRound2(
        index === orders.length - 1
          ? remainingAmount
          : (ratio[index] / totalRatio) * onAccountPayment.amount,
      );
      remainingAmount = mathRound2(remainingAmount - assignedAmount);

      order.onAccountTotal = assignedAmount;
    });
  } else {
    orders.forEach(order => (order.onAccountTotal = 0));
  }
};

const runPreOrdersPlacementValidations = async (
  ctx,
  { orders, payments, customer, serviceDate, email, csrName },
) => {
  if (customer?.status === CUSTOMER_STATUS.onHold) {
    const permissionToCheck = payments.some(p => p.paymentMethod === PAYMENT_METHOD.onAccount)
      ? 'orders:new-on-account-on-hold-order:perform'
      : 'orders:new-prepaid-on-hold-order:perform';

    if (!checkPermissions(ctx.state.user, [permissionToCheck])) {
      throw ApiError.accessDenied('No permission to create an order with customer onHold status');
    }
  }

  if (customer?.status === CUSTOMER_STATUS.inactive) {
    throw ApiError.invalidRequest('Customer is inactive');
  }

  const deferredPayments = payments.filter(payment => payment.deferredPayment);

  if (deferredPayments.length > 1) {
    throw ApiError.invalidRequest('Only one deferred payment is allowed');
  }

  const [deferredPayment] = deferredPayments;

  if (deferredPayment) {
    if (orders.some(order => order.noBillableService)) {
      throw ApiError.invalidRequest(
        'Deferred payment is not allowed for orders without billable services',
      );
    } else if (deferredPayment.paymentMethod !== PAYMENT_METHOD.creditCard) {
      throw ApiError.invalidRequest('Only credit card Payments can be deferred');
    } else if (
      orders.some(item => assertServiceDateValid(item.serviceDate, deferredPayment.deferredUntil))
    ) {
      throw ApiError.invalidRequest('Deferred payment must be before service dates of all orders');
    }
  } else if (isPast(serviceDate) && !isToday(serviceDate)) {
    throw ApiError.invalidRequest('Order cannot be placed for past service date');
  }

  const onAccountPayment = payments.find(
    payment => payment.paymentMethod === PAYMENT_METHOD.onAccount,
  );

  if (
    onAccountPayment &&
    onAccountPayment.overrideCreditLimit &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersOverrideCreditLimit])
  ) {
    throw ApiError.accessDenied('You do not have permission to override credit limit');
  }

  const ordersSum = mathRound2(sumTotals(orders));
  ctx.logger.debug(`createOrders->ordersSum: ${ordersSum}`);

  if (payments.length === 0 && ordersSum !== 0) {
    throw ApiError.invalidRequest('Only zero-total orders can have no payments');
  }

  const invalidOrderIndex = orders.findIndex(
    order => order.paymentMethod === null && order.grandTotal !== 0,
  );

  if (invalidOrderIndex !== -1) {
    throw ApiError.invalidRequest(
      'Only zero-total orders can have no payments',
      `orders[${invalidOrderIndex}] has total ${orders[invalidOrderIndex].grandTotal}`,
    );
  }
  const paymentsSum = mathRound2(sumAmounts(payments));
  ctx.logger.debug(`createOrders->paymentsSum: ${paymentsSum}`);

  if (ordersSum !== paymentsSum) {
    throw ApiError.invalidRequest('Payments total amount is not equal to orders total amount');
  }

  splitOnAccountAmount(orders, onAccountPayment);

  if (onAccountPayment && onAccountPayment.amount > 0 && !onAccountPayment.overrideCreditLimit) {
    const { availableCredit } = await billingService.getAvailableCredit(ctx, {
      customerId: customer.id,
    });

    if (availableCredit < onAccountPayment.amount) {
      throw ApiError.paymentRequired('Credit limit exceeded for on account payment');
    }
  } else if (onAccountPayment?.overrideCreditLimit) {
    orders.forEach(order => {
      order.overrideCreditLimit = true;
    });
  }

  orders.forEach(order => {
    validateBestTimeToComeRange(order.bestTimeToComeFrom, order.bestTimeToComeTo);
    order.csrEmail = email;
    order.csrName = csrName;

    order.deferredPayment = !!deferredPayment;

    if (!payments || payments.length === 0) {
      order.paymentMethod = null;
    } else if (payments.length === 1) {
      order.paymentMethod = payments[0].paymentMethod;
    } else {
      order.paymentMethod = PAYMENT_METHOD.mixed;
    }
  });

  return { paymentsSum };
};

async function* getOrdersAsyncIterator(orders) {
  for (let i = 0; i < orders.length; i++) {
    yield orders[i];
  }
}

export const createOrders = async ctx => {
  const { email, userId, tenantId, schemaName, name: csrName } = ctx.state.user;
  const data = ctx.request.validated.body;
  const {
    customerId,
    businessUnitId,
    businessLineId,
    commercialTaxesUsed,
    payments,
    orders,
    serviceDate,
  } = data;

  const [customer, businessUnit] = await Promise.all([
    CustomerRepo.getInstance(ctx.state).getBy({
      condition: { id: customerId },
      fields: ['id', 'status', 'customerGroupId'],
    }),
    BusinessUnitRepo.getInstance(ctx.state).getBy({ condition: { id: businessUnitId } }),
  ]);
  const { customerGroupId } = customer;

  const { paymentsSum } = await runPreOrdersPlacementValidations(ctx, {
    orders,
    payments,
    customer,
    serviceDate,
    email,
    csrName,
  });

  // upsert customer-jobSite pair
  const [{ jobSiteId }] = orders;
  // bcz each order's pair is identical
  const pairData = getCustomerJobSitePairInputFields(data.orders[0]);
  // TODO: solve jobSite2 case bcz it could be different
  const cjsRepo = CustomerJobSiteRepo.getInstance(ctx.state);
  const { linkedCjsPair, created: linkedCjsPairCreated } = await cjsRepo.upsertOne({
    customerId,
    // no jobSiteId - recycling case
    jobSiteId: jobSiteId || businessUnit.jobSiteId,
    data: pairData,
  });

  // const ordersInput = orders.flatMap((order) => Array(Number(order.billableServiceQuantity)).fill(order));
  const repo = OrderRepo.getInstance(ctx.state, {});

  const newOrders = [];
  const commonObj = {
    payments,
    customerId,
    customerGroupId,
    businessLineId,
    businessUnitId,
    commercialTaxesUsed,
  };

  try {
    for await (const order of getOrdersAsyncIterator(orders)) {
      const q = Number(order.billableServiceQuantity);
      const createOrder = repo.createOne.bind(
        repo,
        {
          data: { ...order, onAccountTotal: order.onAccountTotal / q, ...commonObj },
          tenantId,
          businessUnit,
          linkedCjsPair,
        },
        ctx,
      );

      for await (const o of getOrdersAsyncIterator(Array.from({ length: q }).fill(order))) {
        const createdOrder = await createOrder({ ...o, onAccountTotal: o.onAccountTotal / q }, ctx);
        newOrders.push(createdOrder);
      }
      // const someNewOrders = await Promise.all(Array.from({ length: q }).map(createOrder));
      // newOrders.push(...someNewOrders);
    }
    ctx.logger.info(`createOrders->newOrders.length: ${newOrders.length}`);

    const fieldsToLog = pick([
      'id',
      'serviceDate',
      'billableServiceId',
      'billableServicePrice',
      'grandTotal',
    ]);
    ctx.logger.debug(
      `createOrders->newOrders: ${JSON.stringify(
        newOrders.map(({ id, insertData: i }) => ({ id, ...fieldsToLog(i) })),
        null,
        2,
      )}`,
    );
    const finalOrdersSum = mathRound2(sumBy('grandTotal')(newOrders));
    ctx.logger.debug(`createOrders->finalOrdersSum: ${finalOrdersSum}`);

    if (finalOrdersSum !== paymentsSum) {
      throw ApiError.invalidRequest('Payments total amount is not equal to orders total amount');
    }

    if (newOrders?.length) {
      await billingProcessor.createPaymentsForNewOrders(ctx, {
        payments,
        customerId: data.customerId,
        ordersInput: orders.flatMap(order =>
          Array(Number(order.billableServiceQuantity)).fill(order),
        ),
        newOrders: newOrders.map(
          ({ insertData, id, woNumber, poNumber, defaultFacilityJobSiteId }) => ({
            ...insertData,
            id,
            businessUnitId,
            woNumber,
            poNumber,
            defaultFacilityJobSiteId,
          }),
        ),
        businessUnitId,
        schemaName,
      });

      if (newOrders[0].independentWorkOrder) {
        const independentWorkOrders = newOrders.map(item => item.independentWorkOrder);
        await publishers.syncIndependentToDispatch(ctx, {
          independentWorkOrders,
          schemaName,
          userId,
        });
      }
    }
  } catch (error) {
    if (newOrders?.length) {
      await Promise.allSettled(
        newOrders.map(
          ({
            id: orderId,
            workOrderId,
            independentWorkOrder,
            insertData: { orderRequestId } = {},
          }) =>
            repo.deleteOrderAndRelatedEntities({
              orderId,
              workOrderId,
              independentWorkOrder,
              orderRequestId,
              cjsPairId: linkedCjsPairCreated && linkedCjsPair?.id,
            }),
        ),
      );
    }
    throw error;
  }

  if (newOrders?.length) {
    const action = repo.logAction.create;
    newOrders.forEach(({ id }) => repo.log({ id, repo, userId, action }));

    if (linkedCjsPairCreated && linkedCjsPair?.id) {
      cjsRepo.log({ id: linkedCjsPair.id, userId, action });
    }
  }

  // TODO: update response
  ctx.body = { id: newOrders[0]?.id, total: newOrders.length };
  ctx.status = httpStatus.CREATED;
};
const pickOrderFields = (orderData, status, timeZone = 'UTC') => {
  const fields = [
    'noBillableService',
    'jobSiteId',
    'jobSite2Id',
    'customerId',
    'projectId',
    'customRatesGroupId',
    'materialId',
    'globalRatesServicesId',
    'customRatesGroupServicesId',
    'billableServiceId',
    'billableServicePrice',
    'droppedEquipmentItem',
    'lineItems',
    'thresholds',
    'jobSiteContactId',
    'callOnWayPhoneNumber',
    'callOnWayPhoneNumberId',
    'textOnWayPhoneNumber',
    'textOnWayPhoneNumberId',
    'jobSiteNote',
    'signatureRequired',
    'thirdPartyHaulerId',
    'orderContactId',
    'overrideCreditLimit',
    'materialProfileId',
    'disposalSiteId',
    'promoId',
    'alleyPlacement',
    'cabOver',
    'poRequired',
    'purchaseOrderId',
    'oneTimePurchaseOrderNumber',
    'permitRequired',
    'popupNote',
    'paymentMethod',
    'notifyDayBefore',
    'serviceDate',
    'applySurcharges',
    'surcharges',
    'billableServiceApplySurcharges',
    'thresholds',
  ];

  if (status === ORDER_STATUS.inProgress) {
    fields.push(
      'permitId',
      'driverInstructions',
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
      'someoneOnSite',
      'toRoll',
      'highPriority',
      'earlyPick',
      'serviceDate',
      'billableServiceId',
    );

    const buDate = utcToZonedTime(new Date(), timeZone);
    if (differenceInCalendarDays(orderData.serviceDate, buDate) < 0) {
      throw ApiError.invalidRequest(
        'Past date is disallowed for Service date of orders in inProgress status',
      );
    } else {
      fields.push('billableServiceId');
    }
  }

  return pick(fields)(orderData);
};

const pickLineItemFields = map(
  pick([
    'id',
    'billableLineItemId',
    'globalRatesLineItemsId',
    'customRatesGroupLineItemsId',
    'price',
    'materialId',
    'manifestNumber',
    'quantity',
    'applySurcharges',
  ]),
);

const pickThresholdFields = map(pick(['id', 'price', 'quantity', 'applySurcharges', 'threshold']));

const updateDeferredPayment = async (
  ctx,
  { deferredPayment, grandTotal, serviceDate, orderId },
) => {
  let orderIds = [];

  const { paymentId, ...newPaymentData } = deferredPayment;
  newPaymentData.date ?? (newPaymentData.date = new Date());
  newPaymentData.orderId = orderId;
  newPaymentData.grandTotal = grandTotal;
  newPaymentData.serviceDate = serviceDate;

  ({ orderIds = [] } = await billingService.updateDeferredPayment(ctx, {
    paymentId,
    data: newPaymentData,
  }));

  const { paymentType } = newPaymentData;

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const ordersToUpdate = await orderRepo.getAllPrepaidByIds(orderIds, [
    'id',
    'paymentMethod',
    'mixedPaymentMethods',
  ]);

  if ([PAYMENT_TYPE.check, PAYMENT_TYPE.cash].includes(paymentType) && orderIds?.length) {
    await Promise.all(
      ordersToUpdate.map(orderToUpdate => {
        const mixedPaymentMethods = orderToUpdate?.mixedPaymentMethods ?? [];

        mixedPaymentMethods.indexOf(PAYMENT_METHOD.creditCard) !== -1 &&
          mixedPaymentMethods.splice(mixedPaymentMethods.indexOf(PAYMENT_METHOD.creditCard), 1);

        if (mixedPaymentMethods.length > 1) {
          mixedPaymentMethods.push(paymentType);
        }

        // skipped to log AL since as more tech update
        return orderRepo.updateBy({
          condition: { id: orderToUpdate.id },
          data: {
            paymentMethod:
              orderToUpdate.paymentMethod === PAYMENT_METHOD.mixed
                ? PAYMENT_METHOD.mixed
                : PAYMENT_METHOD[paymentType],
            mixedPaymentMethods:
              orderToUpdate.paymentMethod === PAYMENT_METHOD.mixed || mixedPaymentMethods.length > 0
                ? mixedPaymentMethods
                : [],
          },
          fields: [],
        });
      }),
    );
  } else {
    // no onAccount option available for deferred orders
  }

  return { orderIds };
};

export const editOrder = async ctx => {
  const {
    user: { schemaName, tenantId },
  } = ctx.state;
  const { id } = ctx.params;
  const { body } = ctx.request.validated;
  const { status } = body;

  // Skip non-editable fields.
  // pre-pricing service code:
  // const orderRepo = OrderRepo.getInstance(ctx.state);
  // const originalOrder = await orderRepo.getBy({
  //   condition: { id },
  //   fields: [
  //     'onAccountTotal',
  //     'paymentMethod',
  //     'grandTotal',
  //     'customerId',
  //     'workOrderId',
  //     'independentWorkOrderId',
  //     'status',
  //     'businessLineId',
  //     'businessUnitId',
  //     'billableServiceId',
  //     'serviceDate',
  //     'purchaseOrderId',
  //     'commercialTaxesUsed',
  //   ],
  // });
  // end of pre-pricing service code
  const orders = await pricingGetPriceOrder(ctx, { data: { id } });
  const originalOrder = orders[0];
  // const originalOrder = await orderRepo.getBy({
  //   condition: { id },
  //   fields: [
  //     'onAccountTotal',
  //     'paymentMethod',
  //     'grandTotal',
  //     'customerId',
  //     'workOrderId',
  //     'independentWorkOrderId',
  //     'status',
  //     'businessLineId',
  //     'businessUnitId',
  //     'billableServiceId',
  //     'serviceDate',
  //     'purchaseOrderId',
  //     'commercialTaxesUsed',
  //   ],
  // });
  const { timeZone } = await BusinessUnitRepo.getInstance(ctx.state).getTimeZone(
    originalOrder.businessUnit.id,
    tenantId,
  );

  const data = pickOrderFields(body, status, timeZone);
  data.lineItems = pickLineItemFields(data.lineItems);
  data.thresholds = pickThresholdFields(data.thresholds);

  const { bestTimeToComeFrom, bestTimeToComeTo } = data;
  validateBestTimeToComeRange(bestTimeToComeFrom, bestTimeToComeTo);

  if (!originalOrder) {
    throw orderNotFound(id, status);
  }

  const prevServiceId = originalOrder.billableService?.originalId;
  if (data.serviceDate && status === ORDER_STATUS.inProgress) {
    const newSd = new Date(data.serviceDate);
    const oldSd = new Date(originalOrder.serviceDate);
    if (newSd.toDateString() !== oldSd.toDateString() && isPast(newSd) && !isToday(newSd)) {
      throw ApiError.invalidRequest(
        'InProgress Order serviceDate cannot be edited for any past date',
      );
    }

    if (
      (data.billableServiceId ? prevServiceId !== data.billableServiceId : false) &&
      (isPast(newSd) || isToday(newSd))
    ) {
      throw ApiError.invalidRequest(
        'InProgress Order service can be edited only if serviceDate is future',
      );
    }
  } else if (data.billableServiceId ? prevServiceId !== data.billableServiceId : false) {
    throw ApiError.invalidRequest('Order service cannot be edited in other than InProgress status');
  }

  data.onAccountTotal = originalOrder.onAccountTotal;
  data.businessLineId = originalOrder.businessLine.id; // taxes calc in editOne
  data.businessUnitId = originalOrder.businessUnit.id;
  data.commercialTaxesUsed = originalOrder.commercialTaxesUsed;

  const { deferred } = originalOrder;
  const deferredPayment = body?.payments?.find(payment => payment.deferredUntil);

  if (deferred && deferredPayment) {
    if (status !== ORDER_STATUS.inProgress) {
      throw ApiError.invalidRequest(
        'Order with Deferred Payment can be edited in inProgress status only',
      );
    } else if (deferredPayment.status === PAYMENT_STATUS.deferred) {
      assertServiceDateValid(data.serviceDate, deferredPayment.deferredUntil);
    }
  }

  ctx.logger.debug(`editOrder->data: ${JSON.stringify(data, null, 2)}`);
  // pre-pricing service code:
  // const order = await orderRepo.editOne({
  //   condition: { id },
  //   concurrentData,
  //   data,
  //   independentWorkOrder,
  //   prevServiceId,
  //   recycling,
  //   route,
  //   fields: [
  //     'id',
  //     'grandTotal',
  //     'beforeTaxesTotal',
  //     'status',
  //     'onAccountTotal',
  //     'serviceDate',
  //     'surchargesTotal',
  //     'purchaseOrderId',
  //   ],
  //   log: true,
  // });
  // end of pre-pricing service code
  const order = await pricingAlterOrder(ctx, { data }, id);

  // const order = await orderRepo.editOne({
  //   condition: { id },
  //   concurrentData,
  //   data,
  //   independentWorkOrder,
  //   prevServiceId,
  //   recycling,
  //   route,
  //   fields: [
  //     'id',
  //     'grandTotal',
  //     'beforeTaxesTotal',
  //     'status',
  //     'onAccountTotal',
  //     'serviceDate',
  //     'surchargesTotal',
  //     'purchaseOrderId',
  //   ],
  //   log: true,
  // });
  ctx.logger.debug(`editOrder->order: ${JSON.stringify(order, null, 2)}`);

  let orderIds = [];
  const {
    id: orderId,
    serviceDate,
    purchaseOrder: { id: purchaseOrderId, poNumber = null } = {},
  } = order;
  const grandTotal = Number(order.grandTotal);

  if (deferred && deferredPayment) {
    ({ orderIds } = await updateDeferredPayment(ctx, {
      deferredPayment,
      grandTotal,
      orderId,
      serviceDate,
    }));
  }

  const notEqualGrandTotal = Number(originalOrder.grandTotal) !== grandTotal;
  const notEqualServiceDate = !isEqual(originalOrder.serviceDate, serviceDate);
  const notEqualPurchaseOrder = originalOrder.purchaseOrder?.id !== purchaseOrderId;
  if (notEqualGrandTotal || notEqualServiceDate || notEqualPurchaseOrder) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId,
      grandTotal,
      serviceDate,
      poNumber,
      onAccountTotal: Number(order.onAccountTotal),
      surchargesTotal: Number(order.surchargesTotal),
      beforeTaxesTotal: Number(order.beforeTaxesTotal),
    });
  }

  ctx.status = httpStatus.OK;
  ctx.body = { orderIds };
};

export const rescheduleOrder = async ctx => {
  const {
    user: { schemaName, tenantId },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const {
    serviceDate,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    comment: rescheduleComment,
    addTripCharge,
  } = ctx.request.validated.body;

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const originalOrder = await pricingGetOrderReduced(ctx, {
    data: {
      condition: { id },
      fields: ['id', 'status', 'serviceDate', 'businessUnitId'],
    },
  });
  const { timeZone } = await BusinessUnitRepo.getInstance(ctx.state).getTimeZone(
    // pre-pricing service code:
    // originalOrder.businessUnit.id,
    // end of pre-pricing service code
    originalOrder.businessUnitId,
    tenantId,
  );

  if (originalOrder.status !== ORDER_STATUS.inProgress) {
    throw ApiError.invalidRequest('Only InProgress order can be rescheduled');
  }

  const buDate = utcToZonedTime(new Date(), timeZone);
  if (differenceInCalendarDays(serviceDate, buDate) < 0) {
    throw ApiError.invalidRequest('InProgress Order cannot be rescheduled for any past date');
  }

  const payment = await billingService.getPrepaidOrDeferredPaymentsByOrder(ctx, {
    orderId: id,
    deferredOnly: true,
  });

  const isDeferred = payment?.deferredUntil && payment?.status === PAYMENT_STATUS.deferred;
  isDeferred && assertServiceDateValid(serviceDate, payment.deferredUntil);

  validateBestTimeToComeRange(bestTimeToComeFrom, bestTimeToComeTo);

  const order = await orderRepo.rescheduleOne({
    condition: { id, status: ORDER_STATUS.inProgress },
    concurrentData,
    data: {
      serviceDate,
      bestTimeToComeFrom,
      bestTimeToComeTo,
      rescheduleComment,
      addTripCharge,
    },
    fields: ['id', 'grandTotal', 'beforeTaxesTotal', 'onAccountTotal', 'surchargesTotal'],
    log: true,
  });

  if (!order) {
    throw orderNotFound(id, ORDER_STATUS.inProgress);
  }

  const { id: orderId } = order;
  const grandTotal = Number(order.grandTotal);

  if (isDeferred && payment) {
    await updateDeferredPayment(ctx, {
      deferredPayment: { ...payment, paymentId: payment.id },
      grandTotal,
      orderId,
      serviceDate,
    });
  }

  await billingProcessor.syncOrderTotals(ctx, {
    schemaName,
    orderId,
    serviceDate,
    grandTotal: Number(order.grandTotal),
    onAccountTotal: Number(order.onAccountTotal),
    surchargesTotal: Number(order.surchargesTotal),
    beforeTaxesTotal: Number(order.beforeTaxesTotal),
  });

  ctx.status = httpStatus.OK;
};

export const checkOrdersToApprove = async ctx => {
  const { ids } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.completed });

  const total = await OrderRepo.getInstance(ctx.state).validateOrders({
    condition,
  });

  ctx.sendObj({ total });
};

export const approveOrders = async ctx => {
  // pre-pricing service code:
  // const { ids, validOnly } = ctx.request.body;
  // end of pre-pricing service code
  const { ids } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.completed });

  const result = await pricingApproveOrder(ctx, ids);

  if (!result) {
    throw noOrdersToApprove(ids, ORDER_STATUS.completed);
  }

  ctx.status = httpStatus.OK;
};

export const unapproveOrders = async ctx => {
  const { ids } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.approved });

  const result = await OrderRepo.getInstance(ctx.state).updateOrdersToStatus({
    condition,
    newStatus: ORDER_STATUS.completed,
    log: true,
  });

  if (!result) {
    throw ApiError.notFound(
      'There are no Orders to be unapproved',
      `None approved Orders by ids ${ids} found`,
    );
  }

  ctx.status = httpStatus.OK;
};

export const checkOrdersToFinalize = async ctx => {
  const { ids } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.approved });

  const total = await OrderRepo.getInstance(ctx.state).validateOrders({
    condition,
  });

  ctx.sendObj({ total });
};

export const finalizeOrders = async ctx => {
  const { ids, validOnly } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.approved });

  const result = await OrderRepo.getInstance(ctx.state).updateOrdersToStatus({
    condition,
    newStatus: ORDER_STATUS.finalized,
    validOnly,
    log: true,
  });

  if (!result) {
    throw noOrdersToFinalize(ids);
  }

  ctx.status = httpStatus.OK;
};

export const refundWrongCcPayment = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  const repo = OrderRepo.getInstance(ctx.state);
  const order = await repo.getBy({
    condition: { id },
    fields: ['id', 'customerId', 'paymentMethod', 'mixedPaymentMethods', 'status', 'grandTotal'],
  });

  if (!order) {
    throw orderNotFound(id);
  }
  const { paymentMethod, status } = order;
  if ([ORDER_STATUS.finalized, ORDER_STATUS.canceled].includes(status)) {
    throw ApiError.invalidRequest(`Refund with wrong CC is disallowed for Order status ${status}`);
  }
  if (paymentMethod === PAYMENT_METHOD.onAccount) {
    throw ApiError.invalidRequest('OnAccount method Orders cannot be refunded in such way');
  } else if (
    paymentMethod === PAYMENT_METHOD.creditCard &&
    data.date.toDateString() !== new Date().toDateString()
  ) {
    throw ApiError.invalidRequest(
      'If Payment method is Credit Card - Payment date must be today only',
    );
  }

  data.amount = order.grandTotal;

  await billingService.fullRefundAndNewPrepaidPayment(ctx, {
    data: {
      orderId: id,
      customerId: order.customer.originalId,
      ...data,
    },
  });

  const mixedPaymentMethods = order?.mixedPaymentMethods ?? [];

  mixedPaymentMethods.indexOf(PAYMENT_METHOD.creditCard) !== -1 &&
    mixedPaymentMethods.splice(mixedPaymentMethods.indexOf(PAYMENT_METHOD.creditCard), 1);

  if (mixedPaymentMethods.length > 1) {
    mixedPaymentMethods.push(data.paymentType);
  }

  await repo.updateBy({
    condition: { id },
    data: {
      paymentMethod:
        paymentMethod === PAYMENT_METHOD.mixed ? PAYMENT_METHOD.mixed : data.paymentType,
      mixedPaymentMethods:
        paymentMethod === PAYMENT_METHOD.mixed || mixedPaymentMethods.length > 0
          ? mixedPaymentMethods
          : [],
    },
    fields: [],
  });

  repo.log({ id, action: repo.logAction.modify });

  ctx.status = httpStatus.NO_CONTENT;
};

export const deleteMediaFile = async ctx => {
  const { woNumber } = ctx.params;
  const { deleteFromDispatch, mediaId, isRollOff } = ctx.request.validated.query;
  const fields = ['url'];

  let mediaFileRepo = IndependentWorkOrderMediaRepo.getInstance(ctx.state);

  if (isRollOff) {
    mediaFileRepo = MediaFileRepo.getInstance(ctx.state);
    fields.push('dispatchId');
  }

  const mediaFile = await mediaFileRepo.getBy({
    condition: { id: mediaId },
    fields,
  });

  if (!mediaFile) {
    throw ApiError.notFound(`Media file with id: ${mediaId} not found`);
  }

  if (deleteFromDispatch) {
    try {
      await deleteWorkOrderNote(ctx, woNumber, mediaFile.dispatchId);
    } catch (error) {
      ctx.logger.error(
        `Failed to remove note ${mediaFile.dispatchId} from dispatch. #WO: ${woNumber}`,
      );
      throw error;
    }
  }

  await mediaFileRepo.deleteBy({ condition: { id: mediaId } });

  if (deleteFromDispatch) {
    deleteFileByUrl(mediaFile.url).catch(error =>
      ctx.logger.error(error, `Could not remove file ${mediaFile.url}`),
    );
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const getOrderHistory = async ctx => {
  const { id } = ctx.params;

  const results = await getHistoricalRecords(ctx, id);

  ctx.sendArray(results);
};

export const getOrderRequestById = async ctx => {
  const { id } = ctx.params;

  const orderRequest = await OrderRequestRepo.getInstance(ctx.state).getPopulatedById({
    id,
  });

  if (orderRequest?.contractor) {
    orderRequest.jobSite.contactId = orderRequest.contractor.contactId;
  }

  ctx.sendObj(orderRequest);
};

export const getOrderRequests = async ctx => {
  const {
    skip = 0,
    limit = ORDERS_PER_PAGE,
    sortBy = 'id',
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;
  const { businessUnitId } = ctx.getRequestCondition();

  const orderRequests = await OrderRequestRepo.getInstance(ctx.state).getAllPaginated({
    condition: {
      businessUnitId,
      status: ORDER_REQUEST_STATUS.requested,
    },
    skip: Number(skip),
    limit: Math.min(Number(limit), ORDERS_PER_PAGE),
    sortBy: sortBy === 'createdAt' ? 'id' : sortBy,
    sortOrder,
  });

  orderRequests?.forEach(or => {
    if (or.contractor) {
      or.jobSite.contactId = or.contractor.contactId;
    } else if (or.customer) {
      or.jobSite.contactId = or.customer.contactId;
    }
  });

  ctx.sendArray(orderRequests);
};

export const getOrderRequestsCount = async ctx => {
  const { businessUnitId } = ctx.getRequestCondition();

  const total = await OrderRequestRepo.getInstance(ctx.state).countBy({
    condition: {
      businessUnitId,
      status: ORDER_REQUEST_STATUS.requested,
    },
  });

  ctx.sendObj({ total });
};

export const rejectOrderRequest = async ctx => {
  const { id } = ctx.params;

  const or = await OrderRequestRepo.getInstance(ctx.state).getById({ id });
  if (!or) {
    throw ApiError.notFound(`No Order Request found for id ${id}`);
  }
  if (or.status !== ORDER_REQUEST_STATUS.requested) {
    throw ApiError.invalidRequest(`Only Order with 'requested' status can be rejected`);
  }

  await OrderRequestRepo.getInstance(ctx.state).markAsRejected(id);

  ctx.status = httpStatus.NO_CONTENT;
};

export const createIndependentWorkOrderMedia = async ctx => {
  const { email } = ctx.state.user;
  const { independentWorkOrderId } = ctx.params;
  const { files } = ctx.request;

  if (!files?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }

  const responseArr = await Promise.all(
    files.map(file =>
      file.error
        ? file
        : IndependentWorkOrderMediaRepo.getInstance(ctx.state).createOneFromUrl(
            independentWorkOrderId,
            file,
            email,
          ),
    ),
  );

  await syncWosMedia(ctx, {
    media: responseArr,
    action: SYNC_WOS_MEDIA_ACTION.create,
    isIndependent: true,
  });

  ctx.sendArray(responseArr);
};

export const getJobSiteData = async ctx => {
  const { customerJobSiteId } = ctx.request.body;

  let customerJobSites = {};
  if (customerJobSiteId) {
    customerJobSites = await CustomerJobSiteRepo.getInstance(ctx.state).getBy({
      condition: { id: customerJobSiteId },
    });
    customerJobSites.jobSite = await JobSiteRepository.getInstance(ctx.state).getBy({
      condition: { id: customerJobSites.jobSite.id },
    });
    customerJobSites.customer = await CustomerRepo.getInstance(ctx.state).getBy({
      condition: { id: customerJobSites.customer.id },
    });
  }

  const response = {
    customerJobSite: customerJobSites,
  };

  ctx.sendObj(response);
};

export const getBillableServiceBySubscription = async ctx => {
  const { id, types, excludeTypes } = ctx.request.body;
  try {
    const response = {};
    let billableServiceTmp = {};
    billableServiceTmp = await BillableServiceRepository.getHistoricalInstance(
      ctx.state,
    ).getBillableServiceBySubscription(id, types, excludeTypes);
    response.billableService = billableServiceTmp;
    ctx.sendObj(response);
  } catch (error) {
    ctx.logger.error(`error. ${error}`);
    throw ApiError.invalidRequest(`error. ${error}`);
  }
};
