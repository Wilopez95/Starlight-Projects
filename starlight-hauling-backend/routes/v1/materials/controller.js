import httpStatus from 'http-status';
import map from 'lodash/map.js';
import difference from 'lodash/difference.js';

import MaterialRepo from '../../../repos/material.js';
import MaterialEquipmentItemRepo from '../../../repos/materialEquipmentItem.js';

export const getMaterialById = async ctx => {
  const { id } = ctx.params;

  const materials = await MaterialRepo.getInstance(ctx.state).getAllPopulatedWithEquipmentItems({
    condition: { id },
    limit: 1,
  });

  ctx.sendObj(materials?.[0]);
};

export const getMaterials = async ctx => {
  const { activeOnly, manifestedOnly, equipmentItems, useForDump, useForLoad } =
    ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  activeOnly && (condition.active = true);
  manifestedOnly && (condition.manifested = true);
  useForDump && (condition.useForDump = true);
  useForLoad && (condition.useForLoad = true);

  const materials = await MaterialRepo.getInstance(ctx.state)[
    equipmentItems ? 'getAllPopulatedWithEquipmentItems' : 'getAll'
  ]({
    condition,
  });

  ctx.sendArray(materials);
};

export const getMaterialsByEquipmentItemId = async ctx => {
  const { equipmentItemId } = ctx.params;
  const { activeOnly } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.equipmentItemId = equipmentItemId;
  activeOnly && (condition.active = true);

  const materials = await MaterialRepo.getInstance(ctx.state).getAllByEquipmentItemId({
    condition,
  });

  ctx.sendArray(materials);
};

export const getHistoricalMaterial = async ctx => {
  const { materialId } = ctx.params;
  const condition = ctx.getRequestCondition();
  condition.originalId = materialId;

  const material = await MaterialRepo.getHistoricalInstance(ctx.state).getRecentBy({
    condition,
  });

  ctx.sendArray(material);
};

export const getMaterialsByIds = async ctx => {
  const { ids } = ctx.request.validated.body;

  const materials = await MaterialRepo.getInstance(ctx.state).getAllByIds({
    condition: {},
    ids,
    fields: ['*'],
  });

  ctx.sendArray(materials);
};

export const createMaterial = async ctx => {
  const data = ctx.request.validated.body;

  const newMaterial = await MaterialRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = Object.assign(newMaterial, { equipmentItemIds: data.equipmentItemIds });
};

export const editMaterial = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const equipmentItems = await MaterialEquipmentItemRepo.getInstance(ctx.state).getAll({
    condition: { materialId: id },
  });

  const data = ctx.request.validated.body;
  const newEquipmentItemIds = data.equipmentItemIds || [];
  const allEquipmentItemIds = map(equipmentItems, 'equipmentItemId');
  const addEquipmentItem = difference(newEquipmentItemIds, allEquipmentItemIds);
  const removeEquipmentItem = difference(allEquipmentItemIds, newEquipmentItemIds);

  const updatedMaterial = await MaterialRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    add: addEquipmentItem,
    remove: removeEquipmentItem,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = Object.assign(updatedMaterial, { equipmentItemIds: newEquipmentItemIds });
};

export const deleteMaterial = async ctx => {
  const { id } = ctx.params;

  await MaterialRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
