import { IEntity } from '@root/types';

import { pricingHttpClient } from './httpClient';
import { RequestQueryParams } from './types';

export class BasePricingService<E extends IEntity, R extends IEntity = E, CountType = unknown> {
  readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get<Resp = R[]>(options: RequestQueryParams = {}) {
    return pricingHttpClient.get<E[], Resp>(this.baseUrl, options);
  }

  getById<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return pricingHttpClient.get<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  create<Resp = R>(newEntity: Partial<E>, options: RequestQueryParams = {}) {
    return pricingHttpClient.post<E, Resp>(this.baseUrl, newEntity, options);
  }

  update<Resp = R>(id: number, entity: Partial<E>, options: RequestQueryParams = {}) {
    const concurrentData = { [id]: entity.updatedAt };

    return pricingHttpClient.put<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  patch<Resp = R>(id: number, entity: Partial<E> | null, options: RequestQueryParams = {}) {
    const concurrentData = { [id]: entity?.updatedAt };

    return pricingHttpClient.patch<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  delete<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return pricingHttpClient.delete<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  getCount(options: RequestQueryParams = {}) {
    return pricingHttpClient.get<CountType>(`${this.baseUrl}/count`, options);
  }
}
