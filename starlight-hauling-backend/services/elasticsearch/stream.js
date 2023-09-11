import { Transform } from 'stream';

import compose from 'lodash/fp/compose.js';

import { INDEX_RESYNC_MAX_BATCH_SIZE } from '../../config.js';
import { clean, streamDocuments } from './ElasticSearch.js';

export default async (
  ctx,
  { repo, index, condition, fields, dataMapper, logPrefix, serviceData },
) => {
  if (serviceData) {
    serviceData.map(element => {
      delete element.businessUnitId;
      delete element.businessLineId;
      delete element.serviceFrequencyAggregated;
      delete element.serviceName;
      delete element.serviceItems;
      return element;
    });
  }

  ctx.logger.debug(`es->${logPrefix}->publisher->${index}->schema: ${repo.schemaName}`);

  const highWaterMark = +INDEX_RESYNC_MAX_BATCH_SIZE || 100;
  // ts - transform stream
  const dbDataTs = repo.streamAllData({
    options: {
      objectMode: true,
      highWaterMark,
    },
    condition,
    fields,
    serviceData,
  });

  const mapDataItem = compose(clean, dataMapper);

  const dataMapperTs = new Transform({
    objectMode: true,
    highWaterMark,

    transform(chunk, encoding, callback) {
      callback(null, mapDataItem(chunk));
    },
  });

  dbDataTs
    .once('error', error => {
      ctx.logger.error(error, `Sync failed for "${index}" index. Dropped sync/streaming`);
      dbDataTs.emit('close');
    })
    .once('close', () => {
      dataMapperTs.destroy();
      dbDataTs.destroy();
    });

  dataMapperTs
    .once('readable', () => ctx.logger.info(`es->${logPrefix}-sync-started`))
    .once('end', () => ctx.logger.info(`es->${logPrefix}-sync-finished`))
    .once('error', error => {
      ctx.logger.error(error, `Mapping failed for '${index}' index. Dropped mapping/streaming`);
      dbDataTs.emit('close');
    })
    .once('close', () => dataMapperTs.destroy());

  dbDataTs.pipe(dataMapperTs);

  let counter = 0;
  try {
    counter = await streamDocuments(ctx, index, dataMapperTs);
  } catch (error) {
    ctx.logger.error(error, error?.body?.error);

    dataMapperTs?.destroy?.();
    dbDataTs?.destroy?.();
  }

  ctx.logger.debug(`es->${logPrefix}->publisher->${index}->count: ${counter}`);
  ctx.logger.info(`Sync for "${counter}" items for "${index}" index is done`);
};
