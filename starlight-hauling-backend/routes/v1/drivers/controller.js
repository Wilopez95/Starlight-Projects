import httpStatus from 'http-status';

import pick from 'lodash/fp/pick.js';
import DriverRepository from '../../../repos/driver.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import allowMimeUtil from '../../../utils/allowedMimeTypes.js';
import ApiError from '../../../errors/ApiError.js';
import { INVALID_REQUEST } from '../../../errors/codes.js';
import { deleteFileByUrl, storeFile } from '../../../services/mediaStorage.js';
import { MEDIA_STORAGE_KEY } from '../../../consts/mediaStorage.js';

const ITEMS_PER_PAGE = 25;
const getFiltersData = pick(['filterByBusinessUnit', 'filterByTruck']);
const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('png', 'jpeg', 'webp');

const imageFieldDuplicatedError = new ApiError(
  'Both photoUrl and image fields were found. Only one can be preset at a time.',
  INVALID_REQUEST,
  httpStatus.UNPROCESSABLE_ENTITY,
);

const handleRollbackError = (ctx, error) => {
  ctx.logger.error(error, 'Failed to rollback driver creation');
};

const handleFileRemovalError = (ctx, error) => {
  ctx.logger.error(error, 'Failed to remove file');
};

export const getDrivers = async ctx => {
  const {
    activeOnly = false,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortOrder = SORT_ORDER.desc,
    sortBy,
    query,
  } = ctx.request.query;

  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
    query,
  };

  const drivers = await DriverRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortOrder,
    sortBy,
    condition,
  });

  ctx.sendArray(drivers);
};

export const getAllDrivers = async ctx => {
  const { activeOnly = false, email, query, driverIds } = ctx.request.validated.query;
  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
    query,
  };
  email && (condition.email = email);
  // The request it makes looks like /api/v1/trash-api/drivers?...driverIds=1%2C1%2C1%2C1
  // and results in [1,1,1,1,1] which is stupid.
  // Would be looking up the same driver multiple times
  driverIds && (condition.ids = Array.from(new Set(driverIds)));

  const drivers = await DriverRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    sortOrder: SORT_ORDER.asc,
    sortBy: 'description',
    condition,
  });

  ctx.sendArray(drivers);
};

export const getDriverById = async ctx => {
  const { id } = ctx.params;

  const truckType = await DriverRepository.getInstance(ctx.state).getById({ id });
  ctx.sendArray(truckType);
};

export const createDriver = async ctx => {
  const { schemaName } = ctx.state.user;
  const { files } = ctx.request;
  const [file] = files;

  if (file && !isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }

  if (file && ctx.request.validated.body.photoUrl) {
    throw imageFieldDuplicatedError;
  }

  const data = ctx.request.validated.body;
  const repo = DriverRepository.getInstance(ctx.state);

  let newTruck = await repo.createOne({
    data,
    log: true,
  });

  if (file) {
    const { id } = newTruck;
    let photoUrl;

    try {
      photoUrl = await storeFile(
        schemaName,
        MEDIA_STORAGE_KEY.driverMedia,
        { driverId: id, type: file.type, cacheable: false },
        file,
      );
    } catch (error) {
      ctx.logger.error(error);

      repo.deleteBy({ condition: { id }, log: true }).catch(handleRollbackError.bind(null, ctx));

      throw ApiError.fileUploadFailed();
    }

    try {
      newTruck = await repo.updateBy({
        condition: { id },
        data: { photoUrl },
        log: true,
      });
    } catch (error) {
      ctx.logger.error(error);

      repo.deleteBy({ id, log: true }).catch(handleRollbackError.bind(null, ctx));

      deleteFileByUrl(photoUrl).catch(handleFileRemovalError.bind(null, ctx));

      throw ApiError.fileUploadFailed(`Failed to update photoUrl of driver ${id}`);
    }
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newTruck;
};

export const editDriver = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;
  const {
    user: { schemaName },
  } = ctx.state;
  const { files } = ctx.request;
  const [file] = files;

  if (file && !isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  } else if (file && ctx.request.validated.body.photoUrl) {
    throw imageFieldDuplicatedError;
  }
  let photoUrl;

  if (file) {
    try {
      photoUrl = await storeFile(
        schemaName,
        MEDIA_STORAGE_KEY.driverMedia,
        { driverId: id, type: file.type, cacheable: false },
        file,
      );
    } catch (error) {
      ctx.logger.error(error.message);
      throw ApiError.fileUploadFailed();
    }

    data.photoUrl = photoUrl;
  } else if (!file && !data.photoUrl) {
    data.photoUrl = null;
  }

  let editedTruckType;
  try {
    editedTruckType = await DriverRepository.getInstance(ctx.state).updateOne({
      data,
      id,
      log: true,
    });
  } catch (error) {
    if (photoUrl) {
      deleteFileByUrl(photoUrl).catch(handleFileRemovalError.bind(null, ctx));
    }
    throw error;
  }

  ctx.status = httpStatus.OK;
  ctx.body = editedTruckType;
};

export const updateDriverAppInfo = async ctx => {
  const { id } = ctx.params;

  const driverRepo = DriverRepository.getInstance(ctx.state);
  await driverRepo.updateBy({
    condition: { id },
    data: ctx.request.validated.body,
  });
  const updatedDriver = await driverRepo.getById({ id });

  ctx.status = httpStatus.OK;
  ctx.body = updatedDriver;
};
