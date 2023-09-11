import omit from 'lodash/omit.js';

import knex from '../db/connection.js';

import ApiError from '../errors/ApiError.js';

import { unambiguousCondition, unambiguousSelect } from '../utils/dbHelpers.js';

import fieldToLinkedTableMap from '../consts/fieldToLinkedTableMap.js';
import { EVENT_TYPE } from '../consts/historicalEventType.js';
import BaseRepository from './_base.js';

const filterOutTechField = obj =>
  omit(obj, ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at']);

class VersionedRepository extends BaseRepository {
  constructor(ctxState, { schemaName, tableName } = {}) {
    super(ctxState, { schemaName, tableName });

    this.historicalTableName = BaseRepository.getHistoricalTableName(tableName);
  }

  static get filterOutTechFields() {
    return filterOutTechField;
  }

  static getHistoricalInstance(ctxState, { schemaName, tableName } = {}) {
    const schema = schemaName || this.SCHEMA_NAME || ctxState?.user?.schemaName || '';
    const table = tableName || BaseRepository.getHistoricalTableName(this.TABLE_NAME);

    const instance = super.getInstance(ctxState, { schemaName: schema, tableName: table });

    // a hack but avoids extra methods overloading
    instance.tableName = table;

    return instance;
  }

  async convertToHistorical({ ids, fields = ['*'] }, trx = this.knex) {
    const tableName = this.constructor.getHistoricalTableName();
    const query = trx(tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .whereIn(`${tableName}.originalId`, ids)
      .orderBy(`${tableName}.id`);

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async makeHistoricalRecord({ data, originalId, eventType, fields = ['id'] }, trx) {
    data.originalId = originalId;
    data.eventType = eventType;
    data.userId = this.userId || 'system';
    data.traceId = this.ctxState.reqId;

    const item = await trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .insert(data, fields);

    return item;
  }

  async createOne({ data, fields = ['*'], log } = {}, trx, { noRecord = false } = {}) {
    let obj;
    const _trx = trx || (await this.knex.transaction());

    try {
      obj = await super.createOne({ data, fields: '*', log: false }, _trx);

      if (obj) {
        if (!noRecord) {
          await this.makeHistoricalRecord(
            {
              data: this.constructor.filterOutTechFields(obj),
              originalId: obj.id,
              eventType: EVENT_TYPE.created,
            },
            _trx,
          );
        }
      } else {
        this.ctxState.logger.error(
          `Error creating a historical record for table ${this.tableName} with ${data}`,
        );
        throw ApiError.unknown();
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: obj.id, action: this.logAction.create });

    return VersionedRepository.getFields(obj, fields);
  }

  async updateBy(
    {
      condition,
      data,
      fields = ['*'],
      whereIn,
      concurrentData,
      eventType = EVENT_TYPE.edited,
      log,
      // pre-pricing service code:
      // noUpdateAt = false,
      // end pre-pricing service code
    } = {},
    trx,
    { noRecord = false, skipEmpty = false } = {},
  ) {
    let obj;
    const _trx = trx || (await this.knex.transaction());
    try {
      obj = await super.updateBy(
        // pre-pricing service code:
        // { condition, whereIn, data, fields: '*', concurrentData, noUpdateAt, log: false },
        // end pre-pricing service code
        { condition, whereIn, data, fields: '*', concurrentData, log: false },
        _trx,
      );

      if (obj) {
        if (!noRecord) {
          await this.makeHistoricalRecord(
            {
              data: this.constructor.filterOutTechFields(obj),
              originalId: obj.id,
              eventType,
            },
            _trx,
          );
        }
      } else if (!skipEmpty) {
        throw ApiError.notFound(
          'No such entity',
          `No entity (${this.tableName}) with ${JSON.stringify(condition)}`,
        );
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: obj.id, action: this.logAction.modify });

    return VersionedRepository.getFields(obj, fields);
  }

  async updateByIds({ ids = [], data, log } = {}, trx) {
    const result = await Promise.all(
      ids.map(id =>
        this.updateBy(
          {
            condition: { id },
            data,
            log,
          },
          trx,
        ),
      ),
      this,
    );

    return result;
  }

  async deleteById({ item, log, _trx, noRecord } = {}) {
    if (item) {
      await super.deleteBy({ condition: { id: item.id }, log: false }, _trx);

      if (item && !noRecord) {
        await this.makeHistoricalRecord(
          {
            data: this.constructor.filterOutTechFields(item),
            originalId: item.id,
            eventType: EVENT_TYPE.deleted,
          },
          _trx,
        );
      }

      log && this.log({ id: item.id, action: this.logAction.delete });
    }
    // no else (No such entity) since soft delete
  }

  async deleteBy(
    { condition = {}, whereNotIn = [], fields = ['*'], log } = {},
    trx,
    { noRecord = false } = {},
  ) {
    let obj;
    const _trx = trx || (await this.knex.transaction());

    try {
      let query = super.getAll({ condition, fields: ['*'] }, _trx);

      if (whereNotIn.length) {
        whereNotIn.forEach(({ key, values }) => {
          query = query.whereNotIn(key, values);
        });
      }

      const items = await query;
      if (items?.length) {
        [obj] = items; // for compatibility

        // pre-pricing service code:
        // await Promise.all(items?.map(item => this.deleteById({ item, log, _trx, noRecord }), this));
        // end pre-pricing service code
        await Promise.all(items?.map(item => this.deleteById({ item, log, _trx, noRecord }), this));
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return VersionedRepository.getFields(obj, fields);
  }

  async deleteByIds({ ids, log }, trx) {
    await Promise.all(
      ids.map(id => this.deleteBy({ condition: { id }, fields: ['id'], log }, trx), this),
    );
  }

  static getEventType(obj) {
    return new Date(obj.createdAt).getTime() === new Date(obj.updatedAt).getTime()
      ? EVENT_TYPE.created
      : EVENT_TYPE.edited;
  }

  async upsert(
    { data, constraints, onConflict, concurrentData, log } = {},
    trx = this.knex,
    returnHistorical = false,
  ) {
    let obj = await super.upsert({ data, constraints, onConflict, concurrentData, log }, trx);
    if (obj) {
      obj = this.mapFields(obj);

      const item = await this.makeHistoricalRecord(
        {
          data: this.constructor.filterOutTechFields(obj),
          originalId: obj.id,
          eventType: VersionedRepository.getEventType(obj),
        },
        trx,
      );

      if (returnHistorical) {
        obj.historical = item ? item[0] : null;
      }
    }
    return obj;
  }

  async softDeleteBy({ condition, whereIn = [], whereNotIn = [] }, trx) {
    const items = await super.softDeleteBy({ condition, whereIn, whereNotIn }, trx);

    if (items.length) {
      await Promise.all(
        items.map(item =>
          this.makeHistoricalRecord(
            {
              data: this.constructor.filterOutTechFields(item),
              originalId: item.id,
              eventType: EVENT_TYPE.deleted,
            },
            trx,
          ),
        ),
      );
    }
    return items;
  }

  async upsertMany({ data: dataArr, fields = [], log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    let items;
    try {
      items = await Promise.all(
        dataArr.map(data => this.upsert({ data, fields, log }, _trx), this),
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
    return items;
  }

  async updateMany({ data: dataArr, fields = ['*'] }, trx) {
    const _trx = trx || (await this.knex.transaction());

    let items;
    try {
      items = await Promise.all(
        dataArr.map(
          data =>
            this.updateBy(
              {
                condition: { id: data.id },
                data,
                fields,
              },
              _trx,
            ),
          this,
        ),
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

    return items;
  }

  // TODO: re-write to bulk insert and bulk historical records insert
  async insertMany({ data: dataArr, fields = [] }, trx) {
    const _trx = trx || (await this.knex.transaction());

    let items;
    try {
      items = await Promise.all(dataArr.map(data => this.createOne({ data, fields }, _trx), this));

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return items;
  }

  getRecentBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .orderBy(`${this.tableName}.id`, 'desc')
      .first();
  }

  getRecentBy2({ condition, fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .orderBy(`${this.tableName}.id`, 'desc').first;
  }

  async getHistoricalRecordById({ id, fields = ['*'] }, trx = this.knex) {
    const result = await trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where({ id })
      .orderBy(`${this.historicalTableName}.id`, 'desc')
      .first();
    return result;
  }

  static async getEntityHistoricalRecordById(
    { schemaName, tableName, id, fields = ['*'] },
    trx = knex,
  ) {
    const result = await trx(
      tableName.endsWith('_historical') ? tableName : this.getHistoricalTableName(tableName),
    )
      .withSchema(schemaName)
      .select(fields)
      .where({ id })
      .first();
    return result;
  }

  getAllByHistoricalIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = this.knex) {
    const selects = unambiguousSelect(this.tableName, fields);
    const whereCondition = unambiguousCondition(this.tableName, condition);
    const query = trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(this.tableName, `${this.tableName}.id`, `${this.historicalTableName}.originalId`)
      .whereIn(`${this.historicalTableName}.id`, ids)
      .andWhere(whereCondition)
      .select(selects);

    return query;
  }

  // TODO: completely refactor this to really use bulk DB operations instead of lists of promises with single DB operations
  //  https://starlightpro.atlassian.net/browse/HAULING-6543
  async getLinkedHistoricalIds(
    linkedData,
    { entityId, update = false, entityRepo = this } = {},
    trx = this.knex,
  ) {
    const { schemaName } = this;
    const result = {};

    let entity;
    if (update && entityId) {
      entity = await entityRepo.getById({ id: entityId, fields: Object.keys(linkedData) }, trx);
    }

    await Promise.all(
      Object.entries(linkedData).map(async ([key, value]) => {
        if (!value) {
          // edit when nullifying id
          if (value === null) {
            result[key] = null;
          }
          return;
        }

        const tableName = fieldToLinkedTableMap[key];
        const historicalRecord = await BaseRepository.getNewestHistoricalRecord(
          {
            tableName,
            schemaName,
            condition: { originalId: value },
          },
          trx,
        );

        if (!historicalRecord || !historicalRecord.id) {
          throw ApiError.notFound(
            'No such historical entity',
            `No historical entity for table ${tableName} with ID ${value} was found`,
          );
        }

        if (update) {
          const existingHistoricalRecord = await trx(
            this.constructor.getHistoricalTableName(tableName),
          )
            .withSchema(schemaName)
            .select(['originalId'])
            .where({ id: entity[key] })
            .first();
          // update linked entity through id only if originalId is changed
          if (existingHistoricalRecord && existingHistoricalRecord.originalId === value) {
            result[key] = entity[key];
          } else {
            result[key] = historicalRecord.id;
          }
        } else {
          result[key] = historicalRecord.id;
        }
      }),
    );

    return result;
  }

  getAllWithHistorical(
    { condition = {}, fields = ['*'], orderBy = [`${this.tableName}.id`] } = {},
    trx = this.knex,
  ) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .select([
        ...unambiguousSelect(this.tableName, fields),
        trx.raw('array_agg(??) ??', [`${this.historicalTableName}.id`, 'historicalIds']),
      ])
      .innerJoin(
        this.historicalTableName,
        `${this.tableName}.id`,
        `${this.historicalTableName}.originalId`,
      )
      .orderBy(orderBy)
      .groupBy(`${this.tableName}.id`);
  }
}

export default VersionedRepository;
