import { Context } from '../Interfaces/Auth';
import { IGetBillableServiceBySubscription } from '../Interfaces/BillableService';
import { IBillableSurcharge } from '../Interfaces/BillableSurcharge';
import { IGetBillableSurcharges } from '../Interfaces/BillableSurcharges';
import { IGetCustomGroupRatesSurchargesData } from '../Interfaces/CustomRatesGroupSurcharges';
import { IGeneralData, IGetOrderData } from '../Interfaces/GeneralData';
import { IGetGlobalRatesServices } from '../Interfaces/GlobalRatesServices';
import { IGetGlobalRatesSurcharges } from '../Interfaces/GlobalRateSurcharge';
import { IGetJobSiteData, IGetJobSiteDataData } from '../Interfaces/JobSite';
import { IGetCustomerForRecurrentOrder } from '../Interfaces/RecurrentOrder';
import { IBatchUpdateSubscriptionOrder } from '../Interfaces/SubscriptionOrders';
import { makeHaulingRequest } from '../utils/makeRequest';

export const getOrders = (ctx: Context) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/orders?limit=25&skip=0&sortBy=id&sortOrder=desc&finalizedOnly=false&businessUnitId=1&mine=true&status=inProgress`,
  });

export const getOrderData = (ctx: Context, { data }: IGetOrderData): Promise<IGeneralData> =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/orders/data`,
    data,
  });

export const getCustomerForRecurrentOrder = (
  ctx: Context,
  { data }: IGetCustomerForRecurrentOrder,
) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/recurrent-orders/getCustomerForRecurrentOrder`,
    data,
  });

export const getJobSiteData = (
  ctx: Context,
  { data }: IGetJobSiteDataData,
): Promise<IGetJobSiteData> =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/orders/jobSiteData`,
    data,
  });

export const getBillableServiceBySubscription = (
  ctx: Context,
  { data }: IGetBillableServiceBySubscription,
) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/orders/billableServiceBySubscription `,
    data,
  });

export const getBillableService = (ctx: Context, id: number) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/billable/services/${id}`,
  });

export const getGlobalRatesServices = (ctx: Context, { data }: IGetGlobalRatesServices) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/rates/global/services`,
    data,
  });

export const getGlobalRatesSurcharges = (ctx: Context, { data }: IGetGlobalRatesSurcharges) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/rates/global/surchargesBy`,
    data,
  });

export const getCustomGroupRatesSurcharges = (
  ctx: Context,
  { data }: IGetCustomGroupRatesSurchargesData,
) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/rates/custom/surchargesBy`,
    data,
  });

export const getBillableSurcharges = (
  ctx: Context,
  { data }: IGetBillableSurcharges,
): Promise<IBillableSurcharge[]> =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/billable/surcharges`,
    data,
  });

export const batchUpdateSubscriptionOrder = (
  ctx: Context,
  { data }: IBatchUpdateSubscriptionOrder,
) =>
  makeHaulingRequest(ctx, {
    method: 'patch',
    url: `/api/v1/subscriptions/orders/batch`,
    data,
  });
