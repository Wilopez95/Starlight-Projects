import { IBusinessLine } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

const baseUrl = 'business-lines';

export class BusinessLineService extends BaseService<IBusinessLine> {
  constructor() {
    super(baseUrl);
  }
  getBusinessLinesByBUId(businessUnitId: number, options: RequestQueryParams) {
    return haulingHttpClient.get<
      { businessUnitId: number; options: RequestQueryParams },
      IBusinessLine[]
    >(`${baseUrl}`, { ...options, businessUnitId });
  }
}
