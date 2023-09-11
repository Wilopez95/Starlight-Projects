import {
  downloadBillingReport,
  billingReportsList,
  billingReportsSessionView,
} from '../../../services/billing/reports.js';
import sendAttachment from '../../../utils/sendAttachment.js';

export const downloadReport = async (ctx) => {
  const { data, headers } = await downloadBillingReport(ctx);
  return sendAttachment({ ctx, data, headers });
};

export const reportsList = async (ctx) => {
  const data = await billingReportsList(ctx);
  ctx.sendArray(data);
};

export const reportsSession = async (ctx) => {
  const data = await billingReportsSessionView(ctx);
  ctx.sendObj(data);
};
