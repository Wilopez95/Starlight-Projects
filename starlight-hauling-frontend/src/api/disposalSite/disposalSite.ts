import { IDisposalSite } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import {
  IDisposalRatePayload,
  IDisposalRateResponse,
  IMaterialCodePayload,
  IMaterialCodeResponse,
  IRecyclingCodesResponse,
} from './types';

export class DisposalSiteService extends BaseService<IDisposalSite> {
  constructor() {
    super('disposal-sites');
  }

  requestMaterialCodes(disposalSiteId: number, businessLineId: number) {
    return haulingHttpClient.get<{ businessLineId: number }, IMaterialCodeResponse[]>(
      `${this.baseUrl}/${disposalSiteId}/material-codes`,
      {
        businessLineId,
      },
    );
  }

  requestDisposalRates(disposalSiteId: number, businessLineId: number) {
    return haulingHttpClient.get<{ businessLineId: number }, IDisposalRateResponse[]>(
      `${this.baseUrl}/${disposalSiteId}/disposal-rates`,
      {
        businessLineId,
      },
    );
  }

  requestRecyclingCodes(businessUnitId: number, recyclingTenantName: string) {
    return haulingHttpClient.get<
      { businessUnitId: number; recyclingTenantName: string },
      IRecyclingCodesResponse
    >(`${this.baseUrl}/recycling-codes`, {
      businessUnitId,
      recyclingTenantName,
    });
  }

  updateMaterialMapping(id: number, data: IMaterialCodePayload[]) {
    return haulingHttpClient.patch<IMaterialCodePayload[], void>({
      url: `${this.baseUrl}/${id}/material-codes`,
      data,
    });
  }

  updateDisposalRates(id: number, data: IDisposalRatePayload[]) {
    return haulingHttpClient.patch<IDisposalRatePayload[], void>({
      url: `${this.baseUrl}/${id}/disposal-rates`,
      data,
    });
  }
}
