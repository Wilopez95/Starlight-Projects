import isEmpty from 'lodash/isEmpty.js';

import SubscriptionRepo from '../../repos/subscription/subscription.js';
import RecurrentOrderTemplateRepo from '../../repos/recurrentOrderTemplate.js';

import { generatingOnHoldCustomerEventBody, sendTextEmail } from '../email.js';
import { CUSTOMER_GROUP_TYPE } from '../../consts/customerGroups.js';
import { getMailingWithSales } from './getMailingWithSales.js';
import { notifySubscriptionAndOrderEvent } from './notifySubscriptionAndOrderEvent.js';

const dependenciesDefault = {
  SubscriptionRepo,
  RecurrentOrderTemplateRepo,
  getMailingWithSales,
  generatingOnHoldCustomerEventBody,
  sendTextEmail,
};

export const notifyHoldTenantCustomer = async (
  ctx,
  tenantId,
  schemaName,
  dependencies = dependenciesDefault,
) => {
  const subscriptionRepo = dependencies.SubscriptionRepo.getInstance(ctx.state, { schemaName });
  const recurrentOrderRepo = dependencies.RecurrentOrderTemplateRepo.getInstance(ctx.state, {
    schemaName,
  });

  const fields = ['id', 'customerId', 'onHoldNotifySalesRep', 'onHoldNotifyMainContact'];

  const [subscriptions, orders] = await Promise.all([
    subscriptionRepo.getSubscriptionsToNotifyHold({ fields }),
    recurrentOrderRepo.getOrderToNotifyHold({ fields }),
  ]);

  if (!subscriptions?.length && !orders?.length) {
    return;
  }

  const customers = new Map();
  const mainContacts = [];
  const groupByCustomerReceiver = (
    acc,
    {
      id,
      salesId,
      contactId,
      customerType,
      onHoldNotifySalesRep,
      onHoldNotifyMainContact,
      customerId,
      ...rest
    },
  ) => {
    const values = {
      email: rest.email,
      firstName: rest.firstName,
      lastName: rest.lastName,
    };

    if (customerType === CUSTOMER_GROUP_TYPE.commercial) {
      values.email = rest.mainEmail;
      values.firstName = rest.mainFirstName;
      values.lastName = rest.mainLastName;
    }

    if (!customers.has(customerId)) {
      customers.set(customerId, `${values.firstName} ${values.lastName}`);
    }

    if (!acc[customerId]) {
      acc[customerId] = {
        forMainContact: {},
        forSale: {},
      };
    }
    const customer = acc[customerId];

    if (onHoldNotifyMainContact && !customer.forMainContact[contactId]) {
      customer.forMainContact[contactId] = [];
    }

    if (onHoldNotifySalesRep && salesId && !customer.forSale[salesId]) {
      customer.forSale[salesId] = [];
    }

    if (onHoldNotifySalesRep && salesId) {
      customer.forSale[salesId].push(id);
    }

    if (onHoldNotifyMainContact && values.email) {
      if (!mainContacts.some(contact => contact.id === contactId)) {
        mainContacts.push({ id: contactId, email: values.email });
      }

      customer.forMainContact[contactId].push(id);
    }

    return acc;
  };

  const subscriptionMap = subscriptions?.reduce(groupByCustomerReceiver, {}) || {};
  const ordersMap = orders?.reduce(groupByCustomerReceiver, {}) || {};

  for (const [customerId, customerName] of customers) {
    const notified = await notifySubscriptionAndOrderEvent(
      ctx,
      {
        generateBody: dependencies.generatingOnHoldCustomerEventBody,
        tenantId,
        schemaName,
        subsIdsForSale: subscriptionMap[customerId]?.forSale || {},
        orderIdsForSale: ordersMap[customerId]?.forSale || {},
        subsIdsForMainContact: subscriptionMap[customerId]?.forMainContact || {},
        orderIdsForMainContact: ordersMap[customerId]?.forMainContact || {},
        customerName,
        mainContacts,
        fields: ['customerOnHoldFrom', 'customerOnHoldSubject', 'customerOnHoldBody', 'domainId'],
      },
      dependencies,
    );

    await Promise.all([
      !isEmpty(notified?.notifiedSubscriptionIds)
        ? subscriptionRepo.setSubscriptionHoldSent(notified.notifiedSubscriptionIds)
        : Promise.resolve(),
      !isEmpty(notified?.notifiedOrdersIds)
        ? recurrentOrderRepo.setOrderHoldSent(notified.notifiedOrdersIds)
        : Promise.resolve(),
    ]);
  }
};
