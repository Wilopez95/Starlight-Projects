import { TENANT_INDEX } from '../../consts/searchIndices';
import { Context } from '../../Interfaces/Auth';
import { ISearchParams } from '../../Interfaces/ElasticSearch';
import { ISubscriptionExtends } from '../../Interfaces/Subscriptions';
import { applyTenantToIndex, search } from './elasticSearch';

export const searchSubscriptionsES = async (
  ctx: Context,
  schemaName: string,
  conditions: ISearchParams,
) => {
  return search<ISubscriptionExtends>(
    ctx,
    TENANT_INDEX.subscriptions,
    applyTenantToIndex(TENANT_INDEX.subscriptions, schemaName),
    conditions,
  );
};
