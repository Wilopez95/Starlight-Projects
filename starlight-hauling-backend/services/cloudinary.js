import cloudinary from 'cloudinary';

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOULD_NAME,
  CLOUDINARY_PROJECT_FOLDER,
} from '../config.js';
const cloudinaryV2 = cloudinary.v2;

const EQUIPMENT_ITEM_FOLDER_NAME = 'containers';
const WORK_ORDERS_MEDIA_FOLDER = 'work_orders_media';
const COMPANY_FOLDER_NAME = 'companies';
const BUSINESS_UNIT_FOLDER_NAME = 'business_unit';
const CUSTOMER_EXEMPTION_IMAGES_FOLDER = 'customer_tax_exemptions';
const CUSTOMER_JOB_SITE_EXEMPTION_IMAGES_FOLDER = 'customer_job_site_tax_exemptions';
const CONTRACTS_MEDIA_IMAGES_FOLDER = 'contracts_media';
const DRIVER_MEDIA_IMAGES_FOLDER = 'driver_media';

cloudinaryV2.config({
  cloud_name: CLOUDINARY_CLOULD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export const getContractsMediaPath = (subscriberName, tableName, mediaId, fileName) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${CONTRACTS_MEDIA_IMAGES_FOLDER}/${subscriberName}/${tableName}/${mediaId}/${fileName}`;

export const getSubscriptionOrdersMediaPath = (subscriberName, orderId, fileName) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${subscriberName}/${orderId}/${fileName}`;

export const getEquipmentItemImageFilePath = (subscriber, equipmentItemId) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${EQUIPMENT_ITEM_FOLDER_NAME}/${subscriber}/${equipmentItemId}`;
export const getWorkOrderMediaFilePath = (subscriber, woNumber, fileName) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${WORK_ORDERS_MEDIA_FOLDER}/${subscriber}/${woNumber}/${fileName}`;
export const getCompanyImageFilePath = (subscriber, companyId) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${COMPANY_FOLDER_NAME}/${subscriber}/${companyId}`;
export const getCustomerExemptionImageFilePath = (
  subscriberName,
  customerId,
  taxDistrictId,
  fileName,
) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${CUSTOMER_EXEMPTION_IMAGES_FOLDER}/${subscriberName}/${customerId}${
    taxDistrictId ? `/${taxDistrictId}` : ''
  }/${fileName}`;
export const getCustomerJobSiteExemptionImageFilePath = (
  subscriberName,
  customerJobSiteId,
  taxDistrictId,
  fileName,
) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${CUSTOMER_JOB_SITE_EXEMPTION_IMAGES_FOLDER}/${subscriberName}/${customerJobSiteId}${
    taxDistrictId ? `/${taxDistrictId}` : ''
  }/${fileName}`;

export const getBusinessUnitsImageFilePath = (subscriberName, businessUnitId) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${BUSINESS_UNIT_FOLDER_NAME}/${subscriberName}/${businessUnitId}`;

export const getDriverImageFilePath = (subscriber, driverId) =>
  `${CLOUDINARY_PROJECT_FOLDER}/${DRIVER_MEDIA_IMAGES_FOLDER}/${subscriber}/${driverId}`;

const getFileName = (filePath, isPdf = false) => {
  const i = filePath.lastIndexOf('.');
  return isPdf || i === -1 ? filePath : filePath.slice(0, i);
};

export const uploadFile = (fileStream, filePath, meta) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinaryV2.uploader.upload_stream(
      {
        public_id: getFileName(filePath),
        resource_type: 'auto',
        type: 'upload',
        access_mode: 'public',
        // context: `caption=${caption}|alt=${alt}`,
        overwrite: true,
        async: meta?.async ?? false,
        disable_promises: true,
        invalidate: true,
      },
      (error, response) => (error ? reject(error) : resolve(response?.url)),
    );

    fileStream.pipe(uploadStream, { end: true });
  });

export const deleteFile = filePath =>
  new Promise((resolve, reject) => {
    cloudinaryV2.uploader.destroy(filePath, error => (error ? reject(error) : resolve()));
  });

export const deleteFileByUrl = url => deleteFile(new URL(url).pathname.slice(1));

export const getSignedUrl = url => {
  const key = new URL(url).pathname.split('/').slice(5).join('/');
  const pubId = getFileName(key);
  const ext = key.substring(key.lastIndexOf('.') + 1);

  return cloudinaryV2.utils.private_download_url(pubId, ext);
};

export const getDirectUrl = (path, meta) => cloudinaryV2.url(getFileName(path, meta?.isPdf));
