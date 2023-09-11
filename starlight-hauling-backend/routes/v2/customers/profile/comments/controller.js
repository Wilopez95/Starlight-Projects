import httpStatus from 'http-status';

import CommentRepo from '../../../../../repos/customerComment.js';
import CustomerRepo from '../../../../../repos/customer.js';

import ApiError from '../../../../../errors/ApiError.js';

const customerNotFound = customerId =>
  ApiError.notFound('Customer not found', `Customer doesn't exist with id ${customerId}`);

export const getComments = async ctx => {
  const { customerId } = ctx.params;

  const [customer, comments] = await Promise.all([
    CustomerRepo.getInstance(ctx.state).getBy({
      condition: { id: customerId },
    }),
    CommentRepo.getInstance(ctx.state).getAllComments({
      condition: { customerId },
    }),
  ]);

  if (!customer) {
    throw customerNotFound(customerId);
  }

  ctx.sendArray(comments);
};

export const createComment = async ctx => {
  const { customerId } = ctx.params;
  const { content, authorId } = ctx.request.validated.body;

  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: customerId },
  });

  if (!customer) {
    throw customerNotFound(customerId);
  }

  const newComment = await CommentRepo.getInstance(ctx.state).createOne({
    data: {
      content,
      customerId,
      authorId,
    },
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newComment;
};

export const editComment = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { content, authorId } = ctx.request.validated.body;

  const updatedComment = await CommentRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: { content, authorId },
  });

  ctx.sendObj(updatedComment);
};

export const deleteComment = async ctx => {
  const { id } = ctx.params;

  await CommentRepo.getInstance(ctx.state).deleteBy({ condition: { id } });

  ctx.status = httpStatus.NO_CONTENT;
};
