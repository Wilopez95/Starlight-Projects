import { type Point } from 'geojson';
import { action, computed } from 'mobx';

import {
  type IAddress,
  type IDisposalSite,
  type JsonConversions,
  type WaypointType,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { DisposalSiteStore } from './DisposalSiteStore';

export class DisposalSite extends BaseEntity implements IDisposalSite {
  active: boolean;
  description: string;
  waypointType: WaypointType;
  address: IAddress;
  location: Point;
  hasStorage: boolean;
  hasWeighScale: boolean;
  recycling: boolean;
  businessUnitId?: number;
  recyclingTenantName?: string;

  store: DisposalSiteStore;

  @computed
  get fullAddress() {
    return Object.values(this.address)
      .filter((item: keyof IAddress) => item && !!item.trim())
      .join(', ');
  }

  constructor(store: DisposalSiteStore, entity: JsonConversions<IDisposalSite>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.active = entity.active;
    this.description = entity.description;
    this.waypointType = entity.waypointType;
    this.address = entity.address;
    this.location = entity.location;
    this.hasStorage = entity.hasStorage;
    this.hasWeighScale = entity.hasWeighScale;
    this.recycling = entity.recycling;
    this.businessUnitId = entity.businessUnitId;
    this.recyclingTenantName = entity.recyclingTenantName;
  }

  @action.bound openMapping() {
    this.store.openMapping(this);
  }

  @action.bound openRates() {
    this.store.openRates(this);
  }
}
