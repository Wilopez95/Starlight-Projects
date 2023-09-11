import { Queue } from 'bullmq';
import { client } from '../../../services/redis';

export const QUEUE_NAME = 'recycling:populate-elastic-search-index';

export interface PopulateElasticSearchIndexEvent {
  forceReindex?: boolean;
}

export const populateElasticSearchIndexQueue = new Queue<PopulateElasticSearchIndexEvent>(
  QUEUE_NAME,
  {
    connection: client,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  },
);
