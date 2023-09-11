import { CustomRatesGroupLineItems } from '../database/entities/tenant/CustomRatesGroupLineItems';
import { CustomRatesGroupServices } from '../database/entities/tenant/CustomRatesGroupServices';
import { Context } from '../Interfaces/Auth';
import { IGetJobSiteSearchQuery, IGetCustomerType } from '../Interfaces/RequestServces';
import { makeHaulingRequest } from '../utils/makeRequest';

export const haulingBillableServiceFrequencyRepo = (
  ctx: Context,
  data: CustomRatesGroupServices[],
) =>
  makeHaulingRequest(ctx, {
    method: 'post',
    url: `/api/v1/rates/custom/duplicate/billableServiceFrequency`,
    data,
  });

export const haulingBillableLineItemBillingCycleRepo = (
  ctx: Context,
  data: CustomRatesGroupLineItems[],
) =>
  makeHaulingRequest(ctx, {
    method: 'post',
    url: `/api/v1/rates/custom/duplicate/billableLineItemBillingCycle`,
    data,
  });

export const haulingGetCustomersByIds = (ctx: Context, data: number[]) =>
  makeHaulingRequest(ctx, {
    method: 'post',
    url: `/api/v1/customers/getByIds`,
    data,
  });

export const haulingGetCustomersByCustomerGroup = (ctx: Context, data: IGetCustomerType) =>
  makeHaulingRequest(ctx, {
    method: 'post',
    url: `/api/v1/customers/groups-type`,
    data,
  });

export const getJobSiteSearchQuery = (ctx: Context, { data }: IGetJobSiteSearchQuery) =>
  makeHaulingRequest(ctx, {
    method: 'get',
    url: `/api/v1/subscriptions/query-search`,
    data,
  });
