import { type Regions } from '@root/i18n/config/region';
import {
  type ITaxDistrict,
  type LineItemTax,
  type Tax,
  type TaxDistrictType,
  type UpdateTax,
} from '@root/types';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

import { BaseService, haulingHttpClient } from '../base';

export class TaxDistrictService extends BaseService<ITaxDistrict> {
  constructor() {
    super('tax-districts');
  }

  static searchAdministrativeUnits(query: string, level: TaxDistrictType, region: Regions) {
    return haulingHttpClient.get<{ query: string }, IAdministrativeSearchResponse[]>(
      'tax-districts/administrative-units',
      {
        query,
        level,
        region,
      },
    );
  }

  updateTaxDistrict(district: Partial<ITaxDistrict>, id: number) {
    const concurrentData = { [id]: district.updatedAt };

    return haulingHttpClient.patch<ITaxDistrict>({
      url: `${this.baseUrl}/${id}`,
      data: district,
      concurrentData,
    });
  }

  updateTaxDistrictRates(
    id: number,
    businessLineId: number,
    taxGroupKey: string,
    tax: Tax | LineItemTax,
    commercial: boolean,
  ) {
    return haulingHttpClient.put<UpdateTax>({
      url: `${this.baseUrl}/${id}/${taxGroupKey}`,
      data: { ...tax, businessLineId, commercial },
    });
  }
}
