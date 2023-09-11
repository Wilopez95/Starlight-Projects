import httpStatus from 'http-status';
import map from 'lodash/fp/map.js';
import pick from 'lodash/fp/pick.js';
import sumBy from 'lodash/fp/sumBy.js';
import cloneDeep from 'lodash/cloneDeep.js';
import isEmpty from 'lodash/isEmpty.js';
import { isPast, isToday, isEqual, isFuture } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import OrderRepo from '../../../repos/v2/order.js';
import PhoneNumberRepo from '../../../repos/phoneNumber.js';
import MediaFileRepo from '../../../repos/mediaFile.js';
import OrderRequestRepo from '../../../repos/v2/orderRequest.js';
import IndependentWorkOrderMediaRepo from '../../../repos/independentWorkOrderMedia.js';
import CustomerRepo from '../../../repos/customer.js';
import SurchargeItemRepo from '../../../repos/v2/orderSurcharge.js';
import CustomerJobSiteRepo from '../../../repos/customerJobSitePair.js';
import BusinessUnitRepo from '../../../repos/businessUnit.js';

import { publishers, syncWosMedia } from '../../../services/routePlanner/publishers.js';
import { deleteWorkOrderNote } from '../../../services/dispatch.js';
import { deleteFileByUrl } from '../../../services/mediaStorage.js';
import * as billingProcessor from '../../../services/billingProcessor.js';
import * as billingService from '../../../services/billing.js';
import { getHistoricalRecords } from '../../../services/v2/orderHistory.js';
import calculatePrices from '../../../services/pricesCalculation/order/calculatePrices.js';
import reScheduleIndependentOrder from '../../../services/independentOrders/reScheduleIndependentOrder.js';
import assertServiceDateValid from '../../../services/independentOrders/utils/assertServiceDateValid.js';

import { checkPermissions } from '../../../middlewares/authorized.js';

import validateBestTimeToComeRange from '../../../utils/validateBestTimeToComeRange.js';
import { calculateGcd, mathRound2 } from '../../../utils/math.js';
import { parseSearchQuery } from '../../../utils/search.js';
import {
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../../utils/priceRefactoring.js';

import ApiError from '../../../errors/ApiError.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { ORDER_SORTING_ATTRIBUTE } from '../../../consts/orderSortingAttributes.js';
import { ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { PAYMENT_TYPE } from '../../../consts/paymentType.js';
import { ORDER_REQUEST_STATUS } from '../../../consts/orderRequestStatuses.js';
import { PAYMENT_STATUS } from '../../../consts/paymentStatus.js';
import { CUSTOMER_STATUS } from '../../../consts/customerStatuses.js';
import { SYNC_WOS_MEDIA_ACTION } from '../../../consts/workOrderMedia.js';
import {
  cjsPairFields,
  editOrderFields as editOrderFieldsRaw,
} from '../../../consts/orderFields.js';
import { PERMISSIONS } from '../../../consts/permissions.js';

const ORDERS_PER_PAGE = 25;
const { zonedTimeToUtc } = dateFnsTz;

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

const editOrderFields = editOrderFieldsRaw.map(prefixKeyWithRefactored); // TODO: remove after refactoring

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
  const { edit = false, quickView = false } = ctx.request.validated.query;
  const { id } = ctx.params;

  let fields;
  if (edit) {
    fields = editOrderFields;
  } else if (quickView) {
    fields = OrderRepo.getOrderGridFields();
  }

  const query = OrderRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields,
  });
  const order = await query;

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

  const order = await OrderRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: ['csrEmail'],
  });

  if (!order) {
    throw ApiError.notFound();
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

const splitOnAccountAmount = (orders, onAccountPayment) => {
  if (onAccountPayment) {
    // gcd used here to split onaccount payment proportionally between orders
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
  { orders, payments, customer, serviceDate, email },
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

  const ordersSum = sumTotals(orders);
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
  const paymentsSum = sumAmounts(payments);
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
  const { email, userId, tenantId, schemaName } = ctx.state.user;
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
      fields: ['status', 'customerGroupId'],
    }),
    BusinessUnitRepo.getInstance(ctx.state).getBy({ condition: { id: businessUnitId } }),
  ]);

  const { paymentsSum } = await runPreOrdersPlacementValidations(ctx, {
    orders,
    payments,
    customer,
    serviceDate,
    email,
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
  const repo = OrderRepo.getInstance(ctx.state);
  const newOrders = [];
  const commonObj = { payments, customerId, businessLineId, businessUnitId, commercialTaxesUsed };

  try {
    for await (const order of getOrdersAsyncIterator(orders)) {
      const q = Number(order.billableServiceQuantity);
      const createOrder = repo.createOne.bind(repo, {
        data: { ...order, ...commonObj },
        tenantId,
        businessUnit,
        linkedCjsPair,
      });

      for await (const o of getOrdersAsyncIterator(Array.from({ length: q }).fill(order))) {
        const createdOrder = await createOrder(o);
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

    const finalOrdersSum = sumBy('refactoredGrandTotal')(newOrders);
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
        newOrders: newOrders.map(({ insertData, id, woNumber, defaultFacilityJobSiteId }) => ({
          ...insertData,
          id,
          businessUnitId,
          woNumber,
          defaultFacilityJobSiteId,
        })),
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

const pickOrderFields = (orderData, status, recycling) => {
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

  if (recycling) {
    fields.push('status');
  }

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

    const serviceDate = zonedTimeToUtc(orderData.serviceDate, 'UTC');

    if (!isFuture(serviceDate) && !isToday(serviceDate)) {
      throw ApiError.invalidRequest(
        'Past date is disallowed for Service date of orders in inProgress status',
      );
    } else {
      fields.push('billableServiceId');
    }
  }

  return pick(fields)(orderData);
};
const pickIndependentWOFields = pick([
  'preferredRoute',
  'independentWorkOrderId',
  'woNumber',
  'businessLineId',
  'businessUnitId',
  'signatureRequired',
  'toRoll',
  'alleyPlacement',
  'bestTimeToComeTo',
  'bestTimeToComeFrom',
  'someoneOnSite',
  'highPriority',
  'serviceDate',
  'pickedUpEquipmentItem',
  'droppedEquipmentItem',
  'thirdPartyHaulerId',
]);

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

export const editOrder = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { body } = ctx.request.validated;
  const { status, recycling, route } = body;

  // Skip non-editable fields.
  const data = pickOrderFields(body, status, recycling);
  const independentWorkOrder = pickIndependentWOFields(body);

  data.lineItems = pickLineItemFields(data.lineItems);
  data.thresholds = pickThresholdFields(data.thresholds);

  const { bestTimeToComeFrom, bestTimeToComeTo } = data;
  validateBestTimeToComeRange(bestTimeToComeFrom, bestTimeToComeTo);

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const {
    id: orderId,
    businessUnit: { id: businessUnitId },
    businessLine: { id: businessLineId },
    customer: { originalId: customerId },
    jobSite: { originalId: jobSiteId },
    customerJobSite: { originalId: customerJobSiteId },
    applySurcharges,
    ...originalOrder
  } = replaceLegacyWithRefactoredFieldsDeep(
    await orderRepo.getBy({
      condition: { id },
      fields: [
        'onAccountTotal',
        'paymentMethod',
        'grandTotal',
        'customerId',
        'workOrderId',
        'independentWorkOrderId',
        'status',
        'businessLineId',
        'businessUnitId',
        'billableServiceId',
        'serviceDate',
        'purchaseOrderId',
        'commercialTaxesUsed',

        'id',
        'businessUnitId',
        'businessLineId',
        'jobSiteId',
        'customerJobSiteId',
        'applySurcharges',
      ].map(prefixKeyWithRefactored),
    }),
  );

  if (!originalOrder) {
    throw orderNotFound(id, status);
  }

  const prevServiceId = originalOrder.billableService?.originalId;
  if (data.serviceDate && status === ORDER_STATUS.inProgress) {
    const newSd = new Date(data.serviceDate);
    const oldSd = new Date(originalOrder.oldServiceDate);
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
  data.businessLineId = businessLineId; // taxes calc in editOne
  data.businessUnitId = businessUnitId;
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

  const ordersSurcharges = {};
  const calcParams = cloneDeep(data);
  calcParams.needRecalculatePrice = true;
  calcParams.needRecalculateSurcharges = true;
  calcParams.price = calcParams.billableServicePrice;
  calcParams.lineItems?.length &&
    calcParams.lineItems.forEach(item => {
      item.needRecalculatePrice = true;
      item.needRecalculateSurcharges = true;
    });
  calcParams.thresholds?.length &&
    calcParams.lineItems.forEach(item => {
      item.needRecalculatePrice = true;
      item.needRecalculateSurcharges = true;
    });
  calcParams.quantity = 1;

  const { applyTaxes = true } = calcParams;
  ctx.logger.debug(`editOrder->calcParams: ${JSON.stringify(calcParams, null, 2)}`);

  // TODO: move all pre-calculations into service
  const {
    summary: { servicesTotal, lineItemsTotal, thresholdsTotal, total, surchargesTotal, grandTotal },
    prices: [{ price: billableServicePrice }],
  } = await calculatePrices(ctx, {
    businessUnitId,
    businessLineId,
    customerId,
    jobSiteId,
    customerJobSiteId,
    applySurcharges,
    applyTaxes,
    orders: [calcParams],
    ordersSurcharges, // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
  });

  // TODO: rename this fields after release:
  data.refactoredPriceId = calcParams.priceId;
  data.refactoredPriceGroupId = calcParams.priceGroupHistoricalId;
  data.refactoredBillableServicePrice = billableServicePrice;
  data.refactoredOverrideServicePrice = calcParams.unlockOverrides;
  data.refactoredOverriddenServicePrice = calcParams.unlockOverrides ? billableServicePrice : null;
  data.refactoredBillableServiceTotal = servicesTotal;
  data.refactoredBillableLineItemsTotal = lineItemsTotal;
  data.refactoredThresholdsTotal = thresholdsTotal;
  data.refactoredSurchargesTotal = surchargesTotal;
  data.refactoredBeforeTaxesTotal = total;
  data.refactoredGrandTotal = grandTotal;
  data.refactoredInitialGrandTotal = grandTotal;
  data.refactoredOnAccountTotal = grandTotal;

  ctx.logger.debug(`editOrder->data: ${JSON.stringify(data, null, 2)}`);

  const order = replaceLegacyWithRefactoredFieldsDeep(
    await orderRepo.editOne({
      condition: { id },
      concurrentData,
      data,
      independentWorkOrder,
      prevServiceId,
      recycling,
      route,
      fields: [
        'grandTotal',
        'beforeTaxesTotal',
        'onAccountTotal',
        'serviceDate',
        'surchargesTotal',
      ].map(prefixKeyWithRefactored),
      log: true,
    }),
  );
  ctx.logger.debug(`editOrder->order: ${JSON.stringify(order, null, 2)}`);

  if (!isEmpty(ordersSurcharges[orderId])) {
    // pre-pricing service code:
    // const updatedOrderSurcharges = await this.getOrderSurchargeHistoricalIds(
    // end of pre-pricing service code

    const updatedOrderSurcharges = await OrderRepo.getInstance(
      ctx.state,
    ).getOrderSurchargeHistoricalIds(ordersSurcharges[orderId], { update: false });

    // pre-pricing service code:
    // await SurchargeItemRepo.getInstance(this.ctxState).upsertMany({
    //   data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
    // end of pre-pricing service code
    await SurchargeItemRepo.getInstance(ctx.state).upsertMany({
      data: updatedOrderSurcharges.map(item => Object.assign(item, { orderId })),
      fields: ['id'],
    });
  }

  let orderIds = [];

  if (deferred && deferredPayment) {
    const { paymentId, ...newPaymentData } = deferredPayment;
    newPaymentData.date ?? (newPaymentData.date = new Date());
    newPaymentData.orderId = orderId;
    // TODO: rename it to refactored or simply sync numbers with billing earlier
    newPaymentData.grandTotal = order.grandTotal;

    ({ orderIds = [] } = await billingService.updateDeferredPayment(ctx, {
      paymentId,
      data: newPaymentData,
    }));

    const { paymentType } = newPaymentData;

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
                orderToUpdate.paymentMethod === PAYMENT_METHOD.mixed ||
                mixedPaymentMethods.length > 0
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
  }

  if (
    Number(originalOrder.grandTotal) !== order.grandTotal ||
    !isEqual(originalOrder.serviceDate, order.serviceDate)
  ) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId,
      grandTotal: order.grandTotal,
      serviceDate: order.serviceDate,
      onAccountTotal: Number(order.onAccountTotal),
      surchargesTotal: Number(order.surchargesTotal),
      beforeTaxesTotal: Number(order.beforeTaxesTotal),
    });
  }

  ctx.status = httpStatus.OK;
  ctx.body = { orderIds };
};

export const rescheduleOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { serviceDate, bestTimeToComeFrom, bestTimeToComeTo, comment, addTripCharge } =
    ctx.request.validated.body;

  await reScheduleIndependentOrder(ctx, {
    data: { id, serviceDate, bestTimeToComeFrom, bestTimeToComeTo, comment, addTripCharge },
    concurrentData,
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
  const { ids, validOnly } = ctx.request.body;
  const condition = ctx.getRequestCondition();
  Object.assign(condition, { ids, status: ORDER_STATUS.completed });

  const result = await OrderRepo.getInstance(ctx.state).updateOrdersToStatus({
    condition,
    newStatus: ORDER_STATUS.approved,
    validOnly,
    log: true,
  });

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
    // TODO: remove mapping after refactoring,
    fields: [
      'id',
      'customerId',
      'paymentMethod',
      'mixedPaymentMethods',
      'status',
      'grandTotal',
    ].map(prefixKeyWithRefactored),
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
