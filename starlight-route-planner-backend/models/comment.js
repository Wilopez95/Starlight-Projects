import { DEFAULT_LIMIT, DEFAULT_SKIP } from '../consts/defaults.js';
import { TABLES } from '../consts/tables.js';
import { SORT_ORDER_ENUM } from '../consts/sortOrders.js';
import { EVENT_TYPES } from '../consts/comment.js';
import BaseModel from './_base.js';

export default class Comment extends BaseModel {
  static get tableName() {
    return TABLES.COMMENTS;
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['workOrderId', 'eventType'],

      properties: {
        id: { type: 'integer' },
        workOrderId: { type: 'integer' },
        authorName: { type: 'string' },
        authorRole: { type: 'string' },
        eventType: { enum: EVENT_TYPES },
        authorId: { type: ['string', null] },
        comment: { type: ['string', null] },
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
      result.map(comment =>
        WorkOrderHistory.recordCommentData(
          { workOrderId: comment.workOrderId, data: comment },
          transaction,
        ),
      ),
    );
  }

  static async getAllPaginated(params) {
    const { skip = DEFAULT_SKIP, limit = DEFAULT_LIMIT, workOrderId } = params;

    const result = await this.query()
      .skipUndefined()
      .offset(skip)
      .limit(limit)
      .where({ workOrderId })
      .orderBy('updatedAt', SORT_ORDER_ENUM.DESC);

    return result;
  }

  static async create(payload, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { workOrderId, eventType, comment, role } = payload;

    // TODO: fix this later after permissions are implemented
    const authorRole = this.user?.role
      ? this.user.role
      : role ?? this.user?.id
      ? 'Dispatcher'
      : null;

    try {
      const res = await this.query(trx).upsertGraphAndFetch({
        workOrderId,
        eventType,
        comment,
        authorId: this.user?.id,
        authorName: this.user?.name,
        authorRole,
      });

      if (!outerTransaction) {
        await trx.commit();
      }

      return res;
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
