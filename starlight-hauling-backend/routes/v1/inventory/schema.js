import Joi from 'joi';

const equipmentItemInventoryAdd = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
  totalQuantity: Joi.number().integer().positive().required().allow(0),
  onRepairQuantity: Joi.number().integer().positive().required().allow(0),
  onJobSiteQuantity: Joi.number().integer().positive().required().allow(0),
});

const equipmentItemInventoryUpdate = Joi.object().keys({
  id: Joi.number().integer().positive().required(),
  totalQuantity: Joi.number().integer().positive().optional().allow(0),
  onRepairQuantity: Joi.number().integer().positive().optional().allow(0),
  onJobSiteQuantity: Joi.number().integer().positive().optional().allow(0),
});

export const inventoryDataAdd = Joi.object()
  .keys({
    equipmentItems: Joi.array().items(equipmentItemInventoryAdd.required()).required(),
  })
  .required();

export const inventoryDataUpdate = Joi.object()
  .keys({
    equipmentItems: Joi.array().items(equipmentItemInventoryUpdate.required()).required(),
  })
  .required();

export const getInventoryDataQueryParams = Joi.object().keys({
  businessLineId: Joi.number().integer().positive(),
});
