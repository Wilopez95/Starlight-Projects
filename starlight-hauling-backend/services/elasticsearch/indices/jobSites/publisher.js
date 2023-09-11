import JobSiteRepo from '../../../../repos/jobSite.js';

import { indexDocument } from '../../ElasticSearch.js';
import streamData from '../../stream.js';

export const publish = (ctx, schema, index, item) => {
  ctx.logger.debug(`es->jobSites->publish->${index}->schema: ${schema}`);

  setImmediate(async () => {
    try {
      await indexDocument(ctx, index, item);
    } catch (error) {
      ctx.logger.error(error, `Error while indexing job site with id ${item.id}`);
    }
  });
};

export const publisher = async (ctx, schema, index) => {
  const repo = JobSiteRepo.getInstance(ctx.state, { schemaName: schema });

  await streamData(ctx, {
    repo,
    index,
    dataMapper: jobSite => {
      const item = repo.mapFields(jobSite);
      return repo.mapToIndex(item);
    },
    logPrefix: 'jobSites',
  });
};
