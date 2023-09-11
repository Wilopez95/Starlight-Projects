import httpStatus from 'http-status';
import * as dateFns from 'date-fns';
import * as dateFnsTz from 'date-fns-tz';
import sumBy from 'lodash/sumBy.js';
import orderBy from 'lodash/orderBy.js';
import keyBy from 'lodash/fp/keyBy.js';

import { generatePrepaidReceipts } from '../../../services/pdfGenerator.js';
import { getPaymentGateway } from '../../../services/paymentGateways/factory.js';

import {
  assertMerchantExists,
  processCcPayment,
  refundPrepaidOrder,
  upsertCreditCard,
  createPaymentsForNewOrders,
} from '../../../graphql/mutations.js';

import ApplicationError from '../../../errors/ApplicationError.js';

import { getPaymentsData, checkCcDataPresence } from '../../../utils/payment.js';
import { mathRound2 } from '../../../utils/math.js';
import arrayToJsonStream from '../../../utils/arrayToJsonStream.js';

//import { AUTHORIZATION_AMOUNT } from '../../../config.js'; Commented PRODSUP-160

import { PaymentStatus } from '../../../consts/paymentStatus.js';
import { PaymentType } from '../../../consts/paymentTypes.js';
import { RefundType } from '../../../consts/refundType.js';

const groupById = keyBy('id');

const capturePayment = async (ctx, { payment, orders, newCapture }, { log } = {}) => {
  const { merchant } = payment.creditCard;
  merchant.spUsed = payment.creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);

  let paymentRetref;
  try {
    ({ ccRetref: paymentRetref } = await gateway.captureAuthorizedAmount({
      ccRetref: payment.ccRetref,
      amount: newCapture,
    }));
  } catch (error) {
    ctx.logger.error(error, 'Failed to capture additional amount');
  }

  if (paymentRetref) {
    const { userId } = ctx.state.user;
    try {
      await payment.$updateOnCapture(
        {
          amount: newCapture,
          ccRetref: paymentRetref,
          orders,
        },
        { log, userId },
      );
    } catch (error) {
      ctx.logger.error(error, `Failed to update payment ${payment.id} on capture try`);
      throw error;
    }
  }
};

const voidPayment = async (ctx, { payment, orders }, { log } = {}) => {
  const { merchant } = payment.creditCard;
  merchant.spUsed = payment.creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);

  let voided = false;
  try {
    await gateway.voidAmount({ ccRetref: payment.ccRetref });
    voided = true;
  } catch (error) {
    ctx.logger.error(error, 'Failed to void the authorized amount');
  }

  if (voided) {
    const { userId } = ctx.state.user;
    try {
      await payment.$updateOnVoid({ orders }, { log, userId });
    } catch (error) {
      ctx.logger.error(error, `Failed to update payment ${payment.id} on void try`);

      await payment.$patch({ status: PaymentStatus.AUTHORIZED }).catch(err => {
        ctx.logger.error(err, `Failed to revert status of payment ${payment.id}`);
        throw err;
      });
      throw error;
    }
  }
};

export const checkAndProcessPrepaidOrders = async ctx => {
  const { Customer, Order, Payment } = ctx.state.models;
  const ordersData = ctx.request.validated.body;
  const orderIds = ordersData.map(order => order.id);

  const payments = await Payment.getAllByOrderIds(orderIds);

  const updatedOrders = groupById(ordersData);

  const authorizationPayments = payments.filter(
    payment => payment.status === PaymentStatus.AUTHORIZED,
  );

  for (const payment of authorizationPayments) {
    let filteredOrders = payment.orders.filter(order => updatedOrders[order.id] !== undefined);

    filteredOrders = orderBy(
      filteredOrders,
      [order => updatedOrders[order.id] - order.capturedTotal],
      ['desc'],
    );

    let availablePaymentAmount = mathRound2(
      payment.amount - sumBy(payment.orders, order => Number(order.assignedAmount)),
    );

    const assignedAmounts = [];
    let totalCapture = 0;

    for (const order of filteredOrders) {
      const currentCaptured = Number(order.capturedTotal);
      const onAccountTotal = Number(order.onAccountTotal);
      const requiredCapture = mathRound2(
        updatedOrders[order.id].grandTotal - onAccountTotal - currentCaptured,
      );
      const newCapture =
        requiredCapture <= 0 ? 0 : Math.min(requiredCapture, availablePaymentAmount);

      if (newCapture >= 0) {
        totalCapture = mathRound2(totalCapture + newCapture);
        availablePaymentAmount = mathRound2(availablePaymentAmount - newCapture);

        assignedAmounts.push({ id: order.id, assignedAmount: newCapture });
      }
    }

    if (
      totalCapture === 0 &&
      payment.orders.length === 1 &&
      updatedOrders?.[payment.orders?.[0]?.id]
    ) {
      await voidPayment(ctx, { payment, orders: assignedAmounts }, { log: true });
    } else if (totalCapture > 0) {
      await capturePayment(
        ctx,
        {
          payment,
          orders: assignedAmounts,
          newCapture: totalCapture,
        },
        { log: true },
      );
    }
  }

  // Do this for all orders to handle potential failures during previous invocations.
  const orders = await Order.recalculateCapturedTotals(orderIds);
  const ordersMap = groupById(orders);
  const overlimitOrders = [];
  let resultingOrders = [];

  for (const newOrder of ordersData) {
    const order = ordersMap[newOrder.id];
    const currentCaptured = Number(order?.capturedTotal ?? 0);
    const currentRefunded = Number(order?.refundedTotal ?? 0);
    const onAccountTotal = Number(order?.onAccountTotal ?? 0);
    const requiredCapture = newOrder.grandTotal - currentCaptured;

    // Check if any amount still needs to be captured.
    if (requiredCapture - onAccountTotal > 0 && !order?.overrideCreditLimit) {
      newOrder.capturedTotal = currentCaptured;
      newOrder.refundedAmount = currentRefunded;
      newOrder.onAccountTotal = onAccountTotal;
      newOrder.overrideCreditLimit = order.overrideCreditLimit;
      newOrder.overlimitAmount = mathRound2(newOrder.grandTotal - currentCaptured - onAccountTotal);

      overlimitOrders.push(newOrder);
    } else if (requiredCapture - onAccountTotal < 0) {
      // TODO: get rid of these fields and remove this assignment.
      order.refundedAmount = currentRefunded;
      order.customerOriginalId = order.customerId;
      order.onAccountTotal = onAccountTotal;
      order.overpaidAmount = mathRound2(
        Math.min(currentCaptured + onAccountTotal - newOrder.grandTotal, currentCaptured),
      );

      order.grandTotal = newOrder.grandTotal;

      const orderPayments = await Payment.getAllForRefund({ orderId: order.id });
      // use order's assignedAmount for overpaid max amount
      orderPayments.forEach(payment => (payment.amount = payment.assignedAmount));

      order.__overpaidOrder = true;
      order.payments = orderPayments;

      resultingOrders.push(order);
    }
  }

  if (overlimitOrders.length) {
    const customerIds = [...new Set(overlimitOrders.map(order => order.customerOriginalId))];
    const customersBalances = await Customer.getBalancesIn(customerIds);

    overlimitOrders.forEach(
      order =>
        (order.availableCredit = customersBalances[order.customerOriginalId].availableCredit),
    );

    resultingOrders = resultingOrders.concat(
      overlimitOrders.map(order => {
        order.__overlimitOrder = true;
        return order;
      }),
    );
  }

  ctx.status = httpStatus.OK;
  if (resultingOrders.length > 100) {
    const { data, configs } = arrayToJsonStream(resultingOrders);

    Object.entries(configs.headers).forEach(([key, value]) => ctx.response.set(key, value));
    ctx.body = data;
  } else {
    ctx.body = resultingOrders;
  }
};

export const createAndProcessNewOrders = async ctx => {
  const { orders, customerId, payments } = ctx.request.validated.body;

  await createPaymentsForNewOrders(ctx, { orders, customerId, payments }, { log: true });

  ctx.status = httpStatus.NO_CONTENT;
};

export const refundAndNewPrepaidPayment = async ctx => {
  const { BusinessUnit, Payment } = ctx.state.models;
  const { refundedPaymentId, orderId, ...data } = ctx.request.validated.body;
  const { paymentType, customerId, checkNumber, date } = data;

  const isCreditCard = paymentType === PaymentType.CREDIT_CARD;
  const { creditCardId, newCreditCard } = data;

  checkCcDataPresence({ paymentType, creditCardId, newCreditCard });

  const refundedPayment = await Payment.getByIdForRefund(refundedPaymentId);
  if (!refundedPayment) {
    throw ApplicationError.notFound(`No Payment with id ${refundedPaymentId} exists`);
  }

  const order = refundedPayment.orders.find(
    refundedOrder => Number(refundedOrder.id) === Number(orderId),
  );
  if (!order) {
    throw ApplicationError.notFound(
      `No Order with id ${orderId} assigned to Payment with id ${refundedPaymentId} exists`,
    );
  }

  const { customer } = refundedPayment;
  if (!customer) {
    throw ApplicationError.notFound('No such customer exists');
  }

  const { userId } = ctx.state.user;
  let creditCard, customerGatewayId, merchant;

  if (isCreditCard) {
    merchant = await assertMerchantExists(
      { BusinessUnit },
      { businessUnitId: customer.businessUnitId },
    );

    ({ creditCard, customerGatewayId } = await upsertCreditCard(
      ctx,
      { creditCardId, newCreditCard, currentMerchant: merchant },
      customer,
      {
        log: true,
        userId,
      },
    ));
  }

  const amount = Number(order?.assignedAmount) || 0;
  const businessUnitId = Number(customer.businessUnitId);

  // TODO: why refundType: RefundType.CREDIT_CARD ?
  await refundPrepaidOrder(
    ctx.state,
    {
      refundedPayment,
      orderId,
      businessUnitId,
      refundType: RefundType.CREDIT_CARD,
      checkNumber,
    },
    { updateRefundedTotal: false, log: true },
  );

  let ccInitialRetref; //, ccAuthorizationRetref; Commented in context of PRODSUP-160
  if (isCreditCard) {
    merchant.spUsed = creditCard.spUsed;
    const gateway = getPaymentGateway(ctx, merchant);

    ({
      ccInitialRetref,
      //, ccAuthorizationRetref
    } = await processCcPayment(
      {
        ccAccountId: creditCard.ccAccountId,
        cardholderId: creditCard.cardholderId,
        customerGatewayId,
        amount,
      },
      gateway,
    ));
  }

  const paymentsData = getPaymentsData({
    customerId,
    creditCardId: creditCard?.id,
    orders: [{ id: order.id, assignedAmount: amount }],
    paymentType,
    date: new Date(date),
    checkNumber,
    prevBalance: Number(customer.balance),
    sendReceipt: false,
    amount,
    ccInitialRetref,
    //ccAuthorizationRetref, Commented in context of PRODSUP-160
    userId,
    //skipAuthorization, Commented in context of PRODSUP-160
  });

  if (paymentsData?.length) {
    await Payment.insertManyForPrepaid({ paymentsData, businessUnitId, userId }, undefined, {
      log: true,
      userId,
    });
  }

  if (!customer.onAccount) {
    ctx.state.logger = ctx.logger;
    generatePrepaidReceipts(
      ctx.state,
      {
        orderIds: [order.id],
        customer,
      },
      { log: true, userId },
    );
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const getPrepaidOrDeferredPaymentsByOrder = async ctx => {
  const { Order } = ctx.state.models;
  const { orderId } = ctx.params;
  const { deferredOnly } = ctx.request.validated.query;

  let result;

  if (deferredOnly) {
    result = await Order.getDeferredPayment(orderId);
  } else {
    result = await Order.getPrepaidOrDeferredPayments(orderId);
  }

  ctx.status = httpStatus.OK;
  ctx.body = result;
};

export const getDeferredPaymentsByCustomer = async ctx => {
  const { Payment } = ctx.state.models;
  const { customerId } = ctx.params;

  const result = await Payment.getDeferredByCustomer(customerId);

  ctx.status = httpStatus.OK;
  ctx.body = result;
};

const assertServiceDateValid = (serviceDate, deferredUntil) => {
  const date1 = dateFnsTz.zonedTimeToUtc(serviceDate, 'UTC');
  const date2 = dateFnsTz.zonedTimeToUtc(deferredUntil, 'UTC');
  if (
    !(
      dateFns.isFuture(date1) &&
      dateFns.isFuture(date2) &&
      // differenceInCalendarDays returns signed value
      dateFns.differenceInCalendarDays(date1, date2) >= 1
    )
  ) {
    throw ApplicationError.conflict(
      `Service date must be later deferredUntil date at least in 1 day`,
    );
  }
};

export const updateDeferredPayment = async ctx => {
  const { BusinessUnit, Payment, Order } = ctx.state.models;
  const { userId } = ctx.state.user;
  const { id } = ctx.params;
  const { serviceDate, paymentType, deferredUntil, orderId, grandTotal, ...data } =
    ctx.request.validated.body;

  const isCreditCard = paymentType === PaymentType.CREDIT_CARD;
  const { creditCardId, newCreditCard } = data;

  checkCcDataPresence({ paymentType, creditCardId, newCreditCard });

  if (isCreditCard && new Date(data.date).toDateString() !== new Date().toDateString()) {
    throw ApplicationError.invalidRequest(
      'If Payment method is Credit Card - Payment date must be today only',
    );
  }

  const payment = await Payment.getByIdForCharge(id);
  if (!payment) {
    throw ApplicationError.notFound(`No Payment with id ${id} exists`);
  } else if (
    ![PaymentStatus.DEFERRED, PaymentStatus.FAILED].includes(payment.status) ||
    !payment.deferredUntil
  ) {
    throw ApplicationError.invalidRequest(`Payment with id ${id} is not deferred`);
  } else if (!payment.orders?.length) {
    throw ApplicationError.notFound(`Payment with id ${id} has no orders linked`);
  }

  const { orders, customer } = payment;
  const orderIds = orders.map(element => element.id);

  const order = orders.find(element => Number(element.id) === Number(orderId)); //check
  order.serviceDate = serviceDate;

  if (!order) {
    throw ApplicationError.notFound(
      `Order with id ${orderId} is not linked to payment with id ${id}`,
    );
  }

  const log = true;
  const changedCreditCard =
    isCreditCard && (newCreditCard || String(payment.creditCard.id) !== String(creditCardId));

  // if failed & cc changed or changed to cash/check -> charge immediately
  if (payment.$shouldChargeImmediately({ paymentType, newCreditCard, creditCardId })) {
    let creditCard, customerGatewayId, ccInitialRetref; //, ccAuthorizationRetref; Commented in context of PRODSUP-160
    if (changedCreditCard) {
      const merchant = await assertMerchantExists(
        { BusinessUnit },
        { businessUnitId: customer.businessUnitId },
      );

      ({ creditCard, customerGatewayId } = await upsertCreditCard(
        ctx,
        { creditCardId, newCreditCard, currentMerchant: merchant },
        customer,
        { log: true, userId },
      ));

      merchant.spUsed = creditCard.spUsed;
      const gateway = getPaymentGateway(ctx, merchant);

      ({
        ccInitialRetref,
        //ccAuthorizationRetref Commented in context of PRODSUP-160
      } = await processCcPayment(
        {
          ccAccountId: creditCard.ccAccountId,
          cardholderId: creditCard.cardholderId,
          customerGatewayId,
          amount: Number(payment.amount),
        },
        gateway,
      ));
    }
    const { checkNumber = null, isAch = false } = data;

    const date = data.date instanceof Date ? data.date.toUTCString() : data.date;

    // don't update amount if it's not deferred, capture as is
    await payment.$updateChargedDeferredPayment({
      data: {
        creditCardId: creditCard?.id,
        status: PaymentStatus.CAPTURED,
        date,
        checkNumber,
        isAch,
        paymentType,
        ccRetref: ccInitialRetref,
        prevBalance: Number(payment.customer.balance),
        // emphasis it's not deferred anymore
        deferredUntil: null,
      },
      orderIds,
      userId,
    });

    /*
    Commented in context of PRODSUP-160
    if (ccAuthorizationRetref) {
      await Payment.createOne(
        ctx,
        {
          data: {
            businessUnitId: Number(payment.businessUnitId),
            customerId: payment.customerId,
            creditCardId: creditCard.id,
            paymentType: PaymentType.CREDIT_CARD,
            prevBalance: Number(payment.customer.balance),
            sendReceipt: false,
            date: new Date().toUTCString(),
            status: PaymentStatus.AUTHORIZED,
            ccRetref: ccAuthorizationRetref,
            amount: AUTHORIZATION_AMOUNT,
            appliedAmount: 0,
            orders: orders.map(({ id }) => ({ id, assignedAmount: 0 })),
            userId,
          },
        },
        { logOrderHistory: true, log, userId },
      );
    }*/

    if (!customer.onAccount) {
      ctx.state.logger = ctx.logger;
      generatePrepaidReceipts(
        ctx.state,
        {
          customer,
          orderIds,
        },
        { log, userId },
      );
    }
  }

  // if not failed -> update
  if (payment.$shouldUpdateDeferredInfo()) {
    const minServiceDate = dateFns.min(orders.map(orderElement => orderElement.serviceDate));

    assertServiceDateValid(minServiceDate, deferredUntil);

    const orderTotalDelta = Number(grandTotal) - order.grandTotal;
    const oldAmount = Number(payment.amount);
    const oldAssignedAmount = Number(order.assignedAmount);

    let differenceAmount = 0;

    if (orderTotalDelta > 0) {
      differenceAmount =
        Number(grandTotal) - order.onAccountTotal - order.capturedTotal - oldAssignedAmount;
    } else {
      differenceAmount =
        oldAssignedAmount + orderTotalDelta > 0 ? orderTotalDelta : -oldAssignedAmount;
    }

    const updates = {
      amount: oldAmount + differenceAmount,
      deferredUntil: deferredUntil instanceof Date ? deferredUntil.toUTCString() : deferredUntil,
    };

    if (newCreditCard || String(payment.creditCard.id) !== String(creditCardId)) {
      const merchant = await assertMerchantExists(
        { BusinessUnit },
        { businessUnitId: customer.businessUnitId },
      );

      const { creditCard } = await upsertCreditCard(
        ctx,
        { creditCardId, newCreditCard, currentMerchant: merchant },
        customer,
        {
          log: true,
          userId,
        },
      );

      updates.creditCardId = creditCard.id;
    }

    await payment.$updatedDeferred(updates, orders, userId);

    await payment.$updateAssignedAmount({ orderId, amount: differenceAmount }, userId);
  }

  log && payment.$log({ userId, action: Payment.logAction.modify });

  await Order.recalculateCapturedTotals(orderIds);

  ctx.status = httpStatus.OK;
  ctx.body = { orderIds };
};

export const unDeferredPayment = async ctx => {
  const { Order } = ctx.state.models;
  const { userId } = ctx.state.user;
  const { orderId } = ctx.params;
  const { nonCanceledOrders } = ctx.request.validated.body;

  const payment = await Order.getDeferredPayment(orderId);

  if (!payment) {
    throw ApplicationError.notFound(`No Payment exists for Order with id ${orderId}`);
  } else if (
    payment.status !== PaymentStatus.DEFERRED &&
    payment.status !== PaymentStatus.FAILED &&
    payment.deferredUntil
  ) {
    throw ApplicationError.invalidRequest(`Payment for Order with id ${orderId} is not deferred`);
  }

  await payment.$updateUndeferedPayment(ctx, { orderId, nonCanceledOrders }, { log: true, userId });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getOrderPaymentsHistory = async ctx => {
  const { OrderPaymentHistory, Invoice } = ctx.state.models;
  const { orderId } = ctx.params;

  const [payments, [invoice] = []] = await Promise.all([
    OrderPaymentHistory.getAll({ condition: { orderId } }),
    Invoice.getByOrderIds([orderId], ['invoiceId']),
  ]);

  ctx.status = httpStatus.OK;
  ctx.body = { payments, invoiceId: invoice?.invoiceId };
};

export const getOrdersByPaymentId = async ctx => {
  const { Order } = ctx.state.models;
  const { paymentId } = ctx.params;

  const items = await Order.getAllByPaymentId(paymentId);

  ctx.status = httpStatus.OK;
  ctx.body = items;
};

export const getDeferredPaymentOrders = async ctx => {
  const { Order } = ctx.state.models;
  const { orderId } = ctx.params;

  const items = await Order.getDeferredPaymentOrders(orderId);

  ctx.status = httpStatus.OK;
  ctx.body = items;
};

export const validateMerchantCredentials = async ctx => {
  const { raw, ...merchant } = ctx.request.validated.body;

  let coreGateway, salespointGateway;

  const { paymentGateway, mid, username, password } = merchant;

  if (password && mid) {
    coreGateway = getPaymentGateway(ctx, {
      paymentGateway,
      mid,
      username,
      password,
    });
  }

  if (merchant.salespointPassword && merchant.salespointMid) {
    salespointGateway = getPaymentGateway(ctx, {
      paymentGateway,
      mid: merchant.salespointMid,
      username: merchant.salespointUsername,
      password: merchant.salespointPassword,
    });
  }

  try {
    await Promise.all([
      coreGateway ? coreGateway.validateCredentials(raw) : Promise.resolve(),
      salespointGateway ? salespointGateway.validateCredentials(raw) : Promise.resolve(),
    ]);
  } catch (error) {
    throw ApplicationError.badRequest(
      error,
      'Provided credentials were rejected by payment gateway',
    );
  }

  ctx.status = httpStatus.OK;
};
