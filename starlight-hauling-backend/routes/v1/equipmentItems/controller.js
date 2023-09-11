import httpStatus from 'http-status';

import EquipmentItemRepository from '../../../repos/equipmentItem.js';
import InventoryRepository from '../../../repos/inventory/inventory.js';

import { storeFile, deleteFileByUrl, deleteFile } from '../../../services/mediaStorage.js';

import ApiError from '../../../errors/ApiError.js';
import { INVALID_REQUEST } from '../../../errors/codes.js';

import { MEDIA_STORAGE_KEY } from '../../../consts/mediaStorage.js';
import allowMimeUtil from '../../../utils/allowedMimeTypes.js';

const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('png', 'jpeg', 'webp');

// This is called if we try to rollback equipment creation because file upload fails,
// but then equipment creation fails too. I think we should be negligent about these failures
// and probably deal with stale equipment later.
const handleRollbackError = (ctx, error) => {
  ctx.logger.error(error, 'Failed to rollback equipment creation');
};

const handleFileRemovalError = (ctx, error) => {
  ctx.logger.error(error, 'Failed to remove file');
};

const imageFieldDuplicatedError = new ApiError(
  'imageUrl and image found',
  INVALID_REQUEST,
  httpStatus.UNPROCESSABLE_ENTITY,
  'Both imageUrl and image fields found. Only one can be preset at a time.',
);

export const getEquipmentItemById = async ctx => {
  const { id } = ctx.params;

  const equipmentItem = await EquipmentItemRepository.getInstance(ctx.state).getById({
    id,
  });

  ctx.sendObj(equipmentItem);
};

export const getHistoricalEquipmentItemById = async ctx => {
  const { equipmentItemId } = ctx.params;
  const condition = ctx.getRequestCondition();
  condition.originalId = equipmentItemId;

  const equipmentItem = await EquipmentItemRepository.getHistoricalInstance(ctx.state).getRecentBy({
    condition,
  });

  ctx.sendObj(equipmentItem);
};

export const getEquipmentItems = async ctx => {
  const condition = ctx.getRequestCondition();
  ctx.request.query.activeOnly && (condition.active = true);

  const equipmentItems = await EquipmentItemRepository.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(equipmentItems);
};

export const createEquipmentItem = async ctx => {
  const { schemaName } = ctx.state.user;
  const { files } = ctx.request;
  const [file] = files;

  if (file && !isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }

  if (file && ctx.request.body.imageUrl !== undefined) {
    throw imageFieldDuplicatedError;
  }

  const repo = EquipmentItemRepository.getInstance(ctx.state);
  const inventoryRepo = InventoryRepository.getInstance(ctx.state);

  // It looks like it would be better to hold a transaction here, but it's actually okay:
  // we shouldn't be holding it for that long and wait for the file to finish uploading.
  // So let's just delete the equipment if it all fails.
  let newEquipmentItem = await repo.createOne({ data: ctx.request.validated.body, log: true });
  const inventory = await inventoryRepo.registerEquipmentForAllBusinessUnits(newEquipmentItem);

  if (file) {
    const { id } = newEquipmentItem;
    let imageUrl;

    try {
      imageUrl = await storeFile(
        schemaName,
        MEDIA_STORAGE_KEY.equipmentItemImage,
        { equipmentItemId: id, type: file.type, cacheable: false },
        file,
      );
    } catch (error) {
      ctx.logger.error(error);

      repo.deleteBy({ condition: { id }, log: true }).catch(handleRollbackError.bind(null, ctx));

      if (inventory) {
        await inventoryRepo.deleteByIds({ ids: inventory.map(item => item.id) });
      }

      throw ApiError.fileUploadFailed();
    }

    try {
      newEquipmentItem = await repo.updateBy({
        condition: { id },
        data: { imageUrl },
        log: true,
      });
    } catch (error) {
      ctx.logger.error(error);

      repo.deleteBy({ id, log: true }).catch(handleRollbackError.bind(null, ctx));
      await inventoryRepo.deleteByIds({ ids: inventory.map(item => item.id) });

      deleteFileByUrl(imageUrl).catch(handleFileRemovalError.bind(null, ctx));

      throw new ApiError(`Failed to update imageUrl of equipment ${id}`);
    }
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newEquipmentItem;
};

export const editEquipmentItem = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { files } = ctx.request;
  const [file] = files;

  if (file && !isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  } else if (file && ctx.request.body.imageUrl !== undefined) {
    throw imageFieldDuplicatedError;
  }

  const data = ctx.request.validated.body;
  let imageUrl;

  if (file) {
    try {
      // No need to remove the old image because for the current equipment,
      // the image key will stay the same.
      imageUrl = await storeFile(
        schemaName,
        MEDIA_STORAGE_KEY.equipmentItemImage,
        { equipmentItemId: id, type: file.type, cacheable: false },
        file,
      );
    } catch (error) {
      ctx.logger.error(error.message);
      throw ApiError.fileUploadFailed();
    }

    data.imageUrl = imageUrl;
  } else if (!file && !data.imageUrl) {
    data.imageUrl = null;
  }

  let updatedEquipment;
  try {
    updatedEquipment = await EquipmentItemRepository.getInstance(ctx.state).updateBy({
      condition: { id },
      concurrentData,
      data,
      log: true,
    });
  } catch (error) {
    if (imageUrl) {
      deleteFileByUrl(imageUrl).catch(handleFileRemovalError.bind(null, ctx));
    }
    throw error;
  }

  ctx.sendObj(updatedEquipment);
};

export const deleteEquipmentItem = async ctx => {
  const { schemaName } = ctx.state.user;
  const { id } = ctx.params;

  await EquipmentItemRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  deleteFile(schemaName, MEDIA_STORAGE_KEY.equipmentItemImage, { equipmentItemId: id }).catch(
    handleFileRemovalError.bind(null, ctx),
  );

  ctx.status = httpStatus.NO_CONTENT;
};
