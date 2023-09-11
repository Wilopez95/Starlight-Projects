import { indexAlDocument } from '../../ElasticSearch.js';

import { NO_AUDIT_LOG } from '../../../../config.js';

export const publish = (ctx, schema, index, item) => {
  ctx.logger.debug(`es->auditLog->publish->${index}->schema: ${schema}`);

  if (NO_AUDIT_LOG) {
    return;
  }

  setImmediate(async () => {
    try {
      await indexAlDocument(ctx, index, item);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing audit log entity with id ${item.entityId}`);
    }
  });
};
