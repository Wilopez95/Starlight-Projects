import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { WayPointService } from '@root/api';
import { IWayPoint } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { WayPointItem } from './WayPoint';

export class WaypointStore extends BaseStore<IWayPoint> {
  private readonly service: WayPointService;

  @observable popupInfo?: IWayPoint;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WayPointService();
    this.popupInfo = undefined;
  }

  @action.bound
  setPopupInfo(data: IWayPoint | undefined) {
    this.popupInfo = data;
  }

  @actionAsync
  async getWayPointsList() {
    try {
      const { haulingDisposalSites } = await task(this.service.getWayPointsList());

      this.setItems(haulingDisposalSites.map(wayPoint => new WayPointItem(this, wayPoint)));

      this.offset += this.limit;
    } catch (error) {
      console.error('Get way points list', error);
    }
  }
}
