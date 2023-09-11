import { IContact } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class ContactService extends BaseService<IContact> {
  constructor() {
    super('contacts');
  }

  getJobSiteOrderContacts({
    customerId,
    ...variables
  }: RequestQueryParams & { customerId: number; jobSiteId: number }) {
    return haulingHttpClient.get<IContact[]>(`customers/${customerId}/profile/contacts`, variables);
  }
}
