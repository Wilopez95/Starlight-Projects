import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';

import { BusinessLineService } from '../../api';
import { BaseStore } from '../base/BaseStore';

import { BusinessLine } from './BusinessLine';

export class BusinessLineStore extends BaseStore<any> {
  private readonly service: BusinessLineService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new BusinessLineService();
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      this.setItems((await task(this.service.get())).map((unit) => new BusinessLine(this, unit)));
    } catch (error) {
      console.error('BusinesUnit Request Error:', error);
    }

    this.loading = false;
  }

  isRollOffType(id: string | number) {
    const numberId = +id;
    const rollOfItem = this.values.find((item) => {
      if (item.id === numberId) {
        return item.type === 'rollOff';
      }

      return false;
    });

    return !!rollOfItem;
  }
}
