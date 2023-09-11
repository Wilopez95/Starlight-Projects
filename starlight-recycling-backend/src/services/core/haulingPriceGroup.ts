import { Context } from '../../types/Context';
import axios from 'axios';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { HaulingPriceGroupsResult } from './types/HaulingPriceGroup';
import { getBusinessUnit } from './business_units';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import { HaulingCalculateRatesInput, HaulingCalculateRatesResult } from './types/HaulingOrder';

interface HaulingPriceGroupFilter {
  customerId: number;
  customerJobSiteId: number | null;
}

export const getHaulingPriceGroups = async (
  ctx: Context,
  filter: HaulingPriceGroupFilter,
  authorization?: string,
): Promise<HaulingPriceGroupsResult> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const businessUnit = await getBusinessUnit(ctx, auth);
  const businessLineId = businessUnit.businessLines[0].id;

  const response = await axios.post<HaulingPriceGroupsResult>(
    `${CORE_SERVICE_API_URL}/rates/select`,
    {
      businessUnitId: businessUnit.id,
      businessLineId,
      customerId: filter.customerId,
      customerJobSiteId: filter.customerJobSiteId,
      serviceAreaId: null,
      serviceDate: new Date(),
    },
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

export const calculateRates = async (
  ctx: Context,
  input: HaulingCalculateRatesInput,
  authorization?: string,
): Promise<HaulingCalculateRatesResult> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const businessUnit = await getBusinessUnit(ctx, auth);
  const businessLine = businessUnit.businessLines[0];

  if (!businessUnit) {
    throw new Error('Failed to get business unit');
  }

  const response = await axios.post<HaulingCalculateRatesResult>(
    `${CORE_SERVICE_API_URL}/rates/calc`,
    { businessUnitId: businessUnit.id, businessLineId: businessLine.id, ...input },
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

export interface CalculateThresholdInput {
  customRatesGroupId: number | null;
  materialId: number;
  netWeight: number;
  action: 'dump' | 'load';
}

export interface CalculateThresholdResult {
  thresholdId: number;
  globalRatesThresholdsId?: number;
  customRatesGroupThresholdsId: number | null;
  price: number;
  quantity: number;
  applySurcharges: boolean;
}

export const calculateThresholdsRates = async (
  ctx: Context,
  input: CalculateThresholdInput,
  authorization?: string,
): Promise<[CalculateThresholdResult]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const businessUnit = await getBusinessUnit(ctx, auth);
  const businessLine = businessUnit.businessLines[0];

  if (!businessUnit) {
    throw new Error('Failed to get business unit');
  }

  const response = await axios.post<[CalculateThresholdResult]>(
    `${CORE_SERVICE_API_URL}/thresholds/recycling`,
    { businessUnitId: businessUnit.id, businessLineId: businessLine.id, ...input },
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};
