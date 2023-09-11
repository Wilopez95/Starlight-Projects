import { computed } from 'mobx';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { JsonConversions } from '@root/types';
import { IPermit } from '@root/types/entities/permit';
import { IResponsePermit } from '@root/types/responseEntities';

import { BaseEntity } from '../base/BaseEntity';

import { PermitStore } from './PermitStore';

export class Permit extends BaseEntity implements IPermit {
  jobSiteId: number;
  number: string;
  expirationDate: Date;
  active: boolean;
  businessLineId: string;
  businessUnitId: string;
  store: PermitStore;

  constructor(store: PermitStore, entity: JsonConversions<IResponsePermit>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.number = entity.number;
    this.jobSiteId = entity.jobSiteId;
    this.businessLineId = entity.businessLineId;
    this.businessUnitId = entity.businessUnitId;
    this.expirationDate = substituteLocalTimeZoneInsteadUTC(entity.expirationDate);

    this.active = entity.active;
  }

  @computed
  get jobSite() {
    return this.store.globalStore.jobSiteStore.getById(this.jobSiteId);
  }
}
