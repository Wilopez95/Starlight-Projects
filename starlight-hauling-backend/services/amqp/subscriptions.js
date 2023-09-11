import isEmpty from 'lodash/isEmpty.js';
import sumBy from 'lodash/sumBy.js';
import chunk from 'lodash/chunk.js';
import {
  differenceInMinutes,
  startOfTomorrow,
  differenceInCalendarDays,
  differenceInWeeks,
  differenceInCalendarMonths,
  addMonths,
  format,
} from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import CustomerRepo from '../../repos/customer.js';
import OrderRepo from '../../repos/order.js';
import WorkOrderRepo from '../../repos/workOrder.js';
import PhoneNumberRepo from '../../repos/phoneNumber.js';
import CustomerJobSitePairRepo from '../../repos/customerJobSitePair.js';
import TenantRepository from '../../repos/tenant.js';
import CompanyMailSettingsRepository from '../../repos/companyMailSettings.js';
import DomainRepository from '../../repos/domain.js';
import LandfillOperationRepo from '../../repos/landfillOperation.js';
import BusinessUnitRepo from '../../repos/businessUnit.js';
import ServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import RecurrentOrderTemplateRepo from '../../repos/recurrentOrderTemplate.js';
import RecurrentOrderTemplateOrderRepo from '../../repos/recurrentOrderTemplateOrder.js';
import PreInvoicedOrderDraftRepo from '../../repos/preInvoicedOrderDraft.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';
import CustomRateLineItemRepo from '../../repos/customRatesGroupLineItem.js';
import CustomRateServiceRepo from '../../repos/customRatesGroupService.js';
import CustomRatesRecServiceFreqRepo from '../../repos/customRatesGroupRecurringServiceFrequency.js';
import CustomRatesRecLineItemBlCycleRepo from '../../repos/customRatesGroupRecurringLineItemBillingCycle.js';
import SalesRepHistoryRepo from '../../repos/salesRepresentativeHistory.js';
import MaterialRepo from '../../repos/material.js';
import EquipmentItemRepo from '../../repos/equipmentItem.js';
import OriginDistrictRepo from '../../repos/originDistrict.js';

import { getRecyclingOrderById } from '../recycling.js';

import { getNextServiceDate } from '../recurrentOrder.js';
import * as billingProcessor from '../billingProcessor.js';
import * as smsService from '../sms.js';
import * as emailService from '../email.js';
import calculatePrices from '../pricesCalculation/subscription/calculatePrices.js';
import { subscriptionsIndexingEmitter } from '../subscriptions/subscriptionsIndexingEmitter.js';
import { closeEndingTenantSubscriptions } from '../subscriptions/closeEndingTenantSubscriptions.js';
import { updateByRatesChanges } from '../subscriptions/updateByRatesChanges.js';
import { notifySoonEndingSubscriptions } from '../subscriptions/notifySoonEndingSubscriptions.js';
import { notifyResumeTenantSubscriptions } from '../subscriptions/notifyResumeTenantSubscriptions.js';
import { notifyHoldTenantCustomer } from '../subscriptions/notifyHoldTenantCustomer.js';

import { mathRound2 } from '../../utils/math.js';

import ApiError from '../../errors/ApiError.js';
import { generalErrorHandler } from '../../errors/errorHandler.js';

import { PHONE_TYPE } from '../../consts/phoneTypes.js';
import { NOTIFY_DAY_BEFORE_TYPE } from '../../consts/notifyDayBefore.js';
import { RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE } from '../../consts/recurrentOrderTemplates.js';
import { PAYMENT_METHOD } from '../../consts/paymentMethods.js';
import { ORDER_STATUS } from '../../consts/orderStatuses.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../consts/subscriptionsIndexingActions.js';
import { WEIGHT_UNIT } from '../../consts/workOrder.js';
import { pricingGetPriceOrder } from '../pricing.js';

const RECURRENT_ORDER_BATCH_SIZE = 5;
const { utcToZonedTime } = dateFnsTz;

const checkScheduledTimeForRun = ({ timeZoneName, targetTime, maxAllowedTimeGapInMins }) => {
  const zonedCurrentDate = utcToZonedTime(new Date(), timeZoneName);

  const [h, m, s] = targetTime.split(':');
  const targetDate = new Date();
  targetDate.setHours(Number(h));
  targetDate.setMinutes(Number(m));
  targetDate.setSeconds(Number(s));

  return Math.abs(differenceInMinutes(zonedCurrentDate, targetDate)) < maxAllowedTimeGapInMins;
};

const checkTimeAndApplyToTenant =
  cb =>
  async (ctx, { targetTime, maxAllowedTimeGapInMins = 10 } = {}) => {
    if (!targetTime) {
      return ctx.logger.error('Target time is missed for Notify Customer job');
    }

    const tenants = await TenantRepository.getInstance(ctx.state).getAllWithCompany();

    if (isEmpty(tenants)) {
      return ctx.logger.info(`None tenants or tenants' company info present`);
    }

    await Promise.all(
      tenants.map(({ id: tenantId, name, ...company }) =>
        cb(ctx, { schemaName: name, tenantId, company }, { targetTime, maxAllowedTimeGapInMins }),
      ),
    ).catch(err => generalErrorHandler(err, ctx.logger));
    return ctx.logger.debug(`SuccessFul Check Time And Apply To Tenant`);
  };

export const updateCustomerBalance = async (
  ctx,
  { schemaName, userId, customerId, newBalance } = {},
) => {
  ctx.state.userId = userId;

  await CustomerRepo.getInstance(ctx.state, { schemaName }).updateBy({
    condition: { id: customerId },
    data: { balance: newBalance },
    log: true,
  });
};

export const updateSalesRep = async (ctx, { data } = {}) => {
  ctx.logger.debug(data, 'Attempt to update sales representatives history');

  if (!data.salesRepresentatives?.length) {
    return;
  }

  const salesRepHistoryRepo = SalesRepHistoryRepo.getInstance(ctx.state, {
    schemaName: data.tenantName,
  });

  const businessUnitIds = data.salesRepresentatives.map(({ businessUnitId }) => businessUnitId);
  let salesRepHistoryItems;

  try {
    salesRepHistoryItems = await salesRepHistoryRepo.getAllByBUIds({ ids: businessUnitIds });
  } catch (error) {
    ctx.logger.error(error, 'Failed to get sales rep history items');
  }

  try {
    await Promise.all(
      data.salesRepresentatives?.map(salesRep => {
        const prevValue = salesRepHistoryItems?.find(
          ({ businessUnitId }) => businessUnitId === salesRep.businessUnitId,
        );

        return Number(salesRep.commissionAmount) !== Number(prevValue?.value)
          ? salesRepHistoryRepo.createOne({
              data: {
                userId: data.id,
                businessUnitId: salesRep.businessUnitId,
                value: salesRep.commissionAmount,
              },
            })
          : undefined;
      }),
    );
  } catch (error) {
    ctx.logger.error(error, 'Failed to add sales rep history items');
  }
};

export const notifyCustomersDayBefore = async (
  ctx,
  { schemaName, tenantId, company: { companyName, phone, timeZoneName: companyTimeZoneName } },
  { targetTime, maxAllowedTimeGapInMins, skipTimeCheck = false },
) => {
  // BUs data is relevant since are not historical ones
  const businessUnits = await BusinessUnitRepo.getInstance(ctx.state, {
    schemaName,
  }).getAllPopulated({
    fields: ['id', 'timeZoneName'],
  });

  const businessUnitIds = businessUnits
    .filter(({ timeZoneName }) =>
      skipTimeCheck
        ? true
        : checkScheduledTimeForRun({
            timeZoneName: timeZoneName || companyTimeZoneName,
            targetTime,
            maxAllowedTimeGapInMins,
          }),
    )
    .map(({ id }) => id);

  if (isEmpty(businessUnitIds)) {
    return;
  }

  const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });
  const tomorrow = startOfTomorrow(); // TODO: use TZ of BU

  const orders = await orderRepo.getOrdersToNotifyAbout({
    condition: {
      date: tomorrow,
      businessUnitIds,
    },
    fields: [
      'id',
      'businessUnitId',
      'serviceDate',
      'billableServiceId',
      'jobSiteId',
      'customerId',
      'orderContactId',
      'notifyDayBefore',
    ],
  });

  if (isEmpty(orders)) {
    return;
  }

  const phoneNumberRepo = PhoneNumberRepo.getInstance(ctx.state, { schemaName });

  const mailSettings = await CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: [
      'servicesFrom',
      'servicesReplyTo',
      'servicesSendCopyTo',
      'servicesSubject',
      'servicesBody',
      'domainId',
    ],
  });

  if (mailSettings.domainId) {
    const { name } = await DomainRepository.getInstance(ctx.state).getBy({
      condition: { id: mailSettings.domainId },
      fields: ['name'],
    });

    mailSettings.domain = name;
  }

  await Promise.all(
    orders.map(async order => {
      if (!order || !order.orderContact) {
        return;
      }

      const notificationData = {
        companyName,
        phone,
        date: tomorrow.toDateString(),
        ...order,
      };

      const contactId = order.orderContact.originalId;
      let mainPhoneNumber;

      try {
        const phoneNumber = await phoneNumberRepo.getBy({
          condition: {
            contactId,
            type: PHONE_TYPE.main,
          },
        });

        mainPhoneNumber = phoneNumber.number;
      } catch (error) {
        ctx.logger.error(
          error,
          `Failed to retrieve phone number: order# ${order.id}, contact ${contactId}`,
        );
      }

      if (!mainPhoneNumber) {
        return;
      }

      const notifyByText = order.notifyDayBefore === NOTIFY_DAY_BEFORE_TYPE.byText;

      try {
        if (notifyByText) {
          await smsService.sendOrderNotification(mainPhoneNumber, notificationData);
        } else if (mailSettings.servicesFrom) {
          await emailService.sendOrderNotification(order.orderContact.email, mailSettings);
        }
      } catch (error) {
        ctx.logger.error(
          error,
          `Failed to send notification: order# ${order.id}, contact ${contactId}`,
        );
      }
    }),
  );
};

export const notifyCustomers = checkTimeAndApplyToTenant(notifyCustomersDayBefore);

const generateOrdersFromRecurrentOrderTemplate = async (
  ctx,
  {
    recurrentOrderTemplateId,
    customerId,
    templateNextServiceDate,
    schemaName,
    mailSettings,
    currentDate,
  },
) => {
  const recurrentOrderTemplateRepo = RecurrentOrderTemplateRepo.getInstance(ctx.state, {
    schemaName,
  });
  const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });
  let dataForGeneration;
  let newOrders;

  try {
    dataForGeneration = await recurrentOrderTemplateRepo.getDataForGeneration({
      condition: {
        recurrentOrderTemplateId,
      },
    });
    const { recurrentOrderTemplate, pricesUpdateData, lineItemsUpdateData } = dataForGeneration;

    const { originalId: customerOriginalId } = recurrentOrderTemplate.originalCustomer;

    Object.assign(recurrentOrderTemplate, {
      serviceDate: recurrentOrderTemplate.nextServiceDate,
      createDeferredWorkOrder: true,
    });

    if (lineItemsUpdateData?.length) {
      Object.assign(recurrentOrderTemplate, {
        lineItems: lineItemsUpdateData,
      });
    }

    if (!isEmpty(pricesUpdateData)) {
      Object.assign(recurrentOrderTemplate, pricesUpdateData);
    }

    const ordersInput = Array(Number(recurrentOrderTemplate.billableServiceQuantity)).fill(
      recurrentOrderTemplate,
    );

    const payments = [
      {
        paymentMethod: PAYMENT_METHOD.onAccount,
        amount: sumBy(ordersInput, 'grandTotal'),
        sendReceipt: false,
      },
    ];

    const nextServiceDate = getNextServiceDate({
      date: recurrentOrderTemplate.nextServiceDate,
      endDate: recurrentOrderTemplate.endDate,
      frequencyType: recurrentOrderTemplate.frequencyType,
      customFrequencyType: recurrentOrderTemplate?.customFrequencyType,
      frequencyPeriod: recurrentOrderTemplate?.frequencyPeriod,
      frequencyDays: recurrentOrderTemplate?.frequencyDays,
    });

    const templateUpdateData = {
      syncDate: currentDate.toUTCString(),
      pricesUpdateData,
      lineItemsUpdateData,
    };

    if (nextServiceDate) {
      templateUpdateData.nextServiceDate = nextServiceDate;
    }

    const [linkedCjsPair, tenant] = await Promise.all([
      CustomerJobSitePairRepo.getInstance(ctx.state, { schemaName }).getBy({
        condition: { id: recurrentOrderTemplate.customerJobSiteId },
      }),
      TenantRepository.getInstance(ctx.state).getBy({
        condition: { name: schemaName },
        fields: ['id'],
      }),
    ]);

    await recurrentOrderTemplateRepo.updateOneBeforeGeneration({
      condition: { id: recurrentOrderTemplateId },
      data: templateUpdateData,
      log: true,
    });

    newOrders = await Promise.all(
      ordersInput.map(order =>
        orderRepo.createOneFromRecurrentOrderTemplate({
          data: order,
          recurrentOrderTemplateId,
          tenantId: tenant.id,
          linkedCjsPair,
        }),
      ),
    );

    await recurrentOrderTemplateRepo.updateBy({
      condition: {
        id: recurrentOrderTemplateId,
      },
      data: {
        grandTotal: newOrders[0].grandTotal,
      },
      log: true,
    });

    const billingRecurrentOrdersInput = await billingProcessor.prePopulateRecurrentOrdersInput(
      ctx,
      {
        recurrentOrderTemplateId,
        ordersInput,
        schemaName,
      },
    );

    const [{ businessUnitId }] = ordersInput;

    await billingProcessor.createPaymentsForRecurrentOrders(ctx, {
      ordersInput: billingRecurrentOrdersInput,
      newOrders: newOrders.map(({ insertData, id, woNumber }) => ({
        ...insertData,
        id,
        businessUnitId,
        woNumber,
      })),
      payments,
      tenantId: tenant.id,
      customerId: customerOriginalId,
      businessUnitId,
      schemaName,
    });
  } catch (error) {
    await Promise.allSettled([
      ...(newOrders?.length
        ? newOrders.map(({ id: orderId, workOrderId }) =>
            orderRepo.deleteOrderAndRelatedEntities({ orderId, workOrderId }),
          )
        : []),
      recurrentOrderTemplateRepo.updateBy({
        condition: {
          id: recurrentOrderTemplateId,
        },
        data: {
          lastFailureDate: templateNextServiceDate,
        },
      }),
      mailSettings
        ? emailService.sendRecurrentOrderFailureNotification(
            {
              customerId,
              recurrentOrderId: recurrentOrderTemplateId,
              serviceDate: format(templateNextServiceDate, 'yyyy-MM-dd'),
            },
            mailSettings,
          )
        : Promise.resolve(),
    ]);

    ctx.logger.error(
      error,
      `Failed to generate orders: recurrentTemplate# ${recurrentOrderTemplateId}`,
    );
  }
};

export const generateOrdersFromRecurrentOrderTemplates = async (
  ctx,
  { schemaName, tenantId, company: { timeZoneName: companyTimeZoneName } },
  { targetTime, maxAllowedTimeGapInMins, skipTimeCheck = true },
  date,
) => {
  const recurrentOrderTemplateRepo = RecurrentOrderTemplateRepo.getInstance(ctx.state, {
    schemaName,
  });

  // BUs data is relevant since are not historical ones
  const [businessUnits, mailSettings] = await Promise.all([
    BusinessUnitRepo.getInstance(ctx.state, { schemaName }).getAllPopulated({
      fields: ['id', 'timeZoneName'],
    }),
    CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
      condition: { tenantId },
      fields: ['notificationEmails'],
    }),
  ]);

  const businessUnitIds = businessUnits
    .filter(({ timeZoneName }) =>
      skipTimeCheck
        ? true
        : checkScheduledTimeForRun({
            timeZoneName: timeZoneName || companyTimeZoneName,
            targetTime,
            maxAllowedTimeGapInMins,
          }),
    )
    .map(({ id }) => id);

  if (isEmpty(businessUnitIds)) {
    return;
  }

  // testing purpose
  const currentDate = date ? new Date(date) : new Date();

  const templates = await recurrentOrderTemplateRepo.getRecurrentOrderTemplatesToGenerate({
    condition: { date: currentDate, businessUnitIds },
  });

  if (isEmpty(templates)) {
    return;
  }

  const templateBatches = chunk(templates, RECURRENT_ORDER_BATCH_SIZE);

  for (const templateBatch of templateBatches) {
    await Promise.allSettled(
      templateBatch.map(element =>
        generateOrdersFromRecurrentOrderTemplate(ctx, {
          recurrentOrderTemplateId: element.id,
          customerId: element.customer.originalId,
          templateNextServiceDate: element.nextServiceDate,
          schemaName,
          mailSettings,
          currentDate,
        }),
      ),
    );
  }
};

export const generateTenantOrdersFromRecurrentOrderTemplates = checkTimeAndApplyToTenant(
  generateOrdersFromRecurrentOrderTemplates,
);

export const dispatchOrder = async (ctx, { schemaName, orderId } = {}) => {
  const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });
  const order = await orderRepo.getBy({
    condition: { id: orderId },
    fields: [
      'id',
      'workOrderId',

      'serviceDate',
      'purchaseOrderId',

      'billableServiceId',
      'equipmentItemId',
      'materialId',
      'customerId',
      'orderContactId',
      'jobSiteId',
      'jobSite2Id',
      'disposalSiteId',
      'permitId',
      'businessUnitId',
    ],
  });

  if (!order) {
    return ctx.logger.error(`No Order with id ${orderId} exists`);
  }

  const tenant = await TenantRepository.getInstance(ctx.state).getBy({
    condition: { name: schemaName },
    fields: ['id'],
  });

  await WorkOrderRepo.getInstance(ctx.state, { schemaName }).dispatchOne({
    condition: { id: order.workOrder.id },
    data: Object.assign(order, {
      tenantId: tenant.id,
      customerOriginalId: order.customer.originalId,
      businessUnitId: order.businessUnit.id,
    }),
    fields: [],
  });

  orderRepo.log({ id: orderId, action: orderRepo.logAction.modify });
  return ctx.logger.info(`Success Dispatch Order with id ${orderId}`);
};

const handleSuccessfulRecurrentOrderPayment = async (
  ctx,
  { schemaName, orderId, recurrentOrderTemplateId },
  { mailSettings = {} } = {},
) => {
  const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });

  const order = await orderRepo.getBy({
    condition: { id: orderId, draft: true },
    fields: [
      'id',
      'workOrderId',
      'customerJobSiteId',

      'serviceDate',
      'purchaseOrderId',
      'thirdPartyHaulerId',
      'billableServiceId',
      'equipmentItemId',
      'materialId',
      'customerId',
      'orderContactId',
      'jobSiteId',
      'jobSite2Id',
      'disposalSiteId',
      'permitId',
      'businessUnitId',
    ],
  });

  if (!order) {
    return ctx.logger.error(`No Order with id ${orderId} exists`);
  }

  const cjPair = await CustomerJobSitePairRepo.getHistoricalInstance(ctx.state, {
    schemaName,
  }).getBy({
    condition: { id: order.customerJobSite.id },
    fields: ['alleyPlacement', 'cabOver', 'signatureRequired'],
    excludeTaxDistricts: true,
  });

  if (!cjPair) {
    return ctx.logger.error(`No Customer-JobSite pair found for Order with id ${orderId}`);
  }

  const tenant = await TenantRepository.getInstance(ctx.state).getBy({
    condition: { name: schemaName },
    fields: ['id'],
  });

  try {
    if (order.billableService && !order.thirdPartyHauler) {
      await WorkOrderRepo.getInstance(ctx.state, { schemaName }).dispatchOne({
        condition: { id: order.workOrder.id },
        data: {
          ...order,
          alleyPlacement: cjPair.alleyPlacement,
          cabOver: cjPair.cabOver,
          signatureRequired: cjPair.signatureRequired,
          tenantId: tenant.id,
          customerOriginalId: order.customer.originalId,
          businessUnitId: order.businessUnit.id,
        },
        fields: [],
      });
    }

    await orderRepo.updateBy({ condition: { id: orderId }, data: { draft: false } });
  } catch (error) {
    ctx.logger.error(error, `Failed to dispatch order with id ${orderId}`);

    await Promise.allSettled([
      OrderRepo.getInstance(ctx.state, { schemaName }).deleteOrderAndRelatedEntities({
        orderId,
        workOrderId: order.workOrderId,
      }),
      RecurrentOrderTemplateRepo.getInstance(ctx.state, {
        schemaName,
      }).updateFailureDateByOrderId({
        condition: {
          orderId,
        },
        log: true,
      }),
      mailSettings
        ? emailService.sendRecurrentOrderFailureNotification(
            {
              recurrentOrderId: recurrentOrderTemplateId,
              customerId: order.customer?.originalId,
              serviceDate: format(order.serviceDate, 'yyyy-MM-dd'),
            },
            mailSettings,
          )
        : Promise.resolve(),
    ]);

    return null;
  }

  try {
    await orderRepo.log({ id: orderId, repo: orderRepo, action: orderRepo.logAction.create });
  } catch (error) {
    ctx.logger.error(error, 'Failed to log create order from recurrent template');
  }
  return ctx.logger.info(`Handle Successful Recurrent Order Payment with id ${orderId}`);
};

const handleFailedRecurrentOrderPayment = async (
  ctx,
  { schemaName, orderId, recurrentOrderTemplateId },
  { mailSettings = {} } = {},
) => {
  try {
    const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });
    const order = await orderRepo.getBy({
      condition: { id: orderId, draft: true },
      fields: ['id', 'workOrderId', 'serviceDate', 'customerId'],
    });

    if (!order) {
      return ctx.logger.error(`No Order with id ${orderId} exists`);
    }

    await Promise.allSettled([
      orderRepo.deleteOrderAndRelatedEntities({
        orderId,
        workOrderId: order.workOrderId,
      }),
      RecurrentOrderTemplateRepo.getInstance(ctx.state, {
        schemaName,
      }).updateFailureDateByOrderId({
        condition: {
          orderId,
        },
        log: true,
      }),
      mailSettings
        ? emailService.sendRecurrentOrderFailureNotification(
            {
              customerId: order.customer?.originalId,
              recurrentOrderId: recurrentOrderTemplateId,
              serviceDate: format(order.serviceDate, 'yyyy-MM-dd'),
            },
            mailSettings,
          )
        : Promise.resolve(),
    ]);
  } catch (error) {
    ctx.logger.error(error, 'Failed to remove failed recurrent order');
  }
  return ctx.logger.info(`Handle Failed Recurrent Order Payment with id ${orderId}`);
};

export const handleFailedOrSuccessfulRecurrentOrderPayment = async (
  ctx,
  { schemaName, tenantId, orderId, status },
) => {
  const [mailSettings, { recurrentOrderTemplateId }] = await Promise.all([
    CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
      condition: { tenantId },
      fields: ['notificationEmails'],
    }),
    RecurrentOrderTemplateOrderRepo.getInstance(ctx.state, {
      schemaName,
    }).getRecurrentTemplateByOrderId({
      condition: { orderId },
      fields: ['recurrentOrderTemplateId'],
    }),
  ]);
  if (status === 'success') {
    await handleSuccessfulRecurrentOrderPayment(
      ctx,
      { schemaName, orderId, recurrentOrderTemplateId },
      { mailSettings },
    );
  } else if (status === 'failure') {
    await handleFailedRecurrentOrderPayment(
      ctx,
      { schemaName, orderId, recurrentOrderTemplateId },
      { mailSettings },
    );
  }
};

export const rollbackFailedToInvoiceOrders = async (ctx, { schemaName, userId, orderIds }) => {
  ctx.state.userId = userId;

  const items = await PreInvoicedOrderDraftRepo.getInstance(ctx.state, {
    schemaName,
  }).getAllByOrdersIds({
    condition: { orderIds },
    fields: ['orderId', 'orderStatus'],
  });

  const orders = items.reduce(
    (acc, { orderId, orderStatus }) => {
      acc[orderStatus].push(orderId);
      return acc;
    },
    { [ORDER_STATUS.canceled]: [], [ORDER_STATUS.finalized]: [] },
  );

  const repo = OrderRepo.getInstance(ctx.state, { schemaName });
  try {
    await repo.unmarkOrdersInvoiced(orders);

    const action = repo.logAction.modify;
    orderIds.forEach(id => repo.log({ id, action }));
  } catch (error) {
    ctx.logger.error(error, 'Failed to unmark invoiced orders');
  }
};

const monthlyBilling = service => {
  const startOfSubscription = new Date(service.startDate);
  const monthDiff = differenceInCalendarMonths(
    new Date(service.effectiveDate),
    startOfSubscription,
  );

  const startOfBillingCycle = addMonths(startOfSubscription, monthDiff);
  let endOfBillingCycle = addMonths(startOfBillingCycle, 1);
  if (service.endDate && service.endDate <= endOfBillingCycle) {
    endOfBillingCycle = service.endDate;
  }
  return { start: startOfBillingCycle, end: endOfBillingCycle };
};

const billingCycleDates = service => {
  // TODO extend when another billing cycle implemented
  switch (service.billingCycle) {
    case RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.monthly:
      return monthlyBilling(service);

    default:
      return monthlyBilling(service);
  }
};

const getAllProrationChanges = (allHistorical, billingCycle) => {
  const historicalByBillingCycle = allHistorical.filter(
    item => item.billingCycle === RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.monthly,
  );
  const prorationChanges = [];

  const lastProrate = {
    ...historicalByBillingCycle[historicalByBillingCycle.length - 1],
    effectiveDate: billingCycle.end,
  };

  prorationChanges.push(lastProrate);

  const intermediateProration = historicalByBillingCycle.filter(
    item =>
      !item.recalculate &&
      item.updatedAt >= billingCycle.start &&
      item.updatedAt < billingCycle.end,
  );

  let lastChangeIndex = 0;

  if (!isEmpty(intermediateProration)) {
    prorationChanges.unshift(...intermediateProration);

    lastChangeIndex = intermediateProration[intermediateProration.length - 1];
  }

  const firstProrate = {
    ...historicalByBillingCycle[lastChangeIndex],
    effectiveDate: billingCycle.start,
  };

  prorationChanges.unshift(firstProrate);

  return prorationChanges;
};

const calculateProration = (services, billingCycle) => {
  const billingLength = differenceInCalendarDays(billingCycle.end, billingCycle.start);
  const billingPerDay = {
    xPerMonth: service => service.times,
    xPerWeek: service => service.times * differenceInWeeks(billingCycle.end, billingCycle.start),
    everyXDays: service => billingLength / service.times,
  };

  const result = services
    .map((service, index) => {
      const numberOfServices = Math.floor(billingPerDay[service.type](service));
      const dayDiff = Math.abs(
        differenceInCalendarDays(
          service.effectiveDate,
          services[index + 1 === services.length ? index - 1 : index + 1].effectiveDate,
        ),
      );

      const numberOfProvidedServices = Math.ceil((dayDiff * numberOfServices) / billingLength);
      let totalPrice = 0;

      if (service.prorationType === 'usageDays') {
        totalPrice = ((+service.price * +service.quantity) / billingLength) * dayDiff;
      }

      if (service.prorationType === 'servicesPerformed') {
        totalPrice =
          ((+service.price * +service.quantity) / numberOfServices) * numberOfProvidedServices;
      }

      return mathRound2(totalPrice);
    })
    .reduce((acc, next) => acc + next);

  return result;
};

export const updateOrdersPaymentMethods = async (ctx, { schemaName, orderIds, paymentMethod }) => {
  try {
    await OrderRepo.getInstance(ctx.state, { schemaName }).addPaymentMethodToOrders({
      orderIds,
      paymentMethod,
    });
  } catch (error) {
    ctx.logger.error(
      error,
      `Failed to add payment method to orders with ids: ${orderIds.join(',')}`,
    );
  }
};

export const updateSubscriptionsByRatesChanges = async (
  ctx,
  { globalServiceRates, customServiceRates, globalLineItemsRates, customLineItemsRates },
) => {
  try {
    await updateByRatesChanges(ctx, {
      globalServiceRates,
      customServiceRates,
      globalLineItemsRates,
      customLineItemsRates,
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed update subscriptions by rates changes');
  }
};

const setNextPrice = item => {
  item.price = item.nextPrice;
  item.nextPrice = null;
  return item;
};

export const updatePriceGroups = async ctx => {
  const tenats = await TenantRepository.getInstance(ctx.state).getAll();

  for (const tenant of tenats) {
    try {
      const customRateLineItemRepo = CustomRateLineItemRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });
      const customRateServiceRepo = CustomRateServiceRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });
      const customRatesRecServiceFreqRepo = CustomRatesRecServiceFreqRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });
      const customRatesRecLineItemBlCycleRepo = CustomRatesRecLineItemBlCycleRepo.getInstance(
        ctx.state,
        { schemaName: tenant.name },
      );

      const [
        customServiceRatesToUpdate,
        customLineItemsRatesToUpdate,
        customRecServiceRatesToUpdate,
        customRecLineItemsRatesToUpdate,
      ] = await Promise.all([
        customRateServiceRepo.getAllForPriceUpdateToday(),
        customRateLineItemRepo.getAllForPriceUpdateToday(),
        customRatesRecServiceFreqRepo.getAllForPriceUpdateToday(),
        customRatesRecLineItemBlCycleRepo.getAllForPriceUpdateToday(),
      ]);

      const customServiceRatesUpdates = customServiceRatesToUpdate?.map(setNextPrice) || [];
      const customLineItemsRatesRatesUpdates =
        customLineItemsRatesToUpdate?.map(setNextPrice) || [];
      const customRecServiceRatesUpdates = customRecServiceRatesToUpdate?.map(setNextPrice) || [];
      const customRecLineItemsRatesRatesUpdates =
        customRecLineItemsRatesToUpdate?.map(setNextPrice) || [];

      await Promise.all([
        customRateServiceRepo.upsertMany({ data: customServiceRatesUpdates }),
        customRateLineItemRepo.upsertMany({
          data: customLineItemsRatesRatesUpdates,
        }),
        customRatesRecServiceFreqRepo.upsertMany({ data: customRecServiceRatesUpdates }),
        customRatesRecLineItemBlCycleRepo.upsertMany({
          data: customRecLineItemsRatesRatesUpdates,
        }),
        updateSubscriptionsByRatesChanges(ctx, {
          schemaName: tenant.name,
          customServiceRates: customRecServiceRatesUpdates,
          customLineItemsRates: customRecLineItemsRatesRatesUpdates,
        }),
      ]);
    } catch (error) {
      ctx.logger.error(error, `Failed update price groups for tenant: ${tenant.name}`);
    }
  }
};

export const closeEndingSubscriptions = async ctx => {
  const tenants = await TenantRepository.getInstance(ctx.state).getAll();

  for (const tenant of tenants) {
    try {
      await Promise.all([
        closeEndingTenantSubscriptions(ctx, tenant.name),
        notifySoonEndingSubscriptions(ctx, tenant.id, tenant.name),
      ]);
    } catch (error) {
      ctx.logger.error(error, `Failed to close ending subscriptions for tenant: ${tenant.name}`);
    }
  }
};

export const notifyResumeSubscriptions = async ctx => {
  const tenats = await TenantRepository.getInstance(ctx.state).getAll();

  for (const tenant of tenats) {
    try {
      await notifyResumeTenantSubscriptions(ctx, tenant.id, tenant.name);
    } catch (error) {
      ctx.logger.error(
        error,
        `Failed to notify on resume subscriptions for tenant: ${tenant.name}`,
      );
    }
  }
};

export const notifyHoldCustomer = async ctx => {
  const tenats = await TenantRepository.getInstance(ctx.state).getAll();

  for (const tenant of tenats) {
    try {
      await notifyHoldTenantCustomer(ctx, tenant.id, tenant.name);
    } catch (error) {
      ctx.logger.error(error, `Failed to notify on hold subscriptions for tenant: ${tenant.name}`);
    }
  }
};

export const updateServiceItemPrice = async ctx => {
  const tenats = await TenantRepository.getInstance(ctx.state).getAll();

  for (const tenant of tenats) {
    const repo = ServiceItemRepo.getInstance(ctx.state, { schemaName: tenant.name });
    const serviceItems = await repo.getByDate({
      condition: {
        recalculate: true,
      },
    });

    if (!isEmpty(serviceItems)) {
      for (const service of serviceItems) {
        const allHistorical = await repo.getHistoricalRecords(service.id);
        const billingCycle = billingCycleDates(allHistorical[allHistorical.length - 1]);
        const prorationChanges = getAllProrationChanges(allHistorical, billingCycle);

        const prorateTotal = calculateProration(prorationChanges, billingCycle);

        repo.updateBy({
          condition: { id: service.id },
          data: { recalculate: false, prorateTotal },
        });
      }
    }
  }
};

export const prolongateSubscriptions = async () => {
  // TODO: develop this missed functionality
};

export const upsertLandfillOperation = async (
  ctx,
  {
    recyclingOrderId,
    haulingOrderId,
    recyclingTenantName: tenantName,
    haulingTenantName: schemaName,
  },
) => {
  const orderId = Number(haulingOrderId);
  // pre-pricing service code:
  // const [order] = await Promise.all([
  //   OrderRepo.getInstance(ctx.state, { schemaName }).getBy({ condition: { id: orderId } }),
  // end of pricing service code
  ctx.state.user.schemaName = schemaName;
  const [getOrder] = await Promise.all([
    pricingGetPriceOrder(ctx, { data: { id: haulingOrderId } }),
    // end added for pricing code
    // CompanyRepo.getInstance(ctx.state).getWithTenant({
    //   condition: { tenantName: schemaName },
    //   fields: ['unit'],
    // }),
  ]);

  if (!getOrder[0]) {
    throw ApiError.unknown('Error while getting orders');
  }
  // eslint-disable-next-line prefer-destructuring
  const order = getOrder[0];
  if (!order) {
    throw ApiError.notFound(
      `Landfill Operation cannot be created since the target order ${orderId} does not exist`,
    );
  } else if (!order.workOrderId || !order.billableServiceId) {
    throw ApiError.conflict(
      undefined,
      `Landfill Operation cannot operate with Order ${order.id} without WO or service`,
    );
  } else if (!order?.disposalSiteId) {
    throw ApiError.invalidRequest(
      `Landfill Operation cannot be created since the target order's ${orderId} disposal site is not recycling facility`,
    );
  } else if (
    [ORDER_STATUS.finalized, ORDER_STATUS.canceled, ORDER_STATUS.invoiced].includes(order.status)
  ) {
    throw ApiError.conflict(
      undefined,
      `Landfill Operation for Order with status ${order.status} cannot be resynced`,
    );
  }
  ctx.state.user = {};
  ctx.state.tenantName = tenantName;
  ctx.state.businessUnitId = order.disposalSite.businessUnitId;

  const response = await getRecyclingOrderById(ctx, recyclingOrderId);

  if (!response.data) {
    ctx.logger.error(response?.errors);
    throw ApiError.invalidRequest(
      `Recycling API returned an errors for its order ${recyclingOrderId}`,
    );
  }

  const { order: recyclingOrder } = response.data;
  const {
    customerTruck,
    PONumber,

    arrivedAt,
    departureAt,

    id: ticketNumber,
    weightTicketPrivateUrl: ticketUrl,
    weightTicketAttachedAt: ticketDate,
    weightTicketCreator,

    materialsDistribution,
    miscellaneousMaterialsDistribution,

    images: mediaFiles,
  } = recyclingOrder;

  let { material, container, originDistrict } = recyclingOrder;
  const { weightIn, weightOut } = recyclingOrder;

  [material, container, originDistrict] = await Promise.all([
    material?.id
      ? MaterialRepo.getInstance(ctx.state, { schemaName }).getById({ id: material.id })
      : Promise.resolve(),
    container?.id
      ? EquipmentItemRepo.getInstance(ctx.state, { schemaName }).getById({ id: container.id })
      : Promise.resolve(),
    originDistrict?.id
      ? OriginDistrictRepo.getInstance(ctx.state, { schemaName }).getWithOrigin(originDistrict.id)
      : Promise.resolve(),
  ]);

  let materialCode;
  let materialDescription;
  if (material) {
    ({ code: materialCode = null, description: materialDescription = null } = material);
  }

  if (!materialCode) {
    throw ApiError.invalidRequest(
      `Recycling Order with id ${recyclingOrderId} doesn't have Material Code`,
    );
  }

  let truck;
  let truckTare;
  if (customerTruck) {
    const { truckNumber, emptyWeight } = customerTruck;
    truck = truckNumber ? String(truckNumber) : null;
    truckTare = emptyWeight ? Number(emptyWeight) : null;
  }

  const newData = {
    orderId,

    recyclingOrderId: Number(recyclingOrderId),
    materialCode,
    materialDescription,

    truck,
    truckTare,
    canTare: container?.emptyWeight ? Number(container?.emptyWeight) : null,

    origin: originDistrict?.description ? String(originDistrict.description) : null,
    purchaseOrder: PONumber ? String(PONumber) : null,

    arrivalDate: arrivedAt ?? null,
    departureDate: departureAt ?? null,

    weightIn: mathRound2(weightIn),
    weightOut: mathRound2(weightOut),
    netWeight: mathRound2(Math.abs(weightIn - weightOut || 0)),
    weightUnit: WEIGHT_UNIT.tons,

    ticketNumber: ticketNumber || null,
    ticketUrl: ticketUrl || null,
    ticketDate: ticketDate ? new Date(ticketDate) : null,
    ticketAuthor: weightTicketCreator?.name || null,

    materials:
      materialsDistribution?.map(({ value, material: { id, description, code } }) => ({
        id,
        description,
        code,
        value,
      })) || null,
    miscellaneousItems:
      miscellaneousMaterialsDistribution?.map(
        ({ quantity, material: { id, description, code } }) => ({
          id,
          description,
          code,
          quantity,
        }),
      ) || null,
    mediaFiles: mediaFiles?.map(({ url }) => url) || null,

    syncDate: new Date(),
  };

  const repo = LandfillOperationRepo.getInstance(ctx.state, { schemaName });
  const { id } = await repo.upsertOne({ data: newData, order, images: mediaFiles, log: true });

  const result = await repo.getBy({ condition: { id } });

  return result;
};

export const subscriptionsExpiredBillingPeriod = async ctx => {
  const tenats = await TenantRepository.getInstance(ctx.state).getAll();

  await Promise.all(
    tenats.map(async tenant => {
      const subscriptionRepo = SubscriptionRepo.getInstance(ctx.state, {
        schemaName: tenant.name,
      });

      const subscriptions = await subscriptionRepo.getExpiredPeriodSubscriptions({
        fields: ['*'],
      });

      ctx.state.user.schemaName = tenant.name;

      if (!isEmpty(subscriptions)) {
        await Promise.all(
          subscriptions.map(async subscription => {
            const {
              serviceItems,
              businessUnitId,
              businessLineId,
              customRatesGroupId,
              anniversaryBilling,
              billingCycle,
              startDate,
              endDate,
              id,
              paidTotal: oldPaidTotal,
              recurringGrandTotal: oldRecurringGrandTotal,
            } = subscription;

            const {
              subscriptionPriceCalculation: { recurringGrandTotal, prorationPeriods },
            } = await calculatePrices(ctx, {
              businessUnitId,
              businessLineId,
              billingCycle,
              anniversaryBilling,
              startDate,
              endDate,
              customRatesGroupId,
              serviceItems: serviceItems.map(({ subscriptionOrders, ...items }) => items),
            });

            const [{ periodFrom, periodTo }] = prorationPeriods.flat(2);

            const paidTotal = Number(oldPaidTotal) + Number(oldRecurringGrandTotal);

            const data = {
              recurringGrandTotal,
              periodFrom,
              periodTo,
              paidTotal,
            };

            ctx.logger.info(
              `subcription with id ${id} period recalculated ${JSON.stringify(data)}`,
            );

            return subscriptionRepo.updateBy({
              condition: { id },
              data,
            });
          }),
        );

        const subscriptionIds = subscriptions.map(subscription => subscription.id);

        subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateMany, ctx, {
          ids: subscriptionIds,
        });
      }
    }),
  );
};
