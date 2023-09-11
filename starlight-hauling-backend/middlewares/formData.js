import formidable from 'formidable';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';

import ApiError from '../errors/ApiError.js';
import { INVALID_REQUEST } from '../errors/codes.js';
import { checkMaxFileSize } from '../utils/checkMaxFileSize.js';
import { storeFile } from '../services/mediaStorage.js';

import { parseFileUpload } from './fileUploadStream.js';

const parserError = new ApiError(
  'Could not parse multipart/form-data',
  INVALID_REQUEST,
  httpStatus.BAD_REQUEST,
);

const parseFormDataHandler = (ctx, onComplete, onError) => {
  const form = formidable({ multiples: true });

  form.parse(ctx.req, (error, fields, files) => {
    if (error) {
      ctx.logger.error(error);
      onError(parserError);
      return;
    }

    try {
      if (fields.payload) {
        ctx.request.body = JSON.parse(fields.payload);
      } else if (fields) {
        ctx.request.body = fields;
      }
    } catch (e) {
      ctx.logger.error(e, 'Error while parsing JSON payload');
      onError(parserError);
      return;
    }

    ctx.request.files = Object.entries(files).flatMap(([fieldName, fileOrArray]) => {
      if (Array.isArray(fileOrArray)) {
        return fileOrArray.map((file, index) => {
          if (!checkMaxFileSize(file)) {
            onError(new ApiError(`File size limit error: ${file.name}`));
          }
          file.fieldName = `${fieldName}[${index}]`;
          return file;
        });
      }
      if (!checkMaxFileSize(fileOrArray)) {
        onError(new ApiError(`File size limit error: ${fileOrArray.name}`));
      }
      fileOrArray.fieldName = fieldName;
      return fileOrArray;
    });

    onComplete();
  });
};

export const parseFormData = async (ctx, next) => {
  if (!ctx.is('multipart/form-data')) {
    ctx.request.files = [];
    await next();
    return;
  }

  // TODO create tech debt to unify different approaches
  if (ctx.req.headers['file-upload-method'] && ctx.req.headers['file-upload-method'] === 'stream') {
    const uploadFileCb = data =>
      storeFile(
        data.schemaName,
        data.storageKey,
        { tableName: data.folder, mediaId: uuidv4(), fileName: data.filename },
        data.stream,
      );
    const getFileStreamCb = data => ({ filename: data.filename, stream: data.stream });
    const cb = !ctx.req.headers['ignore-upload'] ? uploadFileCb : getFileStreamCb;

    ctx.request.files = await parseFileUpload(ctx, cb);
  } else {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve, reject) => parseFormDataHandler(ctx, resolve, reject));
  }

  await next();
};
