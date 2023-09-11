import { actionAsync, task } from 'mobx-utils';

import { BusinessUnitService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { BusinessUnit } from './BusinessUnit';

export class BusinessUnitStore extends BaseStore<BusinessUnit> {
  private readonly service: BusinessUnitService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new BusinessUnitService();
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      const businessUnitsResponse = await task(this.service.get());

      this.setItems(businessUnitsResponse.map(unit => new BusinessUnit(this, unit)));
    } catch (error) {
      console.error('BusinessUnit Request Error:', error);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number | string) {
    this.loading = true;

    try {
      const unit = await task(this.service.getById(+id));
      const entity = new BusinessUnit(this, unit);

      this.setItem(entity);

      return entity;
    } catch (error) {
      console.error(`BusinessUnitsStore.getById(${id}) Error:`, error);
    }

    this.loading = false;
  }
}
