import uniqBy from 'lodash/uniqBy.js';
import uniqWith from 'lodash/uniqWith.js';

import { mathRound2 } from '../../../utils/math.js';

import { INVOICE_CONSTRUCTION } from '../../../consts/invoiceConstructions.js';
import { recalculateSubscriptionSummary } from './recalculateSubscriptionSummary.js';

const getSummaryForServiceItem = (serviceItems = []) => {
  const serviceItemsInfo = [];
  for (const serviceItemInfo of serviceItems) {
    const { lineItemsProrationInfo, serviceItemProrationInfo } = serviceItemInfo;

    const [{ description, serviceItemId }] = serviceItemProrationInfo;
    const lineItemsSummary = lineItemsProrationInfo.reduce((accum, lineItem) => {
      const { prorationEffectivePrice, prorationEffectiveDate } = lineItem;
      if (prorationEffectivePrice && prorationEffectiveDate) {
        return mathRound2(accum + prorationEffectivePrice);
      }
      return mathRound2(accum + lineItem.proratedTotal);
    }, 0);

    const serviceItemsApplicable = serviceItemProrationInfo.filter(item => item.isApplicable);

    const serviceItemsSummary = serviceItemsApplicable.reduce((accum, item) => {
      const { prorationEffectivePrice, prorationEffectiveDate } = item;
      if (prorationEffectivePrice && prorationEffectiveDate) {
        return mathRound2(accum + prorationEffectivePrice);
      }

      return mathRound2(accum + item.proratedTotal + item.subscriptionOrdersTotal);
    }, 0);
    serviceItemsInfo.push({
      price: lineItemsSummary + serviceItemsSummary,
      serviceItemId: Number(serviceItemId),
      serviceName: description,
      serviceItemsApplicable,
      lineItemsProrationInfo,
    });
  }

  return serviceItemsInfo;
};

const processSubscriptions = ({ subscriptions = [], invoiceConstruction }) => {
  const subscriptionInvoicingInfo = {
    invoicesTotal: 0,
    proceedSubscriptions: subscriptions.length,
    drafts: [],
  };

  for (const subscription of uniqBy(subscriptions, 'id')) {
    const {
      serviceItems,
      startDate,
      anniversaryBilling,
      endDate,
      billingCycle,
      billingType,
      id,
      nextBillingPeriodTo,
      nextBillingPeriodFrom,
      jobSiteId,
      jobSiteAddress,
      ...rest
    } = subscription;

    const recalcResult = recalculateSubscriptionSummary({
      groupedServiceItems: uniqWith(
        serviceItems,
        (a, b) => a.serviceItemId === b.serviceItemId && a.effectiveDate === b.effectiveDate,
      ),
      startDate: nextBillingPeriodFrom ? new Date(nextBillingPeriodFrom) : null,
      billingCycleCount: 1,
      billingCycle,
      anniversaryBilling,
      endDate: endDate ? new Date(endDate) : null,
    });

    const summaryPerServiceItem = getSummaryForServiceItem(recalcResult[0]);

    const totalPriceForSubscription = summaryPerServiceItem.reduce(
      // eslint-disable-next-line no-constant-binary-expression
      (accum, item) => mathRound2(accum + item.price ?? 0),
      0,
    );

    const subscriptionObj = {
      id,
      totalPriceForSubscription,
      nextBillingPeriodTo,
      nextBillingPeriodFrom,
      summaryPerServiceItem,
      anniversaryBilling,
      billingCycle,
      billingType,
      startDate,
      endDate,
      jobSiteAddress,
      ...rest,
    };

    subscriptionInvoicingInfo.invoicesTotal += totalPriceForSubscription;

    switch (invoiceConstruction) {
      case INVOICE_CONSTRUCTION.byAddress: {
        const isExistSubscription = subscriptionInvoicingInfo.drafts.find(
          subscriptionInfo => subscriptionInfo.jobSiteId === jobSiteId,
        );

        if (isExistSubscription) {
          isExistSubscription.subscriptions.push(subscriptionObj);
        } else {
          subscriptionInvoicingInfo.drafts.push({
            jobSiteId,
            subscriptions: [subscriptionObj],
          });
        }
        break;
      }

      case INVOICE_CONSTRUCTION.byCustomer: {
        const [drafts] = subscriptionInvoicingInfo.drafts;

        if (drafts) {
          drafts.subscriptions.push(subscriptionObj);
        } else {
          subscriptionInvoicingInfo.drafts.push({
            jobSiteId,
            subscriptions: [subscriptionObj],
          });
        }

        break;
      }
      case INVOICE_CONSTRUCTION.byOrder: {
        subscriptionInvoicingInfo.drafts.push({
          jobSiteId,
          subscriptions: [subscriptionObj],
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  return subscriptionInvoicingInfo;
};

export const proceedCustomers = ({ customers }) => {
  const customerInvoicingInfo = [];

  let invoicesTotalCount = 0;
  let proceedSubscriptionsCount = 0;
  let invoicesCount = 0;

  for (const customer of customers) {
    const { subscriptions, invoiceConstruction, ...rest } = customer;

    const { drafts, invoicesTotal, proceedSubscriptions } = processSubscriptions({
      subscriptions,
      invoiceConstruction,
    });

    invoicesTotalCount += invoicesTotal;
    proceedSubscriptionsCount += proceedSubscriptions;
    invoicesCount += drafts.length;

    customerInvoicingInfo.push({
      ...rest,
      invoiceConstruction,
      drafts,
      invoicesCount: drafts.length,
      invoicesTotal,
      proceedSubscriptions,
    });
  }

  return {
    customerInvoicingInfo,
    invoicesTotal: invoicesTotalCount,
    proceedSubscriptions: proceedSubscriptionsCount,
    invoicesCount,
  };
};

const getUniqueCustomers = ({
  onAccountSubscriptions,
  prepaidSubscriptions,
  onAccountOrders,
  prepaidOrders,
}) => {
  const onAccountSubsCustomerIds = onAccountSubscriptions.map(({ id }) => id);
  const prepaidSubsCustomerIds = prepaidSubscriptions.map(({ id }) => id);
  const subscCustomerIds = onAccountSubsCustomerIds.concat(prepaidSubsCustomerIds);
  const orderCustomerIds = onAccountOrders.concat(prepaidOrders).map(({ id }) => id);
  const uniqueIds = [...new Set([...subscCustomerIds, ...orderCustomerIds])];

  const customersCount = uniqueIds.length;

  return customersCount;
};

export const aggregateInvoicing = ({ customerSubscriptions, customersOrders }) => {
  const {
    onAccount: onAccountOrders,
    prepaid: prepaidOrders,
    processedOrders,
    generatedInvoices: generatedInvoicesOrders,
    invoicesTotal: invoicesTotalOrders,
  } = customersOrders;

  const {
    onAccount: onAccountSubscriptions,
    prepaid: prepaidSubscriptions,
    invoicesTotal: invoicesTotalSubscriptions,
    processedSubscriptions,
    generatedInvoices: generatedInvoicesSubscriptions,
  } = customerSubscriptions;

  const customersCount = getUniqueCustomers({
    onAccountSubscriptions,
    prepaidSubscriptions,
    onAccountOrders,
    prepaidOrders,
  });

  return {
    onAccount: {
      subscriptions: onAccountSubscriptions,
      orders: onAccountOrders,
    },
    prepaid: {
      subscriptions: prepaidSubscriptions,
      orders: prepaidOrders,
    },
    customersCount,
    subscriptionsCount: prepaidSubscriptions.length + onAccountSubscriptions.length,
    ordersCount: prepaidOrders.length + onAccountOrders.length,
    invoicesTotal: invoicesTotalSubscriptions + invoicesTotalOrders,
    processedTotal: processedSubscriptions + processedOrders,
    processedSubscriptions,
    processedOrders,
    generatedInvoices: generatedInvoicesSubscriptions + generatedInvoicesOrders,
  };
};
