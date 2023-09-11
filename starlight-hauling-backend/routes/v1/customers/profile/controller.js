import ContactRepo from '../../../../repos/contact.js';
import OrderRepo from '../../../../repos/order.js';

import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { OPEN_ORDER_SORTING_ATTRIBUTE } from '../../../../consts/jobSiteSortingAttributes.js';
import { CONTACT_SORTING_ATTRIBUTE } from '../../../../consts/contactSortingAttributes.js';

const ORDERS_PER_PAGE = 25;

export const getJobSiteOrderContacts = async ctx => {
  const { customerId } = ctx.params;
  const {
    skip = 0,
    limit = ORDERS_PER_PAGE,
    sortBy = CONTACT_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    jobSiteId,
    activeOnly,
  } = ctx.request.query;

  const condition = { customerId };
  activeOnly && (condition.active = true);
  jobSiteId && (condition.jobSiteId = jobSiteId);

  const contacts = await ContactRepo.getInstance(
    ctx.state,
  ).getOrderAndSubscriptionContactsByJobSiteId({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ORDERS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(contacts);
};

export const getOpenOrders = async ctx => {
  const { customerId } = ctx.params;
  const {
    skip = 0,
    limit = ORDERS_PER_PAGE,
    sortBy = OPEN_ORDER_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    jobSiteId,
    projectId,
  } = ctx.request.query;

  const condition = { customerId };
  jobSiteId && (condition.jobSiteId = jobSiteId);
  projectId && (condition.projectId = projectId);

  condition.status = [
    ORDER_STATUS.inProgress,
    ORDER_STATUS.completed,
    ORDER_STATUS.approved,
    ORDER_STATUS.finalized,
    ORDER_STATUS.canceled,
  ];

  const orders = await OrderRepo.getInstance(ctx.state).getAllPaginatedByCustomerJobSitePair({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ORDERS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};

export const getInvoicedOrders = async ctx => {
  const { customerId } = ctx.params;
  const condition = { customerId };
  const {
    skip = 0,
    limit = ORDERS_PER_PAGE,
    sortBy = OPEN_ORDER_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    jobSiteId,
    projectId,
  } = ctx.request.query;

  jobSiteId && (condition.jobSiteId = jobSiteId);
  projectId && (condition.projectId = projectId);

  condition.status = [ORDER_STATUS.invoiced];

  const orders = await OrderRepo.getInstance(ctx.state).getAllPaginatedByCustomerJobSitePair({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ORDERS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};
