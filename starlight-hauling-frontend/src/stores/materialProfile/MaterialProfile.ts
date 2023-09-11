import { computed } from 'mobx';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IMaterialProfile, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { MaterialProfileStore } from './MaterialProfileStore';

export class MaterialProfile extends BaseEntity implements IMaterialProfile {
  active: boolean;
  description: string;
  materialId: number;
  disposalSiteId: number;
  expirationDate: Date | null;
  businessLineId: string;
  store: MaterialProfileStore;
  materialDescription?: string;
  disposalSiteDescription?: string;

  constructor(store: MaterialProfileStore, entity: JsonConversions<IMaterialProfile>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.businessLineId = entity.businessLineId;
    this.materialId = entity.materialId;
    this.materialDescription = entity.materialDescription;
    this.disposalSiteId = entity.disposalSiteId;
    this.disposalSiteDescription = entity.disposalSiteDescription;

    this.expirationDate = entity.expirationDate
      ? substituteLocalTimeZoneInsteadUTC(entity.expirationDate)
      : null;
  }

  @computed
  get material() {
    return this.store.globalStore.materialStore.values.find(
      material => material.id === this.materialId,
    );
  }

  @computed
  get disposalSite() {
    return this.store.globalStore.disposalSiteStore.values.find(
      disposalSite => disposalSite.id === this.disposalSiteId,
    );
  }
}
