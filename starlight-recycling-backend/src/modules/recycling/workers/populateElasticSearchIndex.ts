import { isEmpty, isNumber } from 'lodash';

import {
  PopulateElasticSearchIndexEvent,
  populateElasticSearchIndexQueue,
  QUEUE_NAME,
} from '../queues/populateElasticSearchIndex';
import { getResources, ResourceType } from '../../../services/ums/resources';
import { elasticSearchEntities } from '../decorators/ElasticSearch';
import { createWorker } from './workerWithLogger';
import { populateEntityQueue } from '../queues/populateEntity';
import { createAuditLogTemplate } from './utils/createAuditLogTemplate';

populateElasticSearchIndexQueue.add('populate-elastic-search-index', {});

export const worker = createWorker<PopulateElasticSearchIndexEvent>(QUEUE_NAME, async (job) => {
  let totalProcessed = 0;
  let total = 0;
  const forceReindex = job.data.forceReindex ?? false;

  await createAuditLogTemplate(job);

  do {
    if (!total) {
      job.info('Fetch first batch');
    } else {
      job.info(`Fetching next batch with offset ${totalProcessed}`);
    }

    const recyclingResourcesBatch = await getResources({
      offset: totalProcessed,
      filter: {
        type: ResourceType.RECYCLING,
      },
    });

    totalProcessed += recyclingResourcesBatch.data.length;

    const entitiesValues = Object.values(elasticSearchEntities);

    if (totalProcessed === 0 || entitiesValues.length === 0) {
      break;
    }

    if (!total) {
      total = recyclingResourcesBatch.total;
      job.info(`Found ${total} recycling resources`);
    }

    const step = Math.floor(100 / total);

    for (const recyclingResource of recyclingResourcesBatch.data) {
      try {
        job.info(`Start populating elastic search indexes for ${recyclingResource.srn}'`);

        for (const obj of entitiesValues) {
          const [Entity] = obj;

          populateEntityQueue.add('populate-entity', {
            resource: recyclingResource.srn,
            name: Entity.name,
            forceReindex: forceReindex,
          });
        }

        if (isNumber(job.progress)) {
          await job.updateProgress(job.progress + step);
        }
      } catch (e) {
        job.error(
          e,
          `Failed to to populate elastic resource srn=${recyclingResource.srn}: ${e.message}`,
        );
      }
    }

    if (isEmpty(recyclingResourcesBatch.data)) {
      break;
    }
  } while (totalProcessed !== total);

  await job.updateProgress(100);
  job.info('Finished');
});
