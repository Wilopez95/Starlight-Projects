import { IThirdPartyHauler } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { IThirdPartyHaulerCostsPayload, IThirdPartyHaulerCostsResponse } from './types';

export class ThirdPartyHaulerService extends BaseService<IThirdPartyHauler> {
  constructor() {
    super('3rd-party-haulers');
  }

  requestThirdPartyHaulerCosts(id: number, businessLineId: number) {
    return haulingHttpClient.get<{ businessLineId: number }, IThirdPartyHaulerCostsResponse[]>(
      `${this.baseUrl}/${id}/operating-costs`,
      {
        businessLineId,
      },
    );
  }

  updateThirdPartyHaulerCosts(id: number, data: IThirdPartyHaulerCostsPayload[]) {
    return haulingHttpClient.patch<IThirdPartyHaulerCostsPayload[], void>({
      url: `${this.baseUrl}/${id}/operating-costs`,
      data,
    });
  }
}
