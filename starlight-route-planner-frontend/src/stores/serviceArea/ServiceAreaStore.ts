import { computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ServiceAreaService } from '@root/api/serviceArea/serviceArea';
import { IServiceArea } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { ServiceArea } from './ServiceArea';

export class ServiceAreaStore extends BaseStore<IServiceArea> {
  private readonly service: ServiceAreaService;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new ServiceAreaService();
  }

  @actionAsync
  async getHaulingServiceAreas(businessUnitId: number, businessLineIds: number[]) {
    this.loading = true;

    try {
      const { haulingServiceAreas } = await task(
        this.service.getHaulingServiceAreas(businessUnitId, businessLineIds),
      );

      this.setItems(haulingServiceAreas.map(serviceArea => new ServiceArea(this, serviceArea)));
    } catch (error) {
      console.error('Service Areas fetching error: ', error);
    } finally {
      this.loading = false;
    }
  }

  @computed
  get getDropdownOptions() {
    return this.values.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
  }
}
