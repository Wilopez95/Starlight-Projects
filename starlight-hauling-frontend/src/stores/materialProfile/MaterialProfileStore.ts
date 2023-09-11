import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';
import { IMaterialProfile } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { MaterialProfileService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { MaterialProfile } from './MaterialProfile';
import { RequestOptions } from './types';

export class MaterialProfileStore extends ConfigurationDataBaseStore<MaterialProfile> {
  private readonly service: MaterialProfileService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new MaterialProfileService();
  }

  @actionAsync
  async request({ activeOnly, materials, disposals, businessLineId }: RequestOptions) {
    this.loading = true;

    this.cleanup();

    try {
      const materialProfileResponse = await task(
        this.service.get({ activeOnly, materials, disposals, businessLineId }),
      );

      this.setItems(
        materialProfileResponse.map(materialProfile => new MaterialProfile(this, materialProfile)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'MaterialProfile',
        data: {
          activeOnly,
          materials,
          disposals,
          businessLineId,
        },
        message: `Material Profiles Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: IMaterialProfile) {
    try {
      const newMaterialProfile = await task(this.service.create(entity));

      this.setItem(new MaterialProfile(this, newMaterialProfile));
      NotificationHelper.success('create', 'Material Profile');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Material Profile',
      );
      Sentry.addBreadcrumb({
        category: 'MaterialProfile',
        data: {
          ...entity,
        },
        message: `Material Profiles Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const materialProfile = new MaterialProfile(this, response);

      this.setItem(materialProfile);
      this.selectEntity(materialProfile);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'MaterialProfile',
        data: {
          id,
        },
        message: `Material Profiles Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: IMaterialProfile) {
    try {
      this.clearPreconditionFailedError();
      const newMaterialProfile = await task(this.service.update(entity.id, entity));

      this.setItem(new MaterialProfile(this, newMaterialProfile));
      NotificationHelper.success('update', 'Material Profile');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(entity.id));
      }
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Material Profile',
      );
      Sentry.addBreadcrumb({
        category: 'MaterialProfile',
        data: {
          ...entity,
        },
        message: `Material Profiles Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
