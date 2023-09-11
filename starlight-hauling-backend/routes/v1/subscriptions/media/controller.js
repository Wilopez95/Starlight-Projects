import httpStatus from 'http-status';

import SubscriptionMediaRepository from '../../../../repos/subscriptionMedia.js';

import { getSignedUrl } from '../../../../services/mediaStorage.js';
import { sendFileLink } from '../../../../services/email.js';
import { subscriptionHistoryEmitter } from '../../../../services/subscriptionHistory/emitter.js';

import { SUBSCRIPTION_HISTORY_EVENT } from '../../../../consts/subscriptionHistoryEvents.js';
import { SUBSCTIPTION_HISTORY_ACTION } from '../../../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../../../consts/subscriptionHistoryEntities.js';
import { SUBSCTIPTION_HISTORY_ENTITY_ACTION } from '../../../../consts/subscriptionHistoryEntityActions.js';

import ApiError from '../../../../errors/ApiError.js';

const ITEMS_PER_PAGE = 8;

export const getSubscriptionsMedia = async ctx => {
  const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;
  const { subscriptionId } = ctx.params;
  const condition = {
    relationId: subscriptionId,
  };
  const subscriptionMedia = await SubscriptionMediaRepository.getInstance(
    ctx.state,
  ).getAllPaginated({ condition, skip, limit });

  ctx.sendArray(subscriptionMedia);
};

export const createSubscriptionMedia = async ctx => {
  const { firstName, lastName } = ctx.state.user;
  const { files } = ctx.request;
  const { subscriptionId } = ctx.params;
  const { draftId } = ctx.request.validated.query;

  const condition = {
    relationId: draftId,
  };
  const author = `${firstName} ${lastName}`;

  let fileUrlsArr = [];
  if (files && files.length > 0) {
    fileUrlsArr = files;
  } else if (draftId) {
    const draftMedia = await SubscriptionMediaRepository.getInstance(ctx.state).getAllPaginated({
      condition,
      skip: null,
      limit: null,
    });
    fileUrlsArr = draftMedia.map(dm => dm.url);
  }

  if (!fileUrlsArr?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }

  const responseArr = await Promise.all(
    fileUrlsArr.map(async file => {
      if (file.error) {
        return file;
      }
      const media = await SubscriptionMediaRepository.getInstance(ctx.state).createOneFromUrl(
        subscriptionId,
        file,
        author,
      );
      if (!media.error) {
        subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.additionalAction, ctx.state, {
          action: SUBSCTIPTION_HISTORY_ACTION.added,
          entity: SUBSCTIPTION_HISTORY_ENTITY.media,
          entityAction: SUBSCTIPTION_HISTORY_ENTITY_ACTION.mediaAttached,
          subscriptionId,
          newValue: media.fileName,
        });
      }

      return media;
    }),
  );

  ctx.sendArray(responseArr);
};

export const deleteSubscriptionMedia = async ctx => {
  const { id } = ctx.params;

  const deletedMedia = await SubscriptionMediaRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
  });

  if (deletedMedia) {
    subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.additionalAction, ctx.state, {
      action: SUBSCTIPTION_HISTORY_ACTION.removed,
      entity: SUBSCTIPTION_HISTORY_ENTITY.media,
      entityAction: SUBSCTIPTION_HISTORY_ENTITY_ACTION.mediaDeleted,
      subscriptionId: deletedMedia.subscriptionId,
      previousValue: deletedMedia.fileName,
    });
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const sendFileInEmail = async ctx => {
  const { id } = ctx.params;
  const { email } = ctx.request.validated.body;

  const media = await SubscriptionMediaRepository.getInstance(ctx.state).getById({
    id,
  });

  if (!media?.url) {
    throw ApiError.invalidRequest(`Contract media with such id: ${id} was not found`);
  }

  const signedUrl = await getSignedUrl(media.url);

  await sendFileLink(email, signedUrl);

  ctx.status = httpStatus.NO_CONTENT;
};
