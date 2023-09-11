import isEmpty from 'lodash/fp/isEmpty.js';
import { v4 as uuidv4 } from 'uuid';

import { storeFile, getUrl, deleteFileByUrl } from '../services/mediaStorage.js';

import ApiError from '../errors/ApiError.js';

import { MEDIA_STORAGE_KEY } from '../consts/mediaStorage.js';

import allowMimeUtil from '../utils/allowedMimeTypes.js';

const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('pdf', 'png', 'jpeg', 'webp');

const getKeyByFieldName = fieldName => {
  let key;
  if (fieldName === 'ticketFile') {
    key = MEDIA_STORAGE_KEY.weightTicket;
  } else if (fieldName.startsWith('mediaFile')) {
    key = MEDIA_STORAGE_KEY.workOrderMedia;
  } else if (fieldName.startsWith('manifest')) {
    key = MEDIA_STORAGE_KEY.workOrderManifest;
  }
  return key;
};

const uploadMediaFile = (subscriberName, file, workOrder) => {
  const isTicket = file.fieldName === 'ticketFile';

  const key = getKeyByFieldName(file.fieldName);

  let extension;
  let isPdf = false;
  if (file.type.startsWith('application/pdf')) {
    extension = 'pdf';
    isPdf = true;
  } else if (file.type.startsWith('image/png')) {
    extension = 'png';
  } else if (file.type.startsWith('image/webp')) {
    extension = 'webp';
  } else {
    extension = 'jpeg';
  }

  // hack to force cache invalidation for cloudinary
  const timestamp = Date.now();
  const fileName = isTicket
    ? `Weight-ticket-for-WO-${workOrder.woNumber}_${timestamp}.${extension}`
    : file.name;
  const meta = {
    fileName,
    isPdf,
    type: file.type,
    woNumber: workOrder.woNumber,
  };

  return {
    url: getUrl(subscriberName, key, meta),
    promise: storeFile(subscriberName, key, meta, file),
  };
};

export const uploadWorkOrderMediaFiles = async (placeOrderCase = false, ctx, next) => {
  const { schemaName, name, email } = ctx.state.user;
  const { files } = ctx.request;
  if (isEmpty(files)) {
    await next();
    return;
  }

  if (!files.every(isMimeTypeAllowed)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }

  const promises = [];
  const urls = [];

  // create order case
  if (!ctx.request.body.workOrder) {
    ctx.request.body.workOrder = {};
  }
  const {
    body: { workOrder },
  } = ctx.request;

  if (!workOrder.mediaFiles) {
    workOrder.mediaFiles = [];
  }
  if (!workOrder.manifestFiles) {
    workOrder.manifestFiles = [];
  }

  files.forEach(file => {
    const isTicket = file.fieldName === 'ticketFile';
    const isMediaFile = file.fieldName.startsWith('mediaFile');
    const isManifestFile = file.fieldName.startsWith('manifest');

    const { promise, url } = uploadMediaFile(schemaName, file, workOrder);
    promises.push(promise);
    urls.push(url);

    if (isTicket) {
      workOrder.ticketUrl = url;
      workOrder.ticketFromCsr = true;
      workOrder.ticketDate = new Date();
      workOrder.ticketAuthor = name || email;
    } else if (isMediaFile) {
      workOrder.mediaFiles.push({
        url,
        timestamp: new Date(),
        author: name || email,
        fileName: file.name,
      });
    } else if (isManifestFile) {
      workOrder.manifestFiles.push({
        url,
        csrName: name || true,
      });
    }
  });

  // place order case
  if (workOrder && placeOrderCase && ctx.request.validated.body?.orders?.length) {
    ctx.request.validated.body?.orders.forEach(item => (item.workOrder = workOrder));
  }

  const deleteMediaFilesOnFailure = () => {
    urls.forEach(url =>
      deleteFileByUrl(url).catch(error => ctx.logger.error(error, `Could not remove file ${url}`)),
    );
  };

  try {
    await Promise.all(promises);
  } catch (error) {
    deleteMediaFilesOnFailure();
    throw error;
  }

  await next();
};

export const uploadSubscriptionOrderFiles = async (ctx, next) => {
  const { schemaName, firstName, lastName } = ctx.state.user;
  const { files, body } = ctx.request;

  if (isEmpty(files)) {
    await next();
    return;
  }

  if (!files.every(isMimeTypeAllowed)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }

  const promises = [];
  const urls = [];

  const key = MEDIA_STORAGE_KEY.subscriptionOrderMedia;

  if (!body.mediaFiles) {
    body.mediaFiles = [];
  }
  files.forEach(file => {
    const meta = {
      fileName: file.name,
      type: file.type,
      orderId: ctx.params.id,
    };

    const url = getUrl(schemaName, key, meta);
    promises.push(storeFile(schemaName, key, meta, file));
    urls.push();
    body.mediaFiles.push({
      id: uuidv4(),
      url,
      author: `${firstName} ${lastName}`,
      fileName: file.name,
    });
  });

  const deleteMediaFilesOnFailure = () => {
    urls.forEach(url =>
      deleteFileByUrl(url).catch(error => ctx.logger.error(error, `Could not remove file ${url}`)),
    );
  };

  try {
    await Promise.all(promises);
  } catch (error) {
    deleteMediaFilesOnFailure();
    throw error;
  }

  await next();
};
