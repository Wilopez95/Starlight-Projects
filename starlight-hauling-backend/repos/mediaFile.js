import { deleteFileByUrl } from '../services/mediaStorage.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'media_files';

class MediaFileRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getUrlsByWorkOrderId(workOrderId, trx = this.knex) {
    const images = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ workOrderId })
      .select(['url']);

    return images;
  }

  async getAllGroupedByWorkOrder(workOrderIds, trx = this.knex) {
    const groupedMediaFiles = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('workOrderId', workOrderIds)
      .select(
        trx.raw(
          `json_agg(
                        json_build_object('id', id, 'url', url, 'fileName', file_name)
                    ) as media_files`,
        ),
        'workOrderId',
      )
      .groupBy('workOrderId');

    // groupedMediaFiles.forEach((group) => {
    //     group.mediaFiles = group.mediaFiles.map(camelCaseKeys);
    // });

    return groupedMediaFiles?.length ? groupedMediaFiles : [];
  }

  // not upsert, insert only if new dispathId comes
  async upsertByDispatchId({ mediaFiles, workOrderId }, trx = this.knex) {
    const existingFiles = await super.getAll(
      { condition: { workOrderId }, fields: ['id', 'url'] },
      trx,
    );

    if (existingFiles?.length) {
      const existUrls = existingFiles?.map(({ url }) => url) ?? [];
      const existIds = existingFiles?.map(({ id }) => id) ?? [];
      await Promise.all(
        existUrls.map(url =>
          deleteFileByUrl(url).catch(error =>
            this.ctxState.logger.error(error, `Could not remove file ${url}`),
          ),
        ),
      );
      await super.deleteByIds({ ids: existIds }, trx);
    }

    let newFiles = [];
    if (mediaFiles?.length) {
      mediaFiles.forEach(item => (item.workOrderId = workOrderId));

      newFiles = await super.insertMany({ data: mediaFiles }, trx);
    }

    return newFiles;
  }
}

MediaFileRepository.TABLE_NAME = TABLE_NAME;

export default MediaFileRepository;
