import { pricingHttpClient, RequestQueryParams, BasePricingService } from '@root/api/base';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { IPriceGroup } from '../../types';

import {
  IBulkRatesEditedPayload,
  IBulkRatesPreviewPayload,
  ILinkedPriceGroupResponse,
  IPricingPreviewResponse,
  IRequestSpecificOptions,
  IUpdateThresholdsRequest,
} from './types';

export class PriceGroupService extends BasePricingService<IPriceGroup> {
  constructor() {
    super('priceGroups');
  }

  duplicate(priceGroupId: number, data: IPriceGroup) {
    return pricingHttpClient.post<IPriceGroup>(`${this.baseUrl}/${priceGroupId}/clone`, data);
  }

  requestSpecific(params: IRequestSpecificOptions & RequestQueryParams) {
    return pricingHttpClient.get<IPriceGroup[]>(`${this.baseUrl}/specific`, params);
  }

  updateThresholdSetting(thresholds: IUpdateThresholdsRequest, priceGroupId: number) {
    return pricingHttpClient.patch<IUpdateThresholdsRequest, IPriceGroup>({
      url: `${this.baseUrl}/${priceGroupId}`,
      data: thresholds,
    });
  }

  updateBatch(bulkRates: IBulkRatesEditedPayload) {
    return pricingHttpClient.post<IBulkRatesEditedPayload>(`${this.baseUrl}/batch`, bulkRates);
  }

  requestPreview(bulkRatesOptions: IBulkRatesPreviewPayload) {
    return pricingHttpClient.post<IBulkRatesPreviewPayload, IPricingPreviewResponse>(
      `${this.baseUrl}/batch/preview`,
      bulkRatesOptions,
    );
  }

  requestLinked({ businessLineId, businessUnitId }: IBusinessContextIds) {
    return pricingHttpClient.get<ILinkedPriceGroupResponse>(`${this.baseUrl}/linked`, {
      businessLineId,
      businessUnitId,
    });
  }
}
