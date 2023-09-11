import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper, sortEntities } from '@root/helpers';
import { IContact } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ContactService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import type GlobalStore from '../GlobalStore';

import { Contact } from './Contact';
import { sanitizeContact } from './helpers';
import { ContactSortType } from './types';

export class ContactStore extends BaseStore<Contact, ContactSortType> {
  private readonly service: ContactService;
  @observable shouldShowInactive = true;

  constructor(global: GlobalStore) {
    super(global, 'name', 'asc');
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
      : this.values.filter(contact => contact.active);

    return sortEntities(data, [{ key: 'main', order: 'desc' }], false);
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
        this.service.getJobSiteOrderContacts({
          customerId,
          jobSiteId,
          sortOrder: this.sortOrder,
          sortBy: this.sortBy,
        }),
      );

      this.setItems(contactsResponse.map(contact => new Contact(this, contact)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Request By Job Site Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          jobSiteId,
        },
      });
      Sentry.captureException(typedError);
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
      this.loading = false;

      return contactEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return null;
  }

  @actionAsync
  async requestByCustomer({
    customerId,
    activeOnly,
  }: {
    customerId: number;
    activeOnly?: boolean;
  }) {
    this.loading = true;

    try {
      const contactsResponse = await task(
        this.service.get({
          customerId,
          activeOnly,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        }),
      );

      this.setItems(contactsResponse.map(contact => new Contact(this, contact)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Request By Customer Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          activeOnly,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IContact, businessUnitId: string) {
    sanitizeContact(data);

    try {
      const newContact = await task(this.service.create(data, { businessUnitId }));

      if (newContact.main) {
        this.values.forEach(contact => (contact.main = false));
      }

      this.setItem(new Contact(this, newContact));
      NotificationHelper.success('create', 'Contact');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Contact');
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));

      this.removeEntity(id);
      NotificationHelper.success('delete', 'Contact');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Contact');
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Delete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(data: IContact, businessUnitId: string) {
    sanitizeContact(data);

    try {
      const newContact = await task(this.service.update(data.id, data, { businessUnitId }));

      if (newContact.main) {
        this.values.forEach(contact => (contact.main = false));
      }

      this.setItem(new Contact(this, newContact));
      NotificationHelper.success('update', 'Contact');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Contact');
      Sentry.addBreadcrumb({
        category: 'Contact',
        message: `Contacts Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
