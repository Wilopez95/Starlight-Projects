"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecurrentOrderTemplateOrder = exports.bulkCreateRecurrentOrderTemplateOrder = exports.createRecurrentOrderTemplateOrder = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const date = Joi.date();
exports.createRecurrentOrderTemplateOrder = Joi.object().keys({
    orderId: number.required(),
    recurrentOrderTemplateId: number.required(),
    createdAt: date.optional().allow(null),
    updatedAt: date.optional().allow(null),
});
exports.bulkCreateRecurrentOrderTemplateOrder = Joi.object().keys({
    data: Joi.array().items(exports.createRecurrentOrderTemplateOrder),
});
exports.updateRecurrentOrderTemplateOrder = Joi.object().keys({
    orderId: number.optional(),
    recurrentOrderTemplateId: number.optional(),
    createdAt: date.optional().allow(null),
    updatedAt: date.optional().allow(null),
});
//# sourceMappingURL=validate.js.map