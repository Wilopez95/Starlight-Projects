import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import { populateUserNames } from '../services/ums.js';

import { mathRound2 } from '../utils/math.js';

import { EVENT_TYPE } from '../consts/historicalEventType.js';
import VersionedRepository from './_versioned.js';

const getDeltaByAttributes = (newObj, prevObj, attrs, toNumber) =>
  attrs
    .map(attr => ({
      id: newObj.id,
      userId: newObj.userId,
      attribute: attr,
      timestamp: newObj.createdAt,

      newValue:
        // eslint-disable-next-line no-nested-ternary
        newObj.eventType === EVENT_TYPE.deleted
          ? null
          : toNumber
          ? mathRound2(Number(newObj[attr] || 0))
          : newObj[attr],

      previousValue:
        // eslint-disable-next-line no-nested-ternary
        !prevObj ||
        prevObj.eventType === EVENT_TYPE.deleted ||
        newObj.eventType === EVENT_TYPE.created
          ? null
          : toNumber
          ? mathRound2(Number(prevObj[attr] || 0))
          : prevObj[attr],
    }))
    .filter(item => item.newValue !== item.previousValue);

const sortByTimestamp = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);

class RatesRepository extends VersionedRepository {
  mapFields(originalObj) {
    return compose(
      obj => {
        Object.entries(obj).forEach(([key, value]) => {
          const lower = key.toLowerCase();
          if (lower.endsWith('limit') || lower.endsWith('price')) {
            obj[key] = Number(value || 0);
          }
        });
        return obj;
      },
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async getAll({ condition, fields } = {}) {
    const items = await super.getAll({ condition, fields });

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getOne({ condition, fields } = {}) {
    const result = await this.getAll({ condition, fields });
    try {
      return result[0];
    } catch {
      return null;
    }
  }

  async getBy({ condition, fields = ['*'] } = {}, trx) {
    const rate = await super.getBy({ condition, fields }, trx);

    return rate ? this.mapFields(rate) : null;
  }

  getByLineItemIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('lineItemId', ids)
      .andWhere(condition)
      .select(fields);
  }

  async getByLineItemMappedIds(
    { condition = {}, mappedIds = [], fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const items = await Promise.all(
      mappedIds.map(({ lineItemId, materialId = null }) =>
        super.getBy(
          {
            condition: {
              lineItemId,
              materialId,
              ...condition,
            },
            fields,
          },
          trx,
        ),
      ),
    );

    return items?.filter(Boolean) ?? [];
  }

  getByServiceItemIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('billableServiceId', ids)
      .andWhere(condition)
      .select(fields);
  }

  static async getHistoricalRecords(
    {
      schemaName,
      tableName,
      attributes,
      // skip,
      // limit,
      condition,
    } = {},
    toNumber,
    ctx,
  ) {
    const { notNullConditions, nullConditions } = Object.entries(condition).reduce(
      (res, [key, value]) => {
        if (value === null || value === 'null') {
          res.nullConditions.push(key);
        } else {
          res.notNullConditions[key] = value;
        }
        return res;
      },
      { notNullConditions: {}, nullConditions: [] },
    );

    const fields = ['id', 'eventType', 'userId', 'traceId', 'createdAt'].concat(attributes);

    let query = this.knex(tableName).withSchema(schemaName).select(fields).orderBy('id', 'desc');

    if (!isEmpty(notNullConditions)) {
      query = query.where(notNullConditions);
    }
    if (!isEmpty(nullConditions)) {
      nullConditions.forEach(key => {
        query = query.whereNull(key);
      });
    }

    const items = await query;

    if (!items?.length) {
      return [];
    }

    // compare prev & new values
    const comparedItems = items.flatMap((item, i) =>
      getDeltaByAttributes(item, items[i + 1], attributes, toNumber),
    );

    if (comparedItems.length) {
      await populateUserNames(comparedItems, ctx);
    }

    return comparedItems.sort(sortByTimestamp);
  }
}

export default RatesRepository;
