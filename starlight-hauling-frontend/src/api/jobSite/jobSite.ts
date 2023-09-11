import {
  type IJobSite,
  type ITaxDistrict,
  type ICustomerJobSitePair,
  type IStoreCount,
} from '@root/types';
import { BaseService, haulingHttpClient } from '../base';

import { IRequestByCustomerByIdOptions, IRequestByCustomerOptions } from './types';

const getCustomerJobSitesUrl = (customerId: number | string) => {
  return `customers/${customerId}/job-sites`;
};

export class JobSiteService extends BaseService<IJobSite, IJobSite, IStoreCount> {
  constructor() {
    super('job-sites');
  }

  requestByCustomer({ customerId, ...options }: IRequestByCustomerOptions) {
    const params = {
      // R2-999 Bump up the limit to 200 to get around the issue for now.
      // R2-999 - Steven 3/1/22
      limit: 200,
      ...options,
    };

    return haulingHttpClient.get<IJobSite[]>(getCustomerJobSitesUrl(customerId), params);
  }

  requestByCustomerById({ customerId, id, ...options }: IRequestByCustomerByIdOptions) {
    return haulingHttpClient.get<IJobSite>(`${getCustomerJobSitesUrl(customerId)}/${id}`, options);
  }

  linkToCustomer(data: Omit<ICustomerJobSitePair, 'id' | 'createdAt' | 'updatedAt'>) {
    return haulingHttpClient.post<ICustomerJobSitePair, ICustomerJobSitePair>(
      `${getCustomerJobSitesUrl(data.customerId)}/${data.jobSiteId}`,
      data,
    );
  }

  updateLink(data: ICustomerJobSitePair) {
    const concurrentData = { [data.id]: data.updatedAt };

    return haulingHttpClient.put<
      { customerId: number; jobSiteId: number; id: number },
      ICustomerJobSitePair
    >({
      url: `${getCustomerJobSitesUrl(data.customerId)}/${data.jobSiteId}/cjs/${data.id}`,
      data,
      concurrentData,
    });
  }

  updateTaxDistricts(jobSiteId: number, taxDistrictIds: number[]) {
    return haulingHttpClient.put({
      url: `${this.baseUrl}/${jobSiteId}/tax-districts`,
      data: { taxDistrictIds },
    });
  }

  searchCustomersLinkedJobSites({
    customerId,
    address,
    activeOnly,
  }: {
    customerId: number;
    address: string;
    activeOnly?: boolean;
  }) {
    return haulingHttpClient.get<IJobSite[] | null>(
      `${getCustomerJobSitesUrl(customerId)}/search`,
      {
        address,
        activeOnly,
        // R2-999 Bump up the limit to 200 to get around the issue for now.
        // R2-999 - Steven 3/1/22
        limit: 200,
      },
    );
  }

  static getCustomerJobSiteAvailableDistricts(customerId: number, jobSiteId: number) {
    return haulingHttpClient.get<ITaxDistrict[]>(
      `${getCustomerJobSitesUrl(customerId)}/${jobSiteId}/tax-districts`,
    );
  }
}
