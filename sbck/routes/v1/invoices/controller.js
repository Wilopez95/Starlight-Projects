import yazl from 'yazl';
import httpStatus from 'http-status';
import * as dateFns from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import isEmpty from 'lodash/isEmpty.js';
import uniq from 'lodash/uniq.js';
import chunk from 'lodash/chunk.js';
import groupBy from 'lodash/fp/groupBy.js';
import filter from 'lodash/fp/filter.js';
import compose from 'lodash/fp/compose.js';
import pick from 'lodash/pick.js';

import { mergePdfs } from '../../../services/pdfMerger.js';
import { sendMultipleInvoices, canInvoiceBeSent } from '../../../services/email.js';
import { invoiceInitSession, existTenantInvoice } from '../../../services/reporting/exago.js';
import { executeAutoPay } from '../../../services/autoPayInvoices.js';

import ApplicationError from '../../../errors/ApplicationError.js';

import { getWeightTicketFileName, loadMediaFiles } from '../../../utils/mediaFiles.js';
import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

import { InvoiceMailing } from '../../../consts/invoiceMailing.js';
import { EmailEvent } from '../../../consts/emailEvent.js';
import { GenerationJobStatus } from '../../../consts/generationJobStatus.js';

import { PDF_GENERATION_BATCH_SIZE, CRPT_FEATURES_OFF } from '../../../config.js';

const autoPayInvoices = async ({ ctx, generatedInvoices }) => {
  if (!generatedInvoices?.length) {
    return;
  }

  const byCustomer = compose(groupBy('customerId'), filter('id'))(generatedInvoices);
  const customerIds = Object.keys(byCustomer);

  try {
    await Promise.all(
      customerIds.map(customerId =>
        executeAutoPay({
          ctx,
          customerId,
          generatedInvoices: byCustomer[customerId],
        }),
      ),
    );
  } catch (error) {
    ctx.logger.error(error, 'Error while executing Auto Pay');
  }
};

const getInvoicesForMails = invoice => {
  if (invoice.attachMediaPref) {
    invoice.attachMediaFiles = InvoiceMailing.ATTACH_ALL_MEDIA;
  } else if (invoice.attachTicketPref) {
    invoice.attachMediaFiles = InvoiceMailing.ATTACH_TICKET;
  }

  invoice.receivers = [];

  if (invoice.customer.brokerEmail) {
    invoice.receivers.push(invoice.customer.brokerEmail);
  } else if (!isEmpty(invoice.customer.invoiceEmails) && invoice.customer.sendInvoicesByEmail) {
    invoice.receivers.push(...invoice.customer.invoiceEmails);
  }

  if (
    invoice.orders?.some(
      order =>
        order.customerJobSite.sendInvoicesToJobSite &&
        !isEmpty(order.customerJobSite.invoiceEmails),
    )
  ) {
    invoice.receivers.push(
      ...invoice.orders
        .filter(order => !isEmpty(order.customerJobSite.invoiceEmails))
        .flatMap(order => order.customerJobSite.invoiceEmails),
    );
  }

  invoice.receivers = uniq(invoice.receivers);

  return pick(invoice, [
    'id',
    'receivers',
    'createdAt',
    'pdfUrl',
    'attachMediaFiles',
    'ticketUrl',
    'orders',
    'subscriptions',
    'customerId',
    'balance',
  ]);
};

const sendInvoiceEmails = async (ctx, { invoices, company }) => {
  const { InvoiceEmail, InvoiceAttachments } = ctx.state.models;
  let shouldSendEmails = !!company;

  try {
    await InvoiceEmail.upsertMany({
      data: invoices.flatMap(({ id: invoiceId, receivers = [] }) =>
        isEmpty(receivers)
          ? {
              invoiceId,
              receiver: null,
              status: EmailEvent.FAILED_TO_SEND,
            }
          : receivers.map(receiver => ({
              invoiceId,
              receiver,
              status: shouldSendEmails ? EmailEvent.PENDING : EmailEvent.FAILED_TO_SEND,
            })),
      ),
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to log emails');
    shouldSendEmails = false;
  }

  let mediaFiles = [];
  for (const invoice of invoices) {
    if (invoice?.orders?.length) {
      for (const order of invoice.orders) {
        if (
          !isEmpty(order.ticketUrl) &&
          (invoice.attachMediaFiles === InvoiceMailing.ATTACH_TICKET ||
            invoice.attachMediaFiles === InvoiceMailing.ATTACH_ALL_MEDIA)
        ) {
          // This ensures the ticket is added to the order media files (table)
          // R2-148
          mediaFiles = mediaFiles.concat({
            url: order.ticketUrl,
            fileName: getWeightTicketFileName(order.woNumber, order.ticketUrl.split('.').pop()),
            invoiceId: invoice.id,
          });
        }
      }
    }
    if (invoice.subscriptions?.length) {
      for (const subscription of invoice.subscriptions) {
        mediaFiles = mediaFiles.concat(
          subscription.mediaFiles?.map(({ url, fileName }) => ({
            url,
            fileName,
            invoiceId: invoice.id,
          })),
        );
      }
    }
  }

  try {
    await InvoiceAttachments.upsertMany({
      data: mediaFiles,
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to save attachments for invoices');
  }

  if (shouldSendEmails) {
    sendMultipleInvoices(ctx, {
      invoices,
      mailSettings: company,
    }).catch(error => ctx.logger.error(error, 'Failed to send invoices'));
  }
};

const processInvoices = async (ctx, { invoices, generationJob }) => {
  const { Invoice, GenerationJob, Company, BusinessUnit } = ctx.state.models;
  const { subscriberName, email, name, tenantId, schemaName, userId } = ctx.state.user;

  const startTime = new Date();
  ctx.logger.info(`[Invoices] [${schemaName}] Generation has started at ${startTime}`);

  let company = null;
  let businessUnit = null;
  try {
    company = await Company.getByTenantId(tenantId).catch(error =>
      ctx.logger.error(error, `[Invoices] [${schemaName}] Failed to retrieve company`),
    );
    businessUnit = await BusinessUnit.getById(invoices[0].businessUnitId, ['timeZoneName']);
  } catch (error) {
    ctx.logger.info(`[Invoices] [${schemaName}] Failed to fetch company and business unit info`);
  }

  const timeZoneName = businessUnit?.timeZoneName || company?.timeZoneName || 'UTC';
  const currentDate = dateFnsTz.utcToZonedTime(new Date().getTime(), timeZoneName);
  const exagoSession = await invoiceInitSession(
    ctx,
    schemaName,
    tenantId,
    dateFnsTz.getTimezoneOffset(timeZoneName),
  );
  const exagoSessionId = exagoSession.Id;
  const customInvoice = await existTenantInvoice(ctx, exagoSessionId, schemaName);

  const bs = Number(PDF_GENERATION_BATCH_SIZE) || 30;
  const invoiceBatches = chunk(invoices, bs);

  const isCRPT = CRPT_FEATURES_OFF !== 'true';
  // const shouldSendEmails = !!company;
  // R2-450 - Disabling invoice emails from sending during the
  // order process for now.
  // - Steven, 10/31/2022
  const shouldSendEmails = false;
  const allInvoicesForEmails = [];
  const allInvoices = [];
  const l = +invoices.length;

  ctx.logger.info(`[Invoices] [${schemaName}] Generation for ${l} has started`);

  for (const invoiceBatch of invoiceBatches) {
    const generatedInvoicesBatch = await Promise.all(
      invoiceBatch.map(async invoiceInput =>
        Invoice.generate(
          ctx,
          {
            ...invoiceInput,
            csrName: name,
            csrEmail: email,
            generationJob,
          },
          { subscriberName, schemaName, userId, exagoSessionId, customInvoice },
          { log: true, userId, currentDate },
        ),
      ),
    );

    isCRPT && allInvoices.push(...generatedInvoicesBatch);
    if (shouldSendEmails && generatedInvoicesBatch?.length > 0) {
      generatedInvoicesBatch.forEach(invoice => {
        if (invoice && canInvoiceBeSent(invoice)) {
          allInvoicesForEmails.push(getInvoicesForMails(invoice));
        }
      });
    }
  }

  // TODO: temp hard boost until Customer Portal get released
  if (isCRPT) {
    await autoPayInvoices({ ctx, generatedInvoices: allInvoices });
  }

  invoices.length = 0;
  const endTime = new Date();
  const durationInSec = dateFns.differenceInSeconds(endTime, startTime);

  try {
    await GenerationJob.markAsFinished(generationJob.id, { endTime, durationInSec });
  } catch (error) {
    ctx.logger.error(error, `[Invoices] [${schemaName}] Failed to update job status`);
  }

  if (shouldSendEmails && allInvoicesForEmails?.length > 0) {
    sendInvoiceEmails(ctx, { invoices: allInvoicesForEmails, company });
  }

  ctx.logger.info(`[Invoices] [${schemaName}] Generation has finished at ${endTime}`);
  ctx.logger.info(
    `[Invoices] [${schemaName}] Time spent ${durationInSec} in seconds for ${l} generated invoices`,
  );
};

export const generateInvoices = async ctx => {
  const { GenerationJob } = ctx.state.models;

  const generationJobId = ctx.request.headers['x-generation-job-id'];
  const invoices = ctx.request.body;

  const generationJob = await GenerationJob.createOne({
    data: {
      id: generationJobId,
      expectedCount: invoices.length,
      count: 0,
      failedCount: 0,
      status: GenerationJobStatus.PENDING,
      startTime: new Date(),
    },
  });

  await processInvoices(ctx, { invoices, generationJob }).catch(ctx.logger.error.bind(ctx.logger));

  ctx.status = httpStatus.ACCEPTED;
  ctx.body = { generationJobId: generationJob.id };
};

export const generateSubscriptionsOrdersInvoices = async ctx => {
  const { GenerationJob } = ctx.state.models;
  const { invoices, generationJobId } = ctx.request.validated.body;
  const generationJob = await GenerationJob.createOne({
    data: {
      id: generationJobId,
      expectedCount: invoices.length,
      count: 0,
      failedCount: 0,
      status: GenerationJobStatus.PENDING,
    },
  });

  processInvoices(ctx, { invoices, generationJob }).catch(ctx.logger.error.bind(ctx.logger));

  ctx.status = httpStatus.ACCEPTED;
  ctx.body = { generationJobId: generationJob.id };
};

export const getInvoices = async ctx => {
  const { offset, limit, sortBy, sortOrder } = ctx.request.validated.query;
  const { Invoice } = ctx.state.models;

  let { customerIds } = ctx.request.query;

  if (!customerIds) {
    ctx.status = httpStatus.OK;
    ctx.body = [];
    return;
  }

  if (!Array.isArray(customerIds)) {
    customerIds = [customerIds];
  }

  let invoices;
  try {
    invoices = await Invoice.getAllPaginated({
      condition: { customerIds },
      includeCustomer: true,
      limit,
      offset,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    ctx.logger.error(`Failed to retrieve invoices for customers ${customerIds}`);
    throw error;
  }

  invoices.forEach(invoice => {
    invoice.dueDate = new Date(invoice.dueDate).toUTCString();
    invoice.createdAt = new Date(invoice.createdAt).toUTCString();
  });

  ctx.status = httpStatus.OK;
  ctx.body = invoices;
};

export const getInvoicesByOrders = async ctx => {
  const { orderIds = [] } = ctx.request.validated.body;
  const { Invoice } = ctx.state.models;

  const invoices = await Invoice.getByOrderIds(orderIds);

  ctx.status = httpStatus.OK;
  ctx.body = invoices;
};

export const getInvoiceById = async ctx => {
  const { id } = ctx.params;
  const { openOnly, businessUnitId } = ctx.request.validated.query;
  const { Invoice } = ctx.state.models;

  let invoice;
  try {
    invoice = await Invoice.getInvoiceWithCustomer(id, { openOnly, businessUnitId });
  } catch (error) {
    ctx.logger.error(`Failed to retrieve invoice with ID ${id}`);
    throw error;
  }

  if (invoice) {
    invoice.dueDate = new Date(invoice.dueDate).toUTCString();
    invoice.createdAt = new Date(invoice.createdAt).toUTCString();
  }

  ctx.status = httpStatus.OK;
  ctx.body = invoice;
};

export const getCombinedInvoice = async ctx => {
  const { invoiceIds } = ctx.request.query;
  const { Invoice } = ctx.state.models;

  let pdfUrls;
  try {
    pdfUrls = await Invoice.getPdfUrls(invoiceIds);
  } catch (error) {
    ctx.logger.error(`Could not retrieve PDF URLs for invoices: ${invoiceIds}`);
    throw error;
  }

  const fileName = getAttachmentFileName('Invoice(s)', pdfUrls);

  let buffer;
  try {
    buffer = await mergePdfs(
      pdfUrls.map(({ pdfUrl }) => pdfUrl),
      fileName,
    );
  } catch (error) {
    ctx.logger.error(`Could not merge PDFs for documents: ${pdfUrls}`);
    throw error;
  }

  ctx.attachment(`${fileName}.pdf`);
  ctx.status = httpStatus.OK;
  ctx.body = buffer;
};

export const downloadInvoiceMediaFiles = async ctx => {
  const { id } = ctx.params;
  const { Invoice } = ctx.state.models;

  const invoice = await Invoice.getInvoiceWithAttachments(id);

  if (!invoice) {
    throw ApplicationError.notFound('Invoice not found');
  }

  let mediaFiles = [];

  if (invoice.type === 'subscriptions') {
    mediaFiles = mediaFiles.concat(invoice.invoiceAttachments);
  }

  if (invoice.type === 'orders') {
    mediaFiles = invoice.orders.reduce((files, order) => {
      if (order.ticketUrl) {
        files.push({
          url: order.ticketUrl,
          fileName: getWeightTicketFileName(order.woNumber, order.ticketUrl.split('.').pop()),
          invoiceId: invoice.id,
        });
      }
      if (!isEmpty(order.mediaFiles)) {
        files.push(...order.mediaFiles);
      }

      return files;
    }, []);
  }

  mediaFiles.push({
    url: invoice.pdfUrl,
    fileName: `Invoice from ${invoice.createdAt.toDateString()}.pdf`,
  });

  const attachments = await loadMediaFiles(mediaFiles);

  if (isEmpty(mediaFiles)) {
    throw ApplicationError.notFound('Media files not found');
  }

  const archive = new yazl.ZipFile();

  try {
    attachments.forEach(file => archive.addBuffer(file.content, file.filename));
  } catch (error) {
    ctx.logger.error(error, 'Failed to append file to archive');
    throw error;
  }

  archive.end();

  ctx.type = 'application/zip';
  ctx.attachment(`invoice#${id}_media_files.zip`);
  ctx.body = archive.outputStream;
};
