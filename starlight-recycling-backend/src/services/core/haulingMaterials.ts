import { Context } from '../../types/Context';
import { parseFacilitySrn } from '../../utils/srn';
import axios from 'axios';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { HaulingMaterial } from './types/HaulingMaterial';
import createAuthHeader from './utils/createAuthHeader';
import {
  HaulingHttpCrudService,
  ListResponseBasic,
  PartialContext,
} from '../../graphql/createHaulingCRUDResolver';
import { ParsedUrlQueryInput } from 'querystring';
import PaginationInput from '../../graphql/types/PaginationInput';
import SortInput from '../../graphql/types/SortInput';
import { getBusinessUnit } from './business_units';

export const getHaulingMaterial = async (
  ctx: Context,
  id: number,
  authorization?: string,
): Promise<HaulingMaterial> => {
  let authorizationHeader = authorization;

  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

  if (!authorizationHeader) {
    authorizationHeader = await createAuthHeader(ctx.reqId, tenantName);
  }

  const response = await axios.get<HaulingMaterial>(`${CORE_SERVICE_API_URL}/materials/${id}`, {
    headers: {
      Authorization: authorizationHeader,
      [TRACING_HEADER]: ctx.reqId,
    },
  });

  return response.data;
};

export class HaulingMaterialHttpService extends HaulingHttpCrudService<HaulingMaterial> {
  path = 'materials';

  async get(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    pagination?: PaginationInput,
    sort?: SortInput<HaulingMaterial>[],
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<HaulingMaterial>> {
    const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
    const businessUnit = await getBusinessUnit(ctx, auth);
    const businessLineId = businessUnit.businessLines[0]?.id;

    return super.get(ctx, { businessLineId, ...filter }, pagination, sort, auth, tokenPayload);
  }

  async getByIds(ctx: PartialContext, ids: number[]): Promise<ListResponseBasic<HaulingMaterial>> {
    const response = await this.makeRequest<HaulingMaterial[]>({
      ctx,
      method: 'post',
      data: { ids },
      url: `${CORE_SERVICE_API_URL}/${this.path}/ids`,
    });

    return {
      data: response.data,
    };
  }
}

export const materialService = new HaulingMaterialHttpService();
