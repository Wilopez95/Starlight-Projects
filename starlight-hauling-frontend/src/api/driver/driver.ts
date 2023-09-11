import { IDriver, IDriverFormikData } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class DriverService extends BaseService<IDriver> {
  constructor() {
    super('drivers');
  }

  createDriverWithImage(newEntity: IDriverFormikData, options: RequestQueryParams = {}) {
    const { image, ...equipmentItem } = newEntity;

    if (image) {
      return haulingHttpClient.sendForm<IDriverFormikData, IDriver>({
        url: `${this.baseUrl}`,
        data: newEntity,
        method: 'POST',
        queryParams: options,
      });
    }

    return haulingHttpClient.post<IDriverFormikData, IDriver>(this.baseUrl, equipmentItem, options);
  }

  updateDriverWithImage(
    id: number,
    newEntity: IDriverFormikData,
    options: RequestQueryParams = {},
  ) {
    const { image, ...equipmentItem } = newEntity;

    if (image) {
      return haulingHttpClient.sendForm<IDriverFormikData, IDriver>({
        url: `${this.baseUrl}/${id}`,
        data: newEntity,
        method: 'PUT',
        queryParams: options,
      });
    }

    return haulingHttpClient.put<IDriverFormikData, IDriver>({
      url: `${this.baseUrl}/${id}`,
      data: equipmentItem,
      queryParams: options,
    });
  }

  getAllDrivers(options: RequestQueryParams = {}) {
    return haulingHttpClient.get<IDriver[]>(this.baseUrl, options);
  }
}
