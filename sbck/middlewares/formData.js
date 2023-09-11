import formidable from 'formidable';
import httpStatus from 'http-status';

import ApiError from '../errors/ApplicationError.js';
import { INVALID_REQUEST } from '../errors/codes.js';

const parserError = new ApiError(
  'Could not parse multipart/form-data',
  INVALID_REQUEST,
  undefined,
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

    if (fields.payload) {
      try {
        ctx.request.body = JSON.parse(fields.payload);
      } catch (e) {
        ctx.logger.error(e, 'Error while parsing JSON payload');
        onError(parserError);
        return;
      }
    }

    ctx.request.files = Object.entries(files).flatMap(([fieldName, fileOrArray]) => {
      if (Array.isArray(fileOrArray)) {
        return fileOrArray.map((file, index) => {
          file.fieldName = `${fieldName}[${index}]`;
          return file;
        });
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

  await new Promise((resolve, reject) => parseFormDataHandler(ctx, resolve, reject));

  await next();
};
