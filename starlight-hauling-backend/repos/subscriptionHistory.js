import { SORT_ORDER } from '../consts/sortOrders.js';
import { SUBSCRIPTION_HISTORY_DEFAULT_SORTING } from '../consts/subscriptionHistoryAttributes.js';
import { SUBSCTIPTION_HISTORY_ACTION } from '../consts/subscriptionHistoryActions.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'subscription_history';

class SubscriptionHistoryRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated(
    {
      condition: {
        madeByIds,
        createdAtFrom,
        createdAtTo,
        effectiveDateFrom,
        effectiveDateTo,
        ...filters
      } = {},
      skip,
      limit,
      sortBy = SUBSCRIPTION_HISTORY_DEFAULT_SORTING,
      sortOrder = SORT_ORDER,
      fields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(filters)
      .orderBy(sortBy, sortOrder);

    if (madeByIds?.length) {
      query.whereIn('madeById', madeByIds);
    }

    if (createdAtFrom) {
      query = query.andWhere('createdAt', '>=', createdAtFrom);
    }

    if (createdAtTo) {
      query = query.andWhere('createdAt', '<=', createdAtTo);
    }

    if (effectiveDateFrom) {
      query = query.andWhere('effectiveDate', '>=', effectiveDateFrom);
    }

    if (effectiveDateTo) {
      query = query.andWhere('effectiveDate', '<=', effectiveDateTo);
    }

    if (limit) {
      query = query.limit(limit);
    }
    if (skip) {
      query = query.offset(skip);
    }

    const items = await query;

    return items ?? [];
  }

  async getAvailableFilters(subscriptionId, trx = this.knex) {
    const baseQuery = trx(this.tableName).withSchema(this.schemaName).where({ subscriptionId });
    const promises = [];

    promises.push(
      baseQuery.clone().select(['madeById', 'madeBy']).groupBy(['madeById', 'madeBy']),
      baseQuery
        .clone()
        .select([trx.raw('array_agg(distinct ??) as ??', ['entity', 'entity'])])
        .where({ action: SUBSCTIPTION_HISTORY_ACTION.added })
        .first(),
      baseQuery
        .clone()
        .select([trx.raw('array_agg(distinct ??) as ??', ['attribute', 'attribute'])])
        .where({ action: SUBSCTIPTION_HISTORY_ACTION.changed })
        .first(),
      baseQuery
        .clone()
        .select([trx.raw('array_agg(distinct ??) as ??', ['entity', 'entity'])])
        .where({ action: SUBSCTIPTION_HISTORY_ACTION.removed })
        .first(),
      baseQuery
        .clone()
        .select([trx.raw('array_agg(distinct ??) as ??', ['entityAction', 'entityAction'])])
        .where({ action: SUBSCTIPTION_HISTORY_ACTION.other })
        .first(),
    );

    const [madeBy, added, changed, removed, other] = await Promise.all(promises);

    return {
      madeBy,
      added,
      changed,
      removed,
      other,
    };
  }
}

SubscriptionHistoryRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionHistoryRepository;
