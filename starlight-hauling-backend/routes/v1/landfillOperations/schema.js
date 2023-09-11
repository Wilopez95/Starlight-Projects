import Joi from 'joi';
import { LANDFILL_OPERATIONS_SORTING_ATTRIBUTES } from '../../../consts/loSortingAttributes.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';

const id = Joi.number().integer().positive();

const filters = {
  filterByDateFrom: Joi.string(),
  filterByDateTo: Joi.string(),
  filterByNetWeightFrom: Joi.number(),
  filterByNetWeightTo: Joi.number().greater(Joi.ref('filterByNetWeightFrom')),
  filterByTimeInFrom: Joi.string(),
  filterByTimeInTo: Joi.string(),
  filterByTimeOutFrom: Joi.string(),
  filterByTimeOutTo: Joi.string(),
};

const searchQuery = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim().allow(null),
  Joi.number(),
);

export const paginated = Joi.object()
  .keys({
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    sortBy: Joi.string()
      .valid(...LANDFILL_OPERATIONS_SORTING_ATTRIBUTES)
      .optional(),

    sortOrder: Joi.string()
      .valid(...SORT_ORDERS)
      .optional(),
    query: searchQuery,
    ...filters,
  })
  .required();

export const countParams = Joi.object().keys({
  query: searchQuery,
  ...filters,
});

export const recyclingOrderQuery = Joi.object()
  .keys({
    recyclingTenantName: Joi.string().required(),
    businessUnitId: id.required(),
  })
  .required();

export const landfillInputData = Joi.object()
  .keys({
    recyclingTenantName: Joi.string().required(),
    haulingOrderId: id.required(),
    recyclingOrderId: id.required(),
  })
  .required();

export const landfillData = Joi.object()
  .keys({
    orderId: id, // tech need

    mappedMaterialId: id.allow(null),

    truck: Joi.string().allow(null),
    purchaseOrder: Joi.string().allow(null),
    origin: Joi.string().allow(null),

    arrivalDate: Joi.date(),
    timeIn: Joi.string(),
    arrivalUseTare: Joi.boolean(),
    weightIn: Joi.number().required(),

    departureDate: Joi.date(),
    timeOut: Joi.string(),
    departureUseTare: Joi.boolean(),
    weightOut: Joi.number().required(),
    truckTare: Joi.when('departureUseTare', {
      is: true,
      then: Joi.number().required(),
    }),
    canTare: Joi.when('departureUseTare', {
      is: true,
      then: Joi.number().required(),
    }),

    materials: Joi.array().items(
      Joi.object().keys({
        id: id.required(),
        description: Joi.string().required(),
        code: Joi.string().allow(null).required(),
        value: Joi.number().required(),
      }),
    ),
    miscellaneousItems: Joi.array()
      .items(
        Joi.object().keys({
          id: id.required(),
          description: Joi.string().required(),
          code: Joi.string().allow(null).required(),
          quantity: Joi.number().required(),
        }),
      )
      .allow(null),

    ticketNumber: Joi.string().required(),
  })
  .required();
