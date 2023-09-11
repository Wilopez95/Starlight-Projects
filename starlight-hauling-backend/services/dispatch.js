import { makeDispatchRequest } from '../utils/makeRequest.js';

import ApiError from '../errors/ApiError.js';

export const createWorkOrder = (ctx, data) =>
  makeDispatchRequest(ctx, { method: 'post', url: '/workorders', data }).catch(error => {
    ctx.logger.error(error);
    throw ApiError.unknown('Dispatch API returned an error');
  });

export const updateWorkOrder = (ctx, woNumber, data) =>
  makeDispatchRequest(ctx, { method: 'put', url: `/workorders/${woNumber}`, data });

export const deleteWorkOrder = (ctx, woNumber) =>
  makeDispatchRequest(ctx, { method: 'delete', url: `/workorders/${woNumber}` }).catch(error => {
    ctx.logger.error(error, 'Failed to remove note from dispatch');
    throw error;
  });

export const getWorkOrder = (ctx, woNumber) =>
  makeDispatchRequest(ctx, { method: 'get', url: `/workorders/${woNumber}` });

export const getWorkOrderNotes = (ctx, woNumber) =>
  makeDispatchRequest(ctx, { method: 'get', url: `/workorders/${woNumber}/note` }).catch(error => {
    ctx.logger.error(error, 'Error while fetching WO notes');
    throw error;
  });

export const getAllWorkOrderNotes = (ctx, woNumbers) =>
  makeDispatchRequest(ctx, {
    method: 'get',
    url: `/workorders/notes?workOrders=${woNumbers.join(',')}`,
  }).catch(error => {
    ctx.logger.error(error, 'Error while fetching WO notes');
    throw error;
  });

export const getCansData = (ctx, ids) => {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('id', id));
  params.set('withTransactions', '0');

  return makeDispatchRequest(ctx, { method: 'get', url: `/cans?${params.toString()}}` });
};

export const createWorkOrderNote = (ctx, woNumber, data) =>
  makeDispatchRequest(ctx, { method: 'post', url: `/workorders/${woNumber}/note`, data }).catch(
    error => {
      ctx.logger.error(error);
      throw ApiError.unknown('Dispatch API returned an error');
    },
  );

export const deleteWorkOrderNote = (ctx, woNumber, noteId) =>
  makeDispatchRequest(ctx, {
    method: 'delete',
    url: `/workorders/${woNumber}/note/${noteId}`,
  }).catch(error => {
    ctx.logger.error(error, 'Failed to remove note from dispatch');
    throw error;
  });
