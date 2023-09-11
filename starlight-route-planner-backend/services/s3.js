import Aws from 'aws-sdk';

import { AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_BUCKET } from '../config.js';
import { getFilePathFromUrl } from '../utils/urlUtil.js';
import { WEIGHT_TICKETS_MEDIA_FOLDER } from '../consts/mediaStorage.js';

const s3 = new Aws.S3({
  accessKeyId: AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
});

const uploadFileToS3 = async ({ key, body, type }) => {
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

export const getWeightTicketMediaFilePath = ({ schema, mediaId, filename }) =>
  `${WEIGHT_TICKETS_MEDIA_FOLDER}/${schema}/${mediaId}/${filename}`;

export const getDirectUrl = key => `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

export const uploadFile = async ({ fileStream, filePath, type }) => {
  await uploadFileToS3({ key: filePath, body: fileStream, type });

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
  const key = getFilePathFromUrl(url);
  return deleteFile(key);
};

export const deleteFilesByUrls = async urls => {
  const params = {
    Bucket: AWS_S3_BUCKET,
    Delete: {
      Objects: urls.map(url => ({
        Key: getFilePathFromUrl(url),
      })),
    },
  };

  await s3.deleteObject(params).promise();
};
