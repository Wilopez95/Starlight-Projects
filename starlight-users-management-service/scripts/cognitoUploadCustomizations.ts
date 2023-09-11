import { promises as fsPromises } from 'fs';
import path from 'path';

import { CognitoIdentityServiceProvider } from 'aws-sdk';
import dotenv from 'dotenv';
import { logger } from '../src/services/logger';

dotenv.config();

const cssPath = path.resolve(__dirname, '../cognito/custom-css.css');
const imagePath = path.resolve(__dirname, '../cognito/header.png');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_COGNITO_REGION;

const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
const clientId = process.env.AWS_COGNITO_CLIENT_ID;

if (!userPoolId || !clientId) {
  throw new TypeError('userPoolId and clientId must be provided');
}

let params: CognitoIdentityServiceProvider.ClientConfiguration = {
  region,
  apiVersion: '2016-04-18',
};

// Use variables if present, otherwise, assume role or global credentials are available.
if (accessKeyId && secretAccessKey) {
  params = {
    accessKeyId,
    secretAccessKey,
    ...params,
  };
}

const cognitoClient = new CognitoIdentityServiceProvider(params);

const uploadCustomizations = async (css: string, image: Buffer) => {
  await cognitoClient
    .setUICustomization({
      UserPoolId: userPoolId,
      ClientId: clientId,
      CSS: css,
      ImageFile: image,
    })
    .promise();
};

const main = async () => {
  let css: string;
  let image: Buffer;
  try {
    css = await fsPromises.readFile(cssPath, 'utf8');
    image = await fsPromises.readFile(imagePath);
  } catch (error) {
    logger.error('Error reading file');
    throw error;
  }

  try {
    await uploadCustomizations(css, image);
  } catch (error) {
    logger.error('Error uploading customizations to Cognito');
    throw error;
  }
};

main().catch((error) => {
  logger.error(error, 'Failed to upload Cognito customizations');
});
