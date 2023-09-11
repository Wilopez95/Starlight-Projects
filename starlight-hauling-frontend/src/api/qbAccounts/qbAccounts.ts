import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IQbAccountsResponse } from '@root/types/responseEntities';
import { billingHttpClient, RequestQueryParams } from '../base';
const baseUrl = 'qb-accounts';

export class qbAccountsService {
  static getQbAccounts(integrationId: number, params: RequestQueryParams = {}) {
    return billingHttpClient.get<AppliedFilterState, IQbAccountsResponse>(
      `${baseUrl}?integrationId=${integrationId}`,
      params,
    );
  }
}
