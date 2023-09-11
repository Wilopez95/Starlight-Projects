import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { ICustomerJobSitePair } from '@root/types';
import {
  AddressSuggestion,
  FacilitySuggestion,
  IAdvancedMultiSearchResponse,
  IAuditLogResponse,
  IMultiSearchResponse,
  IResponseCustomersOrInvoices,
} from '@root/types/responseEntities';

import { haulingHttpClient, RequestQueryParams } from '../base';
export class GlobalService {
  static addressSuggestions(query: string, businessUnitId: number) {
    return haulingHttpClient.get<{ query: string }, AddressSuggestion[]>('address-suggestions', {
      query,
      businessUnitId,
    });
  }

  static multiSearch(query: string, businessUnitId: string) {
    return haulingHttpClient.get<{ query: string }, IMultiSearchResponse>('search/multi', {
      query,
      businessUnitId,
    });
  }

  static auditLogs(params: AppliedFilterState, queryParams: RequestQueryParams = {}) {
    return haulingHttpClient.post<AppliedFilterState, IAuditLogResponse>(
      'audit-logs',
      params,
      queryParams,
    );
  }

  static advancedMultiSearch(query: string, businessUnitId: string) {
    return haulingHttpClient.get<{ query: string }, IAdvancedMultiSearchResponse>(
      'search/advanced',
      {
        query,
        businessUnitId,
      },
    );
  }

  static getJobSiteCustomerPair(jobSiteId: number, customerId: number) {
    return haulingHttpClient.get<
      { jobSiteId: number; customerId: number },
      ICustomerJobSitePair | undefined
      // R2-999 Bump up the limit to 200 to get around the issue for now.
      // R2-999 - Steven 3/1/22
    >('linked', { jobSiteId, customerId, limit: 200 });
  }

  static searchCustomersOrInvoices(query: string, businessUnitId: string) {
    return haulingHttpClient.get<
      { query: number; businessUnitId: string },
      IResponseCustomersOrInvoices
    >(`search/customers-invoices`, {
      query,
      businessUnitId,
    });
  }

  static facilitySuggestions(query: string) {
    return haulingHttpClient.get<{ query: number }, FacilitySuggestion[]>(
      `business-units/recycling-facilities`,
      { query },
    );
  }
}
