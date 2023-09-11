import { downloadBillingStatements } from '../../../services/billing/statements.js';
import sendAttachment from '../../../utils/sendAttachment.js';

export const downloadStatements = async (ctx) => {
  const { data, headers } = await downloadBillingStatements(ctx);
  return sendAttachment({ ctx, data, headers });
};
