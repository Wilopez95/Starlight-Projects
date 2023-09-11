import {
  IBulkRatesEditData,
  IBulkRatesLinkedData,
} from '@root/pages/SystemConfiguration/tables/PriceGroups/QuickView/BulkRatesEdit/types';
import {
  IRequestSpecificOptions,
  ITargetedPriceGroups,
  IUpdateThresholdsRequest,
} from '@root/stores/priceGroup/types';
import {
  IBusinessContextIds,
  IPriceGroup,
  IPriceGroupRateLineItem,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  IPriceGroupRateThreshold,
  IRatesHistoryItem,
} from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

import {
  IBulkRatesEditTargetedPriceGroup,
  IPriceGroupLineItemRequest,
  IPriceGroupServiceRequest,
  IPriceGroupSurchargeRequest,
  IPriceGroupThresholdRequest,
  IRatesHistoryRequest,
} from './types';

export class PriceGroupService extends BaseService<IPriceGroup> {
  constructor() {
    super('rates/custom');
  }

  duplicate(priceGroupId: number, data: IPriceGroup) {
    return haulingHttpClient.post<IPriceGroup>(`${this.baseUrl}/${priceGroupId}/duplicate`, data);
  }

  requestServices({
    businessUnitId,
    businessLineId,
    priceGroupId,
    materialId,
    equipmentItemId,
    billableServiceId,
  }: IPriceGroupServiceRequest) {
    return haulingHttpClient.get<IPriceGroupRateService[]>(
      `${this.baseUrl}/${priceGroupId}/services`,
      {
        businessUnitId,
        businessLineId,
        materialId,
        equipmentItemId,
        billableServiceId,
      },
    );
  }

  requestSpecific(params: IRequestSpecificOptions & RequestQueryParams) {
    // ToDo: Uncomment after implement pricegroups into pricing backend
    // return pricingHttpClient.get<IPriceGroup[]>(`${this.baseUrl}`, params);
    return haulingHttpClient.get<IPriceGroup[]>(`${this.baseUrl}/specific`, params);
  }

  requestLineItems({
    businessUnitId,
    businessLineId,
    priceGroupId,
    lineItemId,
    materialId,
  }: IPriceGroupLineItemRequest) {
    return haulingHttpClient.get<IPriceGroupRateLineItem[]>(
      `${this.baseUrl}/${priceGroupId}/line-items`,
      {
        businessUnitId,
        businessLineId,
        lineItemId,
        materialId,
      },
    );
  }

  requestSurcharges({
    businessUnitId,
    businessLineId,
    priceGroupId,
    surchargeId,
    materialId,
  }: IPriceGroupSurchargeRequest) {
    return haulingHttpClient.get<IPriceGroupRateSurcharge[]>(
      `${this.baseUrl}/${priceGroupId}/surcharges`,
      {
        businessUnitId,
        businessLineId,
        surchargeId,
        materialId,
      },
    );
  }

  requestThresholds({
    businessUnitId,
    businessLineId,
    thresholdId,
    materialId,
    equipmentItemId,
    priceGroupId,
  }: IPriceGroupThresholdRequest) {
    return haulingHttpClient.get<IPriceGroupRateThreshold[]>(
      `${this.baseUrl}/${priceGroupId}/thresholds`,
      {
        businessUnitId,
        businessLineId,
        thresholdId,
        materialId,
        equipmentItemId,
      },
    );
  }

  updateServices(services: IPriceGroupRateService[], priceGroupId: number) {
    const concurrentData = services.reduce(
      (acc, service) => ({
        ...acc,
        [service.id as number]: service.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IPriceGroupRateService[], void>({
      url: `${this.baseUrl}/${priceGroupId}/services`,
      data: services,
      concurrentData,
    });
  }

  updateLineItems(lineItems: IPriceGroupRateLineItem[], priceGroupId: number) {
    const concurrentData = lineItems.reduce(
      (acc, lineItem) => ({
        ...acc,
        [lineItem.id as number]: lineItem.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IPriceGroupRateLineItem[], void>({
      url: `${this.baseUrl}/${priceGroupId}/line-items`,
      data: lineItems,
      concurrentData,
    });
  }

  updateSurcharges(surcharges: IPriceGroupRateSurcharge[], priceGroupId: number) {
    const concurrentData = surcharges.reduce(
      (acc, surcharge) => ({
        ...acc,
        [surcharge.id as number]: surcharge.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IPriceGroupRateSurcharge[], void>({
      url: `${this.baseUrl}/${priceGroupId}/surcharges`,
      data: surcharges,
      concurrentData,
    });
  }

  updateThresholds(thresholds: IPriceGroupRateThreshold[], priceGroupId: number) {
    const concurrentData = thresholds.reduce(
      (acc, threshold) => ({
        ...acc,
        [threshold.id as number]: threshold.updatedAt,
      }),
      {},
    );

    return haulingHttpClient.patch<IPriceGroupRateThreshold[], void>({
      url: `${this.baseUrl}/${priceGroupId}/thresholds`,
      data: thresholds,
      concurrentData,
    });
  }

  updateThresholdSetting(thresholds: IUpdateThresholdsRequest, priceGroupId: number) {
    return haulingHttpClient.patch<IUpdateThresholdsRequest, IPriceGroup>({
      url: `${this.baseUrl}/${priceGroupId}`,
      data: thresholds,
    });
  }

  updateBatch(batch: IBulkRatesEditData) {
    return haulingHttpClient.post<IBulkRatesEditData>('rates/batch', batch);
  }

  fetchTargetedRateGroups(options: IBulkRatesEditTargetedPriceGroup) {
    return haulingHttpClient.post<IBulkRatesEditTargetedPriceGroup, ITargetedPriceGroups[]>(
      'rates/batch-target',
      options,
    );
  }

  static requestLinked({ businessLineId, businessUnitId }: IBusinessContextIds) {
    return haulingHttpClient.get<IBulkRatesLinkedData>('rates/linked', {
      businessLineId,
      businessUnitId,
    });
  }

  requestRatesHistory({
    businessUnitId,
    businessLineId,
    entityType,
    lineItemId,
    surchargeId,
    billableServiceId,
    materialId,
    equipmentItemId,
    thresholdId,
    customRatesGroupId,
    billingCycle,
    frequencyId,
  }: IRatesHistoryRequest) {
    return haulingHttpClient.get<IRatesHistoryItem[]>(`rates/history`, {
      businessUnitId,
      businessLineId,
      entityType,
      billableServiceId,
      lineItemId,
      surchargeId,
      thresholdId,
      materialId,
      equipmentItemId,
      customRatesGroupId,
      billingCycle,
      frequencyId,
    });
  }
}
