import { IEntity } from './entity';
import { IMedia, WEIGHT_UNIT_ENUM } from './workOrder';

export interface IWeightTicket extends IEntity {
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
}
