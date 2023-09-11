import Aws from 'aws-sdk';

import { AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET } from '../config.js';

const s3 = new Aws.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
});

const INVOICES_FOLDER = 'invoices';
const RECEIPTS_FOLDER = 'receipts';
const SETTLEMENTS_FOLDER = 'settlements';
const STATEMENTS_FOLDER = 'statements';
const FINANCE_CHARGES_FOLDER = 'financeCharges';
const BANK_DEPOSITS_FOLDER = 'bankDeposits';
const MATERIAL_REPORTS_FOLDER = 'materialReports';
const ROUTE_SHEET_FOLDER = 'routeSheet';

export const getInvoicePdfPath = (subscriberName, invoiceId) =>
  `${INVOICES_FOLDER}/${subscriberName}/${invoiceId}.pdf`;
export const getInvoicePreviewPath = (subscriberName, invoiceId) =>
  `${INVOICES_FOLDER}/${subscriberName}/${invoiceId}_preview.png`;
export const getReceiptPdfPath = (subscriberName, orderId, paymentId) =>
  `${RECEIPTS_FOLDER}/${subscriberName}/${orderId}_${paymentId}.pdf`;
export const getReceiptPreviewPath = (subscriberName, orderId, paymentId) =>
  `${RECEIPTS_FOLDER}/${subscriberName}/${orderId}_${paymentId}_preview.png`;
export const getSettlementPdfPath = (subscriberName, settlementId) =>
  `${SETTLEMENTS_FOLDER}/${subscriberName}/${settlementId}.pdf`;
export const getStatementPdfPath = (subscriberName, statementId) =>
  `${STATEMENTS_FOLDER}/${subscriberName}/${statementId}.pdf`;
export const getFinanceChargePdfPath = (subscriberName, financeChargeId) =>
  `${FINANCE_CHARGES_FOLDER}/${subscriberName}/${financeChargeId}.pdf`;
export const getBankDepositPdfPath = (subscriberName, bankDepositId) =>
  `${BANK_DEPOSITS_FOLDER}/${subscriberName}/${bankDepositId}.pdf`;
export const getRouteSheetPdfPath = (subscriberName, dailyRouteId) =>
  `${ROUTE_SHEET_FOLDER}/${subscriberName}/${dailyRouteId}.pdf`;
export const getMaterialsReportPdfPath = (subscriberName, customerId, timestamp) =>
  `${MATERIAL_REPORTS_FOLDER}/${subscriberName}/customer_${customerId}_${timestamp}.pdf`;

const uploadFileToS3 = async (key, body, type) => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: type,
    ACL: 'public-read',
  };

  await s3.upload(params).promise();

  return key;
};

export const getDirectUrl = key => `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

export const uploadFile = async (file, filePath, type) => {
  await uploadFileToS3(filePath, file, type);

  return getDirectUrl(filePath);
};

const deleteFile = async key => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

export const deleteFileByUrl = url => {
  const key = new URL(url).pathname.slice(1);
  return deleteFile(key);
};
