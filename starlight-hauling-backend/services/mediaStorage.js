import { createReadStream } from 'fs';
import { Readable } from 'stream';

import { logger } from '../utils/logger.js';

import { S3_AS_MEDIA_STORAGE } from '../config.js';
import { MEDIA_STORAGE_KEY } from '../consts/mediaStorage.js';
import * as s3 from './s3.js';
import * as cloudinary from './cloudinary.js';

const mediaStorageService =
  !S3_AS_MEDIA_STORAGE || S3_AS_MEDIA_STORAGE === 'false' ? cloudinary : s3;

const getFilePath = (subscriber, key, meta) => {
  let imagePath;
  switch (key) {
    case MEDIA_STORAGE_KEY.contractsMedia: {
      imagePath = mediaStorageService.getContractsMediaPath(
        subscriber,
        meta.tableName,
        meta.mediaId,
        meta.fileName,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.subscriptionOrderMedia: {
      imagePath = mediaStorageService.getSubscriptionOrdersMediaPath(
        subscriber,
        meta.orderId,
        meta.fileName,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.equipmentItemImage: {
      imagePath = mediaStorageService.getEquipmentItemImageFilePath(
        subscriber,
        meta.equipmentItemId,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.weightTicket:
    case MEDIA_STORAGE_KEY.workOrderManifest:
    case MEDIA_STORAGE_KEY.workOrderMedia: {
      imagePath = mediaStorageService.getWorkOrderMediaFilePath(
        subscriber,
        meta.woNumber,
        meta.fileName,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.companyLogo: {
      imagePath = mediaStorageService.getCompanyImageFilePath(subscriber, meta.companyId);
      break;
    }
    case MEDIA_STORAGE_KEY.businessUnitLogo: {
      imagePath = mediaStorageService.getBusinessUnitsImageFilePath(
        subscriber,
        meta.businessUnitId,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.customerTaxExemptionImage: {
      imagePath = mediaStorageService.getCustomerExemptionImageFilePath(
        subscriber,
        meta.customerId,
        meta.taxDistrictId,
        meta.fileName,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.customerJobSiteTaxExemptionImage: {
      imagePath = mediaStorageService.getCustomerJobSiteExemptionImageFilePath(
        subscriber,
        meta.customerJobSiteId,
        meta.taxDistrictId,
        meta.fileName,
      );
      break;
    }
    case MEDIA_STORAGE_KEY.driverMedia: {
      imagePath = mediaStorageService.getDriverImageFilePath(subscriber, meta.driverId);
      break;
    }
    default:
      break;
  }

  if (!imagePath) {
    throw new TypeError(`Unknown storage key: ${key}`);
  }

  return imagePath;
};

const fileToStream = file => createReadStream(file.path);

export const storeFile = async (subscriber, key, meta, file) => {
  try {
    const path = getFilePath(subscriber, key, meta);

    const fileUrl = await mediaStorageService.uploadFile(
      file instanceof Readable ? file : fileToStream(file),
      path,
      meta,
    );

    return fileUrl;
  } catch (error) {
    logger.error(error, 'Failed to store file');

    throw error;
  }
};

export const getUrl = (subscriber, key, meta) => {
  const path = getFilePath(subscriber, key, meta);

  return mediaStorageService.getDirectUrl(path, meta);
};

export const deleteFile = (subscriber, key, meta) => {
  const path = getFilePath(subscriber, key, meta);

  return mediaStorageService.deleteFile(path);
};

export const getSignedUrl = url => mediaStorageService.getSignedUrl(url);

export const deleteFileByUrl = mediaStorageService.deleteFileByUrl.bind(mediaStorageService);
