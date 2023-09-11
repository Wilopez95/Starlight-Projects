import * as Sentry from '@sentry/react';
import { computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base/types';
import { NotificationHelper } from '@root/helpers';
import { IMaterial } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { MaterialService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Material } from './Material';
import { RequestOptions } from './types';

export class MaterialStore extends ConfigurationDataBaseStore<Material> {
  private readonly service: MaterialService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new MaterialService();
  }

  @actionAsync
  async request(options: RequestOptions = {}, skipEquipmentLoading = false) {
    this.loading = true;
    const loadEquipment = () =>
      skipEquipmentLoading
        ? Promise.resolve()
        : this.globalStore.equipmentItemStore.request({
            businessLineId: options.businessLineId,
            activeOnly: options.activeOnly,
          });
    let materials;
    try {
      const [materialResponse] = await task(
        Promise.all([this.service.get(options), loadEquipment()]),
      );
      materials = materialResponse.map(material => new Material(this, material));
      this.setItems(materials);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Material',
        data: {
          ...options,
        },
        message: `Materials Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return materials;
  }

  @actionAsync
  async requestByEquipmentItem(equipmentItemId: number, options?: RequestQueryParams) {
    this.loading = true;

    this.cleanup();

    try {
      const materialResponse = await task(
        this.service.getByEquipmentItem(equipmentItemId, options),
      );
      const materials = materialResponse.map(material => new Material(this, material));

      this.setItems(materials);
      this.loading = false;

      return materials;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Material',
        data: {
          equipmentItemId,
          ...options,
        },
        message: `Materials Request By Equipment Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: IMaterial) {
    try {
      const newMaterial = await task(this.service.create(entity));

      this.setItem(new Material(this, newMaterial));
      NotificationHelper.success('create', 'Material');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('createMaterial', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Material',
        data: {
          ...entity,
        },
        message: `Materials Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    try {
      const material = await task(this.service.getById(id));
      const materialEntity = new Material(this, material);

      this.setItem(materialEntity);
      this.selectEntity(materialEntity);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Material',
        data: {
          id,
        },
        message: `Materials Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(entity: IMaterial) {
    try {
      this.clearPreconditionFailedError();
      const newMaterial = await task(this.service.update(entity.id, entity));

      this.setItem(new Material(this, newMaterial));
      NotificationHelper.success('update', 'Material');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(entity.id);
      }
      NotificationHelper.error('updateMaterial', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Material',
        data: {
          ...entity,
        },
        message: `Materials Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @computed
  get sortedValuesByAlphabet() {
    const activeAndManifestedValues = this.values.filter(value => value.active && value.manifested);

    return this.sortValues('description', 'asc', activeAndManifestedValues);
  }
}
