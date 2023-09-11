import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { IQbIntegrationLogResponse } from '@root/types/responseEntities';
import { billingHttpClient, RequestQueryParams } from '../base';

const baseUrl = 'qb-integration-log';

export class QbIntegrationLogService {
  static getQbIntegrationLog(filter: AppliedFilterState, params: RequestQueryParams) {
    return billingHttpClient.post<AppliedFilterState, IQbIntegrationLogResponse>(
      `${baseUrl}`,
      filter,
      params,
    );
  }
}
