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
import * as customerService from '../../../services/customer/index.js';

import { parseSearchQuery } from '../../../utils/search.js';

import { CUSTOMER_STATUS } from '../../../consts/customerStatuses.js';
import { CUSTOMER_SORTING_ATTRIBUTE } from '../../../consts/customerSortingAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { TENANT_INDEX } from '../../../consts/searchIndices.js';
import { filterFields } from '../../../consts/customerFields.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../consts/subscriptionsIndexingActions.js';
import sendTermsAndConditions from '../../../utils/sendTermsAndConditiond.js';

const CUSTOMERS_PER_PAGE = 25;

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
    fields: CustomerRepo.getCustomersGridFields(),
    sortBy,
    sortOrder,
    condition,
  });

  ctx.sendArray(customers);
};

export const getCustomersByIds = async ctx => {
  const ids = ctx.request.body;
  const customers = await CustomerRepo.getInstance(ctx.state).getAllPaginated({
    condition: { ids },
    sortBy: 'id',
    limit: 25,
    fields: ['*'],
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

  const newCustomer = await customerService.createCustomer(ctx, { tenantId, body });

  const { id, mainPhoneNumber } = newCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });

  await sendTermsAndConditions(id, ctx);

  ctx.status = httpStatus.CREATED;
  ctx.body = newCustomer;
};

export const editCustomer = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;
  const { id } = ctx.params;
  const { body } = ctx.request.validated;

  const updatedCustomer = await customerService.editCustomer(ctx, { id, tenantId, body });

  if (body.isAutopayExist !== undefined) {
    const { autopayCreditCardId, isAutopayExist } = body;
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
  const { businessUnitId, name, status } = ctx.request.validated.query;

  const customers = await search(
    ctx,
    TENANT_INDEX.customers,
    applyTenantToIndex(TENANT_INDEX.customers, schemaName),
    {
      businessUnitId,
      query: name,
      quickSearch: true,
      status,
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

export const getCustomerByGroupAndType = async ctx => {
  const { customerGroupId, prepaid, onAccount } = ctx.request.body;

  const condition = {};

  const isOnAccount = onAccount && !prepaid;
  const isPrepaid = !onAccount && prepaid;

  if (isOnAccount) {
    condition.onAccount = true;
  } else if (isPrepaid) {
    condition.onAccount = false;
  }

  if (customerGroupId) {
    condition.customerGroupId = customerGroupId;
  }

  const customers = await CustomerRepo.getInstance(ctx.state).getAllPaginated({
    fields: ['id', 'email', 'name', 'status', 'onAccount'],
    condition,
  });

  ctx.sendArray(customers);
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

async function* getCustomersAsyncIterator(customersIds) {
  for (let i = 0; i < customersIds.length; i++) {
    yield customersIds[i];
  }
}

export const bulkPutOnHold = async ctx => {
  const {
    ids,
    reason,
    reasonDescription,
    holdSubscriptionUntil,
    onHoldNotifySalesRep,
    onHoldNotifyMainContact,
  } = ctx.request.validated.body;
  const { schemaName } = ctx.state.user;
  const status = CUSTOMER_STATUS.onHold;

  const customersOnHold = [];

  const repo = CustomerRepo.getInstance(ctx.state);

  for await (const id of getCustomersAsyncIterator(ids)) {
    try {
      const customer = await repo.changeCustomerStatus({
        id,
        status,
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

      customersOnHold.push({ status: 'fulfilled', value: customer });
    } catch (error) {
      customersOnHold.push({ status: 'rejected', reason: error });
    }
  }

  ctx.status = httpStatus.OK;
  ctx.sendObj(customersOnHold);
};

export const bulkResume = async ctx => {
  const { ids, shouldUnholdTemplates } = ctx.request.validated.body;
  const { schemaName } = ctx.state.user;
  const status = CUSTOMER_STATUS.active;

  const activeCustomers = [];

  const repo = CustomerRepo.getInstance(ctx.state);

  for await (const id of getCustomersAsyncIterator(ids)) {
    try {
      const customer = await repo.changeCustomerStatus({
        id,
        status,
        shouldUnholdTemplates,
        log: true,
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

      activeCustomers.push({ status: 'fulfilled', value: customer });
    } catch (error) {
      activeCustomers.push({ status: 'rejected', reason: error });
    }
  }

  ctx.status = httpStatus.OK;
  ctx.sendObj(activeCustomers);
};

export const resendTerms = async ctx => {
  const { customerId } = ctx.request.validated.query;
  await sendTermsAndConditions(customerId, ctx);
  ctx.status = httpStatus.OK;
};

export const getAllCustomersQB = async ctx => {
  const { buList } = ctx.query;
  const validBuList = Array.isArray(buList);
  const customers = await CustomerRepo.getInstance(ctx.state)
    .getAll({
      fields: [`${CustomerRepo.TABLE_NAME}.id`, `${CustomerRepo.TABLE_NAME}.customer_group_id`],
    })
    .whereIn(`${CustomerRepo.TABLE_NAME}.business_unit_id`, validBuList ? buList : [buList]);
  ctx.status = httpStatus.OK;
  ctx.sendObj(customers);
};
