import * as Sentry from '@sentry/react';
import { action } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { UserService } from '@root/api';
import { IUserQueryResult } from '@root/api/user/types';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { FormUser } from '@root/quickViews/UserQuickView/formikData';
import { JsonConversions, UserManagementMapper } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import type GlobalStore from '../GlobalStore';

import { sanitizeUserForCreate, sanitizeUserForUpdate } from './sanitize';
import { User } from './User';

export class UserStore extends ConfigurationDataBaseStore<User> {
  private service: UserService;

  constructor(global: GlobalStore) {
    super(global, ['name']);
    this.service = new UserService();
  }

  @action
  setItem(entity: User) {
    this.data.set(entity.id, entity);
  }

  @action
  setItems(entities: User[]) {
    entities.forEach(entry => {
      this.data.set(entry.id, entry);
    });
  }

  getById(userId: string | number | undefined | null): User | null {
    return this.data.get(userId as number) ?? null;
  }

  @actionAsync
  async requestById(id: string) {
    try {
      const userResponse = await task(this.service.getUserById(id));

      const user = new User(
        this,
        userResponse.user as UserManagementMapper<JsonConversions<IUserQueryResult>>,
      );

      this.setItem(user);
      this.updateSelectedEntity(user, true);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Request by id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async request({ query }: { query?: string } = {}) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const usersResponse = await task(
        this.service.getUsers({ offset: this.offset, limit: this.limit, query }),
      );

      const users = usersResponse.listUsers.data.map(
        user => new User(this, user as UserManagementMapper<JsonConversions<IUserQueryResult>>),
      );

      this.validateLoading(usersResponse.listUsers.data, this.limit);

      this.setItems(users);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          query,
        },
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestByIds(ids: string[]) {
    this.loading = true;
    try {
      const usersResponse = await task(this.service.getByIds(ids));

      const users = usersResponse.users
        .filter(user => user !== null)
        .map(
          user => new User(this, user as JsonConversions<UserManagementMapper<IUserQueryResult>>),
        );

      this.setItems(users);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ids,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestSalesRepsByBU(businessUnitId: number) {
    this.loading = true;
    try {
      const usersResponse = await task(
        this.service.getSalesRepresentativesByBU({ businessUnitId }),
      );

      const users = usersResponse.getSalesRepresentativesByBU.map(user => new User(this, user));

      this.setItems(users);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Request SalesRep By BU Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(user: FormUser) {
    const userInput = sanitizeUserForCreate(user);

    try {
      const response = await task(this.service.createUser(userInput));

      this.setItem(
        new User(
          this,
          response.createUser as UserManagementMapper<JsonConversions<IUserQueryResult>>,
        ),
      );
      NotificationHelper.success('create', 'User');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError?.response?.message === 'User already exists') {
        NotificationHelper.error('create', ActionCode.CONFLICT, 'User');
      } else {
        NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'User');
      }
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Create Error ${JSON.stringify(typedError?.response?.message)}`,
        data: {
          ...user,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(id: string, user: FormUser) {
    const userInput = sanitizeUserForUpdate(user);

    try {
      const response = await task(this.service.updateUser(id, userInput));

      this.setItem(
        new User(
          this,
          response.updateUser as UserManagementMapper<JsonConversions<IUserQueryResult>>,
        ),
      );
      NotificationHelper.success('update', 'User');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'User');
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          ...user,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(id: string) {
    try {
      await task(this.service.deleteUser(id));
      this.data.delete(id as unknown as number);
      NotificationHelper.success('delete', 'User');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'User');
      Sentry.addBreadcrumb({
        category: 'User',
        message: `Users Delete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
