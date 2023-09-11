// eslint-disable-file
import httpStatus from 'http-status';

import isEmpty from 'lodash/isEmpty.js';
import dateFnsTz from 'date-fns-tz';

import * as exagoService from '../../../services/reporting/exago.js';
import { generateAndSaveMaterialsReport, generateAndSaveRouteSheet } from '../../../services/reporting/report.js';
import { getScopedModels } from '../../../utils/getScopedModels.js';

import { ReportFolder, ExagoContentType, ExagoReportType, ServiceType, ReportSettings, WeightTicketType } from '../../../consts/reports.js';
import { BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';

const buFields = ['id', 'logoUrl', 'timeZoneName', 'type'];

export const list = async (ctx) => {
  const { user } = ctx.state;
  const {
    query: { folder },
    sessionData: { reportsFolder },
  } = ctx.request.validated;

  const reports = await getReports(ctx, user, folder, reportsFolder);
  ctx.status = httpStatus.OK;
  ctx.body = reports;
};

export const customerPortalList = async (ctx) => {
  const { user } = ctx.state;
  const reports = await getReports(ctx, user, ReportFolder.CUSTOMER_PORTAL, ServiceType.customerPortal);
  ctx.status = httpStatus.OK;
  ctx.body = reports;
};

export const download = async (ctx) => {
  const {
    query: { fileName, format, path, reportName, ...reportParams },
    reportSessionData,
    sessionData: { isRecyclingBU },
  } = ctx.request.validated;
  if (!reportParams.customerId) {
    reportParams.customerId = null;
  }

  const session = await exagoService.batchInit(ctx, { isRecyclingBU, ...reportSessionData }, reportParams);

  const reportUrl = await exagoService.getReportData(ctx, session.Id, {
    type: format,
    path: [path, reportName]
      .filter(Boolean)
      .map((i) => decodeURIComponent(i))
      .join('/'),
  });

  let file;
  if (isEmpty(reportUrl?.ErrorList) && reportUrl?.ExecuteData) {
    file = Buffer.from(reportUrl.ExecuteData, 'base64');
  } else {
    if (reportUrl?.ErrorList?.includes('NothingQualified')) {
      ctx.logger.warn(`Some warn in report generation: ${reportUrl?.ErrorList}`);
    } else {
      ctx.logger.error(`Some error in report generation: ${JSON.stringify(reportUrl)}`);
    }
  }

  ctx.attachment(`${decodeURIComponent(fileName)}.${format}`);
  ctx.status = httpStatus.OK;
  ctx.body = file;
};

export const getMaterialsReportUrl = async (ctx) => {
  const { tenantName } = ctx.state.user;

  const { pdfUrl } = await generateAndSaveMaterialsReport(ctx, tenantName, ctx.request.validated.query);

  ctx.status = httpStatus.OK;
  ctx.body = { pdfUrl };
};

export const getRouteSheetReportUrl = async (ctx) => {
  const {
    reportSessionData,
    query: { dailyRouteId },
  } = ctx.request.validated;

  const { pdfUrl } = await generateAndSaveRouteSheet(ctx, reportSessionData, { dailyRouteId });

  ctx.status = httpStatus.OK;
  ctx.body = { pdfUrl };
};

const init = async (ctx, { remove, duplicate, edit } = {}) => {
  const { email } = ctx.state.user;
  const {
    body: { customerId, fromDate, toDate, selfService, path, linesOfBusiness },
    reportSessionData,
    sessionData: { isRecyclingBU },
  } = ctx.request.validated;
  const session = await exagoService.batchInit(
    ctx,
    { isRecyclingBU, ...reportSessionData },
    {
      fromDate,
      toDate,
      customerId: customerId ?? undefined,
      linesOfBusiness: linesOfBusiness ?? undefined,
    },
    {
      userFolder: selfService || duplicate || remove ? email : '',
      path: duplicate && path,
      edit,
    },
  );

  ctx.status = httpStatus.OK;
  ctx.body = session;
};

export const initSession = async (ctx) => {
  await init(ctx);
};

export const editSession = async (ctx) => {
  await init(ctx, { edit: true });
};

export const initDuplicateSession = async (ctx) => {
  await init(ctx, { duplicate: true });
};

export const initDeleteSession = async (ctx) => {
  await init(ctx, { remove: true });
};

export const downloadOneInvoice = async (ctx) => {
  const { tenantName } = ctx.state.user;
  const { id } = ctx.request.validated.query;
  console.time('^sessionInit');
  const session = await exagoService.batchInit(ctx, { haulingSchema: tenantName }, { invoiceId: id });
  console.timeEnd('^sessionInit');

  console.time('_downloadFile');
  let file;
  const reportUrl = await exagoService.getReportData(ctx, session.Id, {
    type: 'pdf',
    folder: 'common/',
    name: 'invoice',
  });
  console.timeEnd('_downloadFile');

  if (isEmpty(reportUrl?.ErrorList) && reportUrl?.ExecuteData) {
    file = Buffer.from(reportUrl.ExecuteData, 'base64');
  } else {
    if (reportUrl?.ErrorList?.includes('NothingQualified')) {
      ctx.logger.warn(`Some warn in report generation: ${reportUrl?.ErrorList}`);
    } else {
      ctx.logger.error(`Some error in report generation: ${JSON.stringify(reportUrl)}`);
    }
  }

  ctx.attachment('invoice.pdf');
  ctx.body = file;
  ctx.status = httpStatus.OK;
};

export const downloadInvoice = async (ctx) => {
  const { tenantName } = ctx.state.user;
  const { id, count = 1 } = ctx.request.validated.query;

  console.log('\n\n');
  console.time('===total_' + count);

  async function generateInvoice(number) {
    console.log('--sessionStart' + number);
    console.time('!!session' + number);
    console.time('^sessionInit' + number);
    const session = await exagoService.batchInit(ctx, { haulingSchema: tenantName }, { invoiceId: id });
    console.timeEnd('^sessionInit' + number);

    if (session?.Id) {
      console.time('_downloadFile' + number);
      await exagoService.getReportData(ctx, session.Id, {
        type: 'pdf',
        folder: 'common/',
        name: 'invoice',
      });
      console.timeEnd('_downloadFile' + number);
    } else {
      console.log('----Session not created' + number);
    }
    console.timeEnd('!!session' + number);
  }

  const iterations = [];
  for (let n = 1; n < count + 1; n++) {
    iterations.push(n);
  }

  await Promise.all(iterations.map((i) => generateInvoice(i)));

  console.timeEnd('===total_' + count);

  ctx.status = httpStatus.OK;
};

export const downloadWeightTicket = async (ctx) => {
  const { tenantName, resource, tenantId } = ctx.state.user;
  const [, haulingTenantName, , businessUnitId] = resource.split(':');
  const { Company } = ctx.state.models;
  const { BusinessUnit } = getScopedModels(haulingTenantName);
  const { orderId, type, businessLineId } = ctx.request.validated.query;

  const [company, businessUnit] = await Promise.all([
    Company.getBy({ condition: { tenantId }, fields: ['logoUrl', 'timeZoneName', 'unit'] }),
    BusinessUnit.getById(businessUnitId, buFields),
  ]);

  const timeZone = businessUnit?.timeZoneName || company?.timeZoneName || 'UTC';
  const options = {
    tenantId,
    linesOfBusiness: businessLineId,
    companyLogoUrl: businessUnit?.logoUrl || company?.logoUrl || '',
    timeZone,
    timeZoneInMs: dateFnsTz.getTimezoneOffset(timeZone),
    businessUnitId: businessUnit?.id,
    unitOfMeasure: company?.unit,
  };

  const session = await exagoService.batchInit(
    ctx,
    { haulingSchema: haulingTenantName, recyclingSchema: tenantName },
    { orderId, ...options },
  );

  let file;
  const reportType = type === WeightTicketType.DUMP ? 'weightTicketDump' : 'weightTicketLoad';
  const customFolderExists = await exagoService
    .existTenantWeightTicket(ctx, session.Id, haulingTenantName, reportType);
  const customFolderPath = customFolderExists ? haulingTenantName + '/' : '';

  const reportUrl = await exagoService.getReportData(ctx, session.Id, {
    type: 'pdf',
    path: customFolderPath + ReportSettings[reportType].path
  });

  if (isEmpty(reportUrl?.ErrorList) && reportUrl?.ExecuteData) {
    file = Buffer.from(reportUrl.ExecuteData, 'base64');
  } else {
    if (reportUrl?.ErrorList?.includes('NothingQualified')) {
      ctx.logger.warn(`Some warn in ticket generation: ${reportUrl?.ErrorList}`);
    } else {
      ctx.logger.error(`Some error in ticket generation: ${JSON.stringify(reportUrl)}`);
    }
  }

  ctx.attachment('ticket.pdf');
  ctx.body = file;
  ctx.status = httpStatus.OK;
};

const getReports = async (ctx, user, folderName, serviceFolderName) => {
  const { tenantName, email } = user;
  const session = await exagoService.batchInit(ctx, { haulingSchema: tenantName });
  const data = await exagoService.reports(session.Id);

  const reportsFolderName = 'reports';
  const usersFolderName = 'users';
  let expressViewSuffix = '-ev';
  let fullPath = '';
  const reports = {};
  const getEntityItems = (listOfObject, name) => listOfObject?.entity?.find((item) => item.name === name);
  const joinPath = (...items) => items.join('\\');

  const addFiles = (arrData, path = '', { standardReport = true, tenantReport = false } = {}) => {
    if (!Array.isArray(arrData)) {
      return;
    }

    arrData
      .filter(({ entity, content_type }) => entity || content_type === ExagoContentType.REPORT)
      .forEach((item) => {
        let reportName = item.name;
        if (standardReport && reportName.endsWith(expressViewSuffix)) {
          reportName = reportName.substr(0, reportName.length - expressViewSuffix.length);
        }
        switch (item.content_type) {
          case ExagoContentType.FOLDER: {
            return addFiles(item.entity, joinPath(path, reportName), {
              standardReport,
              tenantReport,
            });
          }
          case ExagoContentType.REPORT: {
            const report = {
              path,
              reportName: reportName,
              reportEditName: '',
              reportType: item.report_type,
              standardReport,
              tenantReport,
            };
            reports[reportName] ? reports[reportName].push(report) : (reports[reportName] = [report]);
            break;
          }
          //ignore other types
          default:
            break;
        }
      });
  };

  let folder;
  const tenantData = getEntityItems(data, tenantName);
  if (folderName === ReportFolder.CUSTOM) {
    const usersData = getEntityItems(tenantData, usersFolderName);

    expressViewSuffix = '';
    folder = getEntityItems(usersData, email);
    fullPath = joinPath(tenantName, usersFolderName, email);

    addFiles(folder?.entity, fullPath, { standardReport: false });
  } else {
    const reportsFolder = getEntityItems(data, reportsFolderName);
    const serviceFolder = getEntityItems(reportsFolder, serviceFolderName);

    // add standard reports
    folder = getEntityItems(serviceFolder, folderName);
    fullPath = joinPath(reportsFolderName, serviceFolderName, folderName);
    addFiles(folder?.entity, fullPath);

    // add tenant reports
    folder = getEntityItems(tenantData, reportsFolderName);
    folder = getEntityItems(folder, serviceFolderName);
    folder = getEntityItems(folder, folderName);
    fullPath = joinPath(tenantName, reportsFolderName, serviceFolderName, folderName);
    addFiles(folder?.entity, fullPath, { tenantReport: true });
  }

  const result = Object.values(reports).map((items) => {
    const finalReport = items[items.length - 1];
    finalReport.reportEditName =
      finalReport.tenantReport && !items.some((item) => item.tenantReport && item.reportType === ExagoReportType.EXPRESS_VIEW)
        ? ''
        : finalReport.reportName + expressViewSuffix;

    return finalReport;
  });

  return result;
};

export const readSessionData = async (ctx, next) => {
  const { Company, BusinessUnit } = ctx.state.models;
  const { tenantName: haulingSchema, tenantId, resource } = ctx.state.user;
  const [, , serviceType, contextId] = resource.split(':');
  const findBuMethod = serviceType === ServiceType.customerPortal ? 'getByCustomerId' : 'getById';

  const [company, businessUnit] = await Promise.all([
    Company.getBy({ condition: { tenantId }, fields: ['logoUrl', 'timeZoneName', 'unit'] }),
    BusinessUnit[findBuMethod](contextId, buFields),
  ]);

  const timeZone = businessUnit?.timeZoneName || company?.timeZoneName || 'UTC';
  ctx.request.validated.reportSessionData = {
    haulingSchema,
    tenantId,
    companyLogoUrl: businessUnit?.logoUrl || company?.logoUrl || '',
    timeZone,
    timeZoneInMs: dateFnsTz.getTimezoneOffset(timeZone),
    businessUnitId: businessUnit?.id,
    unitOfMeasure: company?.unit,
  };

  ctx.request.validated.sessionData = {
    isRecyclingBU: businessUnit.type === BUSINESS_UNIT_TYPE.RECYCLING_FACILITY,
    reportsFolder: serviceType,
  };

  await next();
};
