import { IBusinessLine, IBusinessUnit, IMerchant, IServiceDaysAndTime } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { BusinessUnitFormRequest, ServiceDaysFormRequest } from './types';

const baseUrl = 'business-units';

export class BusinessUnitService extends BaseService<BusinessUnitFormRequest, IBusinessUnit> {
  constructor() {
    super(baseUrl);
  }

  addLinesOfBusiness(businessUnitId: string | number, businessLines: Partial<IBusinessLine>[]) {
    return haulingHttpClient.post<BusinessUnitFormRequest>(
      `${this.baseUrl}/${businessUnitId}/business-lines`,
      {
        businessLines,
      },
    );
  }

  updateLinesOfBusiness(businessUnitId: string | number, businessLines: Partial<IBusinessLine>[]) {
    return haulingHttpClient.put<BusinessUnitFormRequest>({
      url: `${this.baseUrl}/${businessUnitId}/business-lines`,
      data: {
        businessLines,
      },
    });
  }

  createWithForm(data: BusinessUnitFormRequest) {
    return haulingHttpClient.sendForm<BusinessUnitFormRequest, IBusinessUnit>({
      url: `${this.baseUrl}`,
      data,
      method: 'POST',
    });
  }

  updateWithForm(businessUnitId: number, data: BusinessUnitFormRequest) {
    return haulingHttpClient.sendForm<BusinessUnitFormRequest, IBusinessUnit>({
      url: `${this.baseUrl}/${businessUnitId}`,
      data,
      method: 'PUT',
    });
  }

  static getAvailableMerchants(businessUnitId: number) {
    return haulingHttpClient.get<IMerchant[]>(`${baseUrl}/${businessUnitId}/merchants`);
  }

  addServiceDays(businessUnitId: number, serviceDays: Partial<IServiceDaysAndTime>[]) {
    return haulingHttpClient.sendForm<ServiceDaysFormRequest, IServiceDaysAndTime[]>({
      url: `${this.baseUrl}/${businessUnitId}/service-days`,
      data: {
        serviceDays,
      },
      queryParams: {
        id: businessUnitId,
      },
      method: 'POST',
    });
  }

  updateServiceDays(businessUnitId: number, serviceDays: Partial<IServiceDaysAndTime>[]) {
    return haulingHttpClient.sendForm<ServiceDaysFormRequest, IServiceDaysAndTime[]>({
      url: `${this.baseUrl}/${businessUnitId}/service-days`,
      data: {
        serviceDays,
      },
      queryParams: {
        id: businessUnitId,
      },
      method: 'PUT',
    });
  }

  static getServiceDays(businessUnitId: number | string) {
    return haulingHttpClient.get<IServiceDaysAndTime[]>(
      `${baseUrl}/${businessUnitId}/service-days`,
    );
  }
}
