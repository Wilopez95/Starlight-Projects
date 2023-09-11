"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateSubscriptionOrder = exports.createSubscriptionWorkOrder = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();
exports.createSubscriptionWorkOrder = Joi.object()
    .keys({
    subscriptionOrderId: number.required(),
    status: string.required(),
    cancellationReason: string.optional().allow(null),
    newEquipmentNumber: string.optional(),
    jobSiteNote: string.optional().allow(null),
    jobSiteContactTextOnly: string.optional().allow(null),
    bestTimeToComeFrom: string.optional().allow(null),
    bestTimeToComeTo: string.optional().allow(null),
    someoneOnSite: boolean.optional(),
    highPriority: boolean.optional(),
    canReschedule: boolean.optional(),
    equipmentNumber: string.optional().allow(null),
    truckNumber: string.optional().allow(null),
    departedAt: date.optional().allow(null),
    arrivedAt: date.optional().allow(null),
    startedAt: date.optional().allow(null),
    canceledAt: date.optional().allow(null),
    completed_at: date.optional().allow(null),
    serviceDate: date.optional(),
    assignedRoute: string.optional().allow(null),
    driverName: string.optional().allow(null),
    instructionsForDriver: string.optional().allow(null),
    commentFromDriver: string.optional().allow(null),
    earlyPick: boolean.optional(),
    toRoll: boolean.optional(),
    signatureRequired: boolean.optional(),
    alleyPlacement: boolean.optional(),
    poRequired: boolean.optional(),
    permitRequired: boolean.optional(),
    serviceDayOfWeekRequiredByCustomer: boolean.optional().allow(null),
    billableLineItemsTotal: number.optional().allow(0),
    thirdPartyHaulerId: number.optional().allow(null),
    blockingReason: string.optional().allow(null),
    weight: number.optional().allow(0),
    droppedEquipmentItem: string.optional().allow(null),
    pickedUpEquipmentItem: string.optional().allow(null),
    sequenceId: string.optional().allow(null),
    purchaseOrderId: number.optional().allow(null),
})
    .required();
exports.bulkCreateSubscriptionOrder = Joi.object().keys({
    data: Joi.array().items(exports.createSubscriptionWorkOrder),
});
//# sourceMappingURL=validate.js.map