import path from 'path';
import aws from 'aws-sdk';
import multer from 'multer';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_BUCKET } from '../../config.js';
import multerS3 from './s3Storage.js';

export const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

// // Initialize multers3 with our s3 config and other options
export const upload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKET,
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(
        null,
        `trash/uploads/${format(new Date(), 'MM-dd-yyyy')}/${nanoid()}${path
          .extname(file.originalname)
          .toLowerCase()}`,
      );
    },
  }),
});

export const base64Upload = async base64Image => {
  const regEx = /^data:image\/(\w+);base64,(.+)/;
  const processedImage = regEx.exec(base64Image);

  if (!processedImage.length) {
    throw Error('Invalid base64 image data provided');
  }

  const [, extension, rawData] = processedImage;

  const base64Data = Buffer.from(rawData, 'base64');

  const key = `trash/uploads/${format(
    new Date(),
    'MM-dd-yyyy',
  )}/${uuidv4()}/${nanoid()}.${extension}`;

  const params = {
    Bucket: AWS_BUCKET,
    Key: key,
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/${extension}`,
  };

  const { Location } = await s3.upload(params).promise();

  return Location;
};
