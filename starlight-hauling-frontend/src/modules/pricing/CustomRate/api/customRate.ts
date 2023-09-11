import { haulingHttpClient } from '@root/api/base';
import {
  type IThresholdSetting,
  type ThresholdSettingsType,
  type ThresholdType,
} from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { ICustomRatePayload, ICustomRateRequestParams } from './types';

const baseUrl = 'price-groups';

export class CustomRateService {
  request(options: ICustomRateRequestParams) {
    return haulingHttpClient.get<ICustomRateRequestParams[], ICustomRatePayload>(
      `${baseUrl}/${options.id}/prices`,
      {
        ...options,
      },
    );
  }

  update(data: ICustomRatePayload & IBusinessContextIds & { id: number }) {
    return haulingHttpClient.put<ICustomRatePayload, void>({
      url: `${baseUrl}/${data.id}/prices`,
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
