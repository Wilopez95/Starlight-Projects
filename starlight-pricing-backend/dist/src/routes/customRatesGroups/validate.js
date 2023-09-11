"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupsSchema = exports.createCustomRatesGroupsSchema = void 0;
const Joi = require("joi");
let VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];
let THRESHOLD_SETTINGS = [
    "global",
    "canSize",
    "material",
    "canSizeAndMaterial",
];
let id = Joi.number().integer().positive();
exports.createCustomRatesGroupsSchema = Joi.object()
    .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    description: Joi.string().required(),
    customerGroupId: id.optional(),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    active: Joi.boolean().required(),
    validDays: Joi.array()
        .items(Joi.number()
        .integer()
        .valid(...VALID_DAYS)
        .required())
        .min(1)
        .required(),
    overweightSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .required(),
    usageDaysSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .required(),
    demurrageSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .required(),
    dumpSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .required(),
    loadSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .required(),
    startDate: Joi.date().allow(null).required(),
    endDate: Joi.date().allow(null).optional(),
    createdAt: Joi.date().allow(null).optional(),
    updatedAt: Joi.date().allow(null).optional(),
    spUsed: Joi.boolean().optional(),
    nonServiceHours: Joi.boolean().optional(),
    serviceAreaIds: Joi.array()
        .items(Joi.number()
        .integer()
        .optional())
        .min(1)
        .optional(),
})
    .required();
exports.updateCustomRatesGroupsSchema = Joi.object()
    .keys({
    businessUnitId: id.optional(),
    businessLineId: id.optional(),
    description: Joi.string().optional(),
    customerGroupId: id.optional(),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    active: Joi.boolean().optional(),
    validDays: Joi.array()
        .items(Joi.number()
        .integer()
        .valid(...VALID_DAYS)
        .required())
        .min(1)
        .optional(),
    overweightSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .optional(),
    usageDaysSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .optional(),
    demurrageSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .optional(),
    dumpSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .optional(),
    loadSetting: Joi.string()
        .valid(...THRESHOLD_SETTINGS)
        .optional(),
    startDate: Joi.date().allow(null).optional(),
    endDate: Joi.date().allow(null).optional(),
    createdAt: Joi.date().allow(null).optional(),
    updatedAt: Joi.date().allow(null).optional(),
    spUsed: Joi.boolean().optional(),
    nonServiceHours: Joi.boolean().optional(),
    serviceAreaId: Joi.array().items(id.required()).optional(),
    serviceAreaIds: Joi.array()
        .items(Joi.number()
        .integer()
        .optional())
        .min(1)
        .optional(),
})
    .required();
//# sourceMappingURL=validate.js.map