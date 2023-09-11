import { subscribe } from '../services/amqp/client';
import {
  BUSINESS_UNITS_UPDATES_QUEUE,
  TENANTS_CREATE_QUEUE,
  TENANTS_DELETE_QUEUE,
} from '../services/amqp/setup';
import { AMQP_CUSTOMER_CONTACTS_QUEUE, AMQP_UMS_DEAD_LETTER } from '../config';

import { createOrUpdateBusinessUnitResource } from './businessUnits';
import { createTenantResource, deleteTenantResource } from './tenants';
import { upsertCustomerUser } from './customerContacts';

export const setupSubscriptions = async (): Promise<void> => {
  await subscribe(TENANTS_CREATE_QUEUE, createTenantResource, AMQP_UMS_DEAD_LETTER);
  await subscribe(TENANTS_DELETE_QUEUE, deleteTenantResource, AMQP_UMS_DEAD_LETTER);
  await subscribe(
    BUSINESS_UNITS_UPDATES_QUEUE,
    createOrUpdateBusinessUnitResource,
    AMQP_UMS_DEAD_LETTER,
  );
  await subscribe(AMQP_CUSTOMER_CONTACTS_QUEUE, upsertCustomerUser, AMQP_UMS_DEAD_LETTER);
};
