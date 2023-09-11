import httpStatus from 'http-status';

import CustomerMediaRepository from '../../../../repos/customerMedia.js';
import { getSignedUrl } from '../../../../services/mediaStorage.js';
import { sendFileLink } from '../../../../services/email.js';

import ApiError from '../../../../errors/ApiError.js';

const ITEMS_PER_PAGE = 8;

export const getCustomerMedia = async ctx => {
  const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;
  const { customerId } = ctx.params;

  const condition = {
    relationId: customerId,
  };

  const subscriptionMedia = await CustomerMediaRepository.getInstance(ctx.state).getAllPaginated({
    condition,
    skip,
    limit,
  });

  ctx.sendArray(subscriptionMedia);
};

export const createCustomerMedia = async ctx => {
  const { customerId } = ctx.params;
  const { files } = ctx.request;

  if (!files?.length) {
    throw ApiError.invalidRequest('Array of files is empty');
  }

  const responseArr = await Promise.all(
    files.map(file =>
      file.error
        ? file
        : CustomerMediaRepository.getInstance(ctx.state).createOneFromUrl(customerId, file),
    ),
  );

  ctx.sendArray(responseArr);
};

export const deleteCustomerMedia = async ctx => {
  const { id } = ctx.params;

  await CustomerMediaRepository.getInstance(ctx.state).deleteBy({ condition: { id } });

  ctx.status = httpStatus.NO_CONTENT;
};

export const sendFileInEmail = async ctx => {
  const { id } = ctx.params;
  const { email } = ctx.request.validated.body;

  const media = await CustomerMediaRepository.getInstance(ctx.state).getById({ id });

  if (!media?.url) {
    throw ApiError.invalidRequest(`Contract media with such id: ${id} was not found`);
  }

  const signedUrl = await getSignedUrl(media.url);

  await sendFileLink(email, signedUrl);

  ctx.status = httpStatus.NO_CONTENT;
};
