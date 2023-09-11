import { Readable } from 'stream';
import { Base64Decode } from 'base64-stream';

import isEmpty from 'lodash/isEmpty.js';

import { logger } from '../../utils/logger.js';

import {
  getFinanceChargePdfPath,
  getInvoicePdfPath,
  getBankDepositPdfPath,
  getStatementPdfPath,
  getMaterialsReportPdfPath,
  uploadFile,
  getRouteSheetPdfPath,
} from '../s3.js';

import { MimeType } from '../../consts/mimeType.js';
import { ReportSettings } from '../../consts/reports.js';
import { InvoiceType } from '../../consts/invoiceTypes.js';
import * as exagoService from './exago.js';

const createPdfFromRawData = async report => {
  let file;

  if (isEmpty(report?.ErrorList) && report?.ExecuteData) {
    file = Buffer.from(report?.ExecuteData, 'base64');
  } else if (report?.ErrorList?.includes('NothingQualified')) {
    logger.warn(`Some warn in report generation: ${report?.ErrorList}`);
  } else {
    logger.error(`Some error in report generation: ${JSON.stringify(report)}`);
    throw new Error('Failed to generate report');
  }

  if (!file) {
    throw new Error('Failed to save file to s3 bucket');
  }

  return file;
};

const createPdfFromRawDataAsStream = report => {
  let file;

  if (isEmpty(report?.ErrorList) && report?.ExecuteData) {
    const rs = Readable.from(report.ExecuteData, { objectMode: false });

    file = rs.pipe(new Base64Decode());

    file.once('error', error => logger.error(error, 'Failed to save file to s3 bucket'));
  } else if (report?.ErrorList?.includes('NothingQualified')) {
    logger.warn(`Some warn in report generation: ${report?.ErrorList}`);
  } else {
    logger.error(`Some error in report generation: ${JSON.stringify(report)}`);
    throw new Error('Failed to generate report');
  }

  if (!file) {
    throw new Error('Failed to save file to s3 bucket');
  }

  return file;
};

export const generateAndSaveInvoiceBySession = async (
  invoiceType,
  ctx,
  sessionId,
  tenantName,
  id,
  tenantFolder = '',
) => {
  const reportPath = invoiceType === InvoiceType.ORDERS ? 'invoice' : 'invoiceSubscription';

  const report = await exagoService.getInvoiceData(
    ctx,
    sessionId,
    (tenantFolder ? `${tenantFolder}/` : '') + ReportSettings[reportPath].path,
    id,
  );
  let pdfUrl;
  try {
    const file = await createPdfFromRawDataAsStream(report);
    pdfUrl = await uploadFile(file, getInvoicePdfPath(tenantName, id), MimeType.PDF);
  } catch (error) {
    ctx.logger.error(`[Invoices] Failed to generate the pdf file `, error);
  }

  return { id, pdfUrl };
};

export const generateAndSaveBankDeposit = async (ctx, tenantName, tenantId, id) => {
  const session = await exagoService.batchInit(
    ctx,
    { haulingSchema: tenantName },
    {
      [ReportSettings.bankDeposit.filterName]: id,
      tenantId,
    },
  );

  const report = await exagoService.getReportData(ctx, session.Id, {
    path: ReportSettings.bankDeposit.path,
  });

  const file = await createPdfFromRawData(report);

  const pdfUrl = await uploadFile(file, getBankDepositPdfPath(tenantName, id), MimeType.PDF);

  return { id, pdfUrl };
};

export const generateAndSaveFinanceCharge = async (ctx, tenantName, tenantId, id) => {
  const session = await exagoService.batchInit(
    ctx,
    { haulingSchema: tenantName },
    {
      [ReportSettings.financeCharge.filterName]: id,
      tenantId,
    },
  );

  const report = await exagoService.getReportData(ctx, session.Id, {
    path: ReportSettings.financeCharge.path,
  });

  const file = await createPdfFromRawData(report);

  const pdfUrl = await uploadFile(file, getFinanceChargePdfPath(tenantName, id), MimeType.PDF);

  return { id, pdfUrl };
};

export const generateAndSaveStatement = async (ctx, tenantName, tenantId, id) => {
  const session = await exagoService.batchInit(
    ctx,
    { haulingSchema: tenantName },
    {
      [ReportSettings.statement.filterName]: id,
      tenantId,
    },
  );

  const report = await exagoService.getReportData(ctx, session.Id, {
    path: ReportSettings.statement.path,
  });

  const file = await createPdfFromRawData(report);

  const pdfUrl = await uploadFile(file, getStatementPdfPath(tenantName, id), MimeType.PDF);

  return { id, pdfUrl };
};

export const generateAndSaveMaterialsReport = async (ctx, tenantName, reportParams) => {
  const { customerId, jobSiteId, allActiveOnly, fromDate, toDate } = reportParams;

  const session = await exagoService.batchInit(
    ctx,
    { haulingSchema: tenantName },
    {
      customerId,
      jobSiteId,
      fromDate,
      toDate,
    },
  );

  const { reportNames } = ReportSettings.materialsReport;
  let reportName = reportNames.all;
  if (jobSiteId) {
    reportName = reportNames.single;
  } else if (allActiveOnly) {
    reportName = reportNames.allActive;
  }

  const report = await exagoService.getReportData(ctx, session.Id, {
    path: `${ReportSettings.materialsReport.path}/${reportName}`,
  });

  const file = await createPdfFromRawData(report);

  const timestamp = new Date().getTime();
  const pdfUrl = await uploadFile(
    file,
    getMaterialsReportPdfPath(tenantName, reportParams.customerId, timestamp),
    MimeType.PDF,
  );

  return { pdfUrl };
};

export const generateAndSaveRouteSheet = async (ctx, reportSessionData, { dailyRouteId: id }) => {
  const session = await exagoService.batchInit(ctx, reportSessionData, {
    [ReportSettings.routeSheet.filterName]: id,
  });

  const report = await exagoService.getReportData(ctx, session.Id, {
    path: `${ReportSettings.routeSheet.path}`,
  });

  const file = await createPdfFromRawData(report);
  const pdfUrl = await uploadFile(
    file,
    getRouteSheetPdfPath(reportSessionData.haulingSchema, id),
    MimeType.PDF,
  );

  return { pdfUrl };
};
