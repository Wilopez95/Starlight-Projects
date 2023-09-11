import { TABLES } from '../consts/tables.js';
import { WEIGHT_UNITS } from '../consts/weightUnits.js';
import { DAILY_ROUTE_HISTORICAL_EVENT_TYPE } from '../consts/dailyRoute.js';
import BaseModel from './_base.js';

export default class WeightTicket extends BaseModel {
  static get tableName() {
    return TABLES.WEIGHT_TICKETS;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['ticketNumber', 'loadValue', 'weightUnit', 'dailyRouteId'],

      properties: {
        id: { type: 'string' },
        ticketNumber: { type: 'string' },
        loadValue: { type: 'number' },
        weightUnit: { enum: WEIGHT_UNITS },
        dailyRouteId: { type: 'integer' },
        materialId: { type: ['integer', null] },
        disposalSiteId: { type: ['integer', null] },
        arrivalTime: { type: ['string', null] },
        departureTime: { type: ['string', null] },
        timeOnLandfill: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { WeightTicketMedia, DailyRoute } = this.models;

    return {
      dailyRoute: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: DailyRoute,
        join: {
          from: `${this.tableName}.dailyRouteId`,
          to: `${DailyRoute.tableName}.id`,
        },
      },
      weightTicketMedia: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: WeightTicketMedia,
        join: {
          from: `${this.tableName}.id`,
          to: `${WeightTicketMedia.tableName}.weightTicketId`,
        },
      },
    };
  }

  static async afterInsert(args) {
    const { transaction, result } = args;
    const { DailyRouteHistory } = this.models;

    await Promise.all(
      result.map(wt =>
        DailyRouteHistory.recordWeightTicketData(
          {
            dailyRouteId: wt.dailyRouteId,
            data: wt,
            eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.create,
          },
          transaction,
        ),
      ),
    );
  }

  static async afterUpdate(args) {
    const { transaction, result } = args;
    const { DailyRouteHistory } = this.models;

    await Promise.all(
      result.map(wt =>
        DailyRouteHistory.recordWeightTicketData(
          {
            dailyRouteId: wt.dailyRouteId,
            data: wt,
            eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.generic,
          },
          transaction,
        ),
      ),
    );
  }

  static async beforeDelete(args) {
    const { asFindQuery, transaction } = args;
    const { DailyRouteHistory } = this.models;

    const weightTicketsForDelete = await asFindQuery().select('*');

    await Promise.all(
      weightTicketsForDelete.map(wt =>
        DailyRouteHistory.recordWeightTicketData(
          {
            dailyRouteId: wt.dailyRouteId,
            data: wt,
            eventType: DAILY_ROUTE_HISTORICAL_EVENT_TYPE.delete,
          },
          transaction,
        ),
      ),
    );
  }

  static async create(input, media, isAutoAttachFromRecycling = false) {
    const trx = await this.startTransaction();
    const { WeightTicketMedia } = this.models;

    try {
      const { authorId, authorName, ticketNumber, ...restInput } = input;

      if (isAutoAttachFromRecycling) {
        const existingWeightTicket = await this.getBy(
          { condition: { ticketNumber }, fields: ['id'] },
          trx,
        );

        if (existingWeightTicket.id) {
          // TT-11 added .id to remove " Unnecessary conditional, value is always truthy" error
          await this.delete(existingWeightTicket.id, trx);
        }
      }

      const weightTicket = await this.query(trx).upsertGraphAndFetch({
        ...restInput,
        ticketNumber,
        authorId: authorId || this.user.id,
        authorName: authorName || this.user.name,
      });

      await WeightTicketMedia.create(
        { media, weightTicketId: weightTicket.id, isAutoAttachFromRecycling },
        trx,
      );

      await trx.commit();

      return weightTicket;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async createFromDriver(input) {
    const trx = await this.startTransaction();
    const { WeightTicketMedia } = this.models;

    try {
      const { url, ...data } = input;

      const weightTicket = await this.query(trx).upsertGraphAndFetch({
        ...data,
        authorId: this.user.id,
        authorName: this.user.name,
      });

      await WeightTicketMedia.createFromUrl(
        {
          url,
          weightTicketId: weightTicket.id,
        },
        trx,
      );

      await trx.commit();

      return weightTicket;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async update(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { WeightTicketMedia } = this.models;
    const { id, input, media } = options;

    try {
      const weightTicket = await this.patchAndFetchById(id, input, trx);

      if (!media.id) {
        await WeightTicketMedia.deleteByWeightTicketId(id, trx);
        await WeightTicketMedia.create(
          {
            media,
            weightTicketId: id,
          },
          trx,
        );
      }

      await trx.commit();

      return weightTicket;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async updateFromDriver(options, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { WeightTicketMedia } = this.models;
    const { id, url, ...data } = options;

    try {
      const weightTicket = await this.patchAndFetchById(id, data, trx);

      if (url) {
        const { url: prevUrl } = await WeightTicketMedia.getBy(
          { condition: { weightTicketId: id }, fields: ['url'] },
          trx,
        );

        if (prevUrl !== url) {
          await WeightTicketMedia.deleteByWeightTicketId(id, trx);
          await WeightTicketMedia.createFromUrl(
            {
              url,
              weightTicketId: weightTicket.id,
            },
            trx,
          );
        }
      }

      await trx.commit();

      return weightTicket;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  static async delete(id, outerTransaction) {
    const trx = outerTransaction ?? (await this.startTransaction());
    const { WeightTicketMedia } = this.models;

    try {
      await WeightTicketMedia.deleteByWeightTicketId(id, trx);
      await this.deleteById(id, trx);

      if (!outerTransaction) {
        await trx.commit();
      }

      return id;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
