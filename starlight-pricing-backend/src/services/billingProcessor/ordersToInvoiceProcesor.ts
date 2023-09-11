import { DataSource, In, LessThan, LessThanOrEqual } from 'typeorm';
import { isEmpty } from 'lodash';
import { getOrderData } from '../../request/haulingRequest';
import { BaseController } from '../../controllers/base.controller';
import { Orders } from '../../database/entities/tenant/Orders';
import { Subscriptions } from '../../database/entities/tenant/Subscriptions';
import { SubscriptionServiceItem } from '../../database/entities/tenant/SubscriptionServiceItem';
import { IWhere } from '../../Interfaces/GeneralsFilter';
import { Context } from '../../Interfaces/Auth';
import { ISubscriptionExtends } from '../../Interfaces/Subscriptions';
import { IGeneralData, IRequesParamsGeneral } from '../../Interfaces/GeneralData';
import { SubscriptionServiceItemsController } from '../../controllers/subscriptionServiceItems/subscriptionServiceItems.controller';
import { haulingGetCustomersByCustomerGroup } from '../../services/hauling';

const controller = new SubscriptionServiceItemsController();

const getCustomersIds = async (ctx: Context, condition) => {
  let customersIds: string[] = [];

  const dataToFetchCustomers = {
    customerGroupId: condition.customerGroupId,
    prepaid: condition.prepaid,
    onAccount: condition.onAccount,
  };
  const responseCustomer = await haulingGetCustomersByCustomerGroup(ctx, dataToFetchCustomers);
  if (responseCustomer?.length) {
    customersIds = responseCustomer.map(customer => customer.id);
  }
  return customersIds;
};

export const getOrdersToInvoice = async (ctx: Context, count: boolean = false) => {
  const condition = ctx.request.body;

  if (condition.billingDate) {
    const { billingDate: serviceDay } = condition;
    delete condition.billingDate;
    condition.endingDate = serviceDay;
  }

  const { businessUnitId } = ctx.request.query;

  if (condition.arrears !== undefined && !condition.arrears && count) {
    return 0;
  }

  if (condition.isWithSubs && !condition.filterByBusinessLine?.length && count) {
    return 0;
  }

  if (!condition.customerId && !condition.onAccount && !condition.prepaid) {
    return 0;
  }

  const whereFilter1: IWhere = { businessUnitId, status: 'finalized' };
  const whereFilter2: IWhere = { serviceDate: LessThanOrEqual(condition.endingDate) };
  const whereFilter3 = condition.customerId
    ? { originalCustomerId: In([condition.customerId]) }
    : { originalCustomerId: In(await getCustomersIds(ctx, condition)) };

  let ordersToInvoice;
  const dataSource: DataSource = await BaseController.getDataSource(
    ctx.state.user.tenantName as string,
  );
  if (count) {
    ordersToInvoice = await dataSource.manager
      .createQueryBuilder()
      .select('orders')
      .from(Orders, 'orders')
      .where(whereFilter1)
      .andWhere(whereFilter2)
      .andWhere(whereFilter3)
      .getCount();
  } else {
    const listOfOrdersToInvoice = await dataSource.manager
      .createQueryBuilder()
      .select('orders')
      .from(Orders, 'orders')
      .where(whereFilter1)
      .andWhere(whereFilter2)
      .andWhere(whereFilter3)
      .getMany();

    if (!isEmpty(listOfOrdersToInvoice)) {
      for (let i = 0; i < listOfOrdersToInvoice.length; i++) {
        const requestData = {
          businessLineId: listOfOrdersToInvoice[i].businessLineId,
          jobSiteId: listOfOrdersToInvoice[i].jobSiteId,
          billableServiceId: listOfOrdersToInvoice[i].billableServiceId,
          materialId: listOfOrdersToInvoice[i].materialId,
          equipmentItemId: listOfOrdersToInvoice[i].equipmentItemId,
          customerJobSiteId: listOfOrdersToInvoice[i].customerJobSiteId,
        };
        const orderData = await getOrderData(ctx, {
          data: requestData,
        });
        Object.assign(listOfOrdersToInvoice[i], orderData);
      }
      ordersToInvoice = listOfOrdersToInvoice;
    } else {
      ordersToInvoice = [];
    }
  }
  await dataSource.destroy();

  return ordersToInvoice;
};

const getJobSiteAddressFormat = ({ jobSite }: IGeneralData) => {
  return {
    id: jobSite?.originalId,
    zip: jobSite?.address.zip,
    city: jobSite?.address.city,
    state: jobSite?.address.state,
    fullAddress: jobSite?.fullAddress,
    addressLine1: jobSite?.address.addressLine1,
    addressLine2: jobSite?.address.addressLine2,
  };
};

export const getSubscriptionsToInvoice = async (ctx: Context, count: boolean = false) => {
  const condition = ctx.request.body;
  if (
    !condition.businessLineIds.length ||
    (!condition.customerId && !condition.onAccount && !condition.prepaid) ||
    (!condition.arrears && !condition.inAdvance) ||
    !condition.billingCycles.length
  ) {
    return 0;
  }

  if (condition.billingDate) {
    const { billingDate: serviceDay } = condition;
    delete condition.billingDate;
    condition.endingDate = serviceDay;
  }

  const { businessUnitId } = ctx.request.query;

  let whereFilter: IWhere = {
    businessUnitId,
    status: In(['active', 'closed']),
    businessLineId: In(condition.businessLineIds as string[]),
    nextBillingPeriodTo: LessThan(condition.endingDate),
    billingCycle: In(condition.billingCycles as string[]),
  };
  const billingType: Array<string> = [];
  if (condition.arrears) {
    billingType.push('arrears');
  }
  if (condition.inAdvance) {
    billingType.push('inAdvance');
  }

  whereFilter = { ...whereFilter, billingType: In(billingType) };

  const customersWhereFilter = condition.customerId
    ? { customerId: In([condition.customerId]) }
    : { customerId: In(await getCustomersIds(ctx, condition)) };

  const dataSource: DataSource = await BaseController.getDataSource(
    ctx.state.user.tenantName as string,
  );
  let subscriptionsToInvoice: number | ISubscriptionExtends[];
  if (count) {
    subscriptionsToInvoice = await dataSource.manager
      .createQueryBuilder()
      .select('subscription')
      .from(Subscriptions, 'subscription')
      .where(whereFilter)
      .andWhere(customersWhereFilter)
      .getCount();
  } else {
    subscriptionsToInvoice = (await dataSource.manager
      .createQueryBuilder()
      .select('subscription')
      .from(Subscriptions, 'subscription')
      .where(whereFilter)
      .andWhere(customersWhereFilter)
      .getMany()) as ISubscriptionExtends[];
    if (!isEmpty(subscriptionsToInvoice) && Array.isArray(subscriptionsToInvoice)) {
      for (const subscriptionInvoice of subscriptionsToInvoice) {
        const requestData: IRequesParamsGeneral = {
          jobSiteId: subscriptionInvoice.jobSiteId,
        };
        const orderData: IGeneralData = await getOrderData(ctx, {
          data: requestData,
        });
        subscriptionInvoice.jobSiteAddress = getJobSiteAddressFormat(orderData);
        const lineItems = await dataSource.manager
          .createQueryBuilder()
          .select('subscriptionServiceItem')
          .from(SubscriptionServiceItem, 'subscriptionServiceItem')
          .where({ subscriptionId: subscriptionInvoice.id })
          .getMany();

        if (!isEmpty(lineItems)) {
          for (const lineItem of lineItems) {
            const requestbillableData = {
              billableServiceId: lineItem.billableServiceId,
            };
            const { billableService }: IGeneralData = await getOrderData(ctx, {
              data: requestbillableData,
            });
            const lineItemsProrationInfo = {
              ...lineItem,
              ...billableService,
              id: subscriptionInvoice.id,
            };
            Object.assign(lineItem, lineItemsProrationInfo);
          }
        }
        subscriptionInvoice.serviceItems = lineItems;
        ctx.request.body.id = subscriptionInvoice.id;
        subscriptionInvoice.subscriptionServiceItems =
          await controller.getSubscriptionServiceItemById(ctx);
      }
    }
  }

  await dataSource.destroy();

  return subscriptionsToInvoice;
};
