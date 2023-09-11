import httpStatus from 'http-status';

import { HAULING_SUBSCRIPTIONS, HAULING_SUBSCRIPTIONS_DRAFTS } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { makeHaulingApiRequest } from './common.js';

export const getHaulingSubscriptionsCount = async (ctx) => {
  const url = `${HAULING_SUBSCRIPTIONS}/count`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingSubscriptions = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_SUBSCRIPTIONS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingSubscriptionById = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_SUBSCRIPTIONS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const searchHaulingSubscriptions = async (ctx) => {
  const url = `${HAULING_SUBSCRIPTIONS}/search`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingSubscriptionsDraftsCount = async (ctx) => {
  const url = `${HAULING_SUBSCRIPTIONS_DRAFTS}/count`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingSubscriptionsDrafts = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_SUBSCRIPTIONS_DRAFTS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingSubscriptionDraftById = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_SUBSCRIPTIONS_DRAFTS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const searchHaulingSubscriptionDrafts = async (ctx) => {
  const url = `${HAULING_SUBSCRIPTIONS_DRAFTS}/search`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};
