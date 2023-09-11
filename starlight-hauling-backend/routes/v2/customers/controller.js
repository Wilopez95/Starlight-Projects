import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';
import keyBy from 'lodash/keyBy.js';
import map from 'lodash/map.js';
import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';

import CustomerRepo from '../../../repos/customer.js';
import CustomerGroupRepo from '../../../repos/customerGroup.js';

import { subscriptionsIndexingEmitter } from '../../../services/subscriptions/subscriptionsIndexingEmitter.js';
import { applyTenantToIndex, search } from '../../../services/elasticsearch/ElasticSearch.js';
import { syncCustomerData } from '../../../services/billingProcessor.js';
import * as billingService from '../../../services/billing.js';

import { parseSearchQuery } from '../../../utils/search.js';

import { CUSTOMER_SORTING_ATTRIBUTE } from '../../../consts/customerSortingAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { TENANT_INDEX } from '../../../consts/searchIndices.js';
import {
  nonCommercialFields,
  commercialFields,
  filterFields,
} from '../../../consts/customerFields.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../consts/subscriptionsIndexingActions.js';

const CUSTOMERS_PER_PAGE = 25;

const getNonCommercialCustomerData = pick(nonCommercialFields);
const getCommercialCustomerData = pick(commercialFields);
const getFiltersData = pick(filterFields);

export const getCustomers = async ctx => {
  const {
    skip = 0,
    limit = CUSTOMERS_PER_PAGE,
    sortBy = CUSTOMER_SORTING_ATTRIBUTE.name,
    sortOrder = SORT_ORDER.asc,
    customerGroupId,
    businessUnitId,
    query,
    walkup,
  } = ctx.request.validated.query;

  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
    ...parseSearchQuery(query),
  };
  walkup && (condition.walkup = walkup);

  if (customerGroupId) {
    condition.customerGroupId = customerGroupId;
  }

  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  const customers = await CustomerRepo.getInstance(ctx.state).getAllPaginated({
    skip: Number(skip),
    limit: Math.min(Number(limit), CUSTOMERS_PER_PAGE),
    sortBy,
    sortOrder,
    condition,
  });

  ctx.sendArray(customers);
};

export const getCustomersCount = async ctx => {
  const { businessUnitId, query } = ctx.request.validated.query;

  let customerGroupIds = await CustomerGroupRepo.getInstance(ctx.state).getAll({
    fields: ['id'],
  });

  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
    ...parseSearchQuery(query),
  };

  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  customerGroupIds = map(customerGroupIds, 'id');

  const total = await CustomerRepo.getInstance(ctx.state).customersCount({
    condition,
    customerGroupIds,
  });

  ctx.sendObj(total);
};

export const getCustomerById = async ctx => {
  const { id } = ctx.params;

  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(customer);
};

export const getCustomersForInvoicing = async ctx => {
  const { businessUnitId } = ctx.getRequestCondition();

  const customers = await CustomerRepo.getInstance(ctx.state).getCustomersForInvoicing({
    condition: { businessUnitId },
  });

  ctx.sendArray(customers);
};

export const getCustomersForInvoicingWithSubscriptions = async ctx => {
  const { schemaName } = ctx.state.user;
  const { businessUnitId } = ctx.getRequestCondition();

  const customers = await CustomerRepo.getInstance(ctx.state, {
    schemaName,
  }).customersOrdersSubscriptionInvoicing({
    condition: { businessUnitId },
  });

  ctx.sendArray(customers);
};

export const createCustomer = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;
  const { body } = ctx.request.validated;
  const { commercial } = body;

  const data = commercial ? getCommercialCustomerData(body) : getNonCommercialCustomerData(body);

  if (data.gradingRequired) {
    data.gradingNotification = true;
  }

  const newCustomer = await CustomerRepo.getInstance(ctx.state).createOne({
    data,
    commercial,
    tenantId,
    log: true,
  });

  const { id, mainPhoneNumber } = newCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });

  ctx.status = httpStatus.CREATED;
  ctx.body = newCustomer;
};

export const editCustomer = async ctx => {
  const {
    user: { schemaName, tenantId },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { body } = ctx.request.validated;
  const { commercial, contactId } = body;

  const data = commercial ? getCommercialCustomerData(body) : getNonCommercialCustomerData(body);
  data.contactId = contactId;

  if (data.gradingRequired) {
    data.gradingNotification = true;
  }

  const updatedCustomer = await CustomerRepo.getInstance(ctx.state).updateOne({
    condition: { id },
    concurrentData,
    data,
    commercial,
    tenantId,
    log: true,
  });

  if (data.isAutopayExist !== undefined) {
    const { autopayCreditCardId, isAutopayExist } = data;
    await billingService.updateCustomerCcAutoPay(ctx, {
      customerId: id,
      cardId: autopayCreditCardId,
      data: { isAutopayExist, customerId: id, id: autopayCreditCardId },
    });
  }

  const { mainPhoneNumber } = updatedCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });

  ctx.sendObj(updatedCustomer);
};

export const searchCustomers = async ctx => {
  const { schemaName } = ctx.state.user;
  const { businessUnitId, name } = ctx.request.validated.query;

  const customers = await search(
    ctx,
    TENANT_INDEX.customers,
    applyTenantToIndex(TENANT_INDEX.customers, schemaName),
    {
      businessUnitId,
      query: name,
      quickSearch: true,
    },
  );

  ctx.sendArray(customers ? customers.customers : []);
};

export const deleteCustomer = async ctx => {
  const { id } = ctx.params;

  await CustomerRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const searchCustomersDuplicate = async ctx => {
  const { schemaName } = ctx.state.user;
  const { businessUnitId, ...data } = ctx.request.validated.body;

  if (data.phoneNumbers) {
    data.phoneNumbers = data.phoneNumbers[0].number;
  }
  if (data.mainPhoneNumbers) {
    data.mainPhoneNumbers = data.mainPhoneNumbers[0].number;
  }

  const results = await Promise.all(
    Object.values(data)
      .filter(Boolean)
      .map(value => {
        const query = value.toString().toLowerCase();
        return search(
          ctx,
          TENANT_INDEX.customers,
          applyTenantToIndex(TENANT_INDEX.customers, schemaName),
          {
            query,
            limit: Object.keys(data).length,
            businessUnitId,
          },
        );
      }),
  );

  const customerIndexed = results.filter(c => c.customers?.length).flatMap(c => [...c.customers]);

  const duplicatedFields = {};

  if (!isEmpty(customerIndexed)) {
    const name = `${data.firstName} ${data.lastName}`;
    const contactName = `${data.mainFirstName} ${data.mainLastName}`;

    if (customerIndexed.some(c => c.name === name)) {
      duplicatedFields.firstName = name;
      duplicatedFields.lastName = name;
    }

    if (customerIndexed.some(c => c.contactName === contactName)) {
      duplicatedFields.mainFirstName = contactName;
      duplicatedFields.mainLastName = contactName;
    }

    const ids = customerIndexed.map(c => c.id);
    const customers = await CustomerRepo.getInstance(ctx.state).getAllPaginated({
      condition: { ids },
      limit: ids.length,
    });

    Object.entries(omit(data, ['firstName', 'lastName', 'mainFirstName', 'mainLastName'])).forEach(
      ([key, value]) => {
        const duplicated = customers.some(customer => {
          if (['phoneNumbers', 'mainPhoneNumbers'].includes(key)) {
            return customer[key]?.[0]?.number === value;
          }
          return customer[key]?.toLowerCase() === value.toLowerCase();
        });

        if (duplicated) {
          duplicatedFields[key] = value;
        }
      },
    );
  }

  ctx.status = httpStatus.OK;

  if (!isEmpty(duplicatedFields)) {
    ctx.sendObj(duplicatedFields);
  }
};

export const getGroupsByCustomerIds = async ctx => {
  const { ids } = ctx.request.validated.body;

  const customerGroups = await CustomerRepo.getInstance(ctx.state).getGroups(ids);

  ctx.status = httpStatus.OK;

  ctx.sendObj(keyBy(customerGroups, 'customerId'));
};

export const changeCustomerStatus = async ctx => {
  const id = Number(ctx.params.id);
  const {
    status,
    shouldUnholdTemplates,
    reason,
    reasonDescription,
    holdSubscriptionUntil,
    onHoldNotifySalesRep,
    onHoldNotifyMainContact,
  } = ctx.request.validated.body;
  const { schemaName } = ctx.state.user;
  const customer = await CustomerRepo.getInstance(ctx.state).changeCustomerStatus({
    id,
    status,
    shouldUnholdTemplates,
    log: true,
    reason,
    reasonDescription,
    holdSubscriptionUntil,
    onHoldNotifySalesRep,
    onHoldNotifyMainContact,
    ctx,
  });

  await syncCustomerData(ctx, {
    id,
    status,
    schemaName,
  });

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateMany, ctx, {
    customerId: id,
  });

  ctx.status = httpStatus.OK;
  ctx.sendObj(customer);
};
