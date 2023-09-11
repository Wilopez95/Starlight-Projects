import httpStatus from 'http-status';

import SubscriptionWorkOrderMediaRepository from '../../../../repos/subscriptionWorkOrderMedia.js';
import { getSignedUrl } from '../../../../services/mediaStorage.js';
import { sendFileLink } from '../../../../services/email.js';

import { syncWosMedia } from '../../../../services/routePlanner/publishers.js';

import ApiError from '../../../../errors/ApiError.js';
import { SYNC_WOS_MEDIA_ACTION } from '../../../../consts/workOrderMedia.js';

import {
  pricingCreateFromUrlSubscriptionWorkOrderMedia,
  pricingCreateFromUrlSubscriptionOrderMedia,
  pricingGetSubscriptionWorkOrderMedia,
} from '../../../../services/pricing.js';

export const getWorkOrdersMedia = async ctx => {
  // pre-pricing service code:
  // const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;
  // const { subscriptionWorkOrderId } = ctx.params;

  // const condition = {
  //   relationId: subscriptionWorkOrderId,
  // };

  // const subscriptionMedia = await SubscriptionWorkOrderMediaRepository.getInstance(
  //   ctx.state,
  // ).getAllPaginated({ condition, skip, limit });
  const { subscriptionWorkOrderId } = ctx.params;

  const subscriptionMedia = await pricingGetSubscriptionWorkOrderMedia(ctx, {
    data: { id: subscriptionWorkOrderId },
  });

  ctx.sendArray(subscriptionMedia);
};

export const createWorkOrdersMedia = async ctx => {
  const { email } = ctx.state.user;
  const { files } = ctx.request.body;
  const { subscriptionWorkOrderId } = ctx.params;

  if (!files?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }
  const responseArr = await Promise.all(
    files.map(file =>
      file.error
        ? file
        : // pre-pricing service code:
          // : SubscriptionWorkOrderMediaRepository.getInstance(ctx.state).createOneFromUrl(
          //     subscriptionWorkOrderId,
          //     file,
          //     email,
          //   ),
          pricingCreateFromUrlSubscriptionWorkOrderMedia(ctx, {
            data: {
              subscriptionWorkOrderId,
              url: file,
              author: email,
            },
          }),
    ),
    files.map(file =>
      file.error
        ? file
        : // pre-pricing service code:
          // : SubscriptionOrderMediaRepo.getInstance(ctx.state).createOneFromUrl(
          //     subscriptionWorkOrderId,
          //     file,
          //     email,
          //   ),
          pricingCreateFromUrlSubscriptionOrderMedia(ctx, {
            data: {
              subscriptionWorkOrderId,
              url: file,
              author: email,
            },
          }),
    ),
  );

  await syncWosMedia(ctx, {
    media: responseArr,
    action: SYNC_WOS_MEDIA_ACTION.create,
    isIndependent: false,
  });

  ctx.sendArray(responseArr);
};

export const deleteWorkOrdersMedia = async ctx => {
  const { id } = ctx.params;

  await SubscriptionWorkOrderMediaRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
  });

  await syncWosMedia(ctx, { media: [{ id }], action: SYNC_WOS_MEDIA_ACTION.delete });

  ctx.status = httpStatus.NO_CONTENT;
};

export const sendFileInEmail = async ctx => {
  const { id } = ctx.params;
  const { email } = ctx.request.validated.body;

  const media = await pricingGetSubscriptionWorkOrderMedia(ctx, { data: { id } });

  if (!media?.url) {
    throw ApiError.invalidRequest(`Contract media with such id: ${id} was not found`);
  }

  const signedUrl = await getSignedUrl(media.url);

  await sendFileLink(email, signedUrl);

  ctx.status = httpStatus.NO_CONTENT;
};
