import * as Sentry from '@sentry/react';
import { action } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RoleService } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { FormRole } from '@root/quickViews/RoleQuickView/formikData';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import type GlobalStore from '../GlobalStore';

import { Role } from './Role';
import { sanitizeRole } from './sanitize';

export class RoleStore extends ConfigurationDataBaseStore<Role> {
  private service = new RoleService();

  constructor(global: GlobalStore) {
    super(global, ['description']);
  }

  @action
  setItem(entity: Role) {
    this.data.set(entity.id, entity);
  }

  @action
  setItems(entities: Role[]) {
    entities.forEach(entry => {
      this.data.set(entry.id, entry);
    });
  }

  @actionAsync
  async request() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const roles = await task(this.service.getRoles({ offset: this.offset, limit: this.limit }));

      this.validateLoading(roles.listRoles.data, this.limit);

      this.setItems(roles.listRoles.data.map(group => new Role(this, group)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Role',
        message: `Roles Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestForDisplay() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    try {
      const response = await task(this.service.getRolesForDisplay({}));

      this.setItems(response.roles.map(role => new Role(this, role)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Role',
        message: `Roles Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: FormRole): Promise<Role | null> {
    try {
      const response = await task(this.service.createRole(sanitizeRole(entity)));

      const newRole = new Role(this, response.createRole);

      NotificationHelper.success('create', 'Role');
      this.setItem(newRole);

      return newRole;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Role');
      Sentry.addBreadcrumb({
        category: 'Role',
        data: {
          ...entity,
        },
        message: `Roles Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async update(id: string, entity: FormRole) {
    try {
      const response = await task(this.service.updateRole(id, sanitizeRole(entity)));

      NotificationHelper.success('update', 'Role');
      this.setItem(new Role(this, response.updateRole));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Role');
      Sentry.addBreadcrumb({
        category: 'Role',
        data: {
          id,
          ...entity,
        },
        message: `Roles Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(id: string) {
    try {
      await task(this.service.deleteRole(id));

      this.data.delete(id as unknown as number);
      NotificationHelper.success('delete', 'Role');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Role');
      Sentry.addBreadcrumb({
        category: 'Role',
        data: {
          id,
        },
        message: `Roles Delete Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
