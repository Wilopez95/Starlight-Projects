import * as crypto from 'crypto';

import { MID_ENCRYPTION_KEY } from '../config.js';

const algorithm = 'aes-256-gcm';
const IV_LENGTH = 16;

export const encryptMidPassword = password =>
  new Promise(resolve => {
    const encryptionKey = crypto.createSecretKey(Buffer.from(MID_ENCRYPTION_KEY, 'base64'));

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

    resolve(Buffer.concat([iv, cipher.getAuthTag(), encryptedBuffer]).toString('base64'));
  });

export const decryptMidPassword = password =>
  new Promise(resolve => {
    const encryptionKey = crypto.createSecretKey(Buffer.from(MID_ENCRYPTION_KEY, 'base64'));

    const buffer = Buffer.from(password, 'base64');

    const iv = buffer.slice(0, IV_LENGTH);
    const authTag = buffer.slice(IV_LENGTH, 32);
    const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let result = decipher.update(buffer.slice(32), undefined, 'utf-8');
    result += decipher.final('utf-8');

    resolve(result);
  });
