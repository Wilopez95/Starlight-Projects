import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import ContactRepo from '../../../repos/contact.js';

import ApiError from '../../../errors/ApiError.js';
import { NOT_FOUND } from '../../../errors/codes.js';

import { syncCustomerData } from '../../../services/billingProcessor.js';
import * as routePlannerService from '../../../services/routePlanner/publishers.js';

import { PHONE_TYPE } from '../../../consts/phoneTypes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { CONTACT_SORTING_ATTRIBUTE } from '../../../consts/contactSortingAttributes.js';

const CONTACTS_PER_PAGE = 25;

const getContactData = pick([
  'active',
  'main',
  'customerId',
  'firstName',
  'lastName',
  'email',
  'jobTitle',
  'phoneNumbers',
  'allowContractorApp',
  'allowCustomerPortal',
]);

export const getContacts = async ctx => {
  const {
    customerId,
    skip = 0,
    limit = CONTACTS_PER_PAGE,
    sortBy = CONTACT_SORTING_ATTRIBUTE.status,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.query;
  const condition = {};
  customerId && (condition.customerId = customerId);
  if (ctx.request.query.activeOnly) {
    condition.active = true;
  }

  const contacts = await ContactRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    sortBy,
    sortOrder,
    skip: Number(skip),
    limit: Math.min(Number(limit), CONTACTS_PER_PAGE),
  });

  ctx.sendArray(contacts);
};

export const getContactById = async ctx => {
  const { id } = ctx.params;

  const contact = await ContactRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(contact);
};

export const createContact = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;
  const data = getContactData(ctx.request.body);
  const { businessUnitId } = ctx.getRequestCondition();

  const newContact = await ContactRepo.getInstance(ctx.state).createOne({
    data,
    tenantId,
    businessUnitId,
    log: true,
  });

  if (newContact.mainPhoneNumber && newContact.customerId) {
    const { customerId, mainPhoneNumber } = newContact;
    await syncCustomerData(ctx, {
      id: customerId,
      mainPhoneNumber,
      schemaName,
    });
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newContact;
};

export const editContact = async ctx => {
  const {
    user: { schemaName, tenantId },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { businessUnitId } = ctx.getRequestCondition();
  const data = getContactData(ctx.request.body);

  const updatedContact = await ContactRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    tenantId,
    businessUnitId,
    log: true,
  });

  if (updatedContact.mainPhoneNumber) {
    const { customerId, mainPhoneNumber } = updatedContact;
    await syncCustomerData(ctx, {
      id: customerId,
      mainPhoneNumber,
      schemaName,
    });
  }

  const contactMainPhoneNumber = updatedContact.phoneNumbers?.find(
    phoneNumber => phoneNumber.type === PHONE_TYPE.main,
  )?.number;

  if (contactMainPhoneNumber) {
    const { customerId, id: contactId } = updatedContact;
    await routePlannerService.upsertCustomer(ctx, {
      id: customerId,
      contactId,
      mainPhoneNumber: contactMainPhoneNumber,
      schemaName,
    });
  }

  ctx.sendObj(updatedContact);
};

export const deleteContact = async ctx => {
  const { id } = ctx.params;

  try {
    await ContactRepo.getInstance(ctx.state).deleteBy({
      condition: { id, active: false },
      log: true,
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
