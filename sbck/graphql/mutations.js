import { nanoid } from 'nanoid';
import * as dateFns from 'date-fns';
//eslint-disable-next-line
import datefnstz from 'date-fns-tz';
// import utcToZonedTime from 'date-fns-tz/esm/utcToZonedTime/index.js';
import groupBy from 'lodash/groupBy.js';
import isEmpty from 'lodash/isEmpty.js';
import uniq from 'lodash/uniq.js';
import pick from 'lodash/fp/pick.js';
import sumBy from 'lodash/sumBy.js';
import keyBy from 'lodash/keyBy.js';
import chunk from 'lodash/chunk.js';
import last from 'lodash/last.js';

import { generateCcBankDeposits } from '../services/bankDeposits.js';
import { generatePrepaidReceipts } from '../services/pdfGenerator.js';
import * as coreService from '../services/core.js';
import {
  canInvoiceBeSent,
  sendMultipleInvoices,
  sendMultipleStatements,
  sendMultipleFinanceCharges,
} from '../services/email.js';
import { getPaymentGateway } from '../services/paymentGateways/factory.js';
import { mapGatewayToApplicationError } from '../services/paymentGateways/errors.js';

import { checkPermission } from '../middlewares/authorized.js';

import ApplicationError from '../errors/ApplicationError.js';

import { getWeightTicketFileName } from '../utils/mediaFiles.js';
import { mathRound2 } from '../utils/math.js';
import {
  getPaymentsData,
  getPaymentStatus,
  checkCcDataPresence,
  splitPaymentAmount,
} from '../utils/payment.js';

import { PaymentType } from '../consts/paymentTypes.js';
import { EmailEvent } from '../consts/emailEvent.js';
import { PaymentStatus } from '../consts/paymentStatus.js';
import { RefundType } from '../consts/refundType.js';
import { StatementSection } from '../consts/statementSections.js';
import { PaymentMethod } from '../consts/paymentMethod.js';
import { DEFAULT_WRITE_OFF_DIFFERENCE_IN_HOURS } from '../consts/defaults.js';
import { InvoiceType } from '../consts/invoiceTypes.js';
import { GenerationJobStatus } from '../consts/generationJobStatus.js';

import {
  // AUTHORIZATION_AMOUNT, Commented in context of PRODSUP-160
  WRITE_OFF_DIFFERENCE_IN_HOURS,
  PDF_GENERATION_BATCH_SIZE,
} from '../config.js';

const VAULT_CC_COUNT_LIMIT = 10;

export const assertMerchantExists = async ({ BusinessUnit }, { businessUnitId }) => {
  const bu = await BusinessUnit.getWithMerchant({ condition: { businessUnitId } });

  if (!bu?.merchant?.mid && !bu?.merchant?.salespointMid) {
    throw ApplicationError.preconditionFailed(
      `Merchant is not configured for business unit with id ${businessUnitId}`,
    );
  }

  return bu.merchant;
};

const getCreateCcFields = pick([
  'active',
  'cardNickname',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'zip',
  'nameOnCard',
  'expirationDate',
  'cardNumber',
  'cvv',
]);

export const upsertCreditCard = async (
  ctx,
  { creditCardId, newCreditCard, currentMerchant },
  { id: customerId, businessUnitId, ...customerData },
  { log, userId },
) => {
  let creditCard, gateway, customerGatewayId;
  const { BusinessUnit, CreditCard, Merchant } = ctx.state.models;

  if (creditCardId) {
    creditCard = await CreditCard.getById(creditCardId);

    if (!creditCard) {
      throw ApplicationError.notFound('Credit card not found');
    }

    const merchant = await Merchant.getById(creditCard.merchantId);

    if (!merchant) {
      throw ApplicationError.notFound(`Merchant ${creditCard.merchantId} not found`);
    }

    if (currentMerchant?.id?.toString() !== creditCard.merchantId.toString()) {
      throw ApplicationError.invalidRequest('Merchant linked to cc is not active');
    }

    merchant.spUsed = !!creditCard.spUsed;
    gateway = getPaymentGateway(ctx, merchant);
    customerGatewayId = customerData[gateway.customerIdPropName];
  } else {
    const spUsed = !!newCreditCard.spUsed;
    const ccData = getCreateCcFields(newCreditCard);

    const merchant = await assertMerchantExists({ BusinessUnit }, { businessUnitId });
    merchant.spUsed = spUsed;

    gateway = getPaymentGateway(ctx, merchant);

    customerGatewayId = customerData[gateway.customerIdPropName];

    const customerUpdateData = {};

    let activeCustomerGatewayId;

    let shouldCreateVaultRecord = true;

    const gatewayIds = customerData[`${gateway.customerIdPropName}s`];

    if (customerData.walkup) {
      activeCustomerGatewayId = last(gatewayIds) ?? customerGatewayId;

      if (activeCustomerGatewayId) {
        const boundCcCount = await CreditCard.countByCustomerGatewayId(activeCustomerGatewayId);

        if (boundCcCount < VAULT_CC_COUNT_LIMIT) {
          shouldCreateVaultRecord = false;
        }
      }
    } else {
      activeCustomerGatewayId = customerData[gateway.customerIdPropName];

      if (activeCustomerGatewayId) {
        shouldCreateVaultRecord = false;
      }
    }

    if (shouldCreateVaultRecord) {
      try {
        activeCustomerGatewayId = await gateway.createCustomerRecord(ccData);

        if (!customerData[gateway.customerIdPropName]) {
          customerUpdateData[gateway.customerIdPropName] = activeCustomerGatewayId;
        } else if (customerData.walkup) {
          customerUpdateData[`${gateway.customerIdPropName}s`] = [
            ...gatewayIds,
            activeCustomerGatewayId,
          ];
        }

        customerGatewayId = activeCustomerGatewayId;
      } catch (error) {
        throw mapGatewayToApplicationError(error);
      }
    }

    try {
      await gateway.validateCreditCard(ccData);
    } catch (error) {
      ctx.logger.error(error);
      throw mapGatewayToApplicationError(error);
    }

    let ccAccountId = await CreditCard.countByCustomerId(customerId);
    ccAccountId = ccAccountId ? ccAccountId + 1 : 1;

    let gatewayUpdateData;
    try {
      gatewayUpdateData = await gateway.addCreditCard({
        customerGatewayId: activeCustomerGatewayId,
        ccAccountId: ccAccountId.toString(),
        ccData,
      });
    } catch (error) {
      throw mapGatewayToApplicationError(error);
    }

    creditCard = await CreditCard.createOne(
      {
        data: {
          customerId,
          spUsed,
          cardNumberLastDigits: ccData.cardNumber.slice(-4),
          merchantId: merchant.id,
          active: ccData.active,
          cardNickname: ccData.cardNickname,
          jobSites: newCreditCard.jobSites,
          paymentGateway: merchant.paymentGateway,
          customerGatewayId: activeCustomerGatewayId,
          ...gatewayUpdateData,
        },
        customerData: isEmpty(customerUpdateData) ? undefined : customerUpdateData,
      },
      { log, userId },
    );
  }

  return { creditCard, customerGatewayId };
};

const getUpdateGatewayCcFields = pick([
  'nameOnCard',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'zip',
]);

const getUpdateCcFields = pick(['active', 'cardNickname', 'jobSites']);

export const updateCreditCard = async (ctx, { id, data }, { log, userId } = {}) => {
  const { CreditCard, Merchant } = ctx.models;
  const creditCard = await CreditCard.getByIdPopulated(id);

  if (!creditCard) {
    throw ApplicationError.notFound('Credit card not found');
  }

  const { ccAccountId, cardholderId, ccAccountToken, merchantId, customer } = creditCard;

  const merchant = await Merchant.getById(merchantId);

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  merchant.spUsed = creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);

  try {
    await gateway.updateCreditCard({
      customerGatewayId: customer[gateway.customerIdPropName],
      ccAccountId,
      ccAccountToken,
      cardholderId,
      ccData: getUpdateGatewayCcFields(data),
    });
  } catch (error) {
    throw mapGatewayToApplicationError(error);
  }

  const updatedCreditCard = await creditCard.$updateNonPCICompliantData(getUpdateCcFields(data), {
    log,
    userId,
  });

  return updatedCreditCard;
};

export const deleteCreditCard = async (ctx, { id }, { log } = {}) => {
  const { CreditCard, Merchant } = ctx.models;

  const creditCard = await CreditCard.getByIdPopulated(id);

  if (!creditCard) {
    throw ApplicationError.notFound('Credit card not found');
  }

  const { customer, cardholderId, ccAccountId, merchantId } = creditCard;

  if (creditCard.active) {
    throw ApplicationError.invalidRequest('Active credit card cannot be removed');
  }

  const merchant = await Merchant.getById(merchantId);

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  merchant.spUsed = creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);

  try {
    await gateway.removeCreditCard({
      customerGatewayId: customer[gateway.customerIdPropName],
      cardholderId,
      ccAccountId,
    });
  } catch (error) {
    throw mapGatewayToApplicationError(error);
  }

  const { userId } = ctx.user;
  await CreditCard.deleteById(id, { log, userId }).catch(error => {
    ctx.logger.error(
      error,
      'Apparently Credit Card cannot be deleted since other entities ref on it',
    );
  });

  return true;
};

const checkCcDataValidity = ({ paymentType, creditCardId, newCreditCard, date }) => {
  const isCreditCard = paymentType === PaymentType.CREDIT_CARD;
  if (isCreditCard && !creditCardId && !newCreditCard) {
    throw ApplicationError.invalidRequest(
      'Payment type credit card was selected, but no credit card was provided',
    );
  } else if (isCreditCard && date.toDateString() !== new Date().toDateString()) {
    throw ApplicationError.invalidRequest(
      'If Payment method is Credit Card - Payout date must be today only',
    );
  }
};

const numericFields = ['amount', 'prevBalance', 'appliedAmount'];
const mapPaymentFields = obj => {
  Object.entries(obj)
    .filter(([key]) => numericFields.includes(key))
    .forEach(([key, value]) => (obj[key] = mathRound2(Number(value) || 0)));
  return obj;
};

export const processCcPayment = async (
  { customerGatewayId, ccAccountId, cardholderId, amount },
  gateway,
  //skipAuthorization = false Commented in context of PRODSUP-160
) => {
  let ccAuthorizationRetref, ccInitialRetref;

  try {
    ({ ccRetref: ccInitialRetref } = await gateway.authorizeAndCaptureAmount({
      customerGatewayId,
      ccAccountId,
      cardholderId,
      amount,
    }));
  } catch (error) {
    throw mapGatewayToApplicationError(error);
  }

  /*if (!skipAuthorization && AUTHORIZATION_AMOUNT > 0) {
    try {
      ({ ccRetref: ccAuthorizationRetref } = await gateway.authorizeAmount({
        customerGatewayId,
        ccAccountId,
        cardholderId,
        amount: AUTHORIZATION_AMOUNT,
      }));
    } catch (error) {
      throw mapGatewayToApplicationError(error);
    }
  }*/

  return { ccInitialRetref, ccAuthorizationRetref };
};

export const createUnappliedPayment = async (ctx, { customerId, data }, { log } = {}) => {
  const { BusinessUnit, Payment, Customer } = ctx.models;
  const { paymentType, creditCardId, newCreditCard, checkNumber, amount, applications = [] } = data;

  if (
    paymentType === PaymentType.CREDIT_MEMO &&
    !checkPermission(ctx.user, ['billing/payments:credit-memo:perform'])
  ) {
    throw ApplicationError.accessDenied('You do not have permission to create credit memos');
  }

  checkCcDataValidity({ paymentType, creditCardId, newCreditCard, date: new Date(data.date) });

  const customer = await Customer.getById(customerId, [
    'id',
    'cardConnectId',
    'fluidPayId',
    'cardConnectIds',
    'fluidPayIds',
    'balance',
    'businessUnitId',
    'walkup',
  ]);
  if (!customer) {
    throw ApplicationError.notFound('No such customer exists');
  }

  const isCreditCard = paymentType === PaymentType.CREDIT_CARD;
  const { userId } = ctx.user;
  let creditCard = {};
  let ccRetref, customerGatewayId;

  if (isCreditCard) {
    const merchant = await assertMerchantExists(
      { BusinessUnit },
      { businessUnitId: customer.businessUnitId },
    );

    ({ creditCard, customerGatewayId } = await upsertCreditCard(
      ctx,
      { creditCardId, newCreditCard, currentMerchant: merchant },
      customer,
      {
        log,
        userId,
      },
    ));

    merchant.spUsed = creditCard.spUsed;
    const gateway = getPaymentGateway(ctx, merchant);

    ({ ccInitialRetref: ccRetref } = await processCcPayment(
      {
        ccAccountId: creditCard.ccAccountId,
        customerGatewayId,
        cardholderId: creditCard.cardholderId,
        amount,
      },
      gateway,
      true,
    ));
  }

  const date = new Date(data.date).toUTCString();
  const prevBalance = Number(customer.balance);
  const newBalanceResult = Number(prevBalance) - Number(amount);
  const newBalance = Number(newBalanceResult.toFixed(2));

  const status = getPaymentStatus({ isCreditCard, ccInitialRetref: ccRetref });

  const billableItemInfo =
    data.billableItemId && data.billableItemType
      ? {
          billableItemType: data.billableItemType,
          billableItemId: Number(data.billableItemId),
        }
      : {};

  const payment = await Payment.createOne(
    ctx,
    {
      data: {
        ...billableItemInfo,
        customerId: Number(customerId),
        businessUnitId: Number(customer.businessUnitId),
        creditCardId: creditCard?.id,
        isPrepay: false,

        paymentType,

        status,
        ccRetref,

        date,
        checkNumber: checkNumber ?? null,
        isAch: !!data.isAch,
        sendReceipt: !!data.sendReceipt,
        memoNote: data.memoNote,
        applications,
        amount,
        prevBalance,
        newBalance,
        appliedAmount: 0,
        userId,
      },
    },
    { log, userId },
  );

  if (status === PaymentStatus.CAPTURED) {
    await customer.$patch({ balance: newBalance });

    const { schemaName } = ctx.user;
    await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });
  }

  payment.date = data.date;
  return mapPaymentFields(payment);
};

export const createPayout = async (ctx, { customerId, data }, { log } = {}) => {
  const { Payout, Payment, Customer, BusinessUnit } = ctx.models;
  const { paymentIds, paymentType, checkNumber, isAch } = data;
  const date = new Date(data.date);

  const { creditCardId, newCreditCard } = data;
  checkCcDataValidity({ paymentType, creditCardId, newCreditCard, date });

  const [customer, payments] = await Promise.all([
    Customer.getById(customerId, [
      'id',
      'cardConnectId',
      'fluidPayId',
      'businessUnitId',
      'balance',
      'walkup',
    ]),
    Payment.getByIds(paymentIds, [
      'id',
      'paymentType',
      'amount',
      'appliedAmount',
      'customerId',
      'ccRetref',
    ]),
  ]);

  if (!customer) {
    throw ApplicationError.notFound('No such customer exists');
  }
  if (isEmpty(payments)) {
    throw ApplicationError.notFound('None specified payments found');
  }

  const prevBalance = Number(customer.balance);

  let totalAmount = 0;
  const applications = [];
  // additional check for rest unapplied amount of the target Payments
  const wrongPaymentAmount = payments.some(
    ({ id, amount = 0, appliedAmount = 0, paidOutAmount = 0 }) => {
      if (Number(amount) <= Number(appliedAmount)) {
        return true;
      }

      const unappliedAmount = Number(amount) - Number(appliedAmount) - Number(paidOutAmount);
      totalAmount += unappliedAmount;

      // at first this obj is payments-oriented then re-map
      applications.push({
        id,
        paidOutAmount: unappliedAmount,
      });
      return false;
    },
  );

  if (wrongPaymentAmount) {
    throw ApplicationError.invalidRequest('Only unapplied Payments are applicable for payout');
  }

  const { schemaName, userId } = ctx.user;
  let creditCard, customerGatewayId, ccRetref;

  if (paymentType === PaymentType.CREDIT_CARD) {
    const merchant = await assertMerchantExists(
      { BusinessUnit },
      { businessUnitId: customer.businessUnitId },
    );

    ({ creditCard, customerGatewayId } = await upsertCreditCard(
      ctx,
      { creditCardId, newCreditCard, currentMerchant: merchant },
      customer,
      {
        log,
        userId,
      },
    ));

    merchant.spUsed = creditCard.spUsed;
    const gateway = getPaymentGateway(ctx, merchant);

    const { ccAccountId, cardholderId } = creditCard;

    try {
      ({ ccRetref } = await gateway.payoutAmount({
        customerGatewayId,
        ccAccountId,
        cardholderId,
        amount: totalAmount,
      }));
    } catch (error) {
      throw mapGatewayToApplicationError(error);
    }
  }

  const payout = await Payout.createAndApply(
    {
      customerId: Number(customerId),
      creditCard,
      userId,

      paymentType,
      date: date.toUTCString(),
      ccRetref,
      checkNumber,
      isAch: !!isAch,

      amount: totalAmount,
      prevBalance,

      applications,
    },
    { log, userId },
  );

  const { newBalance } = payout;

  await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });

  return payout;
};

const refundPartially = async (
  ctx,
  { payment, orderId, businessUnitId, refundedAmount, refundType, checkNumber },
  { updateBalance = false, logOrderHistory = true, log = false } = {},
) => {
  const { assignedAmount, customerId, paymentType, ccRetref } = payment;

  const totalAmount = mathRound2(payment.amount);
  refundedAmount = mathRound2(refundedAmount);
  if (assignedAmount <= 0) {
    throw ApplicationError.invalidRequest(
      `Only unapplied Payment can be refunded when unapplied amount > 0 but value is ${assignedAmount}`,
    );
  } else if (refundedAmount <= 0) {
    throw ApplicationError.invalidRequest(`Refund amount ${refundedAmount} must be positive`);
  } else if (assignedAmount < refundedAmount) {
    throw ApplicationError.invalidRequest(
      `Amount ${refundedAmount} cannot be refunded since it exceeds unapplied amount ${assignedAmount}`,
    );
  } else if (
    refundType === RefundType.CREDIT_CARD &&
    (paymentType !== PaymentType.CREDIT_CARD || !ccRetref)
  ) {
    throw ApplicationError.invalidRequest(
      'Can not refund a payment without a credit card transaction to credit card',
    );
  }

  const { Customer, Merchant, Payment } = ctx.models;

  let gateway;

  if (refundType === RefundType.CREDIT_CARD) {
    const merchant = await Merchant.getById(payment.creditCard.merchantId);

    if (!merchant) {
      throw ApplicationError.notFound(
        `Merchant with id: ${payment.creditCard.merchantId} not found`,
      );
    }

    merchant.spUsed = payment.creditCard.spUsed;
    gateway = getPaymentGateway(ctx, merchant);

    // try to void it at first when it's first and full refund
    let refunded = false;
    if (totalAmount && totalAmount === refundedAmount && !Number(payment.refundedAmount)) {
      try {
        await gateway.voidAmount({ ccRetref });
        refunded = true;
      } catch (error) {
        ctx.logger.debug(error, 'Attempt to void full captured amout so goes to refund it');
      }
    }

    if (!refunded) {
      try {
        await gateway.partialRefund({ ccRetref, amount: refundedAmount });
      } catch (error) {
        throw mapGatewayToApplicationError(error);
      }
    }
  }

  const { userId, schemaName } = ctx.user;
  let onAccountPayment;
  if (refundType === RefundType.ON_ACCOUNT) {
    // create unapplied refund on account payment
    onAccountPayment = await Payment.createOne(
      ctx,
      {
        data: {
          businessUnitId,
          paymentType: PaymentType.REFUND_ON_ACCOUNT,
          customerId: payment.customerId,
          prevBalance: Number(payment.prevBalance) - refundedAmount,
          sendReceipt: false,
          date: new Date().toUTCString(),
          status: PaymentStatus.CAPTURED,
          isPrepay: false,

          amount: refundedAmount,
          appliedAmount: 0,
          userId,
        },
      },
      {
        log,
        userId,
      },
    );

    const newBalance = await Customer.decrementBalance(customerId, refundedAmount);

    await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });
  }

  const refundedPayment = await payment.$refundUpdate(
    {
      refundedAmount,
      orderId,
      onAccountPayment,
      checkNumber,
      refundType,
    },
    { logOrderHistory, log, userId },
  );

  if (updateBalance) {
    const newBalance = await Customer.incrementBalance(customerId, refundedAmount);

    await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });
  }

  return { refundedPayment, gateway };
};

export const refundUnappliedPayment = async (ctx, { paymentId, amount }, { log } = {}) => {
  const payment = await ctx.models.Payment.getByIdForRefund(paymentId);

  if (!payment) {
    throw ApplicationError.notFound(`No Payment with id ${paymentId} exists`);
  } else if (payment.paymentType !== PaymentType.CREDIT_CARD) {
    throw ApplicationError.invalidRequest(
      `Only unapplied Payment of payment type ${PaymentType.CREDIT_CARD} can be refunded`,
    );
  }

  const { refundedPayment } = await refundPartially(
    ctx,
    {
      payment,
      businessUnitId: Number(payment.customer.businessUnit.id),
      refundedAmount: Number(amount),
      checkNumber: payment?.checkNumber,
      refundType: payment.paymentType,
    },
    { updateBalance: true, log },
  );

  return refundedPayment;
};

export const refundPrepaidOrder = async (
  ctx,
  { refundedPayment, orderId, businessUnitId, amount, refundType, checkNumber },
  { updateRefundedTotal, log },
) => {
  const { Order, Payment } = ctx.models;
  const order = await Order.getById(orderId, ['id', 'capturedTotal', 'refundedTotal']);
  if (!order) {
    throw ApplicationError.notFound(`No Order with id ${orderId} found`);
  }

  if (
    !refundedPayment ||
    !refundedPayment?.orders?.find(refundedPaymentOrder => refundedPaymentOrder.id == orderId)
  ) {
    throw ApplicationError.notFound(`No captured Payment for Order with id ${orderId} found`);
  }
  const assignedAmount = Number(
    refundedPayment.orders.find(
      refundedPaymentOrder => Number(refundedPaymentOrder.id) === Number(orderId),
    )?.assignedAmount,
  );

  // refund payment but without Customer's balance update since it's non-invoiced order yet
  const refundedAmount = amount
    ? Number(amount)
    : // full order refund case
      assignedAmount;

  if (refundedAmount > assignedAmount) {
    throw ApplicationError.invalidRequest(
      'Refunded amount can not be greater than assigned amount',
    );
  }

  const { userId } = ctx.user;
  const { gateway } = await refundPartially(
    ctx,
    {
      payment: refundedPayment,
      orderId,
      businessUnitId,
      refundedAmount,
      refundType,
      checkNumber,
    },
    { updateBalance: false, logOrderHistory: true, log },
  );

  if (refundedPayment.paymentType === PaymentType.CREDIT_CARD && refundedPayment.creditCardId) {
    // Void authorized payment if it's the first refund.
    const authorizedPayment = await Payment.getByOrderId({
      orderId,
      condition: {
        status: PaymentStatus.AUTHORIZED,
        creditCardId: refundedPayment.creditCardId,
      },
    });

    if (authorizedPayment) {
      try {
        await gateway.voidAmount({ ccRetref: authorizedPayment.ccRetref });

        await authorizedPayment.$updateOnVoid(
          {
            orders: refundedPayment.orders.map(({ id }) => ({ id, assignedAmount: 0 })),
          },
          { log, userId },
        );
      } catch (error) {
        ctx.logger.error(error, 'Failed to void the authorized amount');
      }
    }
  }

  const refundedTotal = updateRefundedTotal ? Number(order.refundedTotal) + refundedAmount : 0;

  if (updateRefundedTotal) {
    await order.$patch({
      refundedTotal: mathRound2(Number(order.refundedTotal) + refundedAmount),
      capturedTotal: mathRound2(Number(order.capturedTotal) - Number(refundedAmount)),
    });
  }

  return refundedTotal;
};

const createSettlementAndRelated = async (
  ctx,
  { merchant, isoDate, businessUnitId, merchantId, mid, generationJob },
  { log } = {},
) => {
  const { BankDeposit, GenerationJob, Settlement } = ctx.models;
  const { tenantId, userId } = ctx.state.user;

  const spUsedMid = mid === merchant.salespointMid;
  const gateway = getPaymentGateway(ctx, { ...merchant, spUsed: spUsedMid });

  let settlement;
  try {
    const settlementData = await gateway.requestSettlement({ date: isoDate });
    settlementData.settlementTransactions = settlementData?.settlementTransactions?.map(element => {
      element.spUsed = spUsedMid;
      return element;
    });

    settlement = await Settlement.createSettlement({
      data: {
        ...settlementData,
        businessUnitId: Number(businessUnitId),
        merchantId: Number(merchantId),
        spUsed: merchant.salespointMid === mid,
        mid,
      },
    });

    await generationJob.$relateSettlement(settlement.id);
  } catch (error) {
    ctx.logger.error('Failed to create settlement');

    await generationJob.$incrementFailedCount();

    throw error;
  }

  let bankDeposit;
  try {
    bankDeposit = await generateCcBankDeposits(
      ctx,
      { Settlement, BankDeposit },
      { settlementId: settlement.id, mid: gateway.mid },
      { tenantId },
    );

    await generationJob.$incrementCount();
  } catch (error) {
    ctx.logger.error('Failed to generate cc bank deposits');

    // settlement is not possible without cc bank deposit
    await Settlement.deleteById(settlement.id).catch(err =>
      ctx.logger.error(err, 'Failed to delete settlement'),
    );
    await generationJob.$incrementFailedCount();

    throw error;
  }

  if (log) {
    const action = Settlement.logAction.create;
    settlement?.$log({ userId, action });

    bankDeposit?.id &&
      BankDeposit?.log({
        id: bankDeposit.id,
        userId,
        action,
        entity: BankDeposit.logEntity.bankDeposits,
      });
  }

  try {
    await GenerationJob.markAsFinished(generationJob.id, { endTime: new Date(), durationInSec: 0 });
  } catch (error) {
    ctx.logger.error(error, 'Failed to update job status');
  }
};

export const requestSettlement = async (
  ctx,
  { date, businessUnitId, mid, merchantId },
  { log } = {},
) => {
  const { GenerationJob, Settlement, Merchant } = ctx.models;

  const isoDate = dateFns.parseISO(date);
  if (!dateFns.isValid(isoDate)) {
    throw ApplicationError.invalidRequest('`date` is not a valid date');
  } else if (dateFns.isFuture(isoDate)) {
    throw ApplicationError.invalidRequest('`date` must be in the past');
  }

  const settlementExists = await Settlement.exists({
    condition: { date, merchantId, mid, businessUnitId },
  });
  if (settlementExists) {
    throw ApplicationError.conflict(`Settlement for ${isoDate} already exists`);
  }

  const merchant = await Merchant.getBy({ condition: { id: merchantId } });

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  const generationJob = await GenerationJob.createOne({
    data: {
      id: nanoid(),
      expectedCount: 1,
      count: 0,
      failedCount: 0,
      status: GenerationJobStatus.PENDING,
    },
  });

  createSettlementAndRelated(
    ctx,
    { merchant, isoDate, businessUnitId, merchantId, generationJob, mid },
    { log },
  ).catch(ctx.logger.error.bind(ctx.logger));

  return generationJob.id;
};

const isValidWriteOffDate = dueDate => {
  const writeOffDifference = WRITE_OFF_DIFFERENCE_IN_HOURS || DEFAULT_WRITE_OFF_DIFFERENCE_IN_HOURS;
  return dateFns.differenceInHours(new Date(), new Date(dueDate)) >= writeOffDifference;
};

export const writeOffInvoices = async (ctx, { invoiceIds, customerId, note }, { log } = {}) => {
  const { Invoice, Customer, Payment, BusinessUnit } = ctx.models;
  const { balance } = await Customer.getBalances(customerId);

  const [invoices, customer] = await Promise.all([
    Invoice.getByIds(invoiceIds),
    Customer.getById(customerId, ['id', 'businessUnitId']),
  ]);
  const { timeZone } = await BusinessUnit.getTimeZone(customer.businessUnitId);

  const applications = invoices.map(invoice => ({
    invoiceId: invoice.id,
    amount: Number(invoice.balance),
  }));

  const amount = sumBy(applications, 'amount');
  if (invoices.some(({ dueDate }) => !isValidWriteOffDate(dueDate))) {
    throw ApplicationError.invalidRequest(
      'Due date must be before today at least 90 days for all invoices',
    );
  }

  const { schemaName, userId } = ctx.user;

  const writeOffPayment = await Payment.createOne(
    ctx,
    {
      data: {
        amount,
        applications,
        businessUnitId: Number(customer.businessUnitId),
        customerId: Number(customerId),
        status: PaymentStatus.CAPTURED,
        paymentType: PaymentType.WRITE_OFF,
        prevBalance: Number(balance),
        sendReceipt: false,
        date: dateFns.format(datefnstz.utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd'),
        appliedAmount: 0,
        writeOffNote: note,
        userId,
      },
    },
    { log, userId },
  );

  await Invoice.addWriteOff(invoiceIds, { log, userId });

  const newBalance = await Customer.decrementBalance(customerId, amount);

  await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });

  return writeOffPayment;
};

export const incrementCustomerBalance = async (ctx, customerId, amount) => {
  const { schemaName, userId } = ctx.user;

  const newBalance = await ctx.models.Customer.incrementBalance(customerId, amount);

  await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });
};

export const chargeDeferredCcPayment = async (ctx, payment, { log } = {}) => {
  const {
    // Payment, Commented in context of PRODSUP-160
    Order,
    Merchant,
  } = ctx.models;
  const { customer, creditCard, orders = [] } = payment;

  const {
    // id: customerId, Commented in context of PRODSUP-160
    balance,
  } = customer;
  const {
    //id: creditCardId, Commented in context of PRODSUP-160
    ccAccountId,
    cardholderId,
    merchantId,
  } = creditCard;

  const merchant = await Merchant.getById(merchantId);

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  merchant.spUsed = creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);
  const customerGatewayId = customer[gateway.customerIdPropName];

  // TODO: change to grandTotal - capturedTotal - onAccountTotal with best payment option
  const amount = mathRound2(
    orders.reduce(
      (sum, { grandTotal, capturedTotal, onAccountTotal }) =>
        sum + Math.max(Number(grandTotal) - Number(capturedTotal) - Number(onAccountTotal), 0),
      0,
    ),
  );
  const prevBalance = Number(balance);

  let ccInitialRetref; //, ccAuthorizationRetref; Commented in context of PRODSUP-160
  let captureError;

  if (amount > 0) {
    try {
      ({ ccRetref: ccInitialRetref } = await gateway.authorizeAndCaptureAmount({
        customerGatewayId,
        cardholderId,
        ccAccountId,
        amount,
      }));
    } catch (error) {
      captureError = error;
    }
  }

  const { userId } = ctx.user;
  const updatedPayment = await payment.$updateChargedDeferredPayment(
    ctx,
    {
      data: {
        amount,
        date: new Date().toUTCString(),
        prevBalance,
        status: ccInitialRetref || amount === 0 ? PaymentStatus.CAPTURED : PaymentStatus.FAILED,
        ccRetref: ccInitialRetref,
        orders,

        deferredUntil:
          ccInitialRetref || amount === 0 ? null : new Date(payment.deferredUntil).toUTCString(),
      },
      orderIds: orders.map(({ id }) => id),
      userId,
    },
    { log, userId },
  );

  if (!ccInitialRetref && amount > 0) {
    throw mapGatewayToApplicationError(captureError);
  }

  /*if (AUTHORIZATION_AMOUNT > 0) {
    let authError;
    try {
      ({ ccRetref: ccAuthorizationRetref } = await gateway.authorizeAmount({
        customerGatewayId,
        cardholderId,
        ccAccountId,
        amount: AUTHORIZATION_AMOUNT,
      }));
    } catch (error) {
      authError = error;
    }

    await Payment.createOne(
      ctx,
      {
        data: {
          businessUnitId: Number(updatedPayment.businessUnitId),
          paymentType: PaymentType.CREDIT_CARD,
          prevBalance,
          sendReceipt: false,

          date: new Date().toUTCString(),

          status: ccAuthorizationRetref ? PaymentStatus.AUTHORIZED : PaymentStatus.FAILED,
          ccRetref: ccAuthorizationRetref,

          amount: AUTHORIZATION_AMOUNT,
          appliedAmount: 0,

          creditCardId,
          customerId,
          orders: orders.map(({ id }) => ({ id, assignedAmount: 0 })),
          userId,
        },
      },
      { logOrderHistory: true, log, userId },
    );

    if (authError) {
      ctx.logger.error(mapGatewayToApplicationError(authError));
    }
  }*/

  await Order.recalculateCapturedTotals(payment.orders.map(order => order.id));

  if (!customer.onAccount) {
    generatePrepaidReceipts(
      ctx,
      {
        customer,
        orderIds: orders.map(order => order.id),
      },
      { log, userId },
    );
  }

  return updatedPayment;
};

const validateDeferredPayment = (payment, paymentId) => {
  if (!payment) {
    throw ApplicationError.notFound(`No payment with id ${paymentId} exists`);
  } else if (payment.status !== PaymentStatus.DEFERRED) {
    throw ApplicationError.invalidRequest(`Payment with id ${paymentId} is not deferred`);
  } else if (isEmpty(payment.orders)) {
    throw ApplicationError.notFound(`No orders found for payment with id ${paymentId}`);
  }
};

export const chargeDeferredPayment = async (ctx, { paymentId }, { log } = {}) => {
  const payment = await ctx.models.Payment.getByIdForCharge(paymentId);

  validateDeferredPayment(payment, paymentId);

  const updatedPayment = await chargeDeferredCcPayment(ctx, payment, { log });
  return updatedPayment;
};

export const chargeDeferredPayments = async (ctx, paymentIds, { log } = {}) => {
  const payments = await ctx.models.Payment.getByIdsForCharge(paymentIds);

  if (payments?.length < paymentIds.length) {
    throw ApplicationError.notFound(`Some Payments do not exists for ids ${paymentIds.join(', ')}`);
  }

  payments.forEach(payment => validateDeferredPayment(payment, payment.id));

  const updatedPayments = await Promise.all(
    payments.map(payment => chargeDeferredCcPayment(ctx, payment, { log })),
  );
  return updatedPayments;
};

export const sendInvoices = async (
  ctx,
  { invoiceIds, customerEmails, sendToCustomerInvoiceEmails, attachMedia },
) => {
  const { tenantId } = ctx.user;
  const { Invoice, Company, InvoiceEmail } = ctx.models;

  const invoices = await Invoice.getInvoicesForMailing(invoiceIds);

  const singleCustomer = Object.keys(groupBy(invoices, 'customerId')).length === 1;

  if (singleCustomer && customerEmails.length === 0 && !sendToCustomerInvoiceEmails) {
    throw ApplicationError.invalidRequest('Email is required in case of single customer invoices');
  }

  let mailSettings;
  try {
    mailSettings = await Company.getByTenantId(tenantId);
  } catch (error) {
    ctx.logger.error(error, 'Failed to retrieve mail settings');
  }

  let shouldSendEmails = !!mailSettings;

  for (const invoice of invoices) {
    if (invoice?.invoiceAttachments?.length && invoice?.subscriptions?.[0]) {
      invoice.subscriptions[0].mediaFiles = invoice.invoiceAttachments;
    }
  }

  invoices.forEach(invoice => {
    invoice.attachMediaFiles = attachMedia;
    invoice.orders.forEach(order => {
      if (order.ticketUrl) {
        order.ticketFile = {
          url: order.ticketUrl,
          // R16-42-weight ticket attachment
          // - Steven 8/30/22
          fileName: getWeightTicketFileName(order.woNumber),
        };
      }
    });

    invoice.receivers = [];

    if (singleCustomer) {
      invoice.receivers.push(...customerEmails);

      if (sendToCustomerInvoiceEmails && !isEmpty(invoice.customer.invoiceEmails)) {
        invoice.receivers.push(...invoice.customer.invoiceEmails);
      }
    } else {
      if (!isEmpty(invoice.customer.invoiceEmails) && invoice.customer.sendInvoicesByEmail) {
        invoice.receivers.push(...invoice.customer.invoiceEmails);
      }

      if (
        invoice.orders.some(
          order =>
            order.customerJobSite.sendInvoicesToJobSite &&
            !isEmpty(order.customerJobSite.invoiceEmails),
        )
      ) {
        invoice.receivers.push(
          ...invoice.orders
            .filter(order => !isEmpty(order.customerJobSite.invoiceEmails))
            .flatMap(order => order.customerJobSite.invoiceEmails),
        );
      }
    }

    invoice.receivers = uniq(invoice.receivers);
  });

  const invoicesToSend = invoices.filter(invoice =>
    singleCustomer ? true : canInvoiceBeSent(invoice),
  );

  try {
    await InvoiceEmail.upsertMany({
      data: invoicesToSend.flatMap(({ id: invoiceId, receivers }) =>
        isEmpty(receivers)
          ? {
              invoiceId,
              receiver: null,
              status: EmailEvent.FAILED_TO_SEND,
            }
          : receivers.map(receiver => ({
              invoiceId,
              receiver,
              status: EmailEvent.PENDING,
            })),
      ),
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to log emails');
    shouldSendEmails = false;
  }

  if (shouldSendEmails) {
    sendMultipleInvoices(ctx, { invoices: invoicesToSend, mailSettings }).catch(error => {
      ctx.logger.error(error, 'Unexpected rejection while sending invoices');
    });
  }

  return true;
};

export const deleteStatement = async (ctx, { id }, { log } = {}) => {
  const { Statement, StatementEmail, FinanceCharge } = ctx.models;

  const [emails, financeCharges] = await Promise.all([
    StatementEmail.getBy({ condition: { statementId: id }, fields: ['id'] }),
    FinanceCharge.getBy({ condition: { statementId: id }, fields: ['id'] }),
  ]);

  if (emails || financeCharges) {
    throw ApplicationError.invalidRequest('Statement has already been sent or charged');
  }

  const { userId } = ctx.user;
  const result = await Statement.deleteById(id, { log, userId });

  return result;
};

export const sendStatements = async (ctx, { ids, emails }) => {
  const { Statement, StatementEmail, Company } = ctx.models;
  const { tenantId } = ctx.user;

  const statements = await Statement.getByIdsForMailing(ids);

  if (ids.length > statements?.length) {
    throw ApplicationError.notFound(`Some statements do not exists for ids ${ids.join(', ')}`);
  }

  statements.forEach(statement => {
    if (isEmpty(emails)) {
      statement.receivers = [...statement.customer.statementEmails];
    } else {
      statement.receivers = [...emails];
    }
  });

  try {
    await StatementEmail.upsertMany({
      data: statements
        // TODO check if can be send by sendInvoicesByEmail customer property
        //.filter((statement) => canBeSent(statement))
        .flatMap(({ id: statementId, receivers }) =>
          isEmpty(receivers)
            ? [
                {
                  statementId,
                  receiver: null,
                  status: EmailEvent.FAILED_TO_SEND,
                },
              ]
            : receivers.map(receiver => ({
                statementId,
                receiver,
                status: EmailEvent.PENDING,
              })),
        ),
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to log emails');
  }

  let mailSettings;
  try {
    mailSettings = await Company.getByTenantId(tenantId);
  } catch (error) {
    ctx.logger.error(error, 'Failed to retrieve mail settings');
  }

  await sendMultipleStatements(ctx, { statements, mailSettings }).catch(error => {
    ctx.logger.error(error, 'Unexpected rejection while sending statement');
  });

  return true;
};

export const creditCardAutoPay = async (ctx, { id, data }) => {
  const { CreditCard } = ctx.state.models;

  // in case when we want disable auto pay for customer
  if (!data.isAutopayExist) {
    await CreditCard.creditCardAutoPay(data);
    return;
  }

  const creditCard = await CreditCard.getByIdPopulated(id);
  if (!creditCard) {
    throw ApplicationError.notFound(`Credit card with id ${id} not found `);
  }

  if (!creditCard.active) {
    throw ApplicationError.invalidRequest('Inactive credit card can not be set to auto pay');
  }

  await CreditCard.creditCardAutoPay(data);
};

export const editCreditMemo = async (ctx, { id, data }, { log }) => {
  const { Customer, Payment } = ctx.models;
  const { memoNote, amount, date, billableItemType, billableItemId } = data;

  const creditMemo = await Payment.getByIdWithCustomer(id);
  if (!creditMemo) {
    throw ApplicationError.notFound('No such credit memo exists');
  }

  const {
    customer: { id: customerId },
  } = creditMemo;

  const balances = await Customer.getBalances(customerId);
  if (!balances) {
    throw ApplicationError.notFound('No such customer exists');
  }

  if (creditMemo.paymentType !== PaymentType.CREDIT_MEMO) {
    throw ApplicationError.invalidRequest(
      'Only credit memo payments can be edited',
      `Payment ${id} has type ${creditMemo.paymentType}`,
    );
  } else if (creditMemo.appliedAmount > amount) {
    throw ApplicationError.invalidRequest(
      'New amount can not be less than applied amount',
      `Credit memo ${id} has applied amount ${creditMemo.appliedAmount}`,
    );
  }

  const amountDifference = creditMemo.amount - amount;
  const amountDecreased = amountDifference > 0;

  if (amountDecreased && balances.availableCredit < amountDifference) {
    throw ApplicationError.invalidRequest(
      'Credit limit exceeded',
      // eslint-disable-next-line no-useless-concat
      `Customer balance would be increased by ${amountDifference}, ` +
        `but available credit is ${balances.availableCredit}`,
    );
  }

  const billableItemInfo =
    billableItemType && billableItemId
      ? {
          billableItemType,
          billableItemId: Number(billableItemId),
        }
      : {};

  const { schemaName, userId } = ctx.user;
  const newBalance = await creditMemo.$updateMemoInfo(
    {
      ...billableItemInfo,
      memoNote,
      date,
      amount,
    },
    { log, userId },
  );

  await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });

  return creditMemo;
};

export const deleteCreditMemo = async (ctx, { id }, { log } = {}) => {
  const { Customer, Payment } = ctx.models;

  const creditMemo = await Payment.getByIdWithCustomer(id);
  if (!creditMemo) {
    throw ApplicationError.notFound('No such credit memo exists');
  }

  const {
    customer: { id: customerId },
  } = creditMemo;

  const balances = await Customer.getBalances(customerId);
  if (!balances) {
    throw ApplicationError.notFound('No such customer exists');
  }

  if (creditMemo.paymentType !== PaymentType.CREDIT_MEMO) {
    throw ApplicationError.invalidRequest(
      'Only credit memo payments can be removed',
      `Payment ${id} has type ${creditMemo.paymentType}`,
    );
  } else if (creditMemo.appliedAmount > 0) {
    throw ApplicationError.invalidRequest(
      'Only unapplied credit memos can be deleted',
      `Credit memo ${id} has applied amount ${creditMemo.appliedAmount}`,
    );
  } else if (balances.availableCredit < creditMemo.amount) {
    throw ApplicationError.invalidRequest(
      'Insufficient credit limit to remove credit memo',
      `Current available credit is ${balances.availableCredit} and credit memo amount is ${creditMemo.amount}`,
    );
  }

  const newBalance = await Customer.incrementBalance(customerId, creditMemo.amount);

  const { schemaName, userId } = ctx.user;
  await Payment.deleteCreditMemo(id, { log, userId });

  await coreService.updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });

  return true;
};

export const newMultiOrderPayment = async (ctx, { customerId, data }, { log } = {}) => {
  const { BusinessUnit, Payment, Customer, Order } = ctx.models;
  const { paymentType, orderIds } = data;
  delete data.orderIds;

  const orders = await Order.getByIds(orderIds, [
    'id',
    'beforeTaxesTotal',
    'grandTotal',
    'serviceDate',
    'jobSiteId',
    'paymentMethod',
    'jobSiteId',
    'customerId',
  ]);

  const isCreditCard = paymentType === PaymentType.CREDIT_CARD;
  const { creditCardId, newCreditCard } = data;

  if (paymentType === PaymentType.CREDIT_CARD && !creditCardId && !newCreditCard) {
    throw ApplicationError.invalidRequest(
      'Payment type credit card was selected, but no credit card was provided',
    );
  }

  const customer = await Customer.getById(customerId, [
    'id',
    'cardConnectId',
    'fluidPayId',
    'cardConnectIds',
    'fluidPayIds',
    'balance',
    'businessUnitId',
    'walkup',
  ]);

  if (!customer) {
    throw ApplicationError.notFound('No such customer exists');
  }

  const { userId } = ctx.user;
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
        log,
        userId,
      },
    ));

    delete data.creditCardId;
    delete data.newCreditCard;
  }

  await Order.upsertMany({ data: orders });

  const paymentAmount = await Payment.calculateMultiOrderPaymentAmount(customerId, orders);

  let ccRetref, status;
  if (isCreditCard) {
    const { ccAccountId, cardholderId } = creditCard;
    merchant.spUsed = creditCard.spUsed;
    const gateway = getPaymentGateway(ctx, merchant);

    try {
      ({ ccRetref } = await gateway.authorizeAndCaptureAmount({
        customerGatewayId,
        ccAccountId,
        cardholderId,
        amount: paymentAmount,
      }));
    } catch (error) {
      throw mapGatewayToApplicationError(error);
    }

    status = ccRetref ? PaymentStatus.CAPTURED : PaymentStatus.FAILED;
  } else {
    status = PaymentStatus.CAPTURED;
  }

  const payment = await Payment.createMultiOrderPayment(
    ctx,
    {
      paymentData: {
        ...data,
        customerId: Number(customerId),
        amount: paymentAmount,
        prevBalance: Number(customer.balance),
        date: new Date(data.date).toUTCString(),

        creditCardId: creditCard && isCreditCard ? Number(creditCard?.id) : null,
        ccRetref,
        status,
      },
      orders,
      businessUnitId: Number(customer.businessUnitId),
    },
    { log, userId },
  );

  return payment;
};

const processFinChargesViaChunks = async (
  ctx,
  { finChargesInputData, generationJob, userId, tenantName, tenantId },
  { log } = {},
) => {
  const { GenerationJob, FinanceCharge } = ctx.models;

  const createdFinCharges = [];
  const finChargeBatches = chunk(finChargesInputData, PDF_GENERATION_BATCH_SIZE);

  for (const batch of finChargeBatches) {
    const createdFinChargeBatches = await Promise.all(
      batch.map(finChargeInputData =>
        FinanceCharge.createOne(
          ctx,
          {
            generationJob,
            userId,
            ...finChargeInputData,
          },
          {
            tenantName,
            tenantId,
            userId,
          },
          { log, userId },
        ),
      ),
    );

    if (createdFinChargeBatches?.length > 0) {
      createdFinCharges.push(...createdFinChargeBatches.filter(Boolean));
    }
  }

  try {
    await GenerationJob.markAsFinished(generationJob.id, { endTime: new Date(), durationInSec: 0 });
  } catch (error) {
    ctx.logger.error(error, 'Failed to update job status');
  }
};

export const createFinanceCharge = async (ctx, data, { log } = {}) => {
  const { email, name, tenantId, tenantName, userId } = ctx.user;
  const { GenerationJob, Statement } = ctx.models;

  const statementIds = data.flatMap(item =>
    item.financeChargeInvoices.map(({ statementId }) => statementId),
  );

  let statements = await Statement.getByIds(statementIds, ['id', 'endDate']);
  statements = keyBy(statements, 'id');

  const finChargesInputData = data.flatMap(item =>
    Object.entries(groupBy(item.financeChargeInvoices, 'statementId')).map(
      ([statementId, invoices]) => {
        const total = mathRound2(invoices.reduce((sum, invoice) => sum + invoice.fine, 0));
        return {
          csrEmail: email,
          csrName: name,
          customerId: Number(item.customerId),
          financeChargeApr: Number(item.financeChargeApr),
          statementId: Number(statementId),
          total,
          balance: total,
          exagoPath: 'reports/finance charge/finance charge',
          invoice: {
            customerId: Number(item.customerId),
            csrEmail: email,
            csrName: name,
            total,
            balance: total,
            type: InvoiceType.FINANCE_CHARGES,
            userId,
          },
          invoices: invoices.map(invoice => ({
            id: Number(invoice.invoiceId),
            fine: invoice.fine,
            toDate: statements[statementId].endDate,
          })),
        };
      },
    ),
  );

  const generationJob = await GenerationJob.createOne({
    data: {
      id: nanoid(),
      expectedCount: finChargesInputData.length,
      count: 0,
      failedCount: 0,
      status: GenerationJobStatus.PENDING,
    },
  });

  processFinChargesViaChunks(
    ctx,
    { finChargesInputData, generationJob, userId, tenantName, tenantId },
    { log },
  ).catch(ctx.logger.error);

  return generationJob.id;
};

export const sendFinanceCharges = async (ctx, { ids, emails }) => {
  const { FinanceCharge, FinanceChargeEmail, Company } = ctx.models;
  const { tenantId } = ctx.user;

  const financeCharges = await FinanceCharge.getByIdsForMailing(ids);

  if (ids.length > financeCharges?.length) {
    throw ApplicationError.notFound(`Some finance charges do not exists for ids ${ids.join(', ')}`);
  }

  financeCharges.forEach(financeCharge => {
    if (isEmpty(emails)) {
      financeCharge.receivers = [...financeCharge.customer.invoiceEmails];
    } else {
      financeCharge.receivers = [...emails];
    }
  });

  try {
    await FinanceChargeEmail.upsertMany({
      data: financeCharges
        // TODO check if can be send by sendInvoicesByEmail customer property
        //.filter((financeCharge) => canBeSent(financeCharge))
        .flatMap(({ id: financeChargeId, receivers }) =>
          isEmpty(receivers)
            ? [
                {
                  financeChargeId,
                  receiver: null,
                  status: EmailEvent.FAILED_TO_SEND,
                },
              ]
            : receivers.map(receiver => ({
                financeChargeId,
                receiver,
                status: EmailEvent.PENDING,
              })),
        ),
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to log emails');
  }

  let mailSettings;
  try {
    mailSettings = await Company.getByTenantId(tenantId);
  } catch (error) {
    ctx.logger.error(error, 'Failed to retrieve mail settings');
  }

  await sendMultipleFinanceCharges(ctx, { financeCharges, mailSettings }).catch(error => {
    ctx.logger.error(error, 'Unexpected rejection while sending finance charges');
  });

  return true;
};

export const deleteBankDeposit = async (ctx, { id, log, userId } = {}) => {
  const { BankDeposit } = ctx.state.models;

  const bankDeposit = await BankDeposit.getBy({ condition: { id } });
  if (!bankDeposit) {
    throw ApplicationError.notFound(`BankDeposit ${id} does not exist`);
  }

  if (bankDeposit.count > 0) {
    throw ApplicationError.invalidRequest(`BankDeposit ${id} has payments. Cant be deleted`);
  }

  await BankDeposit.deleteById(id);

  if (log && bankDeposit?.id) {
    bankDeposit.$log({
      userId,
      action: BankDeposit.logAction.delete,
      entity: BankDeposit.logEntity.bankDeposits,
    });
  }

  return true;
};

const getCustomerStatement = async (
  { models, lastStatements, endDate, statementDate, timeZone },
  customerId,
) => {
  const { Invoice, Payment, Payout, RefundedPayment, ReversedPayment } = models;

  const from = datefnstz.utcToZonedTime(
    dateFns.startOfDay(
      lastStatements[customerId].endDate
        ? dateFns.addDays(lastStatements[customerId].endDate, 1)
        : lastStatements[customerId].createdAt,
    ),
    timeZone,
  );
  const to = datefnstz.utcToZonedTime(dateFns.endOfDay(Date.parse(endDate)), timeZone);

  const customerIdFromToFields = { customerId, from, to };
  const [
    createdInvoices,
    updatedInvoices,
    createdPayments,
    updatedPayments,
    createdPayouts,
    createdRefunds,
    createdReverses,
  ] = await Promise.all([
    Invoice.getAllCreatedInRange(customerIdFromToFields),
    Invoice.getAllUpdatedInRange(customerIdFromToFields),
    Payment.getAllCreatedInRange(customerIdFromToFields),
    Payment.getAllUpdatedInRange(customerIdFromToFields),
    Payout.getAllCreatedInRange(customerIdFromToFields),
    RefundedPayment.getAllCreatedInRange(customerIdFromToFields),
    ReversedPayment.getAllCreatedInRange(customerIdFromToFields),
  ]);

  const invoicesTotal = sumBy(createdInvoices, ({ total }) => Number(total));
  const paymentsTotal = sumBy(createdPayments, ({ amount }) => Number(amount));

  const invoices = [
    ...createdInvoices.map(({ id }) => ({
      id,
      section: StatementSection.INVOICES_CURRENT,
    })),
    ...updatedInvoices.map(({ id }) => ({
      id,
      section: StatementSection.INVOICES_PREVIOUS,
    })),
  ];

  const payments = [
    ...createdPayments.map(({ id }) => ({
      id,
      section: StatementSection.PAYMENTS_CURRENT,
    })),
    ...updatedPayments.flatMap(({ id }) => [
      {
        id,
        section: StatementSection.PAYMENTS_PREVIOUS,
      },
    ]),
  ];

  const payouts = createdPayouts.map(({ id, payoutsCount }) => ({
    id,
    payoutsCount,
    section: StatementSection.PAYMENTS_CHANGES,
  }));

  const refundPayments = createdRefunds.map(({ id }) => ({
    id,
    section: StatementSection.PAYMENTS_CHANGES,
  }));
  const reversePayments = createdReverses.map(({ id }) => ({
    id,
    section: StatementSection.PAYMENTS_CHANGES,
  }));

  const updatedPaymentsTotal =
    sumBy(createdPayouts, ({ amount }) => Number(amount)) +
    sumBy(createdRefunds, ({ amount }) => Number(amount)) +
    sumBy(createdReverses, ({ amount }) => Number(amount));

  const prevBalance = lastStatements[customerId].balance
    ? Number(lastStatements[customerId].balance)
    : 0;
  const balance = prevBalance - paymentsTotal + invoicesTotal + updatedPaymentsTotal;

  return {
    customerId: Number(customerId),
    statementDate,
    endDate,
    exagoPath: 'reports/statement/statement',
    prevPdfUrl: lastStatements[customerId]?.pdfUrl,
    invoicesCount: createdInvoices.length,
    invoicesTotal: mathRound2(invoicesTotal),
    paymentsTotal: mathRound2(paymentsTotal),
    balance: mathRound2(balance),
    prevBalance,
    payments,
    payouts,
    invoices,
    refundPayments,
    reversePayments,
  };
};

const processStatementsViaChunks = async (
  ctx,
  { businessUnitId, statementDate, endDate, statements, generationJob, tenantName, tenantId },
  { log } = {},
) => {
  const { BatchStatement, Statement, GenerationJob } = ctx.models;
  const { userId } = ctx.user;

  const batchStatement = await BatchStatement.createOne({
    data: {
      businessUnitId: Number(businessUnitId),
      total: 0,
      count: 0,
      statementDate,
      endDate,
      statements: [],
    },
  });

  const createdStatements = [];
  const batchStatementId = batchStatement.id;
  const statementBatches = chunk(statements, PDF_GENERATION_BATCH_SIZE);

  for (const batch of statementBatches) {
    const createdStatementsBatch = await Promise.all(
      batch.map(statementInputData =>
        Statement.createOne(
          ctx,
          {
            generationJob,
            batchStatementId,
            ...statementInputData,
          },
          {
            tenantName,
            tenantId,
          },
          { log, userId },
        ),
      ),
    );

    if (createdStatementsBatch?.length > 0) {
      createdStatements.push(...createdStatementsBatch.filter(Boolean));
    }
  }

  if (createdStatements.length === 0) {
    try {
      await BatchStatement.deleteById(batchStatementId);
    } catch (error) {
      ctx.logger.error(error, 'Failed to delete batch statement');
    }
  } else if (log && batchStatementId) {
    BatchStatement.log({ id: batchStatementId, userId, action: BatchStatement.logAction.create });
  }

  try {
    await GenerationJob.markAsFinished(generationJob.id, { endTime: new Date(), durationInSec: 0 });
  } catch (error) {
    ctx.logger.error(error, 'Failed to update job status');
  }
};

export const createBatchStatement = async (
  ctx,
  { businessUnitId, customerIds, statementDate, endDate },
  { log } = {},
) => {
  const { tenantName, tenantId } = ctx.user;
  const { models } = ctx;
  const { Customer, GenerationJob, BusinessUnit } = models;

  // eslint-disable-next-line prefer-const
  let [lastStatements, tz] = await Promise.all([
    Customer.getLastStatementEndDateAndBalance(customerIds),
    BusinessUnit.getTimeZone(businessUnitId),
  ]);

  const { timeZone } = tz;
  const dateToCompare = date => new Date(dateFns.format(new Date(date), 'yyyy-MM-dd'));
  if (
    dateFns.isAfter(
      dateToCompare(endDate),
      dateToCompare(datefnstz.utcToZonedTime(new Date(), timeZone)),
    ) ||
    dateFns.isAfter(Date.parse(endDate), Date.parse(statementDate))
  ) {
    throw ApplicationError.invalidRequest('Invalid end or statement date');
  }

  lastStatements = keyBy(lastStatements, 'id');
  const customers = customerIds.filter(
    customerId =>
      !lastStatements[customerId].endDate ||
      dateFns.differenceInCalendarDays(Date.parse(endDate), lastStatements[customerId].endDate) > 0,
  );

  const cb = getCustomerStatement({
    models,
    lastStatements,
    endDate,
    statementDate,
    timeZone,
  });
  const statements = await Promise.all(customers.map(cb));

  if (isEmpty(statements)) {
    throw ApplicationError.notFound('No statements exists');
  }

  const generationJob = await GenerationJob.createOne({
    data: {
      id: nanoid(),
      expectedCount: statements.length,
      count: 0,
      failedCount: 0,
      status: GenerationJobStatus.PENDING,
    },
  });

  processStatementsViaChunks(
    ctx,
    {
      businessUnitId,
      statementDate,
      endDate,
      statements,
      generationJob,
      tenantName,
      tenantId,
    },
    { log },
  ).catch(ctx.logger.error.bind(ctx.logger));

  return generationJob.id;
};

export const sendBatchStatements = async (ctx, { ids }) => {
  const { BatchStatement } = ctx.models;

  const statementIds = await BatchStatement.getStatementsByIds(ids);

  if (!isEmpty(statementIds)) {
    await sendStatements(ctx, { ids: statementIds.map(({ id }) => id) });
  }

  return true;
};

export const createPaymentsForNewOrders = async (
  ctx,
  { orders, customerId, payments },
  { log } = {},
) => {
  const { BusinessUnit, Order, Customer } = ctx.state.models;
  const { userId } = ctx.state.user;
  const customer = await Customer.getById(customerId);

  if (!customer) {
    throw ApplicationError.notFound('No such customer exists');
  }

  orders.forEach(order => {
    order.serviceDate = new Date(order.serviceDate).toUTCString();
    order.grandTotal = Number(order.grandTotal);
    order.onAccountTotal = Number(order.onAccountTotal);
    order.capturedTotal = order.grandTotal - order.onAccountTotal;
  });

  const prepaidPaymentsData = payments
    .filter(payment => payment.paymentMethod !== PaymentMethod.ON_ACCOUNT)
    .map(payment => splitPaymentAmount(orders, payment));

  const deferredPayment = prepaidPaymentsData.find(
    prepaidPayment => prepaidPayment.deferredPayment,
  );

  if (deferredPayment) {
    orders.forEach(order => {
      const deferredOrder = deferredPayment.orders.find(({ id }) => id === order.id);

      order.capturedTotal -= deferredOrder.assignedAmount;
    });
  }

  const paymentsData = groupBy(payments, 'paymentMethod');

  const ccPayments = paymentsData[PaymentType.CREDIT_CARD];
  let customerGatewayId, merchant;

  if (!isEmpty(ccPayments)) {
    merchant = await assertMerchantExists(
      { BusinessUnit },
      { businessUnitId: customer.businessUnitId },
    );

    await Promise.all(
      ccPayments.map(async payment => {
        const { paymentType, creditCardId, newCreditCard } = payment;
        checkCcDataPresence({ paymentType, creditCardId, newCreditCard });

        const result = await upsertCreditCard(
          ctx,
          { creditCardId, newCreditCard, currentMerchant: merchant },
          customer,
          {
            log,
            userId,
          },
        );

        payment.creditCard = result.creditCard;
        customerGatewayId = result.customerGatewayId;
      }),
    );
  }

  const successfulTransactions = [];
  let processedPayments = [];

  let gateway, gatewaySp;

  if (merchant) {
    if (merchant.mid) {
      gateway = getPaymentGateway(ctx, { ...merchant, spUsed: false });
    }
    if (merchant.salespointMid) {
      gatewaySp = getPaymentGateway(ctx, { ...merchant, spUsed: true });
    }
  }

  const processPaymentData = async paymentData => {
    if (paymentData.paymentMethod === PaymentType.CREDIT_CARD && !paymentData.deferredPayment) {
      const gw = paymentData.creditCard.spUsed ? gatewaySp : gateway;
      if (!gw) {
        throw new Error('Gateway is not initialized (probably SP one)');
      }

      const { ccInitialRetref, ccAuthorizationRetref } = await processCcPayment(
        {
          ccAccountId: paymentData.creditCard.ccAccountId,
          cardholderId: paymentData.creditCard.cardholderId,
          // ?? here relevant for walk-up customers CC batching functionality
          customerGatewayId: paymentData.creditCard?.customerGatewayId ?? customerGatewayId,
          amount: paymentData.amount,
        },
        gw,
        !paymentData.authorizeCard,
      );

      paymentData.ccInitialRetref = ccInitialRetref;
      paymentData.ccAuthorizationRetref = ccAuthorizationRetref;

      successfulTransactions.push({
        ccInitialRetref,
        ccAuthorizationRetref,
        amount: paymentData.amount,
        gw,
      });
    }

    return paymentData;
  };

  try {
    processedPayments = await Promise.all(prepaidPaymentsData.map(processPaymentData));
  } catch (error) {
    ctx.logger.error('Failed to process credit card transactions');

    await Promise.allSettled(
      successfulTransactions.map(async ({ ccAuthorizationRetref, gw }) => {
        // TODO: add fallback for captured payments (can't refund them immediately)
        if (ccAuthorizationRetref) {
          try {
            await gw.voidAmount({ ccRetref: ccAuthorizationRetref });
          } catch (err) {
            ctx.logger.error(
              err,
              `Failed to void the authorized amount. Retref: ${ccAuthorizationRetref}`,
            );
          }
        }
      }),
    );

    throw error;
  }

  const paymentsToInsert = processedPayments.flatMap(pp =>
    getPaymentsData({
      customerId,
      creditCardId: pp.creditCard?.id,
      orders: pp.orders,
      paymentType: pp.paymentMethod,
      date: new Date(),
      checkNumber: pp?.checkNumber ?? null,
      isAch: pp?.isAch ?? false,
      prevBalance: Number(customer.balance),
      sendReceipt: !!pp.sendReceipt,
      deferred: !!pp.deferredPayment,
      deferredUntil: pp.deferredPayment ? new Date(pp.deferredUntil) : undefined,
      amount: pp.amount,
      ccInitialRetref: pp.ccInitialRetref,
      //ccAuthorizationRetref: pp.ccAuthorizationRetref, Commented in context of PRODSUP-160
      //skipAuthorization: !pp.authorizeCard, Commented in context of PRODSUP-160
      userId,
    }),
  );

  let paymentMethod;

  if (payments.length === 0) {
    paymentMethod = null;
  } else if (payments.length === 1) {
    paymentMethod = payments[0].paymentMethod;
  } else {
    paymentMethod = PaymentMethod.MIXED;
  }

  await Order.insertNewOrdersAndRelatedData(
    {
      orders,
      paymentMethod,
      customerId,
      paymentsData: paymentsToInsert,
      businessUnitId: Number(customer.businessUnitId),
    },
    { log, userId },
  );

  if (!customer.onAccount) {
    ctx.state.logger = ctx.logger;
    generatePrepaidReceipts(
      ctx.state,
      {
        orderIds: orders.map(order => order.id),
        customer,
      },
      { log, userId },
    );
  }
};
