import sumBy from 'lodash/sumBy.js';

import { mathRound2 } from '../utils/math.js';
import { filterByCustomerAutoPayType, getAutoPayApplicationsData } from '../utils/invoice.js';

import { PaymentType } from '../consts/paymentTypes.js';
import { PaymentStatus } from '../consts/paymentStatus.js';

import { processCcPayment } from '../graphql/mutations.js';
import ApplicationError from '../errors/ApplicationError.js';
import { updateCustomerBalance } from './core.js';
import { getPaymentGateway } from './paymentGateways/factory.js';

export const payInvoices = async (ctx, { invoices, customer }) => {
  if (!invoices?.length || !customer) {
    return null;
  }

  const { id: userId, schemaName } = ctx.state.user;
  const { CreditCard, Payment, Customer, Invoice, Merchant } = ctx.state.models;
  const { id: customerId, businessUnitId, balance } = customer;

  const { invoiceIds, applications } = getAutoPayApplicationsData({ invoices, customerId });

  const amount = mathRound2(sumBy(applications, 'amount'));
  if (amount <= 0) {
    return null;
  }

  const creditCard = await CreditCard.getBy({ condition: { customerId, isAutopay: true } });

  if (!creditCard) {
    throw ApplicationError.notFound(`Auto pay credit card for customer ${customerId} not found`);
  }

  const { id: creditCardId, cardholderId, ccAccountId, merchantId } = creditCard;
  const merchant = await Merchant.getById(merchantId);

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  merchant.spUsed = creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);
  const customerGatewayId = customer[gateway.customerIdPropName];

  const { ccInitialRetref } = await processCcPayment(
    {
      ccAccountId,
      amount,
      customerGatewayId,
      cardholderId,
    },
    gateway,
    true,
  );

  await Payment.createOne(ctx, {
    data: {
      amount,
      appliedAmount: 0,
      applications,
      businessUnitId,
      customerId,
      creditCardId,
      paymentType: PaymentType.CREDIT_CARD,
      prevBalance: Number(balance),
      sendReceipt: false,
      date: new Date().toUTCString(),
      status: PaymentStatus.CAPTURED,
      ccRetref: ccInitialRetref,
      userId,
    },
  });

  const newBalance = await Customer.decrementBalance(customerId, amount);
  await updateCustomerBalance(ctx, { schemaName, userId, customerId, newBalance });

  const updatedInvoices = await Invoice.getByIds(invoiceIds);

  return updatedInvoices;
};

export const executeAutoPay = async ({ ctx, customerId, generatedInvoices }) => {
  if (!customerId || !generatedInvoices?.length) {
    return null;
  }

  const { models } = ctx.state;
  const { Customer, Invoice } = models;
  const { schemaName } = ctx.state.user;

  try {
    const customer = await Customer.getById(customerId);

    const { isAutopayExist, autopayType } = customer;
    if (!isAutopayExist || !autopayType) {
      return null;
    }

    const currentInvoices = filterByCustomerAutoPayType(generatedInvoices, customer);
    const currentInvoiceIds = currentInvoices.map(({ id }) => id);
    const autoPayTypeInvoices = await Invoice.getByCustomerAutoPayType(customer, currentInvoiceIds);

    const invoices = [...currentInvoices, ...autoPayTypeInvoices];
    if (!invoices?.length) {
      return null;
    }

    const updatedInvoices = await payInvoices(ctx, { invoices, customer });
    return updatedInvoices;
  } catch (error) {
    ctx.logger.error(
      error,
      `Error while executing Auto Pay for customer ${customerId} of tenant ${schemaName}`,
    );
    throw error;
  }
};
