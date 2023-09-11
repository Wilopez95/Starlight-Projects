import * as ordersToInvoice from '../../services/billingProcessor/ordersToInvoiceProcesor';
import * as calcSubsInvoices from '../../services/billingProcessor/calcSubsInvoicing';
import { haulingGetCustomersByIds } from '../../services/hauling';
import { mathRound2 } from '../../utils/math';
import { Context } from '../../Interfaces/Auth';
import { IAggregateInvoicingParams, ICustomersObject } from '../../Interfaces/Invoice';
import { ICustomer, ICustomerInvoicingInfo, IProceedCustomers } from '../../Interfaces/Customer';
import {
  IGenerateSubscriptionsDraftsBody,
  ISubscriptionExtends,
} from '../../Interfaces/Subscriptions';

const sortByCb = (i1: ICustomerInvoicingInfo, i2: ICustomerInvoicingInfo) =>
  i2.invoicesCount - i1.invoicesCount;
const sumTotalsCb = (
  totals: ICustomerInvoicingInfo,
  item: ICustomerInvoicingInfo,
): invoicesCounsTotal => {
  totals.generatedInvoices += item.invoicesCount;
  totals.invoicesTotal += mathRound2(item.invoicesTotal);
  return totals;
};

interface invoicesCounsTotal {
  generatedInvoices: number;
  invoicesTotal: number;
}

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

export const aggregateInvoicing = ({
  customerSubscriptions,
  customersOrders,
}: IAggregateInvoicingParams) => {
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

export const generateSubscriptionsDrafts = async (ctx: Context) => {
  const condition = ctx.request.body as IGenerateSubscriptionsDraftsBody;

  const listOfSubscriptionsToInvoice = (await ordersToInvoice.getSubscriptionsToInvoice(
    ctx,
  )) as ISubscriptionExtends[];

  let customersIds: number[] = [];
  if (condition.customerId) {
    customersIds.push(condition.customerId);
  } else {
    customersIds = listOfSubscriptionsToInvoice.reduce(
      (ids: number[], item: ISubscriptionExtends) => {
        if (!ids.includes(item.customerId)) {
          ids.push(item.customerId);
        }
        return ids;
      },
      [],
    );
  }
  let responseCustomers: ICustomer[] = [];
  if (customersIds.length) {
    responseCustomers = await haulingGetCustomersByIds(ctx, customersIds);
  }

  const customersMap = new Map();
  responseCustomers.forEach(item => customersMap.set(item.id, item));

  for (let i = 0; i < listOfSubscriptionsToInvoice.length; i++) {
    const subscription = listOfSubscriptionsToInvoice[i];
    const currentCustomer = customersMap.get(subscription.customerId);
    if (currentCustomer.subscriptions) {
      currentCustomer.subscriptions.push(subscription);
    } else {
      currentCustomer.subscriptions = [subscription];
    }
  }

  const customersList = Array.from(customersMap.values());

  const onAccountCustomers: IProceedCustomers[] = customersList.filter(
    customer => customer.onAccount,
  );

  const prepaidCustomers: IProceedCustomers[] = customersList.filter(
    customer => !customer.onAccount,
  );

  //ToDo:<remove the any & create an interface>
  //By:<wlopez95> || Date: 12/11/2022 || TicketRelated : PS-227
  const onAccount = calcSubsInvoices.proceedCustomers(onAccountCustomers);

  const prepaid = calcSubsInvoices.proceedCustomers(prepaidCustomers);

  const customersCount =
    onAccount.customerInvoicingInfo.length + prepaid.customerInvoicingInfo.length;

  const customers = {
    onAccount: onAccount.customerInvoicingInfo,
    prepaid: prepaid.customerInvoicingInfo,
    customersCount,
    processedSubscriptions: onAccount.proceedSubscriptions + prepaid.proceedSubscriptions,
    invoicesTotal: onAccount.invoicesTotal + prepaid.invoicesTotal,
    generatedInvoices: onAccount.invoicesCount + prepaid.invoicesCount,
  };

  return customers;
};

export const generateOrdersDrafts = async (ctx: Context) => {
  const condition = ctx.request.body;

  const listOfordersToInvoice = await ordersToInvoice.getOrdersToInvoice(ctx);
  if (!listOfordersToInvoice.length) {
    return {
      onAccount: [],
      prepaid: [],
      processedOrders: 0,
      generatedInvoices: 0,
      customersCount: 0,
      invoicesTotal: 0,
    };
  }
  let customersIds: number[] = [];
  if (condition?.customerId) {
    customersIds.push(condition.customerId as number);
  } else {
    customersIds = listOfordersToInvoice.reduce((ids, item) => {
      if (!ids.includes(item.originalCustomerId)) {
        ids.push(item.originalCustomerId);
      }
      return ids;
    }, []);
  }
  const responseCustomers = await haulingGetCustomersByIds(ctx, customersIds);

  const customersMap = new Map();
  responseCustomers.forEach(item => customersMap.set(item.id, item));

  const obj: ICustomersObject = { onAccount: {}, prepaid: {} };

  for (let i = 0; i < listOfordersToInvoice.length; i++) {
    const order = listOfordersToInvoice[i];
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
        case 'byCustomer': {
          customerObj.drafts[0].orders.push(order);
          customerObj.drafts[0].invoicesTotal += invoicesTotal;
          customerObj.invoicesTotal += invoicesTotal;
          break;
        }
        case 'byOrder': {
          customerObj.drafts.push({
            orders: [order],
            invoicesTotal,
            jobSiteId,
          });
          customerObj.invoicesCount++;
          customerObj.invoicesTotal += invoicesTotal;
          break;
        }
        case 'byAddress': {
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
  }

  const { onAccount, prepaid }: ICustomersObject = obj;

  const customers = {
    onAccount: Object.values(onAccount).sort(sortByCb),
    prepaid: Object.values(prepaid).sort(sortByCb),
  };

  const onAccountCount = customers.onAccount.reduce(sumTotalsCb, {
    generatedInvoices: 0,
    invoicesTotal: 0,
  });

  const prepaidCount: ICustomerInvoicingInfo = customers.prepaid.reduce(
    sumTotalsCb,
    onAccountCount,
  );

  Object.assign(customers, {
    processedOrders: listOfordersToInvoice.length,
    customersCount: customers.onAccount.length + customers.prepaid.length,
    generatedInvoices: prepaidCount.generatedInvoices,
    invoicesTotal: prepaidCount.invoicesTotal,
  });

  //ToDo:<Review overpaidOrders & overlimitOrders in services/billingProcessor.js line:501 (Hauling BE)>
  //By:<wlopez95> || Date: 26/10/2022 || TicketRelated : PS-227

  // const ordersIds: number[] = listOfordersToInvoice.reduce((ids, item) => {
  //   ids.push(item.id);
  //   return ids;
  // }, []);

  return customers;
};

export const generateDrafts = async (ctx: Context) => {
  const customerSubscriptions = await generateSubscriptionsDrafts(ctx);

  const customersOrders = await generateOrdersDrafts(ctx);

  return aggregateInvoicing({
    customerSubscriptions,
    customersOrders,
  } as IAggregateInvoicingParams);
};
