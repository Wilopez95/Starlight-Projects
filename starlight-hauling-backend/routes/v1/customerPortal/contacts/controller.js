import httpStatus from 'http-status';

import ContactRepo from '../../../../repos/contact.js';
import ApiError from '../../../../errors/ApiError.js';
import { NOT_FOUND } from '../../../../errors/codes.js';

const DEFAULT_SKIP = 0;
const DEFAULT_LIMIT = 25;

const requiredPortalUserProps = ['customerId', 'tenantId', 'tenantName'];
const checkPortalUserProperties = user => {
  const invalidProps = requiredPortalUserProps.filter(prop => !user[prop]);
  if (invalidProps.length) {
    throw ApiError.invalidRequest(
      `Missing required Customer Portal user properties: "${invalidProps.join(', ')}"`,
    );
  }
};

export const getContacts = async ctx => {
  const { tenantName } = ctx.state.user;
  const {
    customerId,
    activeOnly,
    skip = DEFAULT_SKIP,
    limit = DEFAULT_LIMIT,
  } = ctx.request.validated.query;

  const condition = { customerId };
  if (activeOnly) {
    condition.active = true;
  }

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const contacts = await contactRepo.getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Number(limit),
  });

  ctx.sendArray(contacts);
};

export const getContactById = async ctx => {
  const { tenantName } = ctx.state.user;
  const { customerId } = ctx.request.validated.query;
  const { id } = ctx.params;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const contact = await contactRepo.getBy({
    condition: { id, customerId },
  });

  ctx.sendObj(contact);
};

export const createContact = async ctx => {
  const { tenantName, tenantId } = ctx.state.user;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const newContact = await contactRepo.createOne({
    data: ctx.request.validated.body,
    tenantId,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newContact;
};

export const editContact = async ctx => {
  const { tenantName, tenantId } = ctx.state.user;
  const { customerId } = ctx.request.validated.body;
  const { id } = ctx.params;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const updatedContact = await contactRepo.updateBy({
    condition: { id, customerId },
    data: ctx.request.validated.body,
    tenantId,
  });

  ctx.sendObj(updatedContact);
};

export const deleteContact = async ctx => {
  const { tenantName } = ctx.state.user;
  const { id } = ctx.params;

  try {
    const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
    await contactRepo.deleteBy({
      condition: { id, active: false },
    });
  } catch (error) {
    if (error.code === NOT_FOUND) {
      throw ApiError.notFound(
        'Inactive Contact not found',
        `No inactive Contact exists with id ${id}`,
      );
    }
    throw error;
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const getMyContact = async ctx => {
  checkPortalUserProperties(ctx.state.user);
  const { email, customerId, tenantName } = ctx.state.user;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const contact = await contactRepo.getBy({
    condition: { email, customerId },
  });

  ctx.sendObj(contact);
};

export const editMyContact = async ctx => {
  checkPortalUserProperties(ctx.state.user);
  const { email, customerId, tenantName, tenantId } = ctx.state.user;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const contact = await contactRepo.updateBy({
    condition: { email, customerId },
    data: {
      ...ctx.request.validated.body,
      customerId,
    },
    tenantId,
  });

  ctx.sendObj(contact);
};
