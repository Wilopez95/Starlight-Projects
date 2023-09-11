import { Geometry } from 'geojson';

import { type IServiceArea, type JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ServiceAreaStore } from './ServiceAreaStore';

export class ServiceArea extends BaseEntity implements IServiceArea {
  active: boolean;
  name: string;
  description: string;
  businessUnitId: string;
  businessLineId: string;
  geometry: Geometry;
  defaultMatch?: boolean;

  store: ServiceAreaStore;

  constructor(
    store: ServiceAreaStore,
    entity: JsonConversions<IServiceArea>,
    defaultMatch?: boolean,
  ) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.name = entity.name;
    this.description = entity.description;
    this.businessUnitId = entity.businessUnitId;
    this.businessLineId = entity.businessLineId;
    this.geometry = entity.geometry;
    this.defaultMatch = defaultMatch;
  }
}
