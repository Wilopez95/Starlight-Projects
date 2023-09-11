import { IBusinessUnit } from '@root/types';

import { BaseService } from '../base';

import { BusinessUnitFormRequest } from './types';

const baseUrl = 'business-units';

export class BusinessUnitService extends BaseService<BusinessUnitFormRequest, IBusinessUnit> {
  constructor() {
    super(baseUrl);
  }
}
