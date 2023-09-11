import { AMQP_QUEUE_TRUCK_ON_WAY } from '../../config';
import { share, map } from 'rxjs/operators';
import { observeOn } from '../queue';

export enum TruckOnWayEventType {
  goingToFill = 'goingToFill',
  canceled = 'canceled',
  completed = 'completed',
}

export interface TruckOnWayOrderEvent {
  userId: string;
  tenantName: string;
  woNumber: number;
  haulingOrderId: string;
  eventName: TruckOnWayEventType;
}

export const truckOnWayOrderObservable = observeOn<TruckOnWayOrderEvent>({
  type: AMQP_QUEUE_TRUCK_ON_WAY,
}).pipe(
  map((message) => message.payload),
  share(),
);
