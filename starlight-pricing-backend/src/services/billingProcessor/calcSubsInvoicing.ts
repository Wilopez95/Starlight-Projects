import { isEmpty, uniqBy } from 'lodash';
import { ICustomerInvoicingInfo, IProceedCustomers } from '../../Interfaces/Customer';
import { IProcessServiceItemsResponse } from '../../Interfaces/ServiceItems';
import {
  IProcessSubscriptions,
  IProcessSubscriptionsDraftSubscription,
  IProcessSubscriptionsResponse,
} from '../../Interfaces/Subscriptions';
import { ISubscriptionServiceItem } from '../../Interfaces/SubscriptionServiceItem';

const processServiceItems = (serviceItems: ISubscriptionServiceItem[] | undefined) => {
  const summaryPerServiceItem: IProcessServiceItemsResponse[] = [];
  if (!isEmpty(serviceItems) && serviceItems !== undefined) {
    for (let i = 0; i < serviceItems.length; i++) {
      const newServiceItem: IProcessServiceItemsResponse = {
        price: serviceItems[i].price,
        serviceItemId: serviceItems[i].id,
        serviceName: serviceItems[i].description,
        serviceItemsApplicable: [],
        lineItemsProrationInfo: [],
      };
      summaryPerServiceItem.push(newServiceItem);
    }
  }
  return summaryPerServiceItem;
};

const processSubscriptions = ({
  subscriptions = [],
  invoiceConstruction,
}: IProcessSubscriptions) => {
  const subscriptionInvoicingInfo: IProcessSubscriptionsResponse = {
    invoicesTotal: 0,
    proceedSubscriptions: subscriptions.length,
    drafts: [],
    price: 0,
  };
  for (const subscription of uniqBy(subscriptions, 'id')) {
    const {
      serviceItems,
      subscriptionServiceItems,
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
      customerId,
      businessUnitId,
      businessLineId,
      status,
      customerOriginalId,
      grandTotal,
    } = subscription;

    const summaryPerServiceItem = processServiceItems(serviceItems);

    // const totalPriceForSubscription = summaryPerServiceItem.reduce(
    //   // eslint-disable-next-line no-constant-binary-expression
    //   (accum, item) => mathRound2(accum + item.price),
    //   0,
    // );

    const subscriptionObj: IProcessSubscriptionsDraftSubscription = {
      id,
      totalPriceForSubscription: grandTotal,
      nextBillingPeriodTo,
      nextBillingPeriodFrom,
      summaryPerServiceItem,
      anniversaryBilling,
      billingCycle,
      billingType,
      startDate,
      endDate,
      jobSiteAddress,
      customerId,
      businessUnitId,
      businessLineId,
      status,
      customerOriginalId,
      serviceItems: subscriptionServiceItems,
    };

    subscriptionInvoicingInfo.invoicesTotal += grandTotal;

    switch (invoiceConstruction) {
      case 'byAddress': {
        const isExistSubscription = subscriptionInvoicingInfo.drafts.find(
          subscriptionInfo => subscriptionInfo.jobSiteId === jobSiteId,
        );

        if (isExistSubscription) {
          isExistSubscription.subscriptions?.push(subscriptionObj);
        } else {
          subscriptionInvoicingInfo.drafts.push({
            jobSiteId,
            subscriptions: [subscriptionObj],
          });
        }
        break;
      }

      case 'byCustomer': {
        const isExistSubscription = subscriptionInvoicingInfo.drafts.find(
          subscriptionInfo => subscriptionInfo.jobSiteId === jobSiteId,
        );

        if (isExistSubscription) {
          isExistSubscription.subscriptions?.push(subscriptionObj);
        } else {
          subscriptionInvoicingInfo.drafts.push({
            jobSiteId,
            subscriptions: [subscriptionObj],
          });
        }
        break;
      }
      case 'byOrder': {
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

export const proceedCustomers = (customers: IProceedCustomers[]) => {
  const customerInvoicingInfo: Omit<ICustomerInvoicingInfo, 'generatedInvoices'>[] = [];

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
