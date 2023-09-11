import sgMail from '@sendgrid/mail';
import { format } from 'date-fns';

import groupBy from 'lodash/groupBy.js';
import map from 'lodash/map.js';
import sumBy from 'lodash/sumBy.js';
import sortBy from 'lodash/sortBy.js';
import isEmpty from 'lodash/isEmpty.js';

import { getWeightTicketFileName, loadMediaFiles, loadMediaFile } from '../utils/mediaFiles.js';

import { InvoiceMailing } from '../consts/invoiceMailing.js';
import { DATE_FORMAT } from '../consts/formats.js';
import {
  SENDGRID_SMTP_API_KEY_ID,
  ENV_NAME,
  NOTIFICATIONS_EMAIL,
  FE_HOST,
  EMAIL_SANDBOX,
} from '../config.js';

// SendGrid attachment limit is 19.5mb & in case of base64 buffer 4 bytes needed to store 3
const SENDGRID_ATTACHMENT_LIMIT = 14;
const disableSandbox = EMAIL_SANDBOX === 'false';
sgMail.setApiKey(SENDGRID_SMTP_API_KEY_ID);

/**
 * If the attachment is too large, split it into smaller attachments and add them to the array
 * @param attachments - An array of attachments.
 * @returns An array of arrays.
 */
const splitAttachments = attachments => {
  let currentSize = 0;
  let currentChunk = 0;

  return attachments.reduce(
    (acc, currentAttachment) => {
      if (currentAttachment.size > SENDGRID_ATTACHMENT_LIMIT) {
        return acc;
      }
      if (currentSize + currentAttachment.size < SENDGRID_ATTACHMENT_LIMIT) {
        acc[currentChunk].push(currentAttachment);
        currentSize = currentSize + currentAttachment.size;
      } else {
        currentChunk = currentChunk + 1;
        acc[currentChunk] = [currentAttachment];
        currentSize = currentAttachment.size;
      }

      return acc;
    },
    [[]],
  );
};

export const canInvoiceBeSent = ({ id, orders, customer: { brokerEmail, sendInvoicesByEmail } }) =>
  !!(
    id &&
    (brokerEmail ||
      sendInvoicesByEmail ||
      orders?.some(
        ({ customerJobSite: { sendInvoicesToJobSite, invoiceEmails } }) =>
          sendInvoicesToJobSite && !isEmpty(invoiceEmails),
      ))
  );

/**
 * Send an email with attachments to a list of receivers
 * @returns An array of promises.
 */
export const sendEmailWithAttachments = ({
  to,
  subject,
  text = '',
  from,
  replyTo = from,
  copyTo,
  attachments,
  args,
}) => {
  const receivers = copyTo ? [to, copyTo] : [to];

  return Promise.all(
    receivers.map(receiver =>
      sgMail.send({
        from,
        to: receiver,
        subject: subject ?? '',
        text: text ?? '',
        replyTo: replyTo ?? undefined,
        attachments,
        customArgs: args,
        ...(disableSandbox || {
          mailSettings: {
            sandboxMode: {
              enable: true,
            },
          },
        }),
      }),
    ),
  );
};

/**
 * Send an email with attachments to the customer
 * @param ctx - The context object.
 * @returns Nothing.
 */
export const sendInvoiceWithMediaFiles = async (ctx, { invoice, mailSettings }) => {
  const { receivers } = invoice;
  const { InvoiceEmail } = ctx.state.models;
  const { subscriberName } = ctx.state.user;

  const invoicedEntities = invoice?.orders?.length ? invoice?.orders : invoice?.subscriptions;

  const mediaFiles = invoicedEntities.reduce((files, invoiceEntity) => {
    if (invoiceEntity.ticketFile) {
      files.push(invoiceEntity.ticketFile);
    }
    // we have to check for the ticketFile otherwise when
    // sending from the invoice grid, it will attach a second
    // copy of the weight ticket. For some reason when moving an order
    // through the invoicing process, the weight ticket is not picked up and attached
    // the frist time, this makes sure to grab the weight ticket and attach it.
    if (
      !invoiceEntity.ticketFile &&
      !isEmpty(invoiceEntity.ticketUrl) &&
      (invoice.attachMediaFiles === InvoiceMailing.ATTACH_ALL_MEDIA ||
        invoice.attachMediaFiles === InvoiceMailing.ATTACH_TICKET)
    ) {
      files.push({
        url: invoiceEntity.ticketUrl,
        /*
         * invoiceEntity.ticketUrl.split('.').pop()
         * was removed because it made the file url for weight tickets
         * look like spam to gmail and the emails were being blocked.
         * Weight ticket gets the correct name of weight-ticket-for-wo-#
         * JIRA R16-42
         * Steven 8/31/22
         */
        fileName: getWeightTicketFileName(invoiceEntity.woNumber),
      });
    }

    if (
      !isEmpty(invoiceEntity.mediaFiles) &&
      invoice.attachMediaFiles === InvoiceMailing.ATTACH_ALL_MEDIA
    ) {
      files.push(...invoiceEntity.mediaFiles);
    }

    return files;
  }, []);

  mediaFiles.push({
    url: invoice.pdfUrl,
    fileName: `Invoice from ${invoice.createdAt.toDateString()}.pdf`,
  });

  const attachments = await loadMediaFiles(mediaFiles, { convertToBase64: true });
  const totalSize = sumBy(attachments, 'size');
  // if the domain settings are empty, we are sending the emails from the default email otherwise we are sending them from the domain email
  // the default email in production is notify@starlightsoftware.io set by `NOTIFICATIONS_EMAIL`
  const actualFrom = isEmpty(mailSettings.domain)
    ? NOTIFICATIONS_EMAIL
    : `${mailSettings.invoicesFrom}@${mailSettings.domain}`;
  // all replyTo fields no longer required to be a hostname only if the domain is not added
  // if there is a domain the reply to should be the initial part of the email like it was previously (before the @).
  const actualReplyTo = isEmpty(mailSettings.domain)
    ? mailSettings.invoicesReplyTo
    : `${mailSettings.invoicesReplyTo}@${mailSettings.domain}`;

  if (totalSize > SENDGRID_ATTACHMENT_LIMIT) {
    ctx.logger.info(
      `${totalSize} exceeds ${SENDGRID_ATTACHMENT_LIMIT}, so skipping sending invoice`,
    );
    await InvoiceEmail.updateStatusesOnSend({
      failed: [invoice.id],
    }).catch(error => ctx.logerr.error(error, 'Failed to update email status'));
  }
  try {
    await sendEmailWithAttachments({
      to: receivers,
      from: actualFrom,
      subject: mailSettings.invoicesSubject,
      text: mailSettings.invoicesBody,
      replyTo: mailSettings.invoicesReplyTo ? actualReplyTo : undefined,
      copyTo: mailSettings.invoicesSendCopyTo,
      attachments,
      args: {
        subscriberName,
        env: ENV_NAME,
        invoiceIds: [invoice.id],
      },
    });
  } catch (error) {
    await InvoiceEmail.updateStatusesOnSend({
      failed: [invoice.id],
    }).catch(err => ctx.logerr.error(err, 'Failed to update email status'));
    ctx.logger.error(error, `Failed to send invoice for customer ${receivers.join(',')}`);

    return;
  }

  ctx.logger.info(`Successfully sent email for invoice ${invoice.id} to ${receivers.join(',')}`);

  try {
    await InvoiceEmail.updateStatusesOnSend({ successful: [invoice.id] });
  } catch (error) {
    ctx.logger.error(error, `Failed to update email status for ${invoice.id}`);
  }
};

export const sendInvoicesWithoutMediaFiles = async (ctx, { invoices, mailSettings }) => {
  const { receivers } = invoices[0];
  const { InvoiceEmail } = ctx.state.models;
  const { subscriberName } = ctx.state.user;
  const invoicesFiles = [];

  for (const invoice of invoices) {
    const mediaFile = await loadMediaFile(
      {
        url: invoice.pdfUrl,
        fileName: `Invoice from ${invoice.createdAt.toDateString()}.pdf`,
      },
      { convertToBase64: true },
    );

    invoicesFiles.push(mediaFile);
  }

  invoicesFiles.forEach((file, index) => {
    file.invoiceId = invoices[index].id;
  });

  const attachmentsChunks = splitAttachments(sortBy(invoicesFiles, 'size'));
  const actualFrom = isEmpty(mailSettings.domain)
    ? NOTIFICATIONS_EMAIL
    : `${mailSettings.invoicesFrom}@${mailSettings.domain}`;
  const actualReplyTo = isEmpty(mailSettings.domain)
    ? mailSettings.invoicesReplyTo
    : `${mailSettings.invoicesReplyTo}@${mailSettings.domain}`;
  const results = await Promise.allSettled(
    attachmentsChunks.map(attachments =>
      sendEmailWithAttachments({
        to: receivers,
        from: actualFrom,
        subject: mailSettings.invoicesSubject,
        text: mailSettings.invoicesBody,
        // all replyTo fields no longer required to be a hostname only if the domain is not added
        // if there is a domain the reply to should be the initial part of the email like it was previously (before the @).
        replyTo: mailSettings.invoicesReplyTo ? actualReplyTo : undefined,
        copyTo: mailSettings.invoicesSendCopyTo,
        attachments,
        args: {
          subscriberName,
          env: ENV_NAME,
          invoiceIds: attachments.map(({ invoiceId }) => invoiceId),
        },
      }),
    ),
  );

  const successful = [];
  const failed = [];

  results.forEach(({ status, reason }, index) => {
    const invoiceIds = attachmentsChunks[index].map(({ invoiceId }) => invoiceId);

    if (status === 'rejected') {
      ctx.logger.error(reason, `Failed to send invoices to ${receivers.join(',')}`);
      failed.push(...invoiceIds);
    } else {
      ctx.logger.info(
        `Successfully sent emails for invoices ${invoiceIds} to ${receivers.join(',')}`,
      );
      successful.push(...invoiceIds);
    }
  });

  try {
    await InvoiceEmail.updateStatusesOnSend({ failed, successful });
  } catch (error) {
    ctx.logger.error(error, 'Failed to update statuses after attempt to send emails');
  }
};

// Added ticketUrl to this check because the weight tickets were not getting attached to an invoice email
// if the order did not have any work order notes.
// R2-148 Steven 10/12/22
const mediaCheck = invoice => entity =>
  ((invoice.attachMediaFiles === InvoiceMailing.ATTACH_TICKET ||
    invoice.attachMediaFiles === InvoiceMailing.ATTACH_ALL_MEDIA) &&
    (entity.ticketFile || entity.ticketUrl)) ||
  (invoice.attachMediaFiles === InvoiceMailing.ATTACH_ALL_MEDIA && !isEmpty(entity.mediaFiles));

export const sendMultipleInvoices = async (ctx, { invoices, mailSettings }) => {
  if (!mailSettings || !mailSettings.invoicesFrom) {
    ctx.logger.info('Skipping sending invoices because mailing was not configured');
    return;
  }
  const sendWithAttachments = [];
  const sendWithoutAttachments = invoices.filter(invoice => {
    const invoiceAttachment =
      invoice?.orders?.some(mediaCheck(invoice)) ||
      invoice?.subscriptions?.some(mediaCheck(invoice));

    if (invoiceAttachment) {
      sendWithAttachments.push(invoice);
      return false;
    }

    return true;
  });

  const invoiceBatches = groupBy(sendWithoutAttachments, invoice =>
    map(invoice?.orders || invoice?.subscriptions, 'customerJobSite.id'),
  );

  await Promise.allSettled([
    ...Object.values(invoiceBatches).map(invoice =>
      sendInvoicesWithoutMediaFiles(ctx, {
        invoice,
        mailSettings,
      }),
    ),
    ...sendWithAttachments.map(invoice =>
      sendInvoiceWithMediaFiles(ctx, { invoice, mailSettings }),
    ),
  ]);
};

export const sendMultipleStatements = async (ctx, { statements, mailSettings }) => {
  const { StatementEmail } = ctx.state.models;
  const { subscriberName } = ctx.state.user;

  const statementsBatches = groupBy(statements, 'receivers');

  await Promise.allSettled(
    Object.entries(statementsBatches).map(async ([emailsStr, statementsBatch]) => {
      const receivers = emailsStr.split(',');

      const statementsFiles = [];

      for (const statement of statementsBatch) {
        const mediaFile = await loadMediaFile(
          {
            url: statement.pdfUrl,
            fileName: `Statement from ${statement.createdAt.toDateString()}.pdf`,
          },
          { convertToBase64: true },
        );

        statementsFiles.push(mediaFile);
      }

      statementsFiles.forEach((file, index) => {
        file.statementId = statementsBatch[index].id;
      });
      const attachmentsChunks = splitAttachments(sortBy(statementsFiles, 'size'));
      const actualFrom = isEmpty(mailSettings.domain)
        ? NOTIFICATIONS_EMAIL
        : `${mailSettings.statementsFrom}@${mailSettings.domain}`;
      const actualReplyTo = isEmpty(mailSettings.domain)
        ? mailSettings.statementsReplyTo
        : `${mailSettings.statementsReplyTo}@${mailSettings.domain}`;
      const results = await Promise.allSettled(
        attachmentsChunks.map(attachments =>
          sendEmailWithAttachments({
            to: receivers,
            from: actualFrom,
            subject: mailSettings.statementsSubject,
            text: mailSettings.statementsBody,
            attachments,
            replyTo: mailSettings.statementsReplyTo ? actualReplyTo : undefined,
            copyTo: mailSettings.statementsSendCopyTo,
            args: {
              subscriberName,
              env: ENV_NAME,
              statementIds: attachments.map(({ statementId }) => statementId),
            },
          }),
        ),
      );

      const successful = [];
      const failed = [];

      results.forEach(({ status, reason }, index) => {
        const statementIds = attachmentsChunks[index].map(({ statementId }) => statementId);

        if (status === 'rejected') {
          ctx.logger.error(reason, `Failed to send statement to ${receivers.join(',')}`);
          failed.push(...statementIds);
        } else {
          ctx.logger.info(
            `Successfully sent emails for statement ${statementIds} to ${receivers.join(',')}`,
          );
          successful.push(...statementIds);
        }
      });

      try {
        await StatementEmail.updateStatusesOnSend({ failed, successful });
      } catch (error) {
        ctx.logger.error(error, 'Failed to update statuses after attempt to send emails');
      }
    }),
  );
};

export const sendMultipleFinanceCharges = async (ctx, { financeCharges, mailSettings }) => {
  const { FinanceChargeEmail } = ctx.state.models;
  const { subscriberName } = ctx.state.user;

  const finChargesBatches = groupBy(financeCharges, 'receivers');

  await Promise.allSettled(
    Object.entries(finChargesBatches).map(async ([emailsStr, finChargesBatch]) => {
      const receivers = emailsStr.split(',');

      const finChargesFiles = [];

      for (const financeCharge of finChargesBatch) {
        const mediaFile = await loadMediaFile(
          {
            url: financeCharge.pdfUrl,
            fileName: `FinanceCharge from ${financeCharge.createdAt.toDateString()}.pdf`,
          },
          { convertToBase64: true },
        );

        finChargesFiles.push(mediaFile);
      }

      finChargesFiles.forEach((file, index) => {
        file.financeChargeId = financeCharges[index].id;
      });

      const attachmentsChunks = splitAttachments(sortBy(finChargesFiles, 'size'));
      const actualFrom = isEmpty(mailSettings.domain)
        ? NOTIFICATIONS_EMAIL
        : `${mailSettings.invoicesFrom}@${mailSettings.domain}`;
      const actualReplyTo = isEmpty(mailSettings.domain)
        ? mailSettings.invoicesReplyTo
        : `${mailSettings.invoicesReplyTo}@${mailSettings.domain}`;
      const results = await Promise.allSettled(
        attachmentsChunks.map(attachments =>
          sendEmailWithAttachments({
            to: receivers,
            from: actualFrom,
            subject: mailSettings.invoicesSubject,
            text: mailSettings.invoicesBody,
            replyTo: mailSettings.invoicesReplyTo ? actualReplyTo : undefined,
            copyTo: mailSettings.invoicesSendCopyTo,
            attachments,
            args: {
              subscriberName,
              env: ENV_NAME,
              financeChargeIds: attachments.map(({ financeChargeId }) => financeChargeId),
            },
          }),
        ),
      );

      const successful = [];
      const failed = [];

      results.forEach(({ status, reason }, index) => {
        const financeChargeIds = attachmentsChunks[index].map(
          ({ financeChargeId }) => financeChargeId,
        );

        if (status === 'rejected') {
          ctx.logger.error(reason, `Failed to send finance charge to ${receivers.join(',')}`);
          failed.push(...financeChargeIds);
        } else {
          ctx.logger.info(
            `Successfully sent emails for finance charge ${financeChargeIds} to ${receivers.join(
              ',',
            )}`,
          );
          successful.push(...financeChargeIds);
        }
      });

      try {
        await FinanceChargeEmail.updateStatusesOnSend({ failed, successful });
      } catch (error) {
        ctx.logger.error(error, 'Failed to update statuses after attempt to send emails');
      }
    }),
  );
};

/**
 * Send an email with the SendGrid API
 */
export const sendTextEmail = ({ to, subject, text = '', from, replyTo = from, args }) =>
  sgMail.send({
    from,
    to,
    subject: subject ?? '',
    text: text ?? '',
    replyTo: replyTo ?? undefined,
    customArgs: args,
    ...(disableSandbox || {
      mailSettings: {
        sandboxMode: {
          enable: true,
        },
      },
    }),
  });

export const sendFailedPaymentNotifications = async (ctx, { paymentIds }) => {
  const { Company, Payment } = ctx.models;

  const notificationEmails = await Company.getNotificationEmails(ctx.state.user.tenantId);

  if (isEmpty(notificationEmails)) {
    return;
  }

  const failed = await Payment.getAllForFailedNotification(paymentIds);

  const today = new Date();

  const messages = failed
    .map(payment => {
      const { customer } = payment;

      return `Deferred payment on order(s)
                ${payment.orders
                  .map(
                    order =>
                      `${new URL(
                        `/business-units/${customer.businessUnitId}/customer/${customer.id}/job-sites/${order.jobSiteId}/open-orders/${order.id}`,
                        FE_HOST,
                      ).toString()} of ${customer.name} and service date ${format(
                        order.serviceDate,
                        DATE_FORMAT,
                      )}`,
                  )
                  .join('\n')} was not captured on scheduled date ${format(today, DATE_FORMAT)}.`;
    })
    .join('\n\n');

  await Promise.all(
    notificationEmails.map(email =>
      sendTextEmail({
        to: email,
        subject: 'Failed deferred payments',
        from: NOTIFICATIONS_EMAIL,
        text: messages,
      }).catch(error => {
        ctx.logger.error(error, 'Failed to send failed deferred payment notification email');
      }),
    ),
  );
};
