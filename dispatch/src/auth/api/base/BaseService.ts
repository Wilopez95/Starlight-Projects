import { trashapiHttpClient } from './httpClient';
import { IEntity, RequestQueryParams } from './types';

export class BaseService<
  E extends IEntity,
  R extends IEntity = E,
  CountType = unknown,
> {
  readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get<Resp = R[]>(options: RequestQueryParams = {}) {
    return trashapiHttpClient.get<E[], Resp>(this.baseUrl, options);
  }

  getById<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return trashapiHttpClient.get<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  create<Resp = R>(newEntity: Partial<E>, options: RequestQueryParams = {}) {
    return trashapiHttpClient.post<E, Resp>(this.baseUrl, newEntity, options);
  }

  update<Resp = R>(
    id: number,
    entity: Partial<E>,
    options: RequestQueryParams = {},
  ) {
    const concurrentData = { [id]: entity.updatedAt };

    return trashapiHttpClient.put<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  patch<Resp = R>(
    id: number,
    entity: Partial<E> | null,
    options: RequestQueryParams = {},
  ) {
    const concurrentData = { [id]: entity?.updatedAt };

    return trashapiHttpClient.patch<E, Resp>({
      url: `${this.baseUrl}/${id}`,
      data: entity,
      queryParams: options,
      concurrentData,
    });
  }

  delete<Resp = R>(id: number, options: RequestQueryParams = {}) {
    return trashapiHttpClient.delete<E, Resp>(`${this.baseUrl}/${id}`, options);
  }

  getCount(options: RequestQueryParams = {}) {
    return trashapiHttpClient.get<CountType>(`${this.baseUrl}/count`, options);
  }
}
