import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import type GlobalStore from '@root/app/GlobalStore';
import { ContactService } from '@root/core/api';
import { NotificationHelper, sortEntities } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { IContact } from '@root/core/types';

import { Contact } from './Contact';
import { sanitizeContact } from './helpers';

export class ContactStore extends BaseStore<Contact> {
  private readonly service: ContactService;
  @observable shouldShowInactive = true;
  @observable me: Contact | null = null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new ContactService();
  }

  @action
  changeShowInactive(value: boolean) {
    this.shouldShowInactive = value;
  }

  @computed
  get filteredValues() {
    const data = this.shouldShowInactive
      ? this.values
      : this.values.filter((contact) => contact.active);

    return sortEntities(
      data,
      [{ key: 'main', order: 'desc' }, { key: 'active', order: 'desc' }, 'name'],
      this.shouldShowInactive,
    );
  }

  @computed
  get noResult() {
    return !this.loading && this.values.length === 0;
  }

  @actionAsync
  async requestJobSiteOrderContacts(customerId: number, jobSiteId: number) {
    this.loading = true;

    this.cleanup();

    try {
      const contactsResponse = await task(
        this.service.getJobSiteOrderContacts(customerId, jobSiteId),
      );

      this.setItems(contactsResponse.map((contact) => new Contact(this, contact)));
    } catch (error) {
      console.error('JobSite Order Contact Request Error:', error);
    }

    this.loading = false;
  }

  @actionAsync
  async requestMyContact() {
    this.loading = true;

    try {
      const myContact = await task(this.service.getMyContact());

      this.me = new Contact(this, myContact);
    } catch (e) {
      console.error('Contact Request Error:', e);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;

    try {
      const newContact = await task(this.service.getById(id));
      const contactEntity = new Contact(this, newContact);

      this.setItem(contactEntity);
    } catch (error) {
      console.error('Contact Request Error:', error);
      NotificationHelper.error('contact');
    }

    this.loading = false;
  }

  @actionAsync
  async requestByCustomer({
    customerId,
    activeOnly,
  }: {
    customerId: number;
    activeOnly?: boolean;
  }) {
    this.cleanup();
    this.loading = true;

    try {
      //TODO: Revoke changes when we will have all usefull information
      const contactsResponse = await task(this.service.get({ customerId, activeOnly }));
      // const contactsResponse = filteredValues;

      this.setItems(contactsResponse.map((contact: any) => new Contact(this, contact)));
    } catch (error) {
      console.error('Contact Request by Customer Error:', error);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IContact, businessUnitId: string) {
    sanitizeContact(data);

    try {
      const newContact = await task(this.service.create(data, { businessUnitId }));

      if (newContact.main) {
        this.values.forEach((contact) => (contact.main = false));
      }

      this.setItem(new Contact(this, newContact));
      NotificationHelper.success('contact');
    } catch (error) {
      NotificationHelper.custom('error', JSON.parse(error?.response?.details)?.details);
    }
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));

      this.removeEntity(id);
    } catch (error) {
      console.error('Contact Delete Error', error);
    }
  }

  @actionAsync
  async update(data: IContact, businessUnitId: string) {
    sanitizeContact(data);

    try {
      const newContact = await task(this.service.update(data.id, data, { businessUnitId }));

      if (newContact.main) {
        this.values.forEach((contact) => (contact.main = false));
      }

      this.setItem(new Contact(this, newContact));

      NotificationHelper.success('editContact');
    } catch (error) {
      console.error('Contact Update Error', error);
    }
  }

  @actionAsync
  async updateMe(data: IContact) {
    sanitizeContact(data);

    try {
      const newContact = await task(this.service.updateMyContact(data));

      this.me = new Contact(this, newContact);
      NotificationHelper.success('me');
    } catch (error) {
      console.error('Contact Update Error', error);
      NotificationHelper.error('me');
    }
  }
}
