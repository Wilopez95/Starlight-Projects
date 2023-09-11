import fs from 'fs';
import stream from 'stream';

import { S3_AS_MEDIA_STORAGE } from '../config.js';
import { MEDIA_STORAGE_KEY } from '../consts/mediaStorage.js';
import * as cloudinary from './cloudinary.js';
import * as s3 from './s3.js';

const mediaStorageService =
  !S3_AS_MEDIA_STORAGE || S3_AS_MEDIA_STORAGE === 'false' ? cloudinary : s3;

const getFilePath = ({ schema, key, meta }) => {
  let imagePath;

  switch (key) {
    case MEDIA_STORAGE_KEY.weightTicketMedia: {
      imagePath = mediaStorageService.getWeightTicketMediaFilePath({
        schema,
        mediaId: meta.mediaId,
        filename: meta.filename,
      });
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

const fileToStream = file => fs.createReadStream(file.path);

export const storeFile = async ({ schema, key, meta, file }) => {
  const filePath = getFilePath({ schema, key, meta });
  const fileStream = file instanceof stream.Readable ? file : fileToStream(file);
  const fileUrl = await mediaStorageService.uploadFile({ fileStream, filePath, meta });

  return fileUrl;
};

export const getUrl = ({ schema, key, meta }) => {
  const path = getFilePath({ schema, key, meta });

  return mediaStorageService.getDirectUrl(path);
};

export const deleteFile = ({ schema, key, meta }) => {
  const path = getFilePath({ schema, key, meta });

  return mediaStorageService.deleteFile(path);
};

export const deleteFilesByUrls = urls => mediaStorageService.deleteFilesByUrls(urls);

export const getSignedUrl = url => mediaStorageService.getSignedUrl(url);

export const deleteFileByUrl = mediaStorageService.deleteFileByUrl.bind(mediaStorageService);
