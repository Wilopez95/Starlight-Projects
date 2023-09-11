import { v4 as uuidv4 } from 'uuid';

import omit from 'lodash/omit.js';
import { TABLES } from '../consts/tables.js';
import { WO_HISTORICAL_EVENT_TYPE } from '../consts/workOrder.js';
import { deleteFilesByUrls } from '../services/mediaStorage.js';
import BaseModel from './_base.js';

export default class WorkOrderMedia extends BaseModel {
  static get tableName() {
    return TABLES.WORK_ORDERS_MEDIA;
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'string' },
        workOrderId: { type: 'integer' },
        url: { type: 'string' },
        timestamp: { type: ['string', null] },
        author: { type: ['string', null] },
        fileName: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { WorkOrder } = this.models;

    return {
      workOrder: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: WorkOrder,
        join: {
          from: `${this.tableName}.workOrderId`,
          to: `${WorkOrder.tableName}.id`,
        },
      },
    };
  }

  static async afterInsert(args) {
    const { transaction, result } = args;
    const { WorkOrderHistory } = this.models;

    await Promise.all(
      result.map(media =>
        WorkOrderHistory.recordWorkOrderMediaData(
          {
            workOrderId: media.workOrderId,
            data: media,
            eventType: WO_HISTORICAL_EVENT_TYPE.create,
          },
          transaction,
        ),
      ),
    );
  }

  static async beforeDelete(args) {
    const { WorkOrderHistory } = this.models;

    const res = await args.asFindQuery().select('*');

    await Promise.all(
      res.map(media =>
        WorkOrderHistory.recordWorkOrderMediaData(
          {
            workOrderId: media.workOrderId,
            data: media,
            eventType: WO_HISTORICAL_EVENT_TYPE.delete,
          },
          args.transaction,
        ),
      ),
    );
  }

  static async create(media, workOrderId, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    try {
      const dataToUpsert = media.map(woData => ({
        ...omit(woData, ['subscriptionWorkOrderId', 'independentWorkOrderId']),
        id: woData.id || uuidv4(),
        workOrderId,
        timestamp: new Date().toUTCString(),
      }));

      await this.upsertMany({ data: dataToUpsert }, trx);

      const mediaIds = dataToUpsert.map(({ id }) => id);
      const data = await this.getByIds(mediaIds, ['*'], trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return data;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async deleteByIds(ids, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    try {
      await this.query(trx).findByIds(ids).delete();

      if (!outerTransaction) {
        await trx.commit();
      }

      return ids;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async deleteFromBucketByIds(ids, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());

    try {
      const media = await this.getByIds(ids, ['url'], trx);

      await deleteFilesByUrls(media.map(({ url }) => url));

      if (!outerTransaction) {
        await trx.commit();
      }

      return ids;
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
  }

  static async getCount(condition) {
    const trx = this.knex();
    const { workOrderId } = condition;

    const [result] = await this.query(trx).count('id').where({ workOrderId });

    return result;
  }
}
