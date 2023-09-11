import isEmpty from 'lodash/isEmpty.js';

import CompanyMailSettingsRepository from '../../repos/companyMailSettings.js';
import DomainRepository from '../../repos/domain.js';

import { getSalesRepEmails } from '../ums.js';
import { createServiceToken } from '../tokens.js';
import { generateTraceId } from '../../utils/generateTraceId.js';

export const notifySubscriptionEvent = async (
  ctx,
  { notificationFunction, tenantId, subscriptions, fields = ['*'] },
) => {
  const subsIdsForSale = {};
  subscriptions?.forEach(({ id, salesId }) => {
    if (!subsIdsForSale[salesId]) {
      subsIdsForSale[salesId] = [];
    }
    subsIdsForSale[salesId].push(id);
  });

  const mailSettings = await CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields,
  });

  if (isEmpty(mailSettings)) {
    return false;
  }

  if (mailSettings.domainId) {
    const { name } = await DomainRepository.getInstance(ctx.state).getBy({
      condition: { id: mailSettings.domainId },
      fields: ['name'],
    });

    mailSettings.domain = name;
  }

  ctx.logger.debug(mailSettings, 'subsRepo->notifySubscriptionEvent->mailSettings');

  const serviceToken = await createServiceToken(
    {},
    {
      audience: 'ums',
      subject: undefined,
      requestId: ctx.state.reqId,
    },
  );

  const {
    data: { users: salesReps },
  } = await getSalesRepEmails(
    ctx,
    {
      reqId: generateTraceId(),
      state: {
        user: {
          schemaName: ctx.state.user.schemaName,
          userId: ctx.state.user.userId,
          tenantId,
        },
        reqId: ctx.state.reqId,
      },
    },
    { serviceToken, ids: Object.keys(subsIdsForSale) },
  );

  await Promise.all(
    salesReps.map(async salesRep => {
      const { id, email } = salesRep;
      await notificationFunction(email, subsIdsForSale[id], mailSettings);
    }),
  );

  return true;
};
