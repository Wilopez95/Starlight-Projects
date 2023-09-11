import { indexAlDocument } from '../../ElasticSearch.js';

import { logger } from '../../../../utils/logger.js';

export const publish = (schema, index, item) => {
  logger.debug(`es->auditLog->publish->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await indexAlDocument(index, item);
    } catch (error) {
      logger.error(error, `Error while indexing audit log entity with id ${item.entityId}`);
    }
  });
};
