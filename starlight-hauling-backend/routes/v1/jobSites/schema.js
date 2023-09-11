import Joi from 'joi';
import { zipSchema } from '../schema.js';
import { JOB_SITES_SORTING_ATTRIBUTES } from '../../../consts/jobSitesSotringAttributes.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { GEOMETRY_TYPE } from '../../../consts/GeometryTypes.js';

const id = Joi.number().integer().positive();
const searchQuery = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim().allow(null),
  Joi.number(),
);

const filters = {
  filterByAlleyPlacement: Joi.boolean(),
  filterByCabOver: Joi.boolean(),
  filterByTaxDistrict: Joi.array().single().items(id.required()).max(5).unique(),
  filterByServiceArea: Joi.array().single().items(id.required()).max(5).unique(),
  filterByZipCodes: Joi.array()
    .single()
    .items(Joi.alternatives(Joi.string().min(5), Joi.number()))
    .max(5),
  filterByState: Joi.alternatives(Joi.string(), Joi.number()),
  filterByCity: Joi.alternatives(Joi.string(), Joi.number()),
  filterByCoordinates: Joi.array().items(Joi.number()).length(2),
  filterByName: Joi.string(),
};

export const paginated = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  query: searchQuery,

  sortBy: Joi.string()
    .valid(...JOB_SITES_SORTING_ATTRIBUTES)
    .optional(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
  ...filters,
});

export const countParams = Joi.object().keys({
  query: searchQuery,
  ...filters,
});

const polygonSchema = Joi.array()
  .items(Joi.array().items(Joi.array().items(Joi.number()).length(2).required()).required())
  .required();

export const geofenceSchema = Joi.object().keys({
  type: Joi.string().valid(GEOMETRY_TYPE.polygon, GEOMETRY_TYPE.radius).required(),
  radius: Joi.alternatives().conditional('type', [
    { is: GEOMETRY_TYPE.radius, then: Joi.number().required(), otherwise: Joi.forbidden() },
  ]),
  coordinates: Joi.alternatives().conditional('type', [
    {
      is: GEOMETRY_TYPE.polygon,
      then: polygonSchema,
      otherwise: Joi.forbidden(),
    },
  ]),
});

export const jobSiteData = Joi.object()
  .keys({
    name: Joi.string(),
    address: Joi.object()
      .keys({
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().empty('').allow(null).default(null),
        city: Joi.string().required(),
        state: Joi.string().required(),
      })
      .append(zipSchema)
      .required(),

    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),

    location: Joi.object()
      .keys({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      })
      .required(),
    geofence: geofenceSchema.optional().allow(null),
    comment: Joi.string().optional().allow(null),
  })
  .required();

export const searchParams = Joi.object()
  .keys({
    address: Joi.alternatives().try(Joi.string().trim().min(3).required(), Joi.number()).required(),
  })
  .required();

export const linkToParams = Joi.object().keys({
  linkTo: Joi.number().integer().positive().allow(null),
});

export const getByIdQuery = Joi.object().keys({
  includeInactiveTaxDistricts: Joi.boolean().default(false),
});

export const taxDistricts = Joi.object().keys({
  taxDistrictIds: Joi.array().items(Joi.number().integer().positive()).required(),
});
