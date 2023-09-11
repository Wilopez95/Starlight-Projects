import { v4 as uuidv4 } from 'uuid';

import { TABLES } from '../consts/tables.js';
import { MEDIA_STORAGE_KEY, MEDIA_TABLE_NAME } from '../consts/mediaStorage.js';
import { DEFAULT_PRIVATE_MEDIA_URL } from '../consts/weightTicketMedia.js';

import * as bucketMediaStorage from '../services/mediaStorage.js';
import { RecyclingService } from '../services/recycling.js';
import { getFilenameFromUrl } from '../utils/urlUtil.js';
import BaseModel from './_base.js';

export default class WeightTicketMedia extends BaseModel {
  static get tableName() {
    return TABLES.WEIGHT_TICKETS_MEDIA;
  }

  static get jsonSchema() {
    return {
      type: 'object',

      properties: {
        id: { type: 'string' },
        weightTicketId: { type: 'integer' },
        url: { type: 'string' },
        timestamp: { type: ['string', null] },
        author: { type: ['string', null] },
        fileName: { type: ['string', null] },
        recyclingBusinessUnitId: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
    const { WeightTicket } = this.models;

    return {
      weightTicket: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: WeightTicket,
        join: {
          from: `${this.tableName}.weightTicketId`,
          to: `${WeightTicket.tableName}.id`,
        },
      },
    };
  }

  static async create(options, trx) {
    const { weightTicketId, media, isAutoAttachFromRecycling } = options;

    if (isAutoAttachFromRecycling) {
      const data = await this.query(trx).insert({ ...media, weightTicketId });
      return data;
    }

    if (!media?.file) {
      return null;
    }

    const { mediaId, filename, url } = await this._uploadMediaToBucket(media);

    const mediaDataToSaveInDb = {
      id: mediaId,
      fileName: filename,
      url,
      timestamp: new Date().toUTCString(),
      author: this.user.email,
      weightTicketId,
    };

    const data = await this.query(trx).insert(mediaDataToSaveInDb);

    return data;
  }

  static async createFromUrl(options, trx) {
    const { weightTicketId, url } = options;

    const mediaId = uuidv4();
    const fileName = getFilenameFromUrl(url);

    const mediaDataToSaveInDb = {
      id: mediaId,
      fileName,
      url,
      timestamp: new Date().toUTCString(),
      author: this.user.email,
      weightTicketId,
    };

    const data = await this.query(trx).insert(mediaDataToSaveInDb);

    return data;
  }

  static async deleteByWeightTicketId(weightTicketId, trx) {
    const weightTicketMedia = await this.getBy(
      { condition: { weightTicketId }, fields: ['url'] },
      trx,
    );

    const { url } = weightTicketMedia;

    if (url !== DEFAULT_PRIVATE_MEDIA_URL) {
      await bucketMediaStorage.deleteFileByUrl(url);
      await this.query(trx).delete().where({ weightTicketId });
    }
  }

  static async getRecyclingTicketUrlByTicketId(ticketId) {
    const { WeightTicket } = this.models;

    const { ticketNumber, recyclingBusinessUnitId } = await WeightTicket.getById(ticketId, [
      'ticketNumber',
      'recyclingBusinessUnitId',
    ]);
    const ticketNumberInt = Number(ticketNumber); // On recycling side ticketNumber has integer type

    // On recycling side ticketNumber === orderId
    const response = await RecyclingService.getOrder(ticketNumberInt, {
      user: this.user,
      schemaName: this.schemaName,
      recyclingBusinessUnitId,
    });

    return response.data.order.weightTicketUrl;
  }

  static async _uploadMediaToBucket(media) {
    const { filename, createReadStream } = media.file;
    const file = createReadStream();
    const mediaId = uuidv4();

    try {
      const uploadedMediaUrl = await bucketMediaStorage.storeFile({
        schema: this.schemaName,
        key: MEDIA_STORAGE_KEY.weightTicketMedia,
        meta: { tableName: MEDIA_TABLE_NAME, mediaId, filename },
        file,
      });

      return {
        url: uploadedMediaUrl,
        filename,
        mediaId,
      };
    } catch (error) {
      throw new Error(`Cannot upload media to bucket: ${error.message}`);
    }
  }
}
