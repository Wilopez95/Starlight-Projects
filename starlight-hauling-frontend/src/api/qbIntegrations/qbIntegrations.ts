import { IQbIntegration } from '@root/types';
import { billingHttpClient } from '../base';

const baseUrl = 'qb-integrations';

export class QbIntegrationsService {
  static addQbIntegration(
    integrationBuList: number[] | string,
    password: string,
    dateToAdjustment: number,
    lastSuccessfulIntegration?: string,
    description?: string,
    systemType?: string,
    integrationPeriod?: string | Date,
  ) {
    return billingHttpClient.post<IQbIntegration>(baseUrl, {
      integrationBuList,
      dateToAdjustment,
      password,
      lastSuccessfulIntegration,
      description,
      systemType,
      integrationPeriod,
    });
  }

  static getQWCFile(options?: { validatedOnly?: boolean; id?: number }) {
    return billingHttpClient.get(`${baseUrl}/qwc-file`, options);
  }

  static getQbIntegration(options?: { validatedOnly?: boolean; id?: number }) {
    return billingHttpClient.get<IQbIntegration[]>(`${baseUrl}`, options);
  }

  static updateQbIntegration(data: IQbIntegration, integrationId: number) {
    return billingHttpClient.put({
      url: `${baseUrl}/${integrationId}`,
      data,
    });
  }

  static deleteQbIntegration(id: number) {
    return billingHttpClient.post(`${baseUrl}/delete/${id}`, null);
  }
}
