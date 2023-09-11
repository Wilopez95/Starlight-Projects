import AWS from 'aws-sdk';

import { AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET } from '../config.js';

const EQUIPMENT_ITEM_IMAGES_FOLDER = 'containers';
const WORK_ORDERS_MEDIA_FOLDER = 'work_orders_media';
const COMPANY_IMAGES_FOLDER = 'companies';
const BUSINESS_UNIT_IMAGES_FOLDER = 'business_unit';
const CUSTOMER_EXEMPTION_IMAGES_FOLDER = 'customer_tax_exemptions';
const CUSTOMER_JOB_SITE_EXEMPTION_IMAGES_FOLDER = 'customer_job_site_tax_exemptions';
const CONTRACTS_MEDIA_IMAGES_FOLDER = 'contracts_media';
const SUBSCRIPTION_ORDERS_MEDIA_FOLDER = 'subscriptions_orders_media';
const DRIVER_IMAGES_FOLDER = 'drivers_media';
const TERMS_AND_CONDITIONS = 'terms_and_conditions';

export const getSubscriptionOrdersMediaPath = (subscriberName, orderId, fileName) =>
  `${SUBSCRIPTION_ORDERS_MEDIA_FOLDER}/${subscriberName}/${orderId}/${fileName}`;

export const getContractsMediaPath = (subscriberName, tableName, mediaId, fileName) =>
  `${CONTRACTS_MEDIA_IMAGES_FOLDER}/${subscriberName}/${tableName}/${mediaId}/${fileName}`;

export const getEquipmentItemImageFilePath = (subscriberName, equipmentItemId) =>
  `${EQUIPMENT_ITEM_IMAGES_FOLDER}/${subscriberName}/${equipmentItemId}`;

export const getWorkOrderMediaFilePath = (subscriberName, woNumber, fileName) =>
  `${WORK_ORDERS_MEDIA_FOLDER}/${subscriberName}/${woNumber}/${fileName}`;

export const getCompanyImageFilePath = (subscriberName, companyId) =>
  `${COMPANY_IMAGES_FOLDER}/${subscriberName}/${companyId}`;

export const getBusinessUnitsImageFilePath = (subscriberName, businessUnitId) =>
  `${BUSINESS_UNIT_IMAGES_FOLDER}/${subscriberName}/${businessUnitId}`;

export const getDriverImageFilePath = (subscriberName, driverId) =>
  `${DRIVER_IMAGES_FOLDER}/${subscriberName}/${driverId}`;

export const getCustomerExemptionImageFilePath = (
  subscriberName,
  customerId,
  taxDistrictId,
  fileName,
) =>
  `${CUSTOMER_EXEMPTION_IMAGES_FOLDER}/${subscriberName}/${customerId}${
    taxDistrictId ? `/${taxDistrictId}` : ''
  }/${fileName}`;

export const getCustomerJobSiteExemptionImageFilePath = (
  subscriberName,
  customerJobSiteId,
  taxDistrictId,
  fileName,
) =>
  `${CUSTOMER_JOB_SITE_EXEMPTION_IMAGES_FOLDER}/${subscriberName}/${customerJobSiteId}${
    taxDistrictId ? `/${taxDistrictId}` : ''
  }/${fileName}`;

export const getTermsAndConditionPath = (BU_Name, tenantName, customerId) =>
  `${TERMS_AND_CONDITIONS}/${tenantName}/${BU_Name}/Terms_and_Conditions_${BU_Name}_${customerId}.pdf`;

export const s3 = new AWS.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
});

const uploadFileToS3 = async (key, body, type, cacheable = true, isPrivate = false) => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: type,
    CacheControl: cacheable ? undefined : 'no-store',
  };

  // use isPrivate = true in case of sensitive info (i.e. receipts)
  if (!isPrivate) {
    params.ACL = 'public-read';
  }

  await s3.upload(params).promise();

  return key;
};

export const getDirectUrl = key => `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

export const uploadFile = async (file, filePath, meta) => {
  await uploadFileToS3(filePath, file, meta.type, meta.cacheable);

  return getDirectUrl(filePath);
};

const deleteFileFromS3 = async key => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

export const deleteFile = deleteFileFromS3;

export const deleteFileByUrl = url => {
  const key = new URL(url).pathname.slice(1);
  return deleteFileFromS3(key);
};

export const getSignedUrl = async url => {
  const key = new URL(url).pathname.slice(1);
  const params = { Bucket: AWS_S3_BUCKET, Key: key };

  const signedUrl = await s3.getSignedUrlPromise('getObject', params);
  return signedUrl;
};
