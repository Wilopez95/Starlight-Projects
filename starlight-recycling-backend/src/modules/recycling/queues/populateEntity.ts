import { Queue } from 'bullmq';
import { client } from '../../../services/redis';

export const QUEUE_NAME = 'recycling:populate-entity';

export interface PopulateEntity {
  resource: string;
  name: string;
  forceReindex?: boolean;
}

export const populateEntityQueue = new Queue<PopulateEntity>(QUEUE_NAME, {
  connection: client,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});
