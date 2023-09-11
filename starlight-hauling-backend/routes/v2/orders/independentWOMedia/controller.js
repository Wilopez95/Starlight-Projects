import httpStatus from 'http-status';

import IndependentWorkOrderMediaRepository from '../../../../repos/independentWorkOrderMedia.js';

import ApiError from '../../../../errors/ApiError.js';
import { syncWosMedia } from '../../../../services/routePlanner/publishers.js';
import { SYNC_WOS_MEDIA_ACTION } from '../../../../consts/workOrderMedia.js';

const ITEMS_PER_PAGE = 8;

export const getWorkOrdersMedia = async ctx => {
  const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;
  const { independentWorkOrderId } = ctx.params;

  const condition = {
    relationId: independentWorkOrderId,
  };

  const subscriptionMedia = await IndependentWorkOrderMediaRepository.getInstance(
    ctx.state,
  ).getAllPaginated({ condition, skip, limit });

  ctx.sendArray(subscriptionMedia);
};

export const createWorkOrdersMedia = async ctx => {
  const { email } = ctx.state.user;
  const { files } = ctx.request;
  const { subscriptionWorkOrderId } = ctx.params;

  if (!files?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }

  const responseArr = await Promise.all(
    files.map(file =>
      file.error
        ? file
        : IndependentWorkOrderMediaRepository.getInstance(ctx.state).createOneFromUrl(
            subscriptionWorkOrderId,
            file,
            email,
          ),
    ),
  );

  await syncWosMedia(ctx, {
    media: responseArr,
    action: SYNC_WOS_MEDIA_ACTION.create,
    isIndependent: true,
  });

  ctx.sendArray(responseArr);
};

export const deleteWorkOrdersMedia = async ctx => {
  const { id } = ctx.params;

  await IndependentWorkOrderMediaRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
  });

  await syncWosMedia(ctx, { media: [{ id }], action: SYNC_WOS_MEDIA_ACTION.delete });

  ctx.status = httpStatus.NO_CONTENT;
};
