import { elasticSearch } from '../../../services/elasticsearch';
import { QueryContext } from '../../../types/QueryContext';
import { BaseEntity } from '../../../entities/BaseEntity';
import { getIndexName } from '../decorators/ElasticSearch';

export const getIndex = async <E extends typeof BaseEntity = typeof BaseEntity>(
  ctx: QueryContext,
  Entity: E,
): Promise<string> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Context userInfo not found');
  }

  const { metadata } = ctx[Entity.name].getRepository();
  const index = getIndexName(ctx.userInfo.resource, metadata.tableName);

  const exists = await elasticSearch.indexExists(index);

  if (!exists) {
    throw new Error(`ElasticSearch index ${index} not found`);
  }

  return index;
};
