import { Queue } from 'bullmq';
import { client } from '../../../services/redis';

export const QUEUE_NAME = 'recycling:post-lacked-orders-audit-log-to-hauling';

export interface PostOrderAuditLogToHaulingEvent {
  recyclingOrderId: number;
  haulingOrderId: number;
  entityName: string;
  resource: string;
  userId: string;
  requestId: string;
}

export const postLackedOrdersAuditLogToHauling = new Queue(QUEUE_NAME, {
  connection: client,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});
