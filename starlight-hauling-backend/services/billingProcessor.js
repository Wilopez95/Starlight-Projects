import { nanoid } from 'nanoid';
import pick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import groupBy from 'lodash/groupBy.js';
import keyBy from 'lodash/keyBy.js';

import knex from '../db/connection.js';

import RecurrentOrderTemplateRepo from '../repos/recurrentOrderTemplate.js';
import CustomerRepo from '../repos/customer.js';
import BillableServiceRepo from '../repos/billableService.js';
import BillableLineItemRepo from '../repos/billableLineItem.js';
import OrderRepo from '../repos/order.js';
import SubscriptionRepo from '../repos/subscription/subscription.js';
import OrderRequestRepo from '../repos/orderRequest.js';

import { mathRound2 } from '../utils/math.js';
import arrayToJsonStream from '../utils/arrayToJsonStream.js';

import { PAYMENT_METHOD } from '../consts/paymentMethods.js';
import { INVOICE_CONSTRUCTION } from '../consts/invoiceConstructions.js';
import { BROKER_BILLING } from '../consts/brokerBillings.js';
import { ORDER_STATUS } from '../consts/orderStatuses.js';
import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';
import MaterialRepository from '../repos/material.js';
import GlobalRatesLineItemRepository from '../repos/globalRatesLineItem.js';
import JobSiteRepository from '../repos/jobSite.js';
import { getRecyclingOrderByIds } from './recycling.js';
import { unmarkSubscriptionsInvoiced } from './subscriptions/unmarkSubscriptionsInvoiced.js';
import { markSubscriptionInvoiced } from './subscriptions/markSubscriptionInvoiced.js';
import { aggregateInvoicing } from './subscriptions/utils/calcSubsInvoicing.js';
import * as billingService from './billing.js';

const INVOICES_BYTES_THRESHOLD_TO_COMPRESS = 100 * 1000; // 1 order = 1kb so about 100 orders

const getCustomerJobSiteData = pick([
  'id',
  'customerId',
  'jobSiteId',
  'sendInvoicesToJobSite',
  'invoiceEmails',
]);

export const prePopulateRecurrentOrdersInput = async (
  ctx,
  { ordersInput = [], recurrentOrderTemplateId, schemaName },
) => {
  const template = await RecurrentOrderTemplateRepo.getInstance(ctx.state, { schemaName }).getBy({
    condition: { id: recurrentOrderTemplateId },
    fields: ['id', 'billableServiceId', 'lineItems', 'jobSiteId'],
  });

  ordersInput.forEach(input => {
    input.billableServiceId = template.billableService?.originalId;
    input.jobSiteId = template.jobSite?.originalId;

    template.lineItems?.forEach(lineItem => {
      const itemIndex = input.lineItems?.findIndex(
        ({ billableLineItemId }) => billableLineItemId === lineItem.billableLineItem?.id,
      );

      if (itemIndex === -1) {
        return;
      }

      input.lineItems[itemIndex].billableLineItemId = lineItem.billableLineItem?.originalId;
    });
  });

  return ordersInput;
};

export const prePopulateRecurrentOrdersInputPricing = async (
  ctx,
  // eslint-disable-next-line no-unused-vars
  { ordersInput = [], recurrentOrderTemplate, schemaName },
) => {
  // const template = await RecurrentOrderTemplateRepo.getInstance(ctx.state, { schemaName }).getBy({
  //   condition: { id: 34 },
  //   fields: ['id', 'billableServiceId', 'lineItems', 'jobSiteId'],
  // });

  const billableServiceData = await BillableServiceRepo.getHistoricalInstance(ctx.state).getBy({
    condition: { id: recurrentOrderTemplate.billableServiceId },
  });

  const jobSiteData = await JobSiteRepository.getHistoricalInstance(ctx.state).getBy({
    condition: { id: recurrentOrderTemplate.jobSiteId },
  });

  recurrentOrderTemplate.billableService = billableServiceData;
  recurrentOrderTemplate.jobSite = jobSiteData;

  for (let index = 0; index < recurrentOrderTemplate.lineItems.length; index++) {
    const billableLineItemData = await BillableLineItemRepo.getHistoricalInstance(ctx.state).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].billableLineItemId },
    });
    const materialData = await MaterialRepository.getHistoricalInstance(ctx.state).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].materialId },
    });
    const globalRatesLineItemDate = await GlobalRatesLineItemRepository.getHistoricalInstance(
      ctx.state,
    ).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].globalRatesLineItemsId },
    });

    recurrentOrderTemplate.lineItems[index].billableLineItem = billableLineItemData;
    recurrentOrderTemplate.lineItems[index].material = materialData;
    recurrentOrderTemplate.lineItems[index].globalRatesLineItem = globalRatesLineItemDate;
  }

  const template = recurrentOrderTemplate;

  ordersInput.forEach(input => {
    input.billableServiceId = template.billableService?.originalId;
    input.jobSiteId = template.jobSite?.originalId;

    template.lineItems?.forEach(lineItem => {
      const itemIndex = input.lineItems?.findIndex(
        ({ billableLineItemId }) => billableLineItemId === lineItem.billableLineItem?.id,
      );

      if (itemIndex === -1) {
        return;
      }

      input.lineItems[itemIndex].billableLineItemId = lineItem.billableLineItem?.originalId;
    });
  });

  return ordersInput;
};

const prePopulateOrderItems = async (ctx, { payments, ordersInput, newOrders, schemaName }) => {
  let paymentMethod;
  if (payments.length === 0) {
    paymentMethod = null;
  } else if (payments.length === 1) {
    [{ paymentMethod }] = payments;
  } else {
    paymentMethod = PAYMENT_METHOD.mixed;
  }

  const orders = newOrders.map(newOrder => ({
    paymentMethod,
    lineItems: [],
    ...pick([
      'id',
      'woNumber',
      'poNumber',
      'beforeTaxesTotal',
      'grandTotal',
      'serviceDate',
      'onAccountTotal',
      'overrideCreditLimit',
      'businessLineId',
      'surchargesTotal',
    ])(newOrder),
  }));

  const billableServiceIds = ordersInput
    .filter(({ noBillableService }) => !noBillableService)
    .map(({ billableServiceId }) => billableServiceId);

  const billableLineItemIds = ordersInput.flatMap(({ lineItems = [] }) =>
    lineItems.map(({ billableLineItemId }) => billableLineItemId),
  );

  const billableServices = isEmpty(billableServiceIds)
    ? []
    : await BillableServiceRepo.getInstance(ctx.state, { schemaName }).getAllByIds({
        ids: billableServiceIds,
        fields: ['id', 'description'],
      });

  const billableLineItems = isEmpty(billableLineItemIds)
    ? []
    : await BillableLineItemRepo.getInstance(ctx.state, { schemaName }).getAllByIds({
        ids: billableLineItemIds,
        fields: ['id', 'description'],
      });

  billableServices.forEach(service => {
    ordersInput.forEach((input, index) => {
      if (service.id !== input.billableServiceId) {
        return;
      }

      orders[index].lineItems.push({
        isService: true,
        description: service?.description,
        quantity: 1,
        price: Number(input.billableServicePrice),
        total: Number(input.billableServicePrice),

        billableServiceHistoricalId: newOrders[index].billableServiceId,
      });
    });
  });
  billableLineItems.forEach(lineItem => {
    ordersInput.forEach((input, index) => {
      const itemIndex = input.lineItems.findIndex(
        ({ billableLineItemId }) => billableLineItemId === lineItem.id,
      );

      if (itemIndex === -1) {
        return;
      }

      const item = input.lineItems[itemIndex];

      orders[index].lineItems.push({
        isService: false,
        description: lineItem.description,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: mathRound2(item.price * item.quantity),

        billableLineItemHistoricalId: newOrders[index].lineItems[itemIndex]?.billableLineItemId,
      });
    });
  });

  orders.forEach((order, index) => {
    order.jobSiteId = ordersInput[index].jobSiteId || newOrders[index].defaultFacilityJobSiteId;
    order.customerJobSite = getCustomerJobSiteData(newOrders[index].customerJobSite);
  });

  return orders;
};

export const getNewOrdersPaymentsData = async (
  ctx,
  { payments, ordersInput, newOrders, customerId, businessUnitId, schemaName },
) => {
  const orders = await prePopulateOrderItems(ctx, {
    payments,
    ordersInput,
    newOrders,
    schemaName,
  });
  return {
    businessUnitId,
    customerId,
    orders,
    payments,
  };
};

export const createPaymentsForNewOrders = async (
  ctx,
  { payments, ordersInput, newOrders, customerId, businessUnitId, schemaName },
) => {
  const data = await getNewOrdersPaymentsData(ctx, {
    payments,
    ordersInput,
    newOrders,
    customerId,
    businessUnitId,
    schemaName,
  });
  await billingService.placeOrders(ctx, { data });
};

export const createPaymentsForRecurrentOrders = async (
  ctx,
  { payments, ordersInput, newOrders, customerId, businessUnitId, schemaName, tenantId },
) => {
  const data = await getNewOrdersPaymentsData(ctx, {
    payments,
    ordersInput,
    newOrders,
    customerId,
    businessUnitId,
    schemaName,
  });

  await billingService.placeRecurrentOrders(ctx, {
    ...data,
    schemaName,
    tenantId,
  });
};

export const customerFieldsForBilling = [
  'id',
  'businessUnitId',
  'businessName',
  'firstName',
  'lastName',
  'invoiceConstruction',
  'onAccount',
  'creditLimit',
  'billingCycle',
  'paymentTerms',
  'addFinanceCharges',
  'aprType',
  'financeCharge',
  'mailingAddressLine1',
  'mailingAddressLine2',
  'mailingCity',
  'mailingState',
  'mailingZip',
  'billingAddressLine1',
  'billingAddressLine2',
  'billingCity',
  'billingState',
  'billingZip',
  'sendInvoicesByEmail',
  'sendInvoicesByPost',
  'attachTicketPref',
  'attachMediaPref',
  'invoiceEmails',
  'statementEmails',
  'notificationEmails',
  'status',
  'isAutopayExist',
  'autopayType',
  'walkup',
];

export const syncCustomerData = async (ctx, { id, mainPhoneNumber, schemaName }, trx) => {
  const data = await CustomerRepo.getInstance(ctx.state, { schemaName }).getById(
    {
      id,
      fields: customerFieldsForBilling,
    },
    trx,
  );

  Object.assign(data, {
    schemaName,
    creditLimit: Number(data.creditLimit) || 0,
    financeCharge: Number(data.financeCharge) || 0,
    mainPhoneNumber,
  });

  await billingService.upsertCustomer(ctx, data);
};

export const syncOrderTotals = async (ctx, { schemaName, orderId, ...newTotals }) => {
  await billingService.updateOrderTotals(ctx, {
    schemaName,
    orderId,
    ...newTotals,
  });
};

const sortByCb = (i1, i2) => i2.invoicesCount - i1.invoicesCount;
const sumTotalsCb = (totals, item) => {
  totals.generatedInvoices += item.invoicesCount;
  totals.invoicesTotal += mathRound2(item.invoicesTotal);
  return totals;
};

const accumulateOrdersToDrafts = ({ customersMap, obj }, rawOrder) => {
  const order = rawOrder;
  const invoicesTotal = Number(order.grandTotal);

  const {
    jobSite: { id: jobSiteId },
  } = order;
  const currentCustomer = customersMap.get(order.originalCustomerId);

  const { id, onAccount: onAccountPref, invoiceConstruction } = currentCustomer;
  const customerObj = onAccountPref ? obj.onAccount[id] : obj.prepaid[id];

  if (!customerObj) {
    obj[onAccountPref ? 'onAccount' : 'prepaid'][id] = {
      invoicesCount: 1,
      invoicesTotal,

      drafts: [
        {
          orders: [order],
          invoicesTotal,
          jobSiteId,
        },
      ],
      ...currentCustomer,
    };
  } else {
    switch (invoiceConstruction) {
      case INVOICE_CONSTRUCTION.byCustomer: {
        customerObj.drafts[0].orders.push(order);
        customerObj.drafts[0].invoicesTotal += invoicesTotal;
        customerObj.invoicesTotal += invoicesTotal;
        break;
      }
      case INVOICE_CONSTRUCTION.byOrder: {
        customerObj.drafts.push({
          orders: [order],
          invoicesTotal,
          jobSiteId,
        });
        customerObj.invoicesCount++;
        customerObj.invoicesTotal += invoicesTotal;
        break;
      }
      case INVOICE_CONSTRUCTION.byAddress: {
        const draft = customerObj.drafts.find(_draft => jobSiteId === _draft.jobSiteId);

        if (draft) {
          draft.orders.push(order);
          draft.jobSiteId = jobSiteId;
          draft.invoicesTotal += invoicesTotal;
        } else {
          customerObj.drafts.push({
            orders: [order],
            invoicesTotal,
            jobSiteId,
          });

          customerObj.invoicesCount++;
        }

        customerObj.invoicesTotal += invoicesTotal;
        break;
      }
      default: {
        break;
      }
    }
  }
};

export const generateDrafts = async (condition = {}, ctx) => {
  // by default billing type for order is arrears ( according to business logic)
  // but there is no field in db
  // so in such case back should return 0
  if (condition.arrears !== undefined && !condition.arrears) {
    return {
      onAccount: [],
      prepaid: [],
      processedOrders: 0,
      generatedInvoices: 0,
      customersCount: 0,
      invoicesTotal: 0,
    };
  }

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const { ordersMap, customersSet, orderIds } = await orderRepo.getOrdersMapForDrafts(condition);

  if (!ordersMap?.size) {
    return {
      onAccount: [],
      prepaid: [],
      processedOrders: 0,
      generatedInvoices: 0,
      customersCount: 0,
      invoicesTotal: 0,
    };
  }
  const currentCustomers = await CustomerRepo.getInstance(ctx.state).getAllPaginated({
    condition: { ids: [...customersSet.values()] },
    sortBy: 'id',
    limit: customersSet.size,
    fields: ['*'],
  });

  const customersMap = new Map();
  currentCustomers.forEach(item => customersMap.set(item.id, item));

  const obj = { onAccount: {}, prepaid: {} };

  const cb = accumulateOrdersToDrafts.bind(null, { orderRepo, customersMap, obj });
  ordersMap.forEach(cb);

  const { onAccount, prepaid } = obj;

  const customers = {
    onAccount: Object.values(onAccount).sort(sortByCb),
    prepaid: Object.values(prepaid).sort(sortByCb),
  };

  let generatedInvoices = 0;
  let invoicesTotal = 0;

  if (!isEmpty(customers.onAccount)) {
    const { generatedInvoices: generatedInvoicesNum = 0, invoicesTotal: invoicesTotalNum = 0 } =
      customers.onAccount.reduce(sumTotalsCb, {
        generatedInvoices: 0,
        invoicesTotal: 0,
      });
    generatedInvoices = generatedInvoicesNum;
    invoicesTotal = invoicesTotalNum;
  }

  if (!isEmpty(customers.prepaid)) {
    const { generatedInvoices: generatedInvoicesNum = 0, invoicesTotal: invoicesTotalNum = 0 } =
      customers.prepaid.reduce(sumTotalsCb, {
        generatedInvoices: 0,
        invoicesTotal: 0,
      });
    generatedInvoices = generatedInvoicesNum;
    invoicesTotal = invoicesTotalNum;
  }

  Object.assign(customers, {
    processedOrders: ordersMap.size,
    customersCount: customers.onAccount.length + customers.prepaid.length,
    generatedInvoices,
    invoicesTotal,
  });

  if (orderIds.length) {
    const selectedOrders = await orderRepo.getAllPrepaidByIds(orderIds, [
      'id',
      'grandTotal',
      'customerId',
    ]);

    if (selectedOrders?.length) {
      const billingOrders = await billingService.checkAndProcessPrepaidOrders(ctx, {
        data: selectedOrders,
      });

      const overpaidOrders = [];
      const overlimitOrders = [];
      billingOrders?.forEach(order => {
        if (order.__overpaidOrder) {
          delete order.__overpaidOrder;
          return overpaidOrders.push(order);
        }
        if (order.__overlimitOrder) {
          delete order.__overlimitOrder;
          return overlimitOrders.push(order);
        }
        return null;
      });

      if (overlimitOrders?.length) {
        const overlimitCustomers = groupBy(overlimitOrders, 'customerOriginalId');
        const attachOverlimitOrders = _customers => _customer =>
          _customers[_customer.id] && (_customer.overlimitOrders = _customers[_customer.id]);

        customers.prepaid.forEach(attachOverlimitOrders(overlimitCustomers));
        customers.onAccount.forEach(attachOverlimitOrders(overlimitCustomers));
      }

      if (overpaidOrders?.length) {
        const overpaidCustomers = groupBy(overpaidOrders, 'customerOriginalId');
        const attachOverpaidOrders = _customers => _customer =>
          _customers[_customer.id] && (_customer.overpaidOrders = _customers[_customer.id]);

        customers.prepaid.forEach(attachOverpaidOrders(overpaidCustomers));
        customers.onAccount.forEach(attachOverpaidOrders(overpaidCustomers));
      }
    }
  }

  return customers;
};

export const generateSubscriptionDrafts = async (condition = {}, ctx) => {
  const customerRepo = CustomerRepo.getInstance(ctx.state);

  const customerSubscriptions = await customerRepo.getCustomersForSubscriptionsInvoicing(condition);

  const customersOrders = await generateDrafts(condition, ctx);

  const result = aggregateInvoicing({ customerSubscriptions, customersOrders });

  return result;
};

function getPreInvoicedOrderDrafts({ orders, affectedOrders, generationJobId }) {
  return orders.map(({ id, paymentMethod, customerJobSite, ticket, status }) => {
    affectedOrders.get(id).paymentMethod = paymentMethod;
    affectedOrders.get(id).customerJobSite = customerJobSite;
    affectedOrders.get(id).ticket = affectedOrders.get(id).ticket || ticket;
    return {
      orderId: id,
      orderStatus: status,
      generationJobId,
    };
  });
}

const getDataForOrdersInvoices = async (
  ctx,
  { invoices, customerFields, generationJobId, billingDate } = {},
) => {
  const affectedOrders = new Map();
  const affectedCustomers = new Map();
  const affectedSubscriptions = new Map();

  invoices.forEach(invoice => {
    const { customerId, orders, subscriptions, attachMediaPref, attachTicketPref } = invoice;

    let currentCustomer = affectedCustomers.get(customerId);

    if (!currentCustomer) {
      currentCustomer = { id: customerId };
      affectedCustomers.set(customerId, currentCustomer);
    }

    invoice.attachMediaPref = attachMediaPref;
    invoice.attachTicketPref = attachTicketPref;
    invoice.customer = currentCustomer;

    let total = 0;

    orders.forEach(order => {
      affectedOrders.set(order.id, order);
      total += order.grandTotal;
      delete order.customerId;
    });

    subscriptions?.forEach(subscription => {
      affectedSubscriptions.set(subscription.id, subscription);
      total = mathRound2(total + subscription.totalPriceForSubscription);
    });

    invoice.total = mathRound2(total);
  });

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const customerRepo = CustomerRepo.getInstance(ctx.state);
  const subscriptionRepo = SubscriptionRepo.getInstance(ctx.state);

  const orderIds = Array.from(affectedOrders.keys());
  const customerOriginalIds = Array.from(affectedCustomers.keys());
  const subscriptionIds = Array.from(affectedSubscriptions.keys());

  const [
    { orders = [], mediaFilesGroups = [], ticketFiles = [] },
    customers,
    // pre-pricing service code:
    //   subscriptionMediaFiles,
    //   subscriptionStateBeforeInvoiced,
    // ] = await Promise.all([
    //   orderRepo.getOrderDataForInvoicing(orderIds),
    //   customerRepo.getAllByIds({
    //     ids: customerOriginalIds,
    //     fields: customerFields,
    //   }),

    //   subscriptionIds?.length
    //     ? subscriptionMediaRepo.getMediaFilesForInvoicing(subscriptionIds, [
    //         SUBSCRIPTION_ORDER_STATUS.finalized,
    //         SUBSCRIPTION_ORDER_STATUS.canceled,
    //       ])
    //     : Promise.resolve(),
    //   subscriptionRepo.getStateBeforeInvoiced({
    //     subscriptionIds,
    //   }),
    // ]);

    // mediaFilesGroups.forEach(
    //   ({ mediaFiles, orderId }) => (affectedOrders.get(orderId).mediaFiles = mediaFiles),
    // );
    // subscriptionMediaFiles?.forEach(
    //   ({ subscriptionId, mediaFiles }) =>
    //     (affectedSubscriptions.get(subscriptionId).mediaFiles = mediaFiles),
    // );

    // ticketFiles.forEach(
    //   ({ orderId, url, fileName }) => (affectedOrders.get(orderId).ticketFile = { url, fileName }),
    // );
    // end of pre pricing code
    subscriptionStateBeforeInvoiced,
  ] = await Promise.all([
    orderRepo.getOrderDataForInvoicing(orderIds),

    customerRepo.getAllByIds({
      ids: customerOriginalIds,
      fields: customerFields,
    }),

    subscriptionRepo.getStateBeforeInvoiced(subscriptionIds),
  ]);

  mediaFilesGroups.forEach(
    ({ mediaFiles, orderId }) => (affectedOrders.get(orderId).mediaFiles = mediaFiles),
  );

  ticketFiles.forEach(
    ({ orderId, url, fileName }) => (affectedOrders.get(orderId).ticketFile = { url, fileName }),
  );

  // end added for pricing code
  orders.forEach(({ id, paymentMethod, customerJobSite, ticket }) => {
    affectedOrders.get(id).paymentMethod = paymentMethod;
    affectedOrders.get(id).customerJobSite = customerJobSite;
    affectedOrders.get(id).ticket = ticket;
  });

  const preInvoicedOrderDrafts = getPreInvoicedOrderDrafts({
    orders,
    affectedOrders,
    generationJobId,
  });

  customers.forEach(({ id, ...customerData }) => {
    if (customerData.creditLimit) {
      customerData.creditLimit = Number(customerData.creditLimit);
    }
    if (customerData.balance) {
      customerData.balance = Number(customerData.balance);
    }
    if (customerData.financeCharge) {
      customerData.financeCharge = Number(customerData.financeCharge);
    }

    if (customerData?.owner?.billing === BROKER_BILLING.broker && customerData?.owner?.active) {
      customerData.brokerEmail = customerData.owner.email;
    }

    Object.assign(affectedCustomers.get(id), customerData);
  });

  const trx = await knex.transaction();
  let updatedOrders;
  try {
    if (orderIds?.length) {
      updatedOrders = await orderRepo.markOrdersInvoiced({
        orderIds,
        preInvoicedOrderDrafts,
      });
    }

    await markSubscriptionInvoiced(ctx, { affectedSubscriptions, billingDate }, trx);

    await trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }

  return { updatedOrders, invoices, subscriptionStateBeforeInvoiced };
};

export const generateInvoicesSubscriptionsOrders = async (
  ctx,
  { invoices, customerFields, billingDate } = {},
) => {
  const orderRepo = OrderRepo.getInstance(ctx.state);

  const generationJobId = nanoid();

  const {
    updatedOrders,
    invoices: invoicesToSend,
    subscriptionStateBeforeInvoiced,
  } = await getDataForOrdersInvoices(ctx, {
    invoices,
    customerFields,
    generationJobId,
    billingDate,
  });

  try {
    await billingService.generateInvoicesSubscriptionsOrders(ctx, {
      data: { invoices: invoicesToSend, generationJobId },
    });
  } catch (error) {
    ctx.logger.error(error, 'Error while generating invoices');

    const trx = await knex.transaction();

    try {
      const promise = [];
      if (updatedOrders?.length) {
        const orderPromise = orderRepo.unmarkOrdersInvoiced(updatedOrders, trx);
        promise.push(orderPromise);
      }
      await Promise.all([
        ...promise,
        unmarkSubscriptionsInvoiced(ctx, { subscriptionStateBeforeInvoiced }, trx),
      ]);

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }

    throw error;
  }

  return { generationJobId };
};

export const generateInvoices = async (
  { invoices, customerFields, businessUnitId, businessUnitType } = {},
  ctx,
  { log } = {},
) => {
  const affectedOrders = new Map();
  const affectedCustomers = new Map();
  // pre-pricing service code:

  // invoices.forEach(invoice => {
  //   const { customerId, orders, attachMediaPref, attachTicketPref } = invoice;
  // end of pre-pricing service code
  invoices.forEach(invoice => {
    const { customerId, orders } = invoice;

    let currentCustomer = affectedCustomers.get(customerId);
    if (!currentCustomer) {
      currentCustomer = { id: customerId };
      affectedCustomers.set(customerId, currentCustomer);
    }

    invoice.customer = currentCustomer;

    let total = 0;
    orders.forEach(order => {
      affectedOrders.set(order.id, order);
      total += order.grandTotal;
      delete order.customerId;
      delete order.status;
    });
    invoice.total = mathRound2(total);

    invoice.businessUnitId = businessUnitId;
    invoice.businessUnitType = businessUnitType;
  });

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const customerRepo = CustomerRepo.getInstance(ctx.state);

  const orderIds = Array.from(affectedOrders.keys());
  const customerOriginalIds = Array.from(affectedCustomers.keys());

  const [{ orders, mediaFilesGroups, ticketFiles }, customers] = await Promise.all([
    orderRepo.getOrderDataForInvoicing(orderIds),
    customerRepo.getAllByIds({
      ids: customerOriginalIds,
      fields: customerFields,
    }),
  ]);

  if (businessUnitType === BUSINESS_UNIT_TYPE.recyclingFacility) {
    ctx.state.tenantName = ctx.state?.user?.schemaName;
    ctx.state.businessUnitId = businessUnitId;
    const response = await getRecyclingOrderByIds(ctx, orderIds);
    let recyclingOrders = response?.data?.ordersByHaulingId;
    recyclingOrders = keyBy(recyclingOrders, 'haulingOrderId');
    affectedOrders.forEach(order => {
      const recyclingOrder = recyclingOrders[order.id];
      order.mediaFiles = recyclingOrder?.images?.map(({ filename, url }) => ({
        id: 1,
        fileName: filename,
        url,
      }));
      if (recyclingOrder?.weightTicketPrivateUrl) {
        order.ticketFile = { url: recyclingOrder?.weightTicketPrivateUrl, fileName: 'ticket' };
      }
      order.woNumber = recyclingOrder?.WONumber?.replace(/^\D+/g, ''); // extract just numbers
      order.ticket = `${recyclingOrder?.id}`;
    });
  } else {
    mediaFilesGroups.forEach(
      ({ mediaFiles, orderId }) => (affectedOrders.get(orderId).mediaFiles = mediaFiles),
    );
    ticketFiles.forEach(
      ({ orderId, url, fileName }) => (affectedOrders.get(orderId).ticketFile = { url, fileName }),
    );
  }

  const generationJobId = nanoid();

  orders.forEach(order => {
    order.customerJobSite.id = order.customerJobSite.originalId;
  });

  const preInvoicedOrderDrafts = getPreInvoicedOrderDrafts({
    orders,
    affectedOrders,
    generationJobId,
  });

  customers.forEach(({ id, ...customerData }) => {
    if (customerData.creditLimit) {
      customerData.creditLimit = Number(customerData.creditLimit);
    }
    if (customerData.balance) {
      customerData.balance = Number(customerData.balance);
    }
    if (customerData.financeCharge) {
      customerData.financeCharge = Number(customerData.financeCharge);
    }

    if (customerData?.owner?.billing === BROKER_BILLING.broker && customerData?.owner?.active) {
      customerData.brokerEmail = customerData.owner.email;
    }

    Object.assign(affectedCustomers.get(id), customerData);
  });

  let data = invoices;
  let configs = {};
  const totalBytes = ctx.request.rawBody.length * 2; // approx
  const toCompress = totalBytes > INVOICES_BYTES_THRESHOLD_TO_COMPRESS || true;
  if (toCompress) {
    ({ data, configs } = arrayToJsonStream(invoices));
  }
  configs.headers['x-generation-job-id'] = generationJobId;
  await orderRepo.markOrdersInvoiced({ orderIds, preInvoicedOrderDrafts });
  try {
    await billingService.generateInvoices(ctx, { data, configs });
  } catch (error) {
    const updatedOrders = orders.reduce(
      (acc, { id, status }) => {
        acc[status].push(id);
        return acc;
      },
      { [ORDER_STATUS.canceled]: [], [ORDER_STATUS.finalized]: [] },
    );
    orderRepo
      .unmarkOrdersInvoiced(Object.assign(updatedOrders, { orderIds }))
      .catch(err => ctx.logger.error(err));

    throw error;
  }

  (async () => {
    if (log) {
      const action = orderRepo.logAction.modify;
      for (const id of orderIds) {
        await orderRepo.log({ id, action });
      }
    }

    await OrderRequestRepo.getInstance(ctx.state).markAsHistory({ orderIds });
  })();

  return { generationJobId };
};
