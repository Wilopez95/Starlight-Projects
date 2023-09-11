import Joi from 'joi';
import map from 'lodash/fp/map.js';
import kebabCase from 'lodash/fp/kebabCase.js';

import { DISTRICT_TYPES } from '../../../consts/districtTypes.js';
import {
  TAX_CALCULATIONS,
  TAX_CALCULATION,
  TAX_APPLICATIONS,
  TAX_KINDS,
} from '../../../consts/taxDistricts.js';
const numeric = /^[0-9]+(\.[0-9]+)?$/;
const mapToKebabCase = map(kebabCase);

const id = Joi.number().integer().positive();

export const taxesKey = Joi.object().keys({
  key: Joi.string().valid(...mapToKebabCase(TAX_KINDS)),
});

export const taxes = Joi.object()
  .keys({
    businessLineId: id.required(),

    commercial: Joi.boolean().default(false),
    group: Joi.boolean().required(),
    value: Joi.when('group', {
      is: true,
      then: Joi.string().regex(numeric).required(),
    }).when('group', {
      is: false,
      then: Joi.valid(null),
    }),
    calculation: Joi.string()
      .valid(...TAX_CALCULATIONS)
      .required(),
    application: Joi.when('calculation', {
      is: TAX_CALCULATION.flat,
      then: Joi.string()
        .valid(...TAX_APPLICATIONS)
        .required(),
    }).when('calculation', {
      is: TAX_CALCULATION.percentage,
      then: Joi.valid(null),
    }),
    exclusions: Joi.when('group', {
      is: true,
      then: Joi.alternatives(
        Joi.array().items(id),
        Joi.object().keys({
          thresholds: Joi.array().items(id),
          lineItems: Joi.array().items(id),
        }),
      ),
    }),
    nonGroup: Joi.when('group', {
      is: false,
      then: Joi.alternatives(
        Joi.array().items(
          Joi.object().keys({
            id: id.required(),
            value: Joi.string().regex(numeric).required(),
          }),
        ),
        Joi.object().keys({
          thresholds: Joi.array().items(
            Joi.object().keys({
              id: id.required(),
              value: Joi.string().regex(numeric).required(),
            }),
          ),
          lineItems: Joi.array().items(
            Joi.object().keys({
              id: id.required(),
              value: Joi.string().regex(numeric).required(),
            }),
          ),
        }),
      ),
    }),
  })
  .required();

export const createDistrictData = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    description: Joi.string().required(),
    districtCode: Joi.string(),
    districtName: Joi.string(),
    districtType: Joi.string()
      .valid(...DISTRICT_TYPES)
      .required(),
    includeNationalInTaxableAmount: Joi.boolean().default(false),
    bbox: Joi.array().length(4).items(Joi.number().min(-180).max(180)),
    useGeneratedDescription: Joi.boolean().default(true),
    taxDescription: Joi.string().allow(null),
    taxesPerCustomerType: Joi.boolean().default(false),
  })
  .required();

export const editDistrictData = Joi.object().keys({
  active: Joi.boolean(),
  description: Joi.string(),
  districtCode: Joi.string(),
  districtName: Joi.string().allow(null),
  districtType: Joi.string().valid(...DISTRICT_TYPES),
  includeNationalInTaxableAmount: Joi.boolean().allow(null),
  bbox: Joi.array().length(4).items(Joi.number().min(-180).max(180)),
  useGeneratedDescription: Joi.boolean().allow(null),
  taxDescription: Joi.string().allow(null),
  taxesPerCustomerType: Joi.boolean().allow(null),
});

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const searchParams = Joi.object()
  .keys({
    query: Joi.alternatives().try(Joi.string().trim().max(50).required(), Joi.number()).required(),
    level: Joi.string()
      .valid(...DISTRICT_TYPES)
      .required(),
    region: Joi.string().valid('US', 'CA').required(),
  })
  .required();

export const qbSumParams = Joi.object()
  .keys({
    rangeFrom: Joi.date().required(),
    rangeTo: Joi.date().required(),
    integrationBuList: Joi.array().items(id).single(),
  })
  .required();

export const getRecyclingDistrictsParams = Joi.object()
  .keys({
    customerId: id.required(),
    jobSiteId: id.required().allow(null),
    originDistrictId: id.required().allow(null),
  })
  .required();

export const qbParams = Joi.object()
  .keys({
    joinHistoricalTableIds: Joi.boolean().default(false),
  })
  .required();
