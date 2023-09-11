import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import difference from 'lodash/difference.js';

import BaseModel from '../_base.js';
import {
  DAILY_ROUTE_HISTORICAL_EVENT_TYPE,
  DAILY_ROUTE_HISTORICAL_ENTITY_TYPE,
  DAILY_ROUTE_HISTORICAL_ENTITY_TYPES,
  TRACKABLE_DR_HISTORICAL_FIELDS,
  NON_TRACKABLE_DR_HISTORICAL_FIELDS,
} from '../../consts/dailyRoute.js';
import { TABLES } from '../../consts/tables.js';

export default class DailyRouteHistorical extends BaseModel {
  static get tableName() {
    return TABLES.DAILY_ROUTES_HISTORICAL;
  }

  // we pick all history for needed workOrder
  // then record what change was before in prevObject
  // compare current change with prevObject change, and add to final set
  static async getDailyRouteHistory(dailyRouteId) {
    const historyRecords = await this.query()
      .where({ originalId: dailyRouteId })
      .select(`*`)
      .orderBy('createdAt', 'asc');

    if (!historyRecords.length) return null;

    const attributes = this._getTrackableAttributes(historyRecords);

    const previousChanges = {};

    const changes = historyRecords
      .map(record => {
        if (isEmpty(previousChanges)) {
          record.eventType = DAILY_ROUTE_HISTORICAL_EVENT_TYPE.init;
        }

        if (!DAILY_ROUTE_HISTORICAL_ENTITY_TYPES.includes(record.entityType)) return null;

        const rectifiedRecord = this._adjustRecordDates(record);

        const attrChanges = this._getAttributesChanges(
          attributes,
          rectifiedRecord,
          previousChanges,
        );

        if (!attrChanges.length) return null;

        Object.assign(
          previousChanges,
          attrChanges.reduce((obj, { attribute, newValue }) => {
            obj[attribute] = newValue;
            return obj;
          }, {}),
        );

        const groupedChanges = this._fieldChangesToGrouped(attrChanges);

        return {
          id: record.id,
          originalId: record.originalId,
          eventType: record.eventType,
          entityType: record.entityType,
          timestamp: new Date(record.createdAt).toUTCString(),

          userId: record.userId,
          userName: record.userName,

          changes: groupedChanges,
        };
      })
      .filter(Boolean);

    return changes;
  }

  static async recordDailyRouteData({ dailyRouteId, data, eventType }, trx) {
    const { WorkOrder } = this.models;

    const workOrdersRelated = await WorkOrder.getAll(
      {
        condition: { dailyRouteId },
        fields: ['workOrderId'],
      },
      trx,
    );

    const dailyRouteHistoricalData = this._pickDailyRouteFields(data);
    const workOrderHistoricalData = this._pickWorkOrderFields(workOrdersRelated);

    await this._makeHistoricalRecord(
      {
        data: { ...dailyRouteHistoricalData, ...workOrderHistoricalData },
        originalId: dailyRouteId,
        eventType,
        entityType: DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.dailyRoute,
      },
      trx,
    );
  }

  static async recordWeightTicketData({ dailyRouteId, data, eventType }, trx) {
    const historicalData = this._pickWeightTicketFields(data);

    await this._makeHistoricalRecord(
      {
        data: historicalData,
        originalId: dailyRouteId,
        eventType,
        entityType: DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.weightTicket,
      },
      trx,
    );
  }

  static _getAttributesChanges(attrs, newObj, prevObj) {
    const result = attrs
      .filter(attr => TRACKABLE_DR_HISTORICAL_FIELDS[newObj.entityType].includes(attr))
      .map(attr => ({
        attribute: attr,
        actionType:
          newObj.eventType === DAILY_ROUTE_HISTORICAL_EVENT_TYPE.delete
            ? DAILY_ROUTE_HISTORICAL_EVENT_TYPE.delete
            : undefined,
        newValue:
          newObj.eventType === DAILY_ROUTE_HISTORICAL_EVENT_TYPE.delete ? null : newObj[attr],
        previousValue:
          newObj.eventType === DAILY_ROUTE_HISTORICAL_EVENT_TYPE.delete
            ? newObj[attr]
            : !prevObj ||
              typeof prevObj[attr] === 'undefined' ||
              newObj.eventType === DAILY_ROUTE_HISTORICAL_EVENT_TYPE.create ||
              (attr === 'ticketNumber' &&
                newObj.eventType === DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic)
            ? null
            : prevObj[attr],
      }))
      .filter(item => {
        if (Array.isArray(item.newValue) || Array.isArray(item.previousValue)) {
          return this._fullDifference(item.newValue || [], item.previousValue || []).length;
        }
        return String(item.newValue) !== String(item.previousValue);
      });

    return result;
  }

  static _adjustRecordDates(record) {
    const { completedAt } = record;

    const adjustedCompletedAt = completedAt instanceof Date ? completedAt.getTime() : completedAt;

    return {
      ...record,
      completedAt: adjustedCompletedAt,
    };
  }

  // this is needed just to conform to WO History ret value, for FE mainly
  static _fieldChangesToGrouped(attrChanges) {
    return attrChanges.map(change => ({
      attribute: change.attribute,
      actualChanges: [change],
    }));
  }

  static _pickDailyRouteFields(obj) {
    return pick(obj, TRACKABLE_DR_HISTORICAL_FIELDS[DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.dailyRoute]);
  }

  static _pickWeightTicketFields(obj) {
    return pick(
      obj,
      TRACKABLE_DR_HISTORICAL_FIELDS[DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.weightTicket],
    );
  }

  static _pickWorkOrderFields(arr) {
    const workOrderIds = arr.map(wo => wo.workOrderId);

    return { workOrderIds };
  }

  static _fullDifference(arr1, arr2) {
    // the bigger array must by as the first argument
    return arr1.length > arr2.length ? difference(arr1, arr2) : difference(arr2, arr1);
  }

  static _getTrackableAttributes(items) {
    return Object.keys(items[0]).filter(key => !NON_TRACKABLE_DR_HISTORICAL_FIELDS.includes(key));
  }

  static async _makeHistoricalRecord({ data, originalId, eventType, entityType }, trx) {
    data.originalId = originalId;
    data.eventType = eventType;
    data.entityType = entityType;
    data.userId = this.user.id || 'system';
    data.userName = this.user.name || 'system';

    const item = await this.query(trx).insert(data);

    return item;
  }
}
