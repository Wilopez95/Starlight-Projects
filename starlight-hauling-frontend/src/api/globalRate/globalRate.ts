import {
  type IGlobalRateLineItem,
  type IGlobalRateRecurringLineItem,
  type IGlobalRateRecurringService,
  type IGlobalRateService,
  type IGlobalRateSurcharge,
  type IGlobalRateThreshold,
  type IThresholdSetting,
  type ThresholdSettingsType,
  type ThresholdType,
} from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { haulingHttpClient } from '../base';

import { IGlobalRatesServiceRequest, IGlobalRatesThresholdRequest } from './types';

const baseUrl = 'rates/global';

export class GlobalRateService {
  requestServices({
    businessUnitId,
    businessLineId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IGlobalRatesServiceRequest) {
    return haulingHttpClient.get<IGlobalRateService[]>(`${baseUrl}/services`, {
      businessUnitId,
      businessLineId,
      materialId,
      equipmentItemId,
      billableServiceId,
    });
  }

  updateService(services: IGlobalRateService[]) {
    const concurrentData = services.reduce(
      (acc, service) => ({
        ...acc,
        [service.id]: service.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateService[], void>({
      url: `${baseUrl}/services`,
      data: services,
      concurrentData,
    });
  }

  requestRecurringServices({
    businessUnitId,
    businessLineId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IGlobalRatesServiceRequest) {
    return haulingHttpClient.get<IGlobalRateService[]>(`${baseUrl}/recurring-services`, {
      businessUnitId,
      businessLineId,
      materialId,
      equipmentItemId,
      billableServiceId,
    });
  }

  updateRecurringService(services: IGlobalRateRecurringService[]) {
    const concurrentData = services.reduce(
      (acc, service) => ({
        ...acc,
        [service.id]: service.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateService[], void>({
      url: `${baseUrl}/recurring-services`,
      data: services,
      concurrentData,
    });
  }

  requestLineItems({
    businessUnitId,
    businessLineId,
    lineItemId,
    materialId,
  }: { lineItemId?: number; materialId?: number | null } & IBusinessContextIds) {
    return haulingHttpClient.get<IGlobalRateLineItem[]>(`${baseUrl}/line-items`, {
      businessUnitId,
      businessLineId,
      lineItemId,
      materialId,
    });
  }

  requestSurcharges({
    businessUnitId,
    businessLineId,
    surchargeId,
    materialId,
  }: { surchargeId?: number; materialId?: number } & IBusinessContextIds) {
    return haulingHttpClient.get<IGlobalRateSurcharge[]>(`${baseUrl}/surcharges`, {
      businessUnitId,
      businessLineId,
      surchargeId,
      materialId,
    });
  }

  updateSurcharge(surcharges: IGlobalRateSurcharge[]) {
    const concurrentData = surcharges.reduce(
      (acc, surcharge) => ({
        ...acc,
        [surcharge.id]: surcharge.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateSurcharge[], void>({
      url: `${baseUrl}/surcharges`,
      data: surcharges,
      concurrentData,
    });
  }

  updateLineItem(lineItems: IGlobalRateLineItem[]) {
    const concurrentData = lineItems.reduce(
      (acc, lineItem) => ({
        ...acc,
        [lineItem.id]: lineItem.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateLineItem[], void>({
      url: `${baseUrl}/line-items`,
      data: lineItems,
      concurrentData,
    });
  }

  requestRecurringLineItems({
    businessUnitId,
    businessLineId,
    lineItemId,
  }: { lineItemId?: number } & IBusinessContextIds) {
    return haulingHttpClient.get<IGlobalRateRecurringLineItem[]>(
      `${baseUrl}/recurring-line-items`,
      {
        businessUnitId,
        businessLineId,
        lineItemId,
      },
    );
  }

  updateRecurringLineItem(lineItems: IGlobalRateRecurringLineItem[]) {
    const concurrentData = lineItems.reduce(
      (acc, lineItem) => ({
        ...acc,
        [lineItem.id]: lineItem.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateRecurringLineItem[], void>({
      url: `${baseUrl}/recurring-line-items`,
      data: lineItems,
      concurrentData,
    });
  }

  requestThresholds({
    businessUnitId,
    businessLineId,
    thresholdId,
    materialId,
    equipmentItemId,
  }: IGlobalRatesThresholdRequest) {
    return haulingHttpClient.get<IGlobalRateThreshold[]>(`${baseUrl}/thresholds`, {
      businessUnitId,
      businessLineId,
      thresholdId,
      materialId,
      equipmentItemId,
    });
  }

  updateThresholds(thresholds: IGlobalRateThreshold[]) {
    const concurrentData = thresholds.reduce(
      (acc, threshold) => ({
        ...acc,
        [threshold.id]: threshold.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IGlobalRateThreshold[], void>({
      url: `${baseUrl}/thresholds`,
      data: thresholds,
      concurrentData,
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
