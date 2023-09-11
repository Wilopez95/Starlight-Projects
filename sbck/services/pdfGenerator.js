import { createRequire } from 'module';
import { readFile } from 'fs/promises';

import React from 'react';
import ReactDOM from 'react-dom/server.js';
import { InvoiceBuilder, ReceiptBuilder, SettlementBuilder } from '@starlightpro/invoice-builder';
import isEmpty from 'lodash/isEmpty.js';

import ApplicationError from '../errors/ApplicationError.js';
import { logger } from '../utils/logger.js';
import { NOTIFICATIONS_EMAIL } from '../config.js';

import { MimeType } from '../consts/mimeType.js';
import { PaymentType } from '../consts/paymentTypes.js';
import { PaymentStatus } from '../consts/paymentStatus.js';
import {
  uploadFile,
  getInvoicePdfPath,
  getInvoicePreviewPath,
  getReceiptPdfPath,
  getReceiptPreviewPath,
  getSettlementPdfPath,
} from './s3.js';
import { renderHtmlToPdf } from './pdfRenderer.js';
import { sendEmailWithAttachments } from './email.js';

const cssPath = createRequire(import.meta.url).resolve(
  '@starlightpro/invoice-builder/build/styles.css',
);
let css;

const renderPdf = async (props, component, disclaimerText) => {
  if (!css) {
    css = await readFile(cssPath);
  }

  const htmlStream = ReactDOM.renderToStaticNodeStream(React.createElement(component, props));

  let htmlText = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>${css}</style></head><body>`;

  for await (const chunk of htmlStream) {
    htmlText += chunk;
  }

  if (disclaimerText) {
    htmlText += `<br><br><div>${disclaimerText}</div>`;
  }

  htmlText += '</body></html>';

  const pdfBuffer = await renderHtmlToPdf(htmlText);

  return pdfBuffer;
};

const generateReceipt = async (
  subscriberName,
  currentDate,
  paymentDetails,
  mailSettings,
  sendReceipt = false,
) => {
  const {
    customer: { invoiceEmails },
    order: { id: orderId },
    payment: { id: paymentId },
  } = paymentDetails;

  const { pdf, preview } = await renderPdf(
    paymentDetails,
    ReceiptBuilder,
    mailSettings.receiptsDisclaimerText,
  );

  if (!pdf || !preview) {
    logger.error('Failed to build receipt PDF');
    throw ApplicationError.unknown('Failed to save receipt');
  }

  let pdfUrl;
  let previewUrl;
  try {
    // TODO: use bulk uploads instead of uploading files one-by-one.
    [pdfUrl, previewUrl] = await Promise.all([
      uploadFile(pdf, getReceiptPdfPath(subscriberName, orderId, paymentId), MimeType.PDF),
      uploadFile(preview, getReceiptPreviewPath(subscriberName, orderId, paymentId), MimeType.PNG),
    ]);
  } catch (error) {
    // If saving fails, there is no way to recover and sending an email does not make sense.
    logger.error(error, 'Failed to save invoice PDF to S3. Aborting');
    throw ApplicationError.unknown('Failed to save invoice');
  }

  if (sendReceipt && !mailSettings.adminEmail) {
    logger.error('Failed to retrieve company mail settings');
  }

  if (sendReceipt && mailSettings && mailSettings.receiptsFrom && invoiceEmails) {
    const attachments = [
      {
        type: 'application/pdf',
        content: pdf.toString('base64'),
        filename: `Your receipt from ${currentDate.toDateString()}.pdf`,
      },
    ];
    // if the domain settings are empty, we are sending the emails from the default email otherwise we are sending them from the domain email
    // the default email in production is notify@starlightsoftware.io set by `NOTIFICATIONS_EMAIL`
    const actualFrom = isEmpty(mailSettings?.domain)
      ? NOTIFICATIONS_EMAIL
      : `${mailSettings.receiptsFrom}@${mailSettings.domain}`;
    const actualReplyTo = isEmpty(mailSettings.domain)
      ? mailSettings.receiptsReplyTo
      : `${mailSettings.receiptsReplyTo}@${mailSettings.domain}`;
    try {
      await sendEmailWithAttachments({
        to: invoiceEmails,
        from: actualFrom,
        subject: mailSettings.receiptsSubject,
        text: mailSettings.receiptsBody,
        replyTo: mailSettings.receiptsReplyTo ? actualReplyTo : undefined,
        copyTo: mailSettings.receiptsSendCopyTo,
        attachments,
      });
      logger.info(`Successfully sent receipt to ${invoiceEmails.join(',')}`);
    } catch (error) {
      logger.error(error, `Failed to send receipt for customer ${invoiceEmails.join(',')}`);
    }
  }

  return {
    orderId,
    paymentId,
    receiptPdfUrl: pdfUrl,
    receiptPreviewUrl: previewUrl,
  };
};

export const generateSettlement = async ({ subscriberName, settlementId, settlementInput }) => {
  const { pdf } = await renderPdf(settlementInput, SettlementBuilder);

  if (!pdf) {
    logger.error('Failed to build settlement PDF');
    throw ApplicationError.unknown('Failed to save settlement');
  }

  let pdfUrl;
  try {
    pdfUrl = await uploadFile(
      pdf,
      getSettlementPdfPath(subscriberName, settlementId),
      MimeType.PDF,
    );
  } catch (error) {
    logger.error(error, 'Failed to save settlement PDF to S3. Aborting');
    throw ApplicationError.unknown('Failed to save settlement');
  }

  return pdfUrl;
};

export const generateInvoice = async (subscriberName, invoiceInput, company) => {
  invoiceInput.orders.forEach(order => {
    order.serviceDate = new Date(order.serviceDate);
    order.services = order.lineItems.map(item => ({
      ...item,
      total: Number(item.total),
      price: Number(item.price),
    }));

    order.beforeTaxesTotal = Number(order.beforeTaxesTotal);
    order.grandTotal = Number(order.grandTotal);
  });
  invoiceInput.invoiceNumber = invoiceInput.id;
  invoiceInput.payments = Number(invoiceInput.total) - Number(invoiceInput.balance);

  invoiceInput.customer.billingAddress = {
    addressLine1: invoiceInput.customer.billingAddressLine1,
    addressLine2: invoiceInput.customer.billingAddressLine2,
    city: invoiceInput.customer.billingCity,
    zip: invoiceInput.customer.billingZip,
    state: invoiceInput.customer.billingState,
  };

  if (company) {
    Object.assign(invoiceInput, {
      logoUrl: company.logoUrl,
      physicalAddress: {
        addressLine1: company.physicalAddressLine1,
        addressLine2: company.physicalAddressLine2,
        city: company.physicalCity,
        state: company.physicalState,
        zip: company.physicalZip,
      },
    });
  }

  const { pdf, preview } = await renderPdf(
    invoiceInput,
    InvoiceBuilder,
    company?.invoicesDisclaimerText,
  );

  if (!pdf || !preview) {
    logger.error('Failed to build invoice PDF');
    throw ApplicationError.unknown('Failed to save invoice');
  }

  let pdfUrl;
  let previewUrl;
  try {
    // TODO: use bulk uploads instead of uploading files one-by-one.
    [pdfUrl, previewUrl] = await Promise.all([
      uploadFile(pdf, getInvoicePdfPath(subscriberName, invoiceInput.invoiceNumber), MimeType.PDF),
      uploadFile(
        preview,
        getInvoicePreviewPath(subscriberName, invoiceInput.invoiceNumber),
        MimeType.PNG,
      ),
    ]);
  } catch (error) {
    // If saving fails, there is no way to recover and sending an email does not make sense.
    logger.error(error, 'Failed to save invoice PDF to S3. Aborting');
    throw ApplicationError.unknown('Failed to save invoice');
  }

  return { id: invoiceInput.id, urls: { pdfUrl, previewUrl } };
};

export const generateMultipleInvoices = async (subscriberName, invoices, disclaimerText) => {
  const results = await Promise.all(
    invoices.map(invoice => generateInvoice(subscriberName, invoice, disclaimerText)),
  );

  return results;
};

export const generatePrepaidReceipts = async (
  { models: { Company, Payment }, user: { tenantId, subscriberName } },
  { orderIds, customer },
  { log, userId },
) => {
  const customerAddress = {
    addressLine1: customer.billingAddressLine1,
    addressLine2: customer.billingAddressLine2,
    city: customer.billingCity,
    state: customer.billingState,
    zip: customer.billingZip,
  };

  const companyData = await Company.getByTenantId(tenantId);
  if (!companyData) {
    return logger.error('Missing company data (e.g logo, mail settings)');
  }

  const payments = await Payment.getPaymentsReceiptData(orderIds);

  const physicalAddress = {
    addressLine1: companyData.physicalAddressLine1,
    addressLine2: companyData.physicalAddressLine2,
    city: companyData.physicalCity,
    state: companyData.physicalState,
    zip: companyData.physicalZip,
  };

  Promise.all(
    payments
      .filter(
        ({ status }) => status === PaymentStatus.CAPTURED || status === PaymentStatus.DEFERRED,
      )
      .flatMap(payment =>
        payment?.orders.map(order => {
          let paymentIdentifier, paymentRetRef, cardType;

          if (payment.paymentType === PaymentType.CREDIT_CARD && payment.creditCard) {
            paymentIdentifier = payment.creditCard.cardNumberLastDigits;
            cardType = payment.creditCard.cardType;
            paymentRetRef = payment?.ccRetref;
          } else if (payment.paymentType === PaymentType.CHECK) {
            paymentIdentifier = payment.checkNumber;
          }

          const data = {
            logoUrl: companyData.logoUrl,
            physicalAddress,
            customer: { ...customer, billingAddress: customerAddress },
            order: {
              ...order,
              services: order.lineItems.map(lineItem => ({
                ...lineItem,
                price: Number(lineItem.price),
                quantity: Number(lineItem.quantity),
              })),
              surchargesTotal: Number(order.surchargesTotal),
              beforeTaxesTotal: Number(order.beforeTaxesTotal),
              grandTotal: Number(order.grandTotal),
            },
            payment: {
              ...payment,
              amount: Number(order.assignedAmount),
              paymentMethod: payment.paymentType,
              paymentIdentifier,
              paymentRetRef,
              cardType,
            },
          };

          return generateReceipt(
            subscriberName,
            new Date(),
            data,
            companyData,
            payment.sendReceipt,
          );
        }),
      ),
  )
    .catch(error => {
      logger.error('Failed to generate PDF for prepaid receipts');
      throw error;
    })
    .then(async generatedReceipts => {
      await Promise.allSettled(
        generatedReceipts.map(receiptData => Payment.addReceiptUrls(receiptData, { log, userId })),
      );
    });
  return true;
};
