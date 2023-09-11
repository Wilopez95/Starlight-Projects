import { INavigationCounts } from '@root/types';

import { haulingHttpClient } from '../base';

export class CommonService {
  static getNavigationCounts(businessUnitId: string): Promise<INavigationCounts> {
    return haulingHttpClient.get<INavigationCounts>('nav-counts', { businessUnitId });
  }
}
