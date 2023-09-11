import httpStatus from 'http-status';

import { processSendGridEvents } from '../../../services/sendGridEvents.js';
import { getScopedModels } from '../../../utils/getScopedModels.js';

export const emailsWebhook = async ctx => {
  const events = ctx.request.body;
  const affectedEmailsBySchema = processSendGridEvents(events);

  try {
    await Promise.all(
      Object.keys(affectedEmailsBySchema)
        .map(schema => getScopedModels(schema))
        .flatMap(({ InvoiceEmail, StatementEmail, FinanceChargeEmail }) => [
          InvoiceEmail.updateStatusesOnDelivery(affectedEmailsBySchema[InvoiceEmail.schemaName]),
          StatementEmail.updateStatusesOnDelivery(
            affectedEmailsBySchema[StatementEmail.schemaName],
          ),
          FinanceChargeEmail.updateStatusesOnDelivery(
            affectedEmailsBySchema[FinanceChargeEmail.schemaName],
          ),
        ]),
    );
  } catch (error) {
    ctx.logger.error('Failed to process email status updates');
    throw error;
  }

  ctx.status = httpStatus.NO_CONTENT;
};
