import { parseDate } from '@root/helpers';
import {
  type IMedia,
  type IWeightTicket,
  type JsonConversions,
  type WEIGHT_UNIT_ENUM,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { WeightTicketStore } from './WeightTicketStore';

export class WeightTicket extends BaseEntity implements IWeightTicket {
  store: WeightTicketStore;
  id: number;
  ticketNumber: string;
  loadValue: number;
  weightUnit: WEIGHT_UNIT_ENUM;
  dailyRouteId: number;
  media: IMedia;
  materialId?: number;
  disposalSiteId?: number;
  arrivalTime?: Date;
  departureTime?: Date;
  timeOnLandfill?: Date;
  authorName?: string;

  constructor(store: WeightTicketStore, entity: JsonConversions<IWeightTicket>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.ticketNumber = entity.ticketNumber;
    this.disposalSiteId = entity.disposalSiteId;
    this.loadValue = entity.loadValue;
    this.weightUnit = entity.weightUnit;
    this.materialId = entity.materialId;
    this.media = entity.media;
    this.dailyRouteId = entity.dailyRouteId;
    this.arrivalTime = parseDate(entity.arrivalTime);
    this.departureTime = parseDate(entity.departureTime);
    this.timeOnLandfill = parseDate(entity.timeOnLandfill);
    this.authorName = entity.authorName;
  }
}
