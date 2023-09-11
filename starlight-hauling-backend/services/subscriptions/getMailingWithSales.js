import CompanyMailSettingsRepository from '../../repos/companyMailSettings.js';
import DomainRepository from '../../repos/domain.js';

import { getSalesRepEmails } from '../ums.js';
import { createServiceToken } from '../tokens.js';
import { generateTraceId } from '../../utils/generateTraceId.js';

export const getMailingWithSales = async (ctx, { tenantId, schemaName, fields, idsForSale }) => {
  const mailSettings = await CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields,
  });

  if (mailSettings?.domainId) {
    const { name } = await DomainRepository.getInstance(ctx.state, { schemaName }).getBy({
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
  } = await getSalesRepEmails(ctx, {
    reqId: generateTraceId(),
    state: {
      user: {
        schemaName,
        tenantId,
      },
      reqId: ctx.state.reqId,
    },
    serviceToken,
    ids: Object.keys(idsForSale),
  });

  return { salesReps, mailSettings };
};
