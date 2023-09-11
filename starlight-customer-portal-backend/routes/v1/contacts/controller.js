import httpStatus from 'http-status';

import {
  getHaulingContacts,
  getHaulingContactById,
  createHaulingContact,
  editHaulingContact,
  getMyHaulingContact,
  editMyHaulingContact,
  deleteHaulingContact,
} from '../../../services/hauling/contacts.js';

export const getContacts = async (ctx) => {
  const data = await getHaulingContacts(ctx);
  ctx.sendArray(data);
};

export const getContactById = async (ctx) => {
  const data = await getHaulingContactById(ctx);
  ctx.sendObj(data);
};

export const createContact = async (ctx) => {
  const data = await createHaulingContact(ctx);
  ctx.body = data;
  ctx.status = httpStatus.CREATED;
};

export const editContact = async (ctx) => {
  const data = await editHaulingContact(ctx);
  ctx.sendObj(data);
};

export const deleteContact = async (ctx) => {
  await deleteHaulingContact(ctx);
  ctx.status = httpStatus.NO_CONTENT;
};

export const getMyContact = async (ctx) => {
  const data = await getMyHaulingContact(ctx);
  ctx.sendObj(data);
};

export const editMyContact = async (ctx) => {
  const data = await editMyHaulingContact(ctx);
  ctx.sendObj(data);
};
