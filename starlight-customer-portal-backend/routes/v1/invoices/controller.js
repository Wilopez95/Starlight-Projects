import { downloadBillingCombinedInvoices } from '../../../services/billing/invoices.js';
import sendAttachment from '../../../utils/sendAttachment.js';

export const downloadCombinedInvoices = async (ctx) => {
  const { data, headers } = await downloadBillingCombinedInvoices(ctx);
  return sendAttachment({ ctx, data, headers });
};
