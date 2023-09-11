import httpStatus from 'http-status';
import omit from 'lodash/omit.js';

import CustomerJobSitePairRepo from '../../repos/customerJobSitePair.js';
import OrderRepo from '../../repos/order.js';
import WorkOrderRepo from '../../repos/workOrder.js';
import CustomerRepo from '../../repos/customer.js';
import CommonRepo from '../../repos/_common.js';
import TenantRepository from '../../repos/tenant.js';

import { searchAddress, getCoordinatesByAddress } from '../../services/mapbox.js';
import {
  applyTenantToIndex,
  multiSearchNew,
  search,
} from '../../services/elasticsearch/ElasticSearch.js';
import { getInvoiceById } from '../../services/billing.js';
import { findNearbyConstructionSites } from '../../services/openStreetMap.js';

import { parseSearchQuery } from '../../utils/search.js';
import { checkPermissions } from '../../middlewares/authorized.js';
import { TENANT_INDEX } from '../../consts/searchIndices.js';
import { CUSTOMER_STATUS } from '../../consts/customerStatuses.js';
import { PERMISSIONS } from '../../consts/permissions.js';
import BusinessUnitRepository from '../../repos/businessUnit.js';

const ITEMS_PER_PAGE = 25;

export const searchAddressSuggestion = async ctx => {
  const { query, businessUnitId } = ctx.request.validated.query;
  const { tenantId } = ctx.state.user;

  const { region } = await TenantRepository.getInstance(ctx.state).getBy({
    condition: { id: tenantId },
    fields: ['region'],
  });
  // @TODO: Jonathan, we need the frontend address search to send businessUnitId in the query.
  // Or some other way to get here so that we can search by it. Otherwise this work properly
  let { coordinates } = await BusinessUnitRepository.getInstance(ctx.state).getById({
    id: businessUnitId,
    fields: ['coordinates'],
  });
  if (!coordinates) {
    coordinates = await getCoordinatesByAddress(query).coordinates;
  }

  const addresses = await searchAddress({
    query: query?.toString(),
    limit: 5,
    region,
    proximity: coordinates,
  }).catch(err => ctx.logger.error(err));

  ctx.sendArray(addresses);
};

export const advancedSearch = initialSearch => async ctx => {
  const { schemaName } = ctx.state.user;
  const { businessUnitId } = ctx.request.validated.query;
  const { query } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();

  const { searchId, searchQuery } = parseSearchQuery(query);

  const canViewCustomers = checkPermissions(ctx.state.user, [PERMISSIONS.customersView]);
  const canViewOrders = checkPermissions(ctx.state.user, [
    PERMISSIONS.ordersViewAll,
    PERMISSIONS.ordersViewOwn,
  ]);
  const canViewInvoices = checkPermissions(ctx.state.user, [PERMISSIONS.billingInvoices]);

  if (!searchId && searchQuery.length < 2) {
    const emptyResults = initialSearch
      ? {
          customers: [],
          jobSites: [],
        }
      : {
          customers: [],
          jobSites: [],
          orders: [],
          workOrders: [],
          invoices: [],
        };

    return ctx.sendObj(emptyResults);
  }

  let customers;
  let jobSites;
  let customer;
  let order;
  let workOrder;
  let invoice;
  const limit = 3;
  const customerRepo = CustomerRepo.getInstance(ctx.state);
  const queries = [];
  const promisesMap = new Map();

  if (!searchId || searchQuery.length >= 2) {
    const searchConfig = [{ template: TENANT_INDEX.jobSites }];
    const templates = [
      { index: applyTenantToIndex(TENANT_INDEX.jobSites, schemaName) },
      {
        id: TENANT_INDEX.jobSites,
        source: {
          size: limit,
          query: {
            multi_match: {
              query,
              fields: ['address'],
            },
          },
        },
      },
    ];

    if (canViewCustomers) {
      searchConfig.push({ template: TENANT_INDEX.customers });
      templates.push(
        ...[
          { index: applyTenantToIndex(TENANT_INDEX.customers, schemaName) },
          {
            id: TENANT_INDEX.customers,
            source: {
              sort: [],
              size: limit,
              query: {
                bool: {
                  must: [
                    {
                      query_string: {
                        query,
                        fields: ['name', 'contactName'],
                      },
                    },
                    {
                      match: {
                        businessUnitId,
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      );
    }

    queries.push(multiSearchNew(ctx, templates, searchConfig));
    promisesMap.set('searchRes', queries.length - 1);
  }

  if (searchId) {
    const searchCondition = businessUnitId ? { id: searchId, businessUnitId } : { id: searchId };

    queries.push(
      canViewCustomers ? customerRepo.getBy({ condition: searchCondition }) : Promise.resolve(),
    );

    promisesMap.set('customer', queries.length - 1);

    if (!initialSearch) {
      queries.push(
        canViewOrders
          ? OrderRepo.getInstance(ctx.state).getBy({
              condition: { ...condition, id: searchId },
              fields: ['id', 'customerId'],
            })
          : Promise.resolve(),
        WorkOrderRepo.getInstance(ctx.state).getByAndPopulateCustomer({
          condition: { ...condition, woNumber: searchId },
        }),
        canViewInvoices ? getInvoiceById(ctx, searchCondition) : Promise.resolve(),
      );
      promisesMap.set('order', queries.length - 3);
      promisesMap.set('workOrder', queries.length - 2);
      promisesMap.set('invoice', queries.length - 1);
    }
  }
  const res = await Promise.all(queries);
  if (promisesMap.has('searchRes')) {
    const searchRes = res[promisesMap.get('searchRes')];
    ({ customers, jobSites } = searchRes || {});
  }
  if (promisesMap.has('customer')) {
    customer = res[promisesMap.get('customer')];
  }
  if (promisesMap.has('order')) {
    order = res[promisesMap.get('order')];
  }
  if (promisesMap.has('workOrder')) {
    workOrder = res[promisesMap.get('workOrder')];
  }
  if (promisesMap.has('invoice')) {
    invoice = res[promisesMap.get('invoice')];
  }

  if (customer) {
    const { contactData, phoneNumbers } = customerRepo.pickContactFields(
      customer,
      customer.customerGroup.type === 'commercial',
    );
    const customerPhoneNumbers = phoneNumbers.map(phoneNumber => phoneNumber.number);
    const customerContact = omit(contactData, ['jobTitle', 'phoneNumbers']);
    const indexedCustomer = customerRepo.mapToIndex(
      customer,
      customerContact,
      customerPhoneNumbers,
    );
    indexedCustomer.highlight = {
      id: [`<em>${customer.id}</em>`],
    };
    if (Array.isArray(customers)) {
      customers.unshift(indexedCustomer);
    } else {
      customers = [indexedCustomer];
    }
  }

  if (order) {
    order.customerName = order.customer.name;
    delete order.customer;
    order.highlight = {
      id: [`<em>${order.id}</em>`],
    };
  }
  if (workOrder) {
    workOrder.highlight = {
      woNumber: [`<em>${workOrder.woNumber}</em>`],
    };
  }
  if (invoice) {
    invoice.highlight = {
      id: [`<em>${invoice.id}</em>`],
    };
  }

  customers = customers || [];
  jobSites = jobSites || [];

  if (initialSearch) {
    return ctx.sendObj({
      customers,
      jobSites,
    });
  }

  const orders = order ? [order] : [];
  const workOrders = workOrder ? [workOrder] : [];
  const invoices = invoice ? [invoice] : [];

  return ctx.sendObj({
    customers,
    jobSites,
    orders,
    workOrders,
    invoices,
  });
};

export const searchCustomersOrInvoices = async ctx => {
  const { schemaName } = ctx.state.user;
  const { businessUnitId, query } = ctx.request.validated.query;

  const { searchQuery, searchId } = parseSearchQuery(query);

  const canViewCustomers = checkPermissions(ctx.state.user, [PERMISSIONS.customersView]);
  const canViewInvoices = checkPermissions(ctx.state.user, [PERMISSIONS.billingInvoices]);

  const [invoice, elasticResults] = await Promise.all([
    searchId && canViewInvoices
      ? getInvoiceById(ctx, { id: searchId, openOnly: true, businessUnitId })
      : Promise.resolve(),
    canViewCustomers
      ? search(
          ctx,
          TENANT_INDEX.customers,
          applyTenantToIndex(TENANT_INDEX.customers, schemaName),
          {
            query: searchQuery,
            limit: 5,
            quickSearch: true,

            businessUnitId,
            status: CUSTOMER_STATUS.active,
          },
        )
      : Promise.resolve(),
  ]);

  ctx.sendObj({
    customers: elasticResults?.customers || [],
    invoices: invoice ? [invoice] : [],
  });
};

export const getCustomerJobSitePair = async ctx => {
  const { jobSiteId, customerId } = ctx.request.query;
  const condition = {};
  if (jobSiteId) {
    condition.jobSiteId = jobSiteId;
  }
  if (customerId) {
    condition.customerId = customerId;
  }

  const customerJobSitePair = await CustomerJobSitePairRepo.getInstance(ctx.state).getBy({
    condition,
  });

  ctx.sendObj(customerJobSitePair, httpStatus.NO_CONTENT);
};

export const getNavigationCounts = async ctx => {
  const { email } = ctx.state.user;
  const { businessUnitId } = ctx.getRequestCondition();
  const result = await CommonRepo.navCounts(ctx.state, { condition: { businessUnitId, email } });
  ctx.sendObj(result, httpStatus.OK);
};

export const filterAuditLogs = async ctx => {
  const { schemaName, tenantName, userId } = ctx.state.user;
  const { businessUnitIds, userIds, entityId, entities, actions, dateFrom, dateTo } =
    ctx.request.validated.body;
  const { skip = 0, limit = ITEMS_PER_PAGE } = ctx.request.validated.query;

  const indexName = applyTenantToIndex(
    TENANT_INDEX.auditLogs,
    schemaName !== 'admin' ? schemaName : tenantName,
  );
  if (!indexName) {
    return ctx.logger.error(
      `[AL] Index name cannot be identified since no schema/tenant passed. UserId ${userId}`,
    );
  }

  const filterParamsObj = {
    entityId: entityId || false,
    businessUnitIds: businessUnitIds?.length ? businessUnitIds : false,
    userIds: userIds?.length ? userIds : false,
    entities: entities?.length ? entities : false,
    actions: actions?.length ? actions : false,
    dateFrom: dateFrom ? new Date(dateFrom) : false,
    dateTo: dateTo ? new Date(dateTo) : false,
  };
  const matchAll = Object.values(filterParamsObj).every(v => !v);

  const results = await search(ctx, TENANT_INDEX.auditLogs, indexName, {
    findLogs: true,
    datesFiler: !!(dateFrom || dateTo),

    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),

    matchAll,
    ...(matchAll ? {} : filterParamsObj),
  });

  return ctx.sendObj({
    total: results?.total || 0,
    length: results?.length || 0,
    items: results?.auditLogs || [],
  });
};

export const geofenceSuggestions = async ctx => {
  const { point, radius } = ctx.request.validated.body;

  const polygons = await findNearbyConstructionSites(point, radius);

  ctx.sendArray(polygons);
};
