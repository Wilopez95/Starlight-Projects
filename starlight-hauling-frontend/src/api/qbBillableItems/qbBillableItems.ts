import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IQbBillableItemsResponse } from '@root/types/responseEntities';
import { IQbBillableItemsortedAccounts } from '../../types';
import { billingHttpClient, RequestQueryParams } from '../base';
const baseUrl = 'qb-billable-items';

export class qbBillableItemsService {
  static getQbBillableItems(
    integrationId: number,
    billableItemType: string[],
    params: RequestQueryParams = {},
  ) {
    return billingHttpClient.get<AppliedFilterState, IQbBillableItemsResponse>(
      `${baseUrl}?integrationId=${integrationId}&billableItemType=${billableItemType}`,
      params,
    );
  }

  static insertManyQbBillableItems(
    integrationId: number,
    data: IQbBillableItemsortedAccounts[],
    billableItemType: string[],
    params: RequestQueryParams = {},
  ) {
    return billingHttpClient.post(
      `${baseUrl}/${integrationId}?billableItemType=${billableItemType}`,
      data,
      params,
    );
  }
}
