import httpStatus from 'http-status';

import sumBy from 'lodash/sumBy.js';
import isEmpty from 'lodash/isEmpty.js';
import RecurrentOrderTemplateRepo from '../../../repos/v2/recurrentOrderTemplate.js';
import PhoneNumberRepo from '../../../repos/phoneNumber.js';
import RecurrentOrderTemplateOrderRepo from '../../../repos/recurrentOrderTemplateOrder.js';
import OrderRepo from '../../../repos/v2/order.js';
import CustomerRepo from '../../../repos/customer.js';

import { validateDates, getNextServiceDate } from '../../../services/recurrentOrder.js';
import { getAvailableCredit } from '../../../services/billing.js';
import {
  createPaymentsForNewOrders,
  prePopulateRecurrentOrdersInput,
} from '../../../services/billingProcessor.js';

import validateBestTimeToComeRange from '../../../utils/validateBestTimeToComeRange.js';
import { omitPhoneNumberFields } from '../../../utils/dbHelpers.js';
import { parseSearchQuery } from '../../../utils/search.js';
import { prefixKeyWithRefactored } from '../../../utils/priceRefactoring.js';
import { checkPermissions } from '../../../middlewares/authorized.js';

import ApiError from '../../../errors/ApiError.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import {
  RECURRENT_TEMPLATE_SORTING_ATTRIBUTE,
  RECURRENT_TEMPLATE_STATUS,
} from '../../../consts/recurrentOrderTemplates.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { CUSTOMER_STATUS } from '../../../consts/customerStatuses.js';
import { GENERATED_ORDERS_SORTING_ATTRIBUTE } from '../../../consts/generatedOrdersSortingAttributes.js';
import { PERMISSIONS } from '../../../consts/permissions.js';

const ITEMS_PER_PAGE = 25;

export const createRecurrentOrderTemplate = async ctx => {
  const { email, userId, tenantId, schemaName } = ctx.state.user;
  const {
    recurrentTemplateData,
    customerId,
    jobSiteId,
    projectId,
    businessUnitId,
    businessLineId,
    serviceAreaId,
    jobSiteContactId,
    delivery,
    final,
    pair,
    overrideCreditLimit,
    commercialTaxesUsed,
  } = ctx.request.validated.body;

  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: customerId },
    fields: ['status', 'customerGroupId'],
  });

  if (customer?.status === CUSTOMER_STATUS.inactive) {
    throw ApiError.invalidRequest('Customer is inactive');
  }

  const orders = [];

  if (delivery) {
    orders.push(delivery);
  }

  if (final) {
    orders.push(final);
  }

  const initialServiceDate = getNextServiceDate(
    {
      date: recurrentTemplateData.startDate,
      endDate: recurrentTemplateData.endDate,
      frequencyType: recurrentTemplateData.frequencyType,
      customFrequencyType: recurrentTemplateData?.customFrequencyType,
      frequencyPeriod: recurrentTemplateData?.frequencyPeriod,
      frequencyDays: recurrentTemplateData?.frequencyDays,
    },
    true,
  );

  validateDates({
    startDate: recurrentTemplateData.startDate,
    endDate: recurrentTemplateData?.endDate,
    deliveryServiceDate: delivery?.serviceDate,
    initialServiceDate,
  });

  const ordersInput = orders.flatMap(order =>
    Array(Number(order.billableServiceQuantity)).fill(order),
  );

  ordersInput.forEach(orderInput => (orderInput.isRollOff = true));

  const ordersTotal =
    sumBy(ordersInput, 'grandTotal') +
    recurrentTemplateData.grandTotal * recurrentTemplateData.billableServiceQuantity;

  if (!overrideCreditLimit) {
    const { availableCredit } = await getAvailableCredit(ctx, { customerId });

    if (ordersTotal > 0 && availableCredit < ordersTotal) {
      throw ApiError.paymentRequired('Credit limit exceeded for on account payment');
    }
  } else {
    ordersInput.forEach(order => {
      order.overrideCreditLimit = true;
    });
  }

  const commonData = {
    csrEmail: email,
    businessUnitId,
    businessLineId,
    serviceAreaId,
    customerId,
    jobSiteId,
    projectId,
    jobSiteContactId,
    paymentMethod: PAYMENT_METHOD.onAccount,
    commercialTaxesUsed,
    ...pair,
  };

  validateBestTimeToComeRange(
    recurrentTemplateData.bestTimeToComeFrom,
    recurrentTemplateData.bestTimeToComeTo,
  );
  Object.assign(recurrentTemplateData, commonData);

  orders.forEach(order => {
    validateBestTimeToComeRange(order.bestTimeToComeFrom, order.bestTimeToComeTo);
    Object.assign(order, commonData);
  });

  const recurrentOrderTemplateRepo = RecurrentOrderTemplateRepo.getInstance(ctx.state);
  const recurrentOrderTemplateOrderRepo = RecurrentOrderTemplateOrderRepo.getInstance(ctx.state);

  const newRecurrentOrderTemplate = await recurrentOrderTemplateRepo.createOne({
    data: recurrentTemplateData,
    log: true,
  });

  const { recurrentOrderTemplate } = await recurrentOrderTemplateRepo.getDataForGeneration(
    {
      condition: { recurrentOrderTemplateId: newRecurrentOrderTemplate.id },
    },
    { skipPricesRefresh: true },
  );

  recurrentOrderTemplate.serviceDate = initialServiceDate;
  recurrentOrderTemplate.createDeferredWorkOrder = false;

  const recurrentOrdersInput = Array(Number(recurrentOrderTemplate.billableServiceQuantity)).fill(
    recurrentOrderTemplate,
  );

  const payments = [
    { paymentMethod: PAYMENT_METHOD.onAccount, amount: ordersTotal, sendReceipt: false },
  ];

  const orderRepo = OrderRepo.getInstance(ctx.state);
  let newOrders;

  try {
    const [newRecurrentOrders, ...restCreatedOrders] = await Promise.all([
      Promise.all(
        recurrentOrdersInput.map(order =>
          orderRepo.createOneFromRecurrentOrderTemplate({
            data: order,
            recurrentOrderTemplateId: newRecurrentOrderTemplate.id,
            tenantId,
          }),
        ),
      ),
      ...ordersInput.map(order => orderRepo.createOne({ data: { ...order, payments }, tenantId })),
    ]);

    newOrders = [...newRecurrentOrders, ...restCreatedOrders];

    if (restCreatedOrders?.length) {
      await recurrentOrderTemplateOrderRepo.insertMany({
        data: restCreatedOrders.map(({ id }) => ({
          orderId: id,
          recurrentOrderTemplateId: newRecurrentOrderTemplate.id,
        })),
      });
    }

    const billingRecurrentOrdersInput = await prePopulateRecurrentOrdersInput(ctx, {
      recurrentOrderTemplateId: newRecurrentOrderTemplate.id,
      ordersInput: recurrentOrdersInput,
      schemaName,
    });

    await createPaymentsForNewOrders(ctx, {
      payments,
      customerId,
      ordersInput: ordersInput.concat(billingRecurrentOrdersInput),
      newOrders: newOrders.map(({ insertData, id, woNumber }) => ({
        ...insertData,
        id,
        businessUnitId,
        woNumber,
      })),
      businessUnitId,
      schemaName,
    });

    const currentDate = new Date();

    const nextServiceDate = getNextServiceDate({
      date: initialServiceDate,
      endDate: recurrentOrderTemplate.endDate,
      frequencyType: recurrentOrderTemplate.frequencyType,
      customFrequencyType: recurrentOrderTemplate?.customFrequencyType,
      frequencyPeriod: recurrentOrderTemplate?.frequencyPeriod,
      frequencyDays: recurrentOrderTemplate?.frequencyDays,
    });

    const templateUpdateData = {
      grandTotal: newOrders[0].grandTotal,
      syncDate: currentDate.toUTCString(),
    };

    if (nextServiceDate) {
      templateUpdateData.nextServiceDate = nextServiceDate;
    }

    await recurrentOrderTemplateRepo.updateBy({
      condition: {
        id: newRecurrentOrderTemplate.id,
      },
      data: templateUpdateData,
      log: true,
    });
  } catch (error) {
    const results = await Promise.allSettled([
      recurrentOrderTemplateOrderRepo.deleteBy({
        condition: { recurrentOrderTemplateId: newRecurrentOrderTemplate.id },
      }),
      recurrentOrderTemplateRepo.deleteBy({
        condition: { id: newRecurrentOrderTemplate.id },
      }),
      ...(!isEmpty(newOrders)
        ? newOrders.map(({ id: orderId, workOrderId }) =>
            orderRepo.deleteOrderAndRelatedEntities({ orderId, workOrderId }),
          )
        : []),
    ]);

    results.forEach(({ status, reason }) => {
      if (status === 'rejected') {
        ctx.logger.error(reason, `Failed to rollback results of createRecurrentTemplate operation`);
      }
    });

    throw error;
  }

  if (newOrders?.length) {
    const action = orderRepo.logAction.create;
    newOrders.forEach(({ id }) => orderRepo.log({ id, repo: orderRepo, userId, action }));
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = { id: newRecurrentOrderTemplate.id };
};

export const editRecurrentOrderTemplate = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const data = ctx.request.validated.body;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: ['id', 'customerId'],
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  const updatedTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateOne({
    condition: { id },
    concurrentData,
    data: { ...data, customerId: recurrentOrderTemplate.customer?.originalId },
    log: true,
  });

  ctx.sendObj(updatedTemplate);
};

export const closeRecurrentOrderTemplate = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const notFinalizedCount = await RecurrentOrderTemplateOrderRepo.getInstance(
    ctx.state,
  ).countNotFinalized({
    condition: {
      recurrentOrderTemplateId: id,
    },
  });

  if (notFinalizedCount > 0) {
    throw ApiError.invalidRequest(
      `There are not finalized orders created for the recurrent order.
         Please finalize or cancel them`,
    );
  }

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).closeOne({
    condition: { id },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const putRecurrentTemplateOnHold = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: {
      status: RECURRENT_TEMPLATE_STATUS.onHold,
    },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const putRecurrentTemplateOffHold = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: {
      status: RECURRENT_TEMPLATE_STATUS.active,
    },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getRecurrentOrderTemplates = async ctx => {
  const {
    customerId,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.startDate,
    sortOrder = SORT_ORDER.desc,
    query,
  } = ctx.request.validated.query;

  const result = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getAllPaginated({
    condition: { customerId, ...parseSearchQuery(query) },
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    fields:
      RecurrentOrderTemplateRepo.getRecurrentOrderTemplateFields().map(prefixKeyWithRefactored),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(result);
};

export const getRecurrentOrderTemplatesCount = async ctx => {
  const { customerId, query } = ctx.request.validated.query;

  const total = await RecurrentOrderTemplateRepo.getInstance(ctx.state).count({
    condition: { customerId, ...parseSearchQuery(query) },
  });

  ctx.sendObj({ total });
};

export const getRecurrentOrderTemplateViewDetails = async ctx => {
  const { id } = ctx.params;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: [...RecurrentOrderTemplateRepo.getRecurrentOrderTemplateFields(), 'lineItems'].map(
      prefixKeyWithRefactored,
    ),
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  if (
    recurrentOrderTemplate.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  if (recurrentOrderTemplate.orderContact) {
    const phoneNumbers = await PhoneNumberRepo.getInstance(ctx.state).getAll({
      condition: {
        contactId: recurrentOrderTemplate.orderContact.originalId,
      },
    });
    if (phoneNumbers) {
      recurrentOrderTemplate.orderContact.phoneNumbers = phoneNumbers;
    }
  }

  ctx.sendObj(omitPhoneNumberFields(recurrentOrderTemplate));
};

export const getRecurrentOrderTemplateGeneratedOrders = async ctx => {
  const { id } = ctx.params;

  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = GENERATED_ORDERS_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: ['csrEmail'],
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  if (
    recurrentOrderTemplate.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  const orders = await OrderRepo.getInstance(ctx.state).getAllPaginatedByRecurrentOrderTemplate({
    condition: {
      recurrentOrderTemplateId: id,
    },
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};
