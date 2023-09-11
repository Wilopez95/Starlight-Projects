/* eslint-disable no-unused-vars */
import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import groupBy from 'lodash/groupBy.js';
import BaseModel from '../_base.js';
import {
  WO_HISTORICAL_EVENT_TYPE,
  WO_HISTORICAL_ENTITY_TYPE,
  WO_HISTORICAL_ENTITY_TYPES,
  TRACKABLE_WO_HISTORICAL_FIELDS,
  NON_TRACKABLE_WO_HISTORICAL_FIELDS,
} from '../../consts/workOrder.js';
import { TABLES } from '../../consts/tables.js';

const attributeGroups = {
  bestTimeToCome: ['bestTimeToComeFrom', 'bestTimeToComeTo'],
  status: ['status', 'statusLonChange', 'statusLatChange'],
};

export default class WorkOrderHistory extends BaseModel {
  static get tableName() {
    return TABLES.WORK_ORDERS_HISTORICAL;
  }

  // we pick all history for needed workOrder
  // then record what change was before in prevObject
  // compare current change with prevObject change, and add to final set
  static async getWorkOrderHistory(workOrderId) {
    const historyRecords = await this.query()
      .leftJoin(
        TABLES.WORK_ORDERS,
        `${TABLES.WORK_ORDERS}.id`,
        `${TABLES.WORK_ORDERS_HISTORICAL}.originalId`,
      )
      .where({ originalId: workOrderId })
      .select(`${TABLES.WORK_ORDERS_HISTORICAL}.*`, `${TABLES.WORK_ORDERS}.workOrderId`)
      .orderBy('createdAt', 'asc');

    if (!historyRecords.length) return null;

    const attributes = this._getTrackableAttributes(historyRecords);

    const previousChanges = {};

    const changes = historyRecords
      .map(record => {
        if (isEmpty(previousChanges)) {
          record.eventType = WO_HISTORICAL_EVENT_TYPE.init;
        }

        if (!WO_HISTORICAL_ENTITY_TYPES.includes(record.entityType)) return null;

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

        previousChanges.eventType = record.eventType;

        const groupedChanges = this._fieldChangesToGrouped(attrChanges);

        return {
          id: record.id,
          originalId: record.originalId,
          workOrderId: record.workOrderId,
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

  static async recordWorkOrderData({ workOrderId, data }, trx) {
    const historicalData = this._pickWorkOrderFields(data);

    await this._makeHistoricalRecord(
      {
        data: historicalData,
        originalId: workOrderId,
        eventType: WO_HISTORICAL_EVENT_TYPE.generic,
        entityType: WO_HISTORICAL_ENTITY_TYPE.workOrder,
      },
      trx,
    );
  }

  static async recordDailyRouteData({ workOrderId, data }, trx) {
    const historicalData = this._pickDailyRouteFields(data);

    await this._makeHistoricalRecord(
      {
        data: historicalData,
        originalId: workOrderId,
        eventType: WO_HISTORICAL_EVENT_TYPE.generic,
        entityType: WO_HISTORICAL_ENTITY_TYPE.dailyRoute,
      },
      trx,
    );
  }

  static async recordWorkOrderMediaData({ workOrderId, data, eventType }, trx) {
    const historicalData = this._pickMediaFields(data);

    await this._makeHistoricalRecord(
      {
        data: historicalData,
        originalId: workOrderId,
        eventType,
        entityType: WO_HISTORICAL_ENTITY_TYPE.media,
      },
      trx,
    );
  }

  static async recordCommentData({ workOrderId, data }, trx) {
    const historicalData = this._pickCommentFields(data);

    await this._makeHistoricalRecord(
      {
        data: historicalData,
        originalId: workOrderId,
        eventType: WO_HISTORICAL_EVENT_TYPE.create,
        entityType: WO_HISTORICAL_ENTITY_TYPE.comment,
      },
      trx,
    );
  }

  static _getAttributesChanges(attrs, newObj, prevObj) {
    const result = attrs
      .filter(
        attr =>
          TRACKABLE_WO_HISTORICAL_FIELDS[newObj.entityType].includes(attr) || attr === 'eventType',
      )
      .map(attr => ({
        attribute: attr,
        actionType:
          newObj.eventType === WO_HISTORICAL_EVENT_TYPE.delete
            ? WO_HISTORICAL_EVENT_TYPE.delete
            : undefined,
        newValue: newObj.eventType === WO_HISTORICAL_EVENT_TYPE.delete ? null : newObj[attr],
        previousValue:
          newObj.eventType === WO_HISTORICAL_EVENT_TYPE.delete
            ? newObj[attr]
            : !prevObj ||
              typeof prevObj[attr] === 'undefined' ||
              newObj.eventType === WO_HISTORICAL_EVENT_TYPE.create
            ? null
            : prevObj[attr],
      }))
      .filter(({ newValue, previousValue }) => String(newValue) !== String(previousValue));

    return result;
  }

  static _getTrackableAttributes(items) {
    return Object.keys(items[0]).filter(key => !NON_TRACKABLE_WO_HISTORICAL_FIELDS.includes(key));
  }

  static _adjustRecordDates(record) {
    const { completedAt } = record;

    const adjustedCompletedAt = completedAt instanceof Date ? completedAt.getTime() : completedAt;

    return {
      ...record,
      completedAt: adjustedCompletedAt,
    };
  }

  // groups flat changes to grouped changes to be treated as a single change
  static _fieldChangesToGrouped(attrChanges) {
    const attrGroupsEntries = Object.entries(attributeGroups);

    const groupedChanges = groupBy(attrChanges, change => {
      const fieldGroup = attrGroupsEntries.find(([_, fields]) => fields.includes(change.attribute));

      if (fieldGroup) {
        return fieldGroup[0];
      }

      return change.attribute;
    });

    return Object.entries(groupedChanges).map(([attribute, actualChanges]) => ({
      attribute,
      actualChanges,
    }));
  }

  static _pickWorkOrderFields(obj) {
    return pick(obj, TRACKABLE_WO_HISTORICAL_FIELDS[WO_HISTORICAL_ENTITY_TYPE.workOrder]);
  }

  static _pickDailyRouteFields(obj) {
    return {
      truckId: obj.truckId,
      driverId: obj.driverId,
      driverName: obj.driverName,
      truckType: obj.truckType,
      truckName: obj.truckName,
    };
  }

  static _pickMediaFields(obj) {
    return {
      mediaId: obj.id,
      url: obj.url,
      fileName: obj.fileName,
    };
  }

  static _pickCommentFields(obj) {
    return {
      commentId: obj.id,
      commentEventType: obj.eventType,
      comment: obj.comment,
    };
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
