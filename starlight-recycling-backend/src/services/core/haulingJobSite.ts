import axios from 'axios';

import { HaulingCustomerJobSite } from '../../modules/recycling/entities/CustomerJobSite';
import { HaulingJobSite, HaulingJobSiteInput } from '../../modules/recycling/entities/JobSite';
import { QueryContext } from '../../types/QueryContext';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';
import { HaulingEntityFilter } from './types/HaulingEntityFilter';
import { Context } from '../../types/Context';
import { Point } from 'geojson';
import { getTenantByName } from './tenants';

interface CreateHaulingCustomerJobSiteInput {
  customerId: number;
  active: boolean;
  jobSiteId: number;
  popupNote: string | null;
  poRequired?: boolean;
}

export class HaulingJobSiteHttpService extends HaulingHttpCrudService<
  HaulingJobSite,
  HaulingJobSiteInput
> {
  path = 'job-sites';
}

export const createHaulingCustomerJobSite = async (
  ctx: QueryContext,
  { customerId, jobSiteId, ...data }: CreateHaulingCustomerJobSiteInput,
  authorization?: string,
): Promise<HaulingCustomerJobSite> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const customerJobSiteData = {
    ...data,
    alleyPlacement: false,
    cabOver: false,
    permitRequired: false,
    signatureRequired: false,
    sendInvoicesToJobSite: false,
  };

  const response = await axios.post<HaulingCustomerJobSite>(
    `${CORE_SERVICE_API_URL}/customers/${customerId}/job-sites/${jobSiteId}`,
    customerJobSiteData,
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

interface HaulingCustomerJobSiteFilter extends HaulingEntityFilter {
  customerId: number;
  activeOnly?: boolean;
  limit?: number;
}

interface HaulingCustomerJobSitePairFilter {
  customerId: number;
  jobSiteId: number;
}

interface HaulingCustomerJobSitePairByIdFilter {
  customerId: number;
  jobSiteId: number;
}

export const getHaulingCustomerJobSite = async (
  ctx: QueryContext,
  { customerId, jobSiteId }: HaulingCustomerJobSitePairByIdFilter,
  authorization?: string,
): Promise<HaulingCustomerJobSite> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const response = await axios.get<HaulingCustomerJobSite>(
    `${CORE_SERVICE_API_URL}/customers/${customerId}/job-sites/${jobSiteId}`,
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

export const getHaulingCustomerJobSites = async (
  ctx: QueryContext,
  { query, customerId, activeOnly, limit = 10 }: HaulingCustomerJobSiteFilter,
  authorization?: string,
): Promise<HaulingCustomerJobSite[]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
  const params = query
    ? {
        address: query,
      }
    : {
        activeOnly,
        limit,
      };
  const headers = {
    Authorization: auth,
    [TRACING_HEADER]: ctx.reqId,
  };
  const subPath = query ? '/search' : '';
  const response = await axios.get<HaulingCustomerJobSite[]>(
    `${CORE_SERVICE_API_URL}/customers/${customerId}/job-sites${subPath}`,
    {
      headers,
      params,
    },
  );

  return response.data;
};

export const getHaulingCustomerJobSitesAll = async (
  ctx: QueryContext,
  { customerId }: HaulingCustomerJobSiteFilter,
  authorization?: string,
): Promise<HaulingCustomerJobSite[]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));

  const response = await axios.get<HaulingCustomerJobSite[]>(
    `${CORE_SERVICE_API_URL}/customers/${customerId}/job-sites/all`,
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
    },
  );

  return response.data;
};

export const getHaulingCustomerJobSitePair = async (
  ctx: QueryContext,
  { customerId, jobSiteId }: HaulingCustomerJobSitePairFilter,
  authorization?: string,
): Promise<HaulingCustomerJobSite> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));

  const response = await axios.get<HaulingCustomerJobSite>(`${CORE_SERVICE_API_URL}/linked`, {
    headers: {
      Authorization: auth,
      [TRACING_HEADER]: ctx.reqId,
    },
    params: {
      customerId,
      jobSiteId,
    },
  });

  return response.data;
};

export const getOrCreateJobSite = async (
  ctx: PartialContext,
  tenantName: string,
  haulingJobSite: HaulingJobSite,
): Promise<HaulingJobSite> => {
  const jobSites = await haulingJobSiteHttpService.get(ctx, {
    filterByCoordinates: (haulingJobSite.location as Point).coordinates,
    filterByAddressLine: haulingJobSite.address.addressLine1,
  });
  const jobSite = jobSites?.data?.[0];

  if (jobSite) {
    return jobSite;
  }

  const jobSiteInput: HaulingJobSiteInput = {
    address: haulingJobSite.address,
    alleyPlacement: false,
    cabOver: false,
    location: haulingJobSite.location,
  };

  const { region } = jobSiteInput.address;

  if (!region) {
    const tenant = await getTenantByName(ctx, tenantName);
    jobSiteInput.address.region = tenant.region;
  }

  return haulingJobSiteHttpService.create(ctx, jobSiteInput);
};

export const getOrCreateCustomerJobSite = async (
  ctx: PartialContext,
  customerId: number,
  jobSiteId: number,
): Promise<HaulingCustomerJobSite> => {
  const customerJobSite = await getHaulingCustomerJobSitePair(ctx as Context, {
    customerId,
    jobSiteId,
  });

  if (customerJobSite) {
    return customerJobSite;
  }

  return createHaulingCustomerJobSite(ctx as Context, {
    active: true,
    customerId,
    jobSiteId,
    popupNote: null,
    poRequired: false,
  });
};

export const haulingJobSiteHttpService = new HaulingJobSiteHttpService();
