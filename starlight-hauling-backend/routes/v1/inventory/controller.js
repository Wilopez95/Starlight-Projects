import httpStatus from 'http-status';

import InventoryRepository from '../../../repos/inventory/inventory.js';

export const getInventory = async ctx => {
  const { businessUnitId } = ctx.params;
  const { businessLineId } = ctx.request.validated.query;

  const result = await InventoryRepository.getInstance(ctx.state).getAllByBusinessUnitId(
    businessUnitId,
    { active: true, businessLineId },
  );

  ctx.sendArray(result);
};

export const registerInventory = async ctx => {
  const { businessUnitId } = ctx.params;
  const { equipmentItems } = ctx.request.validated.body;

  const result = await InventoryRepository.getInstance(ctx.state).registerEquipment(
    businessUnitId,
    equipmentItems,
  );

  ctx.status = httpStatus.CREATED;
  ctx.body = result;
};

export const updateInventory = async ctx => {
  const { businessUnitId } = ctx.params;
  const { equipmentItems } = ctx.request.validated.body;

  const result = await InventoryRepository.getInstance(ctx.state).updateEquipmentInventoryBy({
    condition: { businessUnitId },
    data: equipmentItems,
  });

  ctx.sendArray(result);
};
