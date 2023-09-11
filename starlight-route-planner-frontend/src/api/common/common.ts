import { INavigationCounts } from '@root/types';

import { haulingHttpClient } from '../base';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CommonService {
  static getNavigationCounts(businessUnitId: number): Promise<INavigationCounts> {
    return haulingHttpClient.get<{ businessUnitId: number }, INavigationCounts>('nav-counts', {
      businessUnitId,
    });
  }
}
