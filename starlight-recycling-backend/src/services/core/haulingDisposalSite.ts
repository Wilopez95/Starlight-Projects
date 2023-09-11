import { ParsedUrlQueryInput } from 'querystring';
import { CORE_SERVICE_API_URL } from '../../config';
import {
  HaulingHttpCrudService,
  ListResponseBasic,
  PartialContext,
} from '../../graphql/createHaulingCRUDResolver';
import { DisposalSite } from './types/DisposalSite';
import { HaulingMaterialCode } from './types/HaulingMaterialCode';
import { HaulingOrder } from './types/HaulingOrder';

export class HaulingDisposalSiteHttpService extends HaulingHttpCrudService<DisposalSite> {
  path = 'disposal-sites';

  async getMaterialCodes(
    ctx: PartialContext,
    disposalSiteId: number,
    filter?: ParsedUrlQueryInput,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<HaulingMaterialCode>> {
    const response = await this.makeRequest<HaulingMaterialCode[]>({
      ctx,
      authorization,
      tokenPayload,
      method: 'get',
      params: filter,
      url: `${CORE_SERVICE_API_URL}/${this.path}/${disposalSiteId}/material-codes`,
    });

    return {
      data: response.data,
    };
  }
}

export const disposalSiteService = new HaulingDisposalSiteHttpService();

export const getTruckOnWayMappedMaterialId = async (
  ctx: PartialContext,
  tenantName: string,
  haulingOrder: HaulingOrder,
): Promise<number | null> => {
  const {
    disposalSite: { originalId: disposalSiteId },
    businessLine: { id: businessLineId },
    material: { originalId: materialId },
  } = haulingOrder;

  const materialCodes = await disposalSiteService.getMaterialCodes(
    ctx,
    disposalSiteId,
    {
      businessLineId,
      materialId,
    },
    undefined,
    {
      tenantName,
      schemaName: tenantName,
    },
  );

  const recyclingMaterialId = materialCodes?.data?.[0]?.recyclingMaterialId;

  return recyclingMaterialId || null;
};
