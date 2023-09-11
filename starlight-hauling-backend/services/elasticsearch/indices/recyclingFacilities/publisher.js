import BusinessUnitRepo from '../../../../repos/businessUnit.js';

import { indexDocument } from '../../ElasticSearch.js';
import streamData from '../../stream.js';

import { BUSINESS_UNIT_TYPE } from '../../../../consts/businessUnitTypes.js';

export const publish = (ctx, schema, index, item) => {
  ctx.logger.debug(`es->recyclingFacilities->publish->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await indexDocument(ctx, index, item);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing recycling facility with id ${item.id}`);
    }
  });
};

export const publisher = async (ctx, schema, index) => {
  const repo = BusinessUnitRepo.getInstance(ctx.state, { schemaName: schema });

  await streamData(ctx, {
    repo,
    condition: { type: BUSINESS_UNIT_TYPE.recyclingFacility },
    index,
    dataMapper: bu => repo.mapToIndex(bu),
    logPrefix: 'recyclingFacilities',
  });
};
