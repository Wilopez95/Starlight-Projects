import objection from 'objection';

import { logger } from '../utils/logger.js';
import isProperObject from '../utils/isProperObject.js';
import { mathRound2 } from '../utils/math.js';

import { makeAuditLogRecord } from '../services/auditLog.js';

import { AUDIT_LOG_ACTION, AUDIT_LOG_ENTITY } from '../consts/auditLog.js';

import { AUDIT_LOG_AS_SEPARATE_PROCESS } from '../config.js';

const { Model } = objection;

const numericFields = ['quantity', 'price', 'limit', 'total', 'amount', 'balance'];
const numericFieldRegex = new RegExp(`(${numericFields.join('|')})$`, 'i');
const isNumericField = key => numericFieldRegex.test(key);

export default class BaseModel extends Model {
  static get schemaName() {
    return 'admin';
  }

  static get models() {
    return null;
  }

  static get jsonAttributes() {
    // necessary for postgres array type usage
    return [];
  }

  static query(...args) {
    const query = super.query(...args);

    if (query.has('withSchema') || this.schemaName === undefined) {
      return query;
    }

    return query.withSchema(this.tableName == 'quick_books_services' ? 'admin' : this.schemaName); // HACKY SOLUTION JGG
  }

  static async upsertMany({ data }, trx) {
    await this.query(trx).upsertGraph(data, { insertMissing: true });
  }

  $beforeInsert() {
    this.createdAt = new Date().toUTCString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toUTCString();
  }

  static async getBy({ condition, fields = ['*'] } = {}) {
    const item = await this.query().where(condition).select(fields).first();
    return item;
  }

  static async getAll({ condition = {}, fields = ['*'] } = {}) {
    const items = await this.query().where(condition).select(fields);
    return items;
  }

  static async getById(id, fields = ['*'], trx) {
    const item = await this.query(trx).findById(id).select(fields);
    return item;
  }

  static async getByIds(ids, fields = ['*']) {
    const items = await this.query().findByIds(ids).select(fields);
    return items;
  }

  static async patchById(id, data = {}, trx) {
    await this.query(trx).findById(id).patch(data);
  }

  async $patch(data = {}) {
    await this.$query().patch(data);
  }

  async $patchAndFetch(data = {}, trx) {
    const item = await this.$query(trx).patchAndFetch(data);
    return item;
  }

  static async deleteById(id, trx) {
    await this.query(trx).deleteById(id);
  }

  static async deleteByIds(ids) {
    await this.query().findByIds(ids).delete();
  }

  static async upsert(data) {
    const trx = await this.startTransaction();
    if (data.id) {
      data.id = Number(data.id);
    }

    try {
      await this.query(trx).upsertGraph(data, { insertMissing: true });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static get logAction() {
    return AUDIT_LOG_ACTION;
  }

  static get logEntity() {
    return AUDIT_LOG_ENTITY;
  }

  static log({ id, model = this, entity: entityName, userId, action, timestamp }) {
    const entity = entityName || AUDIT_LOG_ENTITY[model.tableName];
    const errObj = {};
    if (!entity) {
      Error.captureStackTrace(errObj);
      return logger.info(
        errObj.stack,
        `Skipped Audit Log since unmapped entity ${entityName}, table name ${model.tableName}`,
      );
    } else if (!id) {
      Error.captureStackTrace(errObj);
      return logger.info(
        errObj.stack,
        `Skipped Audit Log since no id passed, entity ${entityName}, tableName ${model.tableName}`,
      );
    }

    // cut 'Bound'
    const modelName = model.name.slice(5);
    const logObj = {
      modelName,
      entityId: id,
      entity,
      schemaName: model.schemaName,
      userId: userId || 'system',
      action,
      timestamp: timestamp || new Date(),
    };

    if (AUDIT_LOG_AS_SEPARATE_PROCESS && AUDIT_LOG_AS_SEPARATE_PROCESS === 'true') {
      if (global.auditLogProcess) {
        // send to AL forked process directly to avoid dependency cycle
        global.auditLogProcess.send(logObj);
      } else {
        logger.info(logObj, 'Audit Log process is not started');
      }
    } else {
      makeAuditLogRecord(logObj);
    }
    return null;
  }

  $log({ id = this.id, model = this.constructor, entity, userId, action, timestamp }) {
    return this.constructor.log({ id, model, entity, userId, action, timestamp });
  }

  static getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    return super.query(trx).withSchema(schemaName).findById(id).select(fields);
  }

  static castNumbers(obj) {
    function recursiveCastCb([key, value]) {
      if (isProperObject(value)) {
        // kind of recursive camel-casing (1 level more only)
        Object.entries(value)?.forEach(([_key, _value]) => {
          if (isNumericField(_key.toLowerCase())) {
            value[_key] = mathRound2(Number(_value) || 0);
          }
        });
      } else if (Array.isArray(value) && isProperObject(value[0])) {
        value.forEach(item => Object.entries(item).forEach(recursiveCastCb.bind(item)));
      } else if (isNumericField(key.toLowerCase())) {
        obj[key] = mathRound2(Number(value) || 0);
      }
    }

    Object.entries(obj).forEach(recursiveCastCb.bind(obj));
    return obj;
  }
}
