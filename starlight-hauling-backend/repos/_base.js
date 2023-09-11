import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';
import pick from 'lodash/pick.js';
import map from 'lodash/map.js';
import difference from 'lodash/difference.js';

import knex from '../db/connection.js';
import config from '../db/config.js';

import { getCacheOf, CACHE_MAP } from '../services/cache.js';
import { logger as pinoLogger } from '../utils/logger.js';
import * as auditLog from '../services/auditLog.js';

import { mergeArrays, stringOf } from '../utils/arrays.js';
import isProperObject from '../utils/isProperObject.js';
import { camelCaseKeys } from '../utils/dbHelpers.js';
import { mathRound2 } from '../utils/math.js';
import { generateTraceId } from '../utils/generateTraceId.js';

import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from '../consts/auditLog.js';

const cachedTableColumns = getCacheOf(CACHE_MAP.TABLE_COLUMNS);

const UNPARSED_COLUMNS_PREFIX = 'zzz';
const UNPARSED_COLUMNS_SUFFIX = 'dot';

const numericFields = ['quantity', 'price', 'limit', 'total', 'amount', 'balance'];
const numericFieldRegex = new RegExp(`(${numericFields.join('|')})$`, 'i');
const isNumericField = key => numericFieldRegex.test(key);

const getColumns = async ({ tableName, schemaName }) => {
  if (!cachedTableColumns.has(tableName)) {
    const items = await knex('columns')
      .withSchema('informationSchema')
      .where({
        tableSchema: schemaName,
        tableName,
      })
      .select('columnName');

    if (items?.length) {
      cachedTableColumns.set(
        tableName,
        items.map(({ columnName }) => columnName),
      );
    }
  }
  return cachedTableColumns.get(tableName);
};

class BaseRepository {
  constructor(ctxState, { schemaName, tableName } = {}) {
    this.ctxState = ctxState;
    this.schemaName = schemaName ?? ctxState.schemaName;
    this.tableName = tableName;

    this.userId = ctxState.userId ?? ctxState.user?.userId ?? 'system';

    this.upsertConstraints = [];
    this.upsertOnConflict = '';
    this.excludeKeyOnUpsert = '';

    // for convenience and shortcut
    this.knex = knex;
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  static getInstance(ctxState = {}, { schemaName, tableName } = {}) {
    const schema =
      schemaName ||
      this.SCHEMA_NAME ||
      ctxState?.user?.schemaName ||
      ctxState?.user?.tenantName ||
      '';
    const table = tableName || this.TABLE_NAME;
    const copiedCtxState = { ...ctxState };

    if (!copiedCtxState.user) {
      copiedCtxState.user = { schemaName: schema };
    } else {
      copiedCtxState.user = {
        ...copiedCtxState.user,
        schemaName: schema,
      };
    }

    copiedCtxState.reqId = ctxState.reqId || generateTraceId();

    if (ctxState.reqId && !ctxState.logger) {
      copiedCtxState.logger = pinoLogger.child({ reqId: copiedCtxState.reqId });
    }

    const instance = new this(copiedCtxState, { schemaName: schema, tableName: table });

    return instance;
  }

  static get knex() {
    return knex;
  }

  get constraints() {
    return this.upsertConstraints;
  }

  mapFields(obj) {
    return obj;
  }

  mapNestedObjects(excludeFields = [], obj) {
    // all fields applied since joins' result must be camel-cased
    Object.entries(obj)
      .filter(([key]) => !excludeFields.includes(key))
      .forEach(([key, value]) => {
        if (isProperObject(value)) {
          delete value.event_type;
          delete value.eventType;

          obj[key] = camelCaseKeys(value);

          // kind of recursive camel-casing (1 level more only)
          Object.entries(value)?.forEach(([_key, _value]) => {
            if (isProperObject(_value)) {
              value[_key] = camelCaseKeys(_value);
            } else if (isNumericField(_key.toLowerCase())) {
              value[_key] = mathRound2(Number(_value) || 0);
            }
          });
        } else if (Array.isArray(value) && isProperObject(value[0])) {
          value.forEach((item, i) => (value[i] = camelCaseKeys(item)));
        } else if (isNumericField(key.toLowerCase())) {
          obj[key] = mathRound2(Number(value) || 0);
        }
      });
    return obj;
  }

  mapJoinedFields(obj) {
    // parsed in custom way aggregated fields of the joined tables intead of json_agg
    // bcz json_agg sucks in performance a lot when date is a lot
    const fieldsToDestruct = [];

    Object.entries(obj)
      .filter(([key]) => key.startsWith(UNPARSED_COLUMNS_PREFIX))
      .forEach(([key, value]) => {
        const prop = key.slice(3);
        const [tableName, column] = prop
          .replace('Dot', UNPARSED_COLUMNS_SUFFIX)
          .split(UNPARSED_COLUMNS_SUFFIX);
        // ugly thing with [0] to maintain other current parsing
        if (!obj[tableName]?.[0]) {
          obj[tableName] = [{}];
        }
        obj[tableName][0][column] = value;
        delete obj[key];
        fieldsToDestruct.push(tableName);
      });

    // filter out empty "populated" objects
    Object.entries(obj)
      .filter(([key]) => fieldsToDestruct.includes(key))
      .forEach(([key, [value]]) => {
        if ('id' in value && value.id === null) {
          delete obj[key];
        } else {
          obj[key] = value;
        }
      });

    return obj;
  }

  // TODO: remove this when price refactoring is finished
  mapFieldsWithPrefixRefactored(obj) {
    const prefix = 'refactored';

    const getPropWithoutPrefix = (key, prefixToRemove) => {
      let prop = key.replace(prefixToRemove, '');

      const [firstCharacterOfKey] = prop;

      prop = prop.replace(firstCharacterOfKey, firstCharacterOfKey.toLowerCase());

      return prop;
    };

    const fieldsToDestruct = Object.entries(obj).filter(([key]) => {
      if (key.startsWith(prefix)) {
        const prop = getPropWithoutPrefix(key, prefix);

        return Object.keys(obj).includes(prop);
      }

      return false;
    });

    Object.keys(obj)
      .filter(key => fieldsToDestruct.includes(key))
      .forEach(key => {
        delete obj[key];
      });

    Object.entries(obj)
      .filter(([key]) => key.startsWith(prefix))
      .forEach(([key, value]) => {
        const prop = getPropWithoutPrefix(key, prefix);

        delete obj[key];
        obj[prop] = value;
      });

    return obj;
  }

  getAll({ condition = {}, fields = ['*'], orderBy = [] } = {}, trx = knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .where(condition)
      .select(fields)
      .orderBy(orderBy);
  }

  getAllPaginated(
    { condition = {}, skip = 0, limit = 25, fields = ['*'], orderBy = [] } = {},
    trx = knex,
  ) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .limit(limit)
      .offset(skip)
      .where(condition)
      .select(fields)
      .orderBy(orderBy);
  }

  getAllByIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('id', ids)
      .andWhere(condition)
      .select(fields);
  }

  async count({ condition = {}, whereNull = {} } = {}, trx = knex) {
    let query = trx(this.tableName).withSchema(this.schemaName).count(`${this.tableName}.id`);

    if (!isEmpty(condition)) {
      query = query.where(condition);
    }

    if (!isEmpty(whereNull)) {
      query = query.whereNull(whereNull);
    }

    const result = await query;

    return Number(result?.[0]?.count) || 0;
  }

  async createOne({ data, fields = '*', log = false } = {}, trx = knex) {
    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .insert(data, log ? '*' : fields);

    if (!items?.[0]) {
      return null;
    }

    const [item] = items;
    log && this.log({ id: item.id, action: this.logAction.create });

    return item;
  }

  getBy({ condition, fields = ['*'] } = {}, trx = knex) {
    return trx(this.tableName).withSchema(this.schemaName).select(fields).where(condition).first();
  }
  getBy_All({ condition, fields = ['*'] } = {}, trx = knex) {
    return trx(this.tableName).withSchema(this.schemaName).select(fields).where(condition);
  }
  getById({ id, fields = ['*'] }, trx = knex) {
    return trx(this.tableName).withSchema(this.schemaName).select(fields).where({ id }).first();
  }

  async updateBy(
    { condition = {}, whereIn = [], data, fields = '*', concurrentData, noUpdateAt, log } = {},
    trx = knex,
  ) {
    const updateData = { ...data };
    if (!noUpdateAt) {
      updateData.updatedAt = knex.fn.now();
    }

    const { id } = condition;
    if (id && concurrentData?.[id]) {
      await trx.raw(`select ??.updated_check('??.??', ?, ?);`, [
        config.internalSchema,
        this.schemaName,
        this.tableName,
        id,
        concurrentData[id],
      ]);
    }

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .update(updateData, log ? '*' : fields)
      .where(condition);

    if (whereIn?.length) {
      whereIn.forEach(({ key, values }) => {
        query = query.whereIn(key, values);
      });
    }

    const items = await query;
    if (!items?.[0]) {
      return null;
    }

    log &&
      items?.length &&
      Promise.all(items.map(item => this.log({ id: item.id, action: this.logAction.modify })));

    return items?.[0] || null;
  }

  updateByIds({ ids = [], data, fields = [], log } = {}, trx) {
    return Promise.all(
      ids.map(id =>
        this.updateBy(
          {
            condition: { id },
            data,
            fields,
            log,
          },
          trx,
        ),
      ),
      this,
    );
  }

  async softDeleteBy({ condition = {}, whereIn = [], whereNotIn = [] }, trx) {
    const updateData = { deletedAt: knex.fn.now() };

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .update(updateData)
      .where(condition)
      .whereNull('deletedAt')
      .returning('*');

    if (whereIn?.length) {
      whereIn.forEach(({ key, values }) => {
        query = query.whereIn(key, values);
      });
    }

    if (whereNotIn?.length) {
      whereNotIn.forEach(({ key, values }) => {
        query = query.whereNotIn(key, values);
      });
    }

    const items = await query;
    if (!items?.[0]) {
      return [];
    }
    return items;
  }

  async deleteBy({ condition, log } = {}, trx = knex) {
    let items;
    if (log) {
      items = await trx(this.tableName).withSchema(this.schemaName).select(['*']).where(condition);
    }

    await trx(this.tableName).withSchema(this.schemaName).where(condition).delete();

    log &&
      items?.length &&
      Promise.all(items.map(({ id }) => this.log({ id, action: this.logAction.delete })));
  }

  async deleteByIds({ ids = [], log }, trx = knex) {
    let items;
    if (log) {
      items = await trx(this.tableName)
        .withSchema(this.schemaName)
        .select(['*'])
        .whereIn('id', ids);
    }

    await trx(this.tableName).withSchema(this.schemaName).whereIn('id', ids).delete();

    log &&
      items?.length &&
      Promise.all(items.map(({ id }) => this.log({ id, action: this.logAction.delete })));
  }

  static getFields(obj, fields) {
    return fields === '*' || fields?.[0] === '*' ? obj : pick(obj, fields);
  }

  async getEntityActionBeforeUpsert(data, constraints, trx = knex) {
    const tableConstraints = Array.isArray(constraints) ? constraints : this.upsertConstraints;
    const condition = pick(data, tableConstraints?.length ? tableConstraints : ['id']);

    if (!isEmpty(condition)) {
      const exists = await (super.getBy || this.getBy).call(
        this,
        { condition, fields: ['id'] },
        trx,
      );
      return exists ? AUDIT_LOG_ACTION.modify : AUDIT_LOG_ACTION.create;
    }
    return null;
  }

  async upsert({ data, constraints, onConflict, concurrentData, fields = ['*'], log } = {}, trx) {
    const timestampsFields = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];
    const tableConstraints = Array.isArray(constraints) ? constraints : this.upsertConstraints;
    const tableOnConflict = onConflict || this.upsertOnConflict;
    const { id } = data;
    let result;
    let action;

    const _trx = trx || (await knex.transaction());
    try {
      if (id && concurrentData?.[id]) {
        await _trx.raw(`select ??.updated_check('??.??', ?, ?);`, [
          config.internalSchema,
          this.schemaName,
          this.tableName,
          id,
          concurrentData[id],
        ]);
      }

      const objForInsert = omit(data, timestampsFields);
      const insertKeys = Object.keys(objForInsert);
      const insertValues = Object.values(objForInsert);

      const objForUpdate = omit(data, tableConstraints.concat(timestampsFields));
      const updateKeys = Object.keys(objForUpdate);
      const updateValues = Object.values(objForUpdate);

      if (isEmpty(insertValues) && isEmpty(updateValues)) {
        throw new Error('There is no data for update or insert in upsert method');
      }

      if (log) {
        action = await this.getEntityActionBeforeUpsert(data, constraints, _trx);
      }

      result = await _trx.raw(
        `
                INSERT INTO ??.??(
                        ${stringOf(insertValues.length, '??', ', ')}
                    )
                    VALUES (
                        ${stringOf(insertValues.length, '?', ', ')}
                    )
                ON CONFLICT (
                    ${tableOnConflict || stringOf(tableConstraints.length, '??', ', ')}
                )
                DO UPDATE SET
                    ${
                      !isEmpty(updateValues)
                        ? `${stringOf(updateValues.length, '?? = ?', ', ')},`
                        : ''
                    } "updated_at" = NOW()
                RETURNING ${log ? '*' : fields.join(',')}
            `,
        [
          this.schemaName,
          this.tableName,
          ...insertKeys,
          ...insertValues,
          ...(tableOnConflict ? [] : tableConstraints),
          ...mergeArrays(updateKeys, updateValues),
        ],
      );

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && action && this.log({ id: id || result.rows[0].id, action });

    return result?.rows?.[0] || null;
  }

  async softUpsert(
    { data, constraints, onConflict, concurrentData, fields = ['*'], log } = {},
    trx,
  ) {
    const timestampsFields = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];
    const tableConstraints = Array.isArray(constraints) ? constraints : this.upsertConstraints;
    const tableOnConflict = onConflict || this.upsertOnConflict;
    const excludeKey = this.excludeKeyOnUpsert;
    const { id } = data;
    let result;
    let action;

    const _trx = trx || (await knex.transaction());
    try {
      if (id && concurrentData?.[id]) {
        await _trx.raw(`select ??.updated_check('??.??', ?, ?);`, [
          config.internalSchema,
          this.schemaName,
          this.tableName,
          id,
          concurrentData[id],
        ]);
      }

      const objForInsert = omit(data, timestampsFields);
      const insertValues = Object.values(objForInsert);

      if (isEmpty(insertValues)) {
        throw new Error('There is no data insert in softUpsert method');
      }

      if (!excludeKey) {
        throw new Error('There is no excludeKey in softUpsert method');
      }

      if (log) {
        action = await this.getEntityActionBeforeUpsert(data, constraints, _trx);
      }

      result = await _trx(this.tableName)
        .withSchema(this.schemaName)
        .insert(data)
        .onConflict(tableOnConflict ? [] : tableConstraints)
        .merge({
          [excludeKey]: knex.raw('EXCLUDED.??', `${excludeKey}`),
        })
        .returning(log ? '*' : fields.join(','));

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && action && this.log({ id: id || result[0].id, action });

    return result?.[0] || null;
  }

  insertMany({ data, fields = ['id'] }, trx = knex) {
    return trx(this.tableName).withSchema(this.schemaName).insert(data, fields);
  }

  async upsertMany({ data: dataArr, constraints, concurrentData, fields = ['*'], log }, trx) {
    const _trx = trx || (await knex.transaction());

    let items;
    try {
      items = await Promise.all(
        dataArr.map(async data => {
          let action;
          if (log) {
            action = await this.getEntityActionBeforeUpsert(data, constraints, trx);
          }

          const item = await this.upsert({ data, constraints, concurrentData, fields }, _trx);

          if (log && action) {
            item.__action = action;
          }
          return item;
        }, this),
      );

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    if (items?.length && log) {
      items.forEach(item => {
        const { __action: action, id } = item;
        action && this.log({ id, action });
        delete item.__action;
      }, this);
    }

    return items;
  }

  // TODO: completely refactor this to really use bulk DB operations instead of lists of promises with single DB operations
  //  https://starlightpro.atlassian.net/browse/HAULING-6543
  async upsertItems({ data, condition = {}, fields = ['id'] }, trx = knex) {
    const existingItems = await this.getAll({ condition, fields: ['id'] }, trx);

    const firstItems = !existingItems?.length;
    const existingIds = map(existingItems, 'id');

    // TODO: clarify how this can be used without danger?
    if (!data?.length) {
      await this.deleteByIds({ ids: existingIds }, trx);
      return null;
    }

    const fieldsWithId = fields.includes('id') ? fields : fields.concat('id');

    // items to update or add
    const items = await Promise.all(
      data.map(({ id, ...item }) => {
        const itemData = Object.assign(item, condition);
        if (!firstItems && id) {
          return this.updateBy(
            {
              condition: { id },
              data: itemData,
              fields: fieldsWithId,
            },
            trx,
          );
        }
        return this.createOne(
          {
            data: itemData,
            fields: fieldsWithId,
          },
          trx,
        );
      }, this),
    );

    // any missed items on update need to be deleted: override-like logic
    if (existingIds?.length) {
      const idsToRemove = difference(existingIds, map(items, 'id'));
      if (idsToRemove?.length) {
        await this.deleteByIds({ ids: idsToRemove }, trx);
      }
    }

    return items;
  }

  static getHistoricalTableName(tableName = this.TABLE_NAME) {
    return `${tableName}_historical`;
  }

  static async getNewestHistoricalRecord(
    { tableName, schemaName, condition, fields = ['id'] },
    trx = knex,
  ) {
    const item = await trx(
      tableName.endsWith('_historical') ? tableName : this.getHistoricalTableName(tableName),
    )
      .withSchema(schemaName)
      .select(fields)
      .where(condition)
      .orderBy('id', 'desc')
      .first();

    return item;
  }

  static getNewestHistoricalRecords(
    { tableName, schemaName, originalIds, fields = ['id'] },
    trx = knex,
  ) {
    return trx(this.getHistoricalTableName(tableName))
      .with('max_ids', builder =>
        builder
          .from(this.getHistoricalTableName(tableName))
          .withSchema(schemaName)
          .max('id as max_id')
          .whereIn('originalId', originalIds)
          .groupBy('originalId'),
      )
      .withSchema(schemaName)
      .select(fields)
      .joinRaw('inner join max_ids on id = max_id');
  }

  getColumns({ tableName = this.tableName, schemaName = this.schemaName }) {
    return getColumns({ tableName, schemaName });
  }

  async getColumnsToSelect(alias = this.tableName) {
    const items = await getColumns({
      tableName: this.tableName,
      schemaName: this.schemaName,
    });

    return items?.map(
      column =>
        `${this.tableName}.${column} as ${UNPARSED_COLUMNS_PREFIX}${alias}${UNPARSED_COLUMNS_SUFFIX}${column}`,
    );
  }

  static async getColumnsToSelect({ alias, tableName, schemaName, tnPrefix }) {
    const items = await getColumns({ tableName, schemaName });

    return items?.map(
      column =>
        `${
          tnPrefix ?? tableName
        }.${column} as ${UNPARSED_COLUMNS_PREFIX}${alias}${UNPARSED_COLUMNS_SUFFIX}${column}`,
    );
  }

  streamAllData({ options = {}, condition = {}, fields = ['*'] } = {}, trx = knex) {
    const query = trx(this.tableName).withSchema(this.schemaName).select(fields);
    return isEmpty(condition) ? query.stream(options) : query.where(condition);
  }

  get logAction() {
    return AUDIT_LOG_ACTION;
  }

  get logEntity() {
    return AUDIT_LOG_ENTITY;
  }

  async log({ id, repo, entity: entityName, userId, action, timestamp }) {
    const entity = entityName || AUDIT_LOG_ENTITY[this.tableName];
    const errObj = {};
    if (!entity) {
      Error.captureStackTrace(errObj);
      return this.ctxState.logger.info(
        errObj.stack,
        `Skipped Audit Log since unmapped entity, table name ${this.tableName}`,
      );
    }

    return await auditLog.makeRecord(this.ctxState, {
      repo: repo || this,
      id,
      entity,
      schemaName: this.schemaName,
      userId: userId || this.userId || 'system',
      action,
      timestamp: timestamp || new Date(),
    });
  }

  get camelCaseKeys() {
    return camelCaseKeys;
  }

  async populateBu({ query, selects }) {
    const jtName = 'business_units';
    const joinedTableColumns = await BaseRepository.getColumnsToSelect({
      alias: 'businessUnit',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    // eslint-disable-next-line no-param-reassign
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.businessUnitId`);

    return { query, selects };
  }

  async populateBl({ query, selects }) {
    const jtName = 'business_lines';
    const joinedTableColumns = await BaseRepository.getColumnsToSelect({
      alias: 'businessLine',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    // eslint-disable-next-line no-param-reassign
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.businessLineId`);

    return { query, selects };
  }

  async populateBuBl({ query, selects }) {
    await this.populateBu({ query, selects });
    await this.populateBl({ query, selects });

    return { query, selects };
  }

  getByIdQuery(id, trx = knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .where(`${this.tableName}.id`, id)
      .first();
  }

  async getByIdToLog(id, trx = knex) {
    const item = await (this.getById || super.getById).call(this, {
      id,
      fields: ['*'],
      trx,
    });
    return item ? camelCaseKeys(item) : null;
  }
}

export default BaseRepository;
