import { type RecurrentOrder } from '@root/stores/recurrentOrder/RecurrentOrder';
import { IRecurrentOrder } from '@root/types';

import { BaseService, pricingHttpClient } from '../base';

type RecurrentOrderStoreCountResponse = {
  total: number;
};

export class RecurrentOrderService extends BaseService<
  IRecurrentOrder,
  IRecurrentOrder,
  RecurrentOrderStoreCountResponse
> {
  constructor() {
    super('recurrent-orders');
  }

  getViewDetails(id: number) {
    return pricingHttpClient.get<RecurrentOrder>(`${this.baseUrl}/${id}/details`);
  }

  putOnHold(id: number) {
    return pricingHttpClient.post<RecurrentOrder>(`${this.baseUrl}/${id}/put-on-hold`, { id });
  }

  putOffHold(id: number) {
    return pricingHttpClient.post<RecurrentOrder>(`${this.baseUrl}/${id}/put-off-hold`, { id });
  }

  close(id: number) {
    return pricingHttpClient.post<RecurrentOrder>(`${this.baseUrl}/${id}/close`, { id });
  }
}
