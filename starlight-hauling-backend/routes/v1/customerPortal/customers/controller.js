import pick from 'lodash/fp/pick.js';
import map from 'lodash/map.js';

import CustomerRepo from '../../../../repos/customer.js';
import ContactRepo from '../../../../repos/contact.js';
import { syncCustomerData } from '../../../../services/billingProcessor.js';

const DEFAULT_SKIP = 0;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 1e5;

const commonCustomerFields = [
  'mailingAddress',
  'billingAddress',
  'phoneNumbers',
  'email',
  'contactId',

  'isAutopayExist',
  'autopayType',
  'autopayCreditCardId',
];
const getCommercialCustomerData = pick([
  ...commonCustomerFields,
  'businessName',
  'mainFirstName',
  'mainLastName',
  'mainJobTitle',
  'mainEmail',
  'mainPhoneNumbers',
]);
const getNonCommercialCustomerData = pick([...commonCustomerFields, 'firstName', 'lastName']);

const getCustomerIds = async ({ ctx, skip = DEFAULT_SKIP, limit = MAX_LIMIT }) => {
  const { email, tenantName } = ctx.state.user;

  const contactRepo = ContactRepo.getInstance(ctx.state, { schemaName: tenantName });
  const contacts = await contactRepo.getAllPaginated({
    condition: { email, allowCustomerPortal: true, active: true },
    fields: ['customerId'],
    skip: Number(skip),
    limit: Number(limit),
  });
  return map(contacts, 'customerId');
};

export const getCustomers = async ctx => {
  const { tenantName } = ctx.state.user;
  const { skip = DEFAULT_SKIP, limit = DEFAULT_LIMIT } = ctx.request.validated.query;
  const customerIds = await getCustomerIds({ ctx, skip, limit });
  if (!customerIds?.length) {
    return ctx.sendArray();
  }

  const customerRepo = CustomerRepo.getInstance(ctx.state, { schemaName: tenantName });
  const customers = await customerRepo.getAllPaginated({
    condition: { ids: customerIds },
    skip: Number(skip),
    limit: Number(limit),
  });

  return ctx.sendArray(customers);
};

export const getCustomersCount = async ctx => {
  const customerIds = await getCustomerIds({ ctx });
  if (!customerIds?.length) {
    return ctx.sendArray();
  }

  const { tenantName } = ctx.state.user;
  const customerRepo = CustomerRepo.getInstance(ctx.state, { schemaName: tenantName });
  const total = await customerRepo.customersCount({
    condition: { ids: customerIds },
  });

  return ctx.sendObj(total);
};

export const getCustomerById = async ctx => {
  const { tenantName } = ctx.state.user;
  const { id } = ctx.params;

  const customerRepo = CustomerRepo.getInstance(ctx.state, { schemaName: tenantName });
  const customer = await customerRepo.getBy({ condition: { id } });

  ctx.sendObj(customer);
};

export const editCustomer = async ctx => {
  const { id } = ctx.params;
  const { body } = ctx.request.validated;
  const { tenantName } = ctx.state.user;
  const { commercial } = body;

  const data = commercial ? getCommercialCustomerData(body) : getNonCommercialCustomerData(body);
  const customerRepo = CustomerRepo.getInstance(ctx.state, { schemaName: tenantName });
  const updatedCustomer = await customerRepo.updateOne({
    condition: { id },
    data,
    commercial,
  });

  const { mainPhoneNumber } = updatedCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName: tenantName });

  ctx.sendObj(updatedCustomer);
};
