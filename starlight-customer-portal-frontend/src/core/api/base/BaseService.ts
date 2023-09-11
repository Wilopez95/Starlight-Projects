import { EntityName } from '@root/auth/hooks/permission/types';
import { IEntity } from '@root/core/types';

import { haulingHttpClient } from './httpClient';
import { RequestQueryParams } from './types';

export class BaseService<E extends IEntity, R extends IEntity = E, CountType = unknown> {
  readonly baseUrl: string;

  constructor(baseUrl: string | EntityName) {
    this.baseUrl = baseUrl;
  }

  get<Resp = R[]>(options: RequestQueryParams = {}) {
    return haulingHttpClient.get<E[], Resp>(this.baseUrl, options);
  }

  getById<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  create<Resp = R>(newEntity: Partial<E>, options: RequestQueryParams = {}) {
    return haulingHttpClient.post<E, Resp>(this.baseUrl, newEntity, options);
  }

  update<Resp = R>(id: number, entity: Partial<E>, options: RequestQueryParams = {}) {
    const concurrentData = { [id]: entity.updatedAt };

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
    return haulingHttpClient.get<CountType>(`${this.baseUrl}/count`, options);
  }
}
