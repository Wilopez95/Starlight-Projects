import { haulingHttpClient } from '@root/api/base';
import {
  type IThresholdSetting,
  type ThresholdSettingsType,
  type ThresholdType,
} from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import {
  GeneralRateRequestResponse,
  IGeneralRatePayload,
  IGeneralRateRequestParams,
} from './types';

const baseUrl = 'price-groups/general';

export class GeneralRateService {
  request(options: IGeneralRateRequestParams) {
    return haulingHttpClient.get<IGeneralRateRequestParams[], GeneralRateRequestResponse>(
      `${baseUrl}/prices`,
      {
        ...options,
      },
    );
  }

  update(data: IGeneralRatePayload & IBusinessContextIds) {
    return haulingHttpClient.put<IGeneralRatePayload, void>({
      url: `${baseUrl}/prices`,
      data,
    });
  }

  requestThresholdTypes() {
    return haulingHttpClient.get<ThresholdType[]>(`${baseUrl}/thresholds/types`);
  }

  requestThresholdSetting({
    thresholdId,
    businessUnitId,
    businessLineId,
  }: IBusinessContextIds & { thresholdId: number }) {
    return haulingHttpClient.get<
      IBusinessContextIds & { thresholdId: number },
      IThresholdSetting | undefined
    >(`${baseUrl}/thresholds/${thresholdId}/setting`, { businessUnitId, businessLineId });
  }

  updateThresholdSetting({
    businessLineId,
    businessUnitId,
    setting,
    thresholdId,
  }: { setting: ThresholdSettingsType; thresholdId: number } & IBusinessContextIds) {
    return haulingHttpClient.patch<{ setting: ThresholdSettingsType } & IBusinessContextIds, void>({
      url: `${baseUrl}/thresholds/${thresholdId}/setting`,
      data: {
        businessLineId,
        businessUnitId,
        setting,
      },
    });
  }
}
