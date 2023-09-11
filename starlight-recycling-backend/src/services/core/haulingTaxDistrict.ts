import { HaulingTaxDistrict, TaxDistrictFilter } from './types/HaulingTaxDistrict';
import { Context } from '../../types/Context';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import axios from 'axios';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import querystring from 'querystring';

export const getTaxDistricts = async (
  ctx: Context,
  authorization?: string,
): Promise<HaulingTaxDistrict[]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));

  const response = await axios.get<HaulingTaxDistrict[]>(`${CORE_SERVICE_API_URL}/tax-districts`, {
    headers: {
      Authorization: auth,
      [TRACING_HEADER]: ctx.reqId,
    },
  });

  return response.data;
};

export const getTaxDistrictsForOrder = async (
  ctx: Context,
  params: TaxDistrictFilter,
  authorization?: string,
): Promise<HaulingTaxDistrict[]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));

  const response = await axios.get<HaulingTaxDistrict[]>(
    `${CORE_SERVICE_API_URL}/tax-districts/recycling`,
    {
      headers: {
        Authorization: auth,
        [TRACING_HEADER]: ctx.reqId,
      },
      paramsSerializer: (params) => {
        return querystring.stringify({
          ...params,
          jobSiteId: params.jobSiteId || 'null',
          originDistrictId: params.originDistrictId || 'null',
        });
      },
      params,
    },
  );

  return response.data;
};
