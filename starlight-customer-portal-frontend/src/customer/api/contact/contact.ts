import { BaseService, haulingHttpClient } from '@root/core/api/base';
import { IContact } from '@root/core/types';

export class ContactService extends BaseService<IContact> {
  constructor() {
    super('contacts');
  }

  getJobSiteOrderContacts(customerId: number, jobSiteId: number) {
    return haulingHttpClient.get<{ customerId: number; jobSiteId: number }, IContact[]>(
      `customers/${customerId}/profile/contacts`,
      {
        jobSiteId,
      },
    );
  }

  getMyContact() {
    return haulingHttpClient.get<{ customerId: number; jobSiteId: number }, IContact>(
      `contacts/me`,
    );
  }

  updateMyContact(data: IContact) {
    return haulingHttpClient.put<IContact>({
      url: `contacts/me`,
      data,
    });
  }
}
