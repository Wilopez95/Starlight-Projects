import Joi from 'joi';

const id = Joi.number().integer().positive();
const truckType = {
  truckTypeId: id.required(),
  truckAverageCost: Joi.number().optional(),
  fuelCost: Joi.number().optional(),
  miscAverageCost: Joi.number().optional(),
  insuranceCost: Joi.number().optional(),
  maintenanceCost: Joi.number().optional(),
  depreciationCost: Joi.number().optional(),
};
const truck = {
  truckId: id.required(),
  truckAverageCost: Joi.number().optional(),
  fuelCost: Joi.number().optional(),
  miscAverageCost: Joi.number().optional(),
  insuranceCost: Joi.number().optional(),
  maintenanceCost: Joi.number().optional(),
  depreciationCost: Joi.number().optional(),
};

const driver = {
  driverId: id.required(),
  driverAverageCost: Joi.number().optional(),
};

export const costsGeneralData = Joi.object()
  .keys({
    businessUnitId: id.required().allow(null),
    date: Joi.date().required(),
    averageCost: Joi.number().required(),
    truckAverageCost: Joi.number().required(),
    driverAverageCost: Joi.number().required(),
    detailedCosts: Joi.boolean().required(),
    truckTypeCosts: Joi.array().items(Joi.object().keys(truckType).required()).allow(null),
    truckCosts: Joi.array().items(Joi.object().keys(truck).required()).allow(null),

    driverCosts: Joi.array().items(Joi.object().keys(driver).required()).allow(null),
  })
  .required();

export const costsGeneralUpdateData = Joi.object()
  .keys({
    averageCost: Joi.number().required(),
    truckAverageCost: Joi.number().required(),
    driverAverageCost: Joi.number().required(),
    detailedCosts: Joi.boolean().required(),
    truckTypeCosts: Joi.array()
      .items(
        Joi.object()
          .keys({ id, ...truckType })
          .required(),
      )
      .allow(null),
    truckCosts: Joi.array()
      .items(
        Joi.object()
          .keys({ id, ...truck })
          .required(),
      )
      .allow(null),

    driverCosts: Joi.array()
      .items(
        Joi.object()
          .keys({ id, ...driver })
          .required(),
      )
      .allow(null),
  })
  .required();

export const queryParams = Joi.object()
  .keys({
    date: Joi.date().optional(),

    activeOnly: Joi.boolean().optional(),
    detailed: Joi.boolean().optional(),

    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),

    buId: id.allow(null),
  })
  .required();
