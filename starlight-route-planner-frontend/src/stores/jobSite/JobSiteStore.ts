import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { JobSiteService } from '@root/api';

import { IJobSiteStore } from '@root/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { JobSiteStoreCount } from './types';

export class JobSiteStore extends BaseStore<IJobSiteStore> {
  private readonly service: JobSiteService;

  @observable counts?: JobSiteStoreCount;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new JobSiteService();
  }

  @actionAsync
  async requestCount() {
    try {
      const counts = await task(this.service.getCount());

      this.counts = counts;
    } catch (error) {
      console.error('Customer Count Request Error:', error);
    }
  }

  @action
  cleanup() {
    super.cleanup();
  }
}
