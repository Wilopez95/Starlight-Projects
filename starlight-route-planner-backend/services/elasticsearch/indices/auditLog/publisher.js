import { elasticSearch } from '../../ElasticSearch.js';
import { NO_AUDIT_LOG } from '../../../../config.js';

export const publish = ({ ctx, indexName, schemaName, document }) => {
  ctx.logger.debug(`es->auditLog->publish->${indexName}->schema: ${schemaName}`);

  if (NO_AUDIT_LOG) {
    return;
  }

  setImmediate(async () => {
    try {
      await elasticSearch.indexDocument(ctx, indexName, document);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing audit log entity with id ${document.entityId}`);
    }
  });
};
