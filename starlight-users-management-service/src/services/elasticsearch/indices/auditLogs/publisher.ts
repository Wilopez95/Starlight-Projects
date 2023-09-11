import { get } from 'lodash';

import { indexAlDocument } from '../../ElasticSearch';

import { logger } from '../../../logger';

/**
 * It takes a schema, an index, and an item, and then indexes the item in the index
 * @param {string} schema - The name of the schema that was used to validate the item.
 * @param {string} index - The name of the index to publish to.
 * @param item - The item to be indexed.
 */
export const publish = (schema: string, index: string, item: Record<string, unknown>): void => {
  logger.debug(`es->auditLog->publish->${index}->schema: ${schema}`);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setImmediate(async () => {
    try {
      await indexAlDocument(index, item);
    } catch (error) {
      logger.error(
        error as Error,
        `Error while indexing item with id: ${get(item, 'entityId') as string}`,
      );
    }
  });
};
