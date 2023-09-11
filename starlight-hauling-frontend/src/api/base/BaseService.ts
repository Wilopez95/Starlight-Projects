import { IEntity } from '@root/types';

import { haulingHttpClient, pricingHttpClient } from './httpClient';
import { RequestQueryParams } from './types';

export class BaseService<E extends IEntity, R extends IEntity = E, CountType = unknown> {
  readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get<Resp = R[]>(options: RequestQueryParams = {}) {
    if (this.baseUrl === 'orders' || this.baseUrl === 'recurrent-orders') {
      return pricingHttpClient.get<E[], Resp>(`${this.baseUrl}`, options);
    }

    return haulingHttpClient.get<E[], Resp>(this.baseUrl, options);
  }

  getById<Resp = R>(id: number, options: RequestQueryParams = {}) {
    // ToDo: Uncomment after implement pricegroups into pricing backend
    // if (this.baseUrl === 'rates/custom') {
    //   return pricingHttpClient.get<E, Resp>(`${this.baseUrl}/${id}`, options);
    // }

    return haulingHttpClient.get<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  getHistoricalById<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<E, Resp>(`${this.baseUrl}/historical/${id}`, options);
  }

  create<Resp = R>(newEntity: Partial<E>, options: RequestQueryParams = {}) {
    return haulingHttpClient.post<E, Resp>(this.baseUrl, newEntity, options);
  }

  update<Resp = R>(id: number, entity: Partial<E>, options: RequestQueryParams = {}) {
    const concurrentData = { [id]: entity.updatedAt };

    if (this.baseUrl == 'orders') {
      return pricingHttpClient.put<E, Resp>({
        url: `${this.baseUrl}/${id}`,
        data: entity,
        queryParams: options,
        concurrentData,
      });
    }

    return haulingHttpClient.put<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  patch<Resp = R>(id: number, entity: Partial<E> | null, options: RequestQueryParams = {}) {
    const concurrentData = { [id]: entity?.updatedAt };

    return haulingHttpClient.patch<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  delete<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return haulingHttpClient.delete<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  getCount(options: RequestQueryParams = {}) {
    if (this.baseUrl.includes('orders')) {
      return pricingHttpClient.get<CountType>(`${this.baseUrl}/count`, options);
    }

    return haulingHttpClient.get<CountType>(`${this.baseUrl}/count`, options);
  }
}
