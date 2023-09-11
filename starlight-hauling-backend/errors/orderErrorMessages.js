import ApiError from './ApiError.js';

export const orderNotFound = (id, status) => {
  const statusText = status ? ` and status ${status}` : '';
  return ApiError.notFound('Order not found', `Order with id ${id} ${statusText} doesn't exist`);
};
