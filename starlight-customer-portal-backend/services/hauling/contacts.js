import httpStatus from 'http-status';

import { HAULING_CONTACTS } from '../../consts/routes.js';
import { GET, PUT, POST, DELETE } from '../../consts/methods.js';
import { makeHaulingApiRequest } from './common.js';

export const getHaulingContacts = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_CONTACTS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingContactById = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_CONTACTS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const createHaulingContact = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_CONTACTS,
    method: POST,
    successStatus: httpStatus.CREATED,
  });
  return data;
};

export const editHaulingContact = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_CONTACTS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: PUT,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const deleteHaulingContact = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_CONTACTS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: DELETE,
    successStatus: httpStatus.NO_CONTENT,
  });
  return data;
};

export const getMyHaulingContact = async (ctx) => {
  const url = `${HAULING_CONTACTS}/me`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const editMyHaulingContact = async (ctx) => {
  const url = `${HAULING_CONTACTS}/me`;
  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: PUT,
    successStatus: httpStatus.OK,
  });
  return data;
};
