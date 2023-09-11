import { Queue } from 'bullmq';
import { client } from '../../../services/redis';
import { EventListenerType } from '../../../services/observableEntity';
import { QueryContext } from '../../../types/QueryContext';

export const QUEUE_NAME = 'recycling:populate-order-indexed';

export interface PopulateOrderIndexed {
  orderId: number;
  indexName: string;
  primaryId: string;
  eventType: EventListenerType;
  resource: string;
  ctx: QueryContext;
  makeAuditLog: boolean;
}

export const populateOrderIndexedQueue = new Queue(QUEUE_NAME, {
  connection: client,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});
