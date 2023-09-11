import { computed } from 'mobx';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IPromo, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { PromoStore } from './PromoStore';

export class Promo extends BaseEntity implements IPromo {
  active: boolean;
  code: string;
  description: string | null;
  note: string | null;
  startDate: Date | null;
  endDate: Date | null;
  store: PromoStore;
  businessLineId: string;
  businessUnitId: string;

  constructor(store: PromoStore, entity: JsonConversions<IPromo>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.code = entity.code;
    this.note = entity.note;
    this.businessLineId = entity.businessLineId;
    this.businessUnitId = entity.businessUnitId;

    this.startDate = entity.startDate ? substituteLocalTimeZoneInsteadUTC(entity.startDate) : null;
    this.endDate = entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null;
  }

  @computed
  get name() {
    return `${this.code}${this.description ? `/${this.description}` : ''}`;
  }

  @computed
  get nameWithNote() {
    return `${this.code}${this.description ? `/${this.description}` : ''} ${
      this.note ? ` (${this.note})` : ''
    }`;
  }
}
