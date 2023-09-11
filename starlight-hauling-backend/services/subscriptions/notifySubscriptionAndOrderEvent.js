import isEmpty from 'lodash/isEmpty.js';
import { SENDGRID_SENDER_EMAIL } from '../../config.js';

export const notifySubscriptionAndOrderEvent = async (
  ctx,
  {
    generateBody,
    tenantId,
    schemaName,
    subsIdsForSale,
    orderIdsForSale,
    subsIdsForMainContact,
    orderIdsForMainContact,
    mainContacts,
    customerName,
    fields = ['*'],
  },
  { getMailingWithSales, sendTextEmail },
) => {
  const { mailSettings, salesReps } = await getMailingWithSales(ctx, {
    tenantId,
    fields,
    schemaName,
    idsForSale: { ...subsIdsForSale, ...orderIdsForSale },
  });

  if (isEmpty(mailSettings)) {
    return false;
  }

  const { customerOnHoldBody, customerOnHoldSubject, customerOnHoldFrom, domain } = mailSettings;

  const promises = [];
  const notifiedSubscriptionIds = [];
  const notifiedOrdersIds = [];

  if (!isEmpty(subsIdsForMainContact) || !isEmpty(orderIdsForMainContact)) {
    promises.push(
      ...mainContacts.map(async contact => {
        const { id, email } = contact;
        const body = generateBody(
          customerOnHoldBody,
          subsIdsForMainContact[id],
          orderIdsForMainContact[id],
          customerName,
        );
        const actualFrom = isEmpty(domain)
          ? SENDGRID_SENDER_EMAIL
          : `${customerOnHoldFrom}@${domain}`;
        await sendTextEmail(email, customerOnHoldSubject, body, actualFrom);

        subsIdsForMainContact[id]?.length &&
          notifiedSubscriptionIds.push(...subsIdsForMainContact[id]);
        orderIdsForMainContact[id]?.length && notifiedOrdersIds.push(...orderIdsForMainContact[id]);
      }),
    );
  }

  if (!isEmpty(subsIdsForSale) || !isEmpty(orderIdsForSale)) {
    promises.push(
      ...salesReps.map(async salesRep => {
        if (salesRep.email) {
          const { id, email } = salesRep;
          const body = generateBody(
            customerOnHoldBody,
            subsIdsForSale[id],
            orderIdsForSale[id],
            customerName,
          );
          const actualFrom = isEmpty(domain)
            ? SENDGRID_SENDER_EMAIL
            : `${customerOnHoldFrom}@${domain}`;

          await sendTextEmail(email, customerOnHoldSubject, body, actualFrom);

          subsIdsForSale[id]?.length && notifiedSubscriptionIds.push(...subsIdsForSale[id]);
          orderIdsForSale[id]?.length && notifiedOrdersIds.push(...orderIdsForSale[id]);
        }
      }),
    );
  }

  if (!promises.length) {
    return false;
  }

  await Promise.all(promises);

  ctx.logger.debug(
    notifiedSubscriptionIds,
    'notifySubscriptionAndOrderEvent->notifiedSubscriptionIds',
  );
  ctx.logger.debug(notifiedOrdersIds, 'notifySubscriptionAndOrderEvent->notifiedOrdersIds');

  return { notifiedSubscriptionIds, notifiedOrdersIds };
};
