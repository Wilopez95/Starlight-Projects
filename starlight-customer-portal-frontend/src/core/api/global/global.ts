import {
  AddressSuggestion,
  IAdvancedMultiSearchResponse,
  IMultiSearchResponse,
} from '@root/core/types/responseEntities';

import { haulingHttpClient } from '../base';

export class GlobalService {
  static addressSuggestions(query: string) {
    return haulingHttpClient.get<{ query: string }, AddressSuggestion[]>('address-suggestions', {
      query,
    });
  }

  static multiSearch(query: string, businessUnitId?: string) {
    return haulingHttpClient.get<{ query: string }, IMultiSearchResponse>('search/multi', {
      query,
      businessUnitId,
    });
  }

  static advancedMultiSearch(query: string, businessUnitId?: string) {
    return haulingHttpClient.get<{ query: string }, IAdvancedMultiSearchResponse>(
      'search/advanced',
      {
        query,
        businessUnitId,
      },
    );
  }
}
