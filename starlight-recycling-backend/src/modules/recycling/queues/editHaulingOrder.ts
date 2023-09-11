import { Queue } from 'bullmq';
import Me from '../../../types/Me';
import { client } from '../../../services/redis';

export const QUEUE_NAME = 'recycling:edit-hauling-order';

export interface EditHaulingOrderEvent {
  orderId: number;
  resource: string;
  userInfo: Me;
  reqId?: string;
}

export const editHaulingOrderQueue = new Queue(QUEUE_NAME, {
  connection: client,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
