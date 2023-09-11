import httpStatus from 'http-status';

import {
  applyTenantToIndex,
  getIndexAliasName,
  dropIndex,
  verifyIndexName,
} from '../../../../services/elasticsearch/ElasticSearch.js';
import { sync } from '../../../../services/elasticsearch/sync.js';

export const reSyncIndex = async ctx => {
  const { index, namespace, awaitSync = true } = ctx.request.validated.body;

  index && verifyIndexName(index);

  if (awaitSync) {
    await sync(ctx, {
      resyncRequired: true,
      templatesFilter: index ? [index] : [],
      tenantsFilter: namespace ? [namespace] : [],
    });

    ctx.status = httpStatus.OK;
  } else {
    sync(ctx, {
      resyncRequired: true,
      templatesFilter: index ? [index] : [],
      tenantsFilter: namespace ? [namespace] : [],
    });

    ctx.status = httpStatus.ACCEPTED;
  }
};

export const createIndex = async ctx => {
  const { index, namespace } = ctx.request.validated.body;

  index && verifyIndexName(index);

  await sync(ctx, {
    resyncRequired: true,
    templatesFilter: [index],
    tenantsFilter: [namespace],
  });

  ctx.status = httpStatus.OK;
};

export const deleteIndex = async ctx => {
  const { index, namespace } = ctx.request.validated.body;

  index && verifyIndexName(index);

  const idxName = await getIndexAliasName(ctx, applyTenantToIndex(index, namespace));

  if (!idxName) {
    ctx.status = httpStatus.NOT_FOUND;
  } else {
    await dropIndex(ctx, idxName);

    ctx.status = httpStatus.NO_CONTENT;
  }
};
