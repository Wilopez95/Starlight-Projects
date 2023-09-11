import * as Sentry from '@sentry/react';
import { computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ResourceService } from '@root/api';
import { ResourceType } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import type GlobalStore from '../GlobalStore';

import { Resource } from './Resource';

export class ResourceStore {
  private service = new ResourceService();

  private globalStore: GlobalStore;

  @observable private data = new Map<string, Resource>();
  @observable loading = false;

  constructor(global: GlobalStore) {
    this.globalStore = global;
  }

  @actionAsync
  async request(): Promise<void> {
    this.loading = true;

    try {
      await task(this.globalStore.businessUnitStore.request());

      const resources = await task(this.service.getResources());

      resources.forEach(resource => {
        const srnParts = Resource.parseSrn(resource.srn);

        const label =
          srnParts[2] === 'global'
            ? undefined
            : this.globalStore.businessUnitStore.getById(srnParts[2])?.nameLine1;

        this.data.set(resource.srn, new Resource({ ...resource, label }));
      });
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Resource',
        message: `Resources Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @computed
  get values(): Resource[] {
    return Array.from(this.data.values());
  }

  get configurableResourceTypes(): Exclude<ResourceType, ResourceType.GLOBAL>[] {
    return [ResourceType.HAULING, ResourceType.RECYCLING];
  }
}
