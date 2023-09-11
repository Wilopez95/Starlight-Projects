import groupBy from 'lodash/groupBy.js';
import isBoolean from 'lodash/isBoolean.js';

import { getPaymentGateway } from '../services/paymentGateways/factory.js';

import { RecordType } from '../consts/paymentGateways.js';

import ApplicationError from '../errors/ApplicationError.js';
import { CcSorting } from '../consts/ccSorting.js';
import { SortOrder } from '../consts/sortOrders.js';

export const getCreditCard = async (ctx, { id }) => {
  const { Merchant } = ctx.models;
  const creditCard = await ctx.models.CreditCard.getByIdPopulated(id, ['*'], {
    jobSites: true,
  });

  if (!creditCard) {
    throw ApplicationError.notFound(`Credit card ${id} not found`);
  }

  const { customer, ccAccountId, cardholderId, merchantId } = creditCard;

  const merchant = await Merchant.getById(merchantId);

  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  merchant.spUsed = creditCard.spUsed;
  const gateway = getPaymentGateway(ctx, merchant);

  const customerGatewayId = customer[gateway.customerIdPropName];

  let gatewayCc;
  try {
    gatewayCc = await gateway.getCustomerCreditCards({
      // ?? here relevant for walk-up customers CC batching functionality
      customerGatewayId: creditCard?.customerGatewayId ?? customerGatewayId,
      ccAccountId,
      cardholderId,
    });
  } catch (error) {
    ctx.logger.error(error);

    throw ApplicationError.notFound('Failed to fetch credit card from payment gateway');
  }

  if (!gatewayCc) {
    throw ApplicationError.notFound(`No stored data in payment gateway for CC with id ${id}`);
  }

  Object.assign(creditCard, gatewayCc, { id: creditCard.id });
  return creditCard;
};

const datesComparatorAsc = (o1, o2) => +o2.expirationDate - +o1.expirationDate;
const datesComparatorDesc = (o1, o2) => +o1.expirationDate - +o2.expirationDate;

export const getCreditCards = async (
  ctx,
  {
    customerId,
    merchantId,
    activeOnly,
    jobSiteId,
    relevantOnly,
    spUsedOnly,
    returnCcToken = false,
    offset,
    limit,
    isAutopay,
    sortBy = CcSorting.ID,
    sortOrder = SortOrder.DESC,
  },
) => {
  const { CreditCard, Customer, Merchant } = ctx.models;
  const condition = { customerId };
  jobSiteId && (condition.jobSiteId = jobSiteId);
  if (activeOnly || relevantOnly) {
    condition.active = true;
  }
  if (isBoolean(isAutopay)) {
    condition.isAutopay = isAutopay;
  }
  if (spUsedOnly) {
    condition.spUsed = true;
  }
  if (merchantId) {
    condition.merchantId = merchantId;
  }

  let customer, creditCards;
  if (relevantOnly) {
    customer = await Customer.getWithBusinessUnit(customerId);

    condition.merchantId = customer.businessUnit.merchantId;

    creditCards = await CreditCard.getAllPaginated({
      condition,
      offset,
      limit,
      sortBy,
      sortOrder,
    });
  } else {
    [customer, creditCards] = await Promise.all([
      Customer.getById(customerId),
      CreditCard.getAllPaginated({ condition, offset, limit, sortBy, sortOrder }),
    ]);
  }

  if (!customer) {
    throw ApplicationError.notFound(
      'Customer not found',
      `Customer doesn't exist with id ${customerId}`,
    );
  }

  if (customer.walkup) {
    return [];
  }

  if (!creditCards?.length) {
    return [];
  }
  const sortingByDb = creditCards;
  const groupedCreditCards = groupBy(creditCards, 'merchantId');
  const merchantIds = Object.keys(groupedCreditCards);
  const merchants = await Merchant.getByIds(merchantIds);

  const result = await Promise.all(
    Object.entries(groupedCreditCards).map(async element => {
      const merchant = merchants.find(({ id }) => id === +element.merchantId);

      const allCc = [];
      let gateway, customerGatewayId, gatewayCreditCards;
      if (spUsedOnly && merchant.salespointMid) {
        merchant.spUsed = true;
        gateway = getPaymentGateway(ctx, merchant);
        customerGatewayId = customer[gateway.customerIdPropName];
        gatewayCreditCards = await gateway.getCustomerCreditCards({ customerGatewayId });
        allCc.push(...gatewayCreditCards);
      } else {
        if (merchant.mid) {
          merchant.spUsed = false;
          gateway = getPaymentGateway(ctx, merchant);
          customerGatewayId = customer[gateway.customerIdPropName];
          gatewayCreditCards = await gateway.getCustomerCreditCards({
            customerGatewayId,
          });
          allCc.push(...gatewayCreditCards);
        }
        if (merchant.salespointMid) {
          merchant.spUsed = true;
          gateway = getPaymentGateway(ctx, merchant);
          customerGatewayId = customer[gateway.customerIdPropName];
          gatewayCreditCards = await gateway.getCustomerCreditCards({
            customerGatewayId,
          });
          allCc.push(...gatewayCreditCards);
        }
      }

      return element.creditCards.filter(cc => {
        const gatewayCc = allCc.find(
          ({ id, recordType }) => id === cc.ccAccountId && recordType === RecordType.CARD,
        );

        const gatewayCardholder =
          cc.cardholderId &&
          allCc.find(
            ({ id, recordType }) => id === cc.cardholderId && recordType === RecordType.CARDHOLDER,
          );
        Object.assign(cc, gatewayCardholder ?? {}, gatewayCc ?? {}, { id: cc.id });

        if (!returnCcToken) {
          delete cc.ccAccountToken;
        }
        if (!cc.jobSites?.length) {
          cc.jobSites = null;
        }

        return !(relevantOnly && cc.expiredLabel);
      });
    }),
  );

  const sortedResult = result.flat();
  if (sortBy === CcSorting.EXPIRATION_DATE) {
    const cb =
      sortOrder === SortOrder.DESC.toUpperCase() ? datesComparatorDesc : datesComparatorAsc;
    return sortedResult.sort(cb);
  }

  return sortingByDb;
};
