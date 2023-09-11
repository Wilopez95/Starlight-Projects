import httpStatus from 'http-status';

import SubscriptionMediaRepository from '../../../../repos/subscriptionMedia.js';

import ApiError from '../../../../errors/ApiError.js';

const ITEMS_PER_PAGE = 8;

export const getSubscriptionDraftMedia = async ctx => {
  const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;
  const { subscriptionDraftId } = ctx.params;

  const condition = {
    relationId: subscriptionDraftId,
  };

  const subscriptionMedia = await SubscriptionMediaRepository.getInstance(
    ctx.state,
  ).getAllPaginated({ condition, skip, limit });

  ctx.sendArray(subscriptionMedia);
};

export const createSubscriptionDraftMedia = async ctx => {
  const { email } = ctx.state.user;
  const { files } = ctx.request;
  const { subscriptionDraftId } = ctx.params;

  if (!files?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }

  const responseArr = await Promise.all(
    files.map(file =>
      file.error
        ? file
        : SubscriptionMediaRepository.getInstance(ctx.state).createOneFromUrl(
            subscriptionDraftId,
            file,
            email,
          ),
    ),
  );

  ctx.sendArray(responseArr);
};

export const deleteSubscriptionDraftMedia = async ctx => {
  const { id } = ctx.params;

  await SubscriptionMediaRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
  });

  ctx.status = httpStatus.NO_CONTENT;
};
