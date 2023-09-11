import { Context } from '../../../../../types/Context';
import Order, { OrderStatus } from '../../../entities/Order';
import getContextualizedEntity from '../../../../../utils/getContextualizedEntity';
import { elasticSearch, UpdateByQueryResponse } from '../../../../../services/elasticsearch';
import { getIndexName } from '../../../decorators/ElasticSearch';

export const updateElasticHaulingOrdersByQuery = async (
  ctx: Context,
  status: OrderStatus,
  haulingOrderIds: number[],
): Promise<void> => {
  const ContextualizedEntity = getContextualizedEntity(Order)(ctx);
  const { metadata } = ContextualizedEntity.getRepository();

  const response = await elasticSearch.client.updateByQuery<UpdateByQueryResponse>({
    index: getIndexName(ctx.userInfo.resource!, metadata.tableName),
    refresh: true,
    body: {
      script: {
        lang: 'painless',
        source: `ctx._source["status"] = "${status}"`,
      },
      query: {
        terms: {
          haulingOrderId: haulingOrderIds,
        },
      },
    },
  });

  if (response.body.failures?.length) {
    ctx.log.error(response.body.failures, 'Failed to update elastic orders');
  }
  ctx.log.info(`Updated ${response.body.updated}, took ${response.body.took}ms`);
};
