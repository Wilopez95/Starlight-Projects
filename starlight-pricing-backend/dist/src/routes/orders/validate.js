"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateByIdsSchema = exports.updateOrderSchema = exports.createOrderSchema = void 0;
const Joi = require("joi");
const validate_1 = require("../lineItems/validate");
let id = Joi.number().integer().positive();
exports.createOrderSchema = Joi.object()
    .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    orderRequestId: id.optional().allow(null),
    draft: Joi.boolean().optional(),
    isRollOff: Joi.boolean().required(),
    //contractorId: id.required(),
    status: Joi.string().required(),
    serviceAreaId: id.optional().allow(null),
    customRatesGroupId: id.optional().allow(null),
    jobSiteId: id.required(),
    jobSite2Id: id.optional().allow(null),
    customerId: id.required(),
    customerGroupId: id.optional().allow(null),
    originalCustomerId: id.optional().allow(null),
    customerJobSiteId: id.required(),
    projectId: id.optional().allow(null),
    billableServiceId: id.optional().allow(null),
    materialId: id.optional(),
    equipmentItemId: id.optional(),
    thirdPartyHaulerId: id.optional().allow(null),
    promoId: id.optional().allow(null),
    materialProfileId: id.optional().allow(null),
    globalRatesServicesId: id.optional().allow(null),
    customRatesGroupServicesId: id.optional().allow(null),
    billableServicePrice: Joi.number().optional(),
    billableServiceTotal: Joi.number().optional(),
    billableLineItemsTotal: Joi.number().optional().allow(null),
    thresholdsTotal: Joi.number().optional().allow(null),
    beforeTaxesTotal: Joi.number().optional().allow(null),
    onAccountTotal: Joi.number().required(),
    initialGrandTotal: Joi.number().required(),
    grandTotal: Joi.number().required(),
    serviceDate: Joi.date().required(),
    jobSiteContactId: id.optional().allow(null),
    jobSiteNote: Joi.string().optional().allow(null),
    callOnWayPhoneNumber: Joi.string().optional().allow(null),
    textOnWayPhoneNumber: Joi.string().optional().allow(null),
    callOnWayPhoneNumberId: id.optional().allow(null),
    textOnWayPhoneNumberId: id.optional().allow(null),
    driverInstructions: Joi.string().optional().allow(null),
    permitId: id.optional().allow(null),
    bestTimeToComeFrom: Joi.string().optional().allow(null),
    bestTimeToComeTo: Joi.string().optional().allow(null),
    someoneOnSite: Joi.boolean().optional().allow(null),
    toRoll: Joi.boolean().optional().allow(null),
    highPriority: Joi.boolean().optional().allow(null),
    earlyPick: Joi.boolean().optional().allow(null),
    alleyPlacement: Joi.boolean().optional().allow(null),
    cabOver: Joi.boolean().required(),
    orderContactId: id.optional(),
    disposalSiteId: id.optional().allow(null),
    workOrderId: id.optional(),
    invoiceNotes: Joi.string().optional().allow(null),
    cancellationReasonType: Joi.string().optional().allow(null),
    cancellationComment: Joi.string().optional().allow(null),
    unapprovedComment: Joi.string().optional().allow(null),
    unfinalizedComment: Joi.string().optional().allow(null),
    rescheduleComment: Joi.string().optional().allow(null),
    droppedEquipmentItem: Joi.string().optional().allow(null),
    csrEmail: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    invoiceDate: Joi.date().optional().allow(null),
    notifyDayBefore: Joi.string().optional().allow(null),
    overrideCreditLimit: Joi.boolean().optional(),
    createdBy: Joi.string().required(),
    mixedPaymentMethods: Joi.string().optional().allow(null),
    applySurcharges: Joi.boolean().optional().allow(null),
    commercialTaxesUsed: Joi.boolean().optional().allow(null),
    purchaseOrderId: id.optional().allow(null),
    independentWorkOrderId: id.optional().allow(null),
    priceId: id.optional().allow(null),
    overrideServicePrice: Joi.boolean().optional(),
    overriddenServicePrice: id.optional().allow(null),
    serviceTotal: id.optional().allow(null),
    invoicedAt: Joi.date().optional().allow(null),
    paidAt: Joi.date().optional().allow(null),
    createdAt: Joi.date().optional().allow(null),
    updatedAt: Joi.date().optional().allow(null),
    surchargesTotal: Joi.number().optional(),
    originDistrictId: id.optional().allow(null),
    csrName: Joi.string().optional().allow(null),
})
    .required();
exports.updateOrderSchema = Joi.object()
    .keys({
    businessUnitId: id.optional(),
    businessLineId: id.optional(),
    orderRequestId: id.optional().allow(null),
    draft: Joi.boolean().optional(),
    isRollOff: Joi.boolean().optional(),
    status: Joi.string().optional(),
    serviceAreaId: id.optional(),
    customRatesGroupId: id.optional().allow(null),
    jobSiteId: id.optional(),
    jobSite2Id: id.optional().allow(null),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    projectId: id.optional().allow(null),
    billableServiceId: id.optional().allow(null),
    materialId: id.optional(),
    equipmentItemId: id.optional(),
    thirdPartyHaulerId: id.optional().allow(null),
    promoId: id.optional().allow(null),
    materialProfileId: id.optional().allow(null),
    globalRatesServicesId: id.optional().allow(null),
    customRatesGroupServicesId: id.optional().allow(null),
    billableServicePrice: Joi.number().optional(),
    billableServiceTotal: Joi.number().optional(),
    billableLineItemsTotal: Joi.number().optional().allow(null),
    thresholdsTotal: Joi.number().optional(),
    beforeTaxesTotal: Joi.number().optional().allow(null),
    onAccountTotal: Joi.number().optional(),
    initialGrandTotal: Joi.number().optional(),
    grandTotal: Joi.number().optional().allow(null),
    serviceDate: Joi.date().optional(),
    jobSiteContactId: id.optional().allow(null),
    jobSiteNote: Joi.string().optional().allow(null),
    callOnWayPhoneNumber: Joi.string().optional().allow(null),
    textOnWayPhoneNumber: Joi.string().optional().allow(null),
    callOnWayPhoneNumberId: id.optional().allow(null),
    textOnWayPhoneNumberId: id.optional().allow(null),
    driverInstructions: Joi.string().optional().allow(null),
    permitId: id.optional().allow(null),
    bestTimeToComeFrom: Joi.string().optional().allow(null),
    bestTimeToComeTo: Joi.string().optional().allow(null),
    someoneOnSite: Joi.boolean().optional().allow(null),
    toRoll: Joi.boolean().optional().allow(null),
    highPriority: Joi.boolean().optional().allow(null),
    earlyPick: Joi.boolean().optional().allow(null),
    alleyPlacement: Joi.boolean().optional(),
    cabOver: Joi.boolean().optional(),
    orderContactId: id.optional(),
    disposalSiteId: id.optional().allow(null),
    workOrderId: id.optional(),
    invoiceNotes: Joi.string().optional().allow(null),
    cancellationReasonType: Joi.string().optional().allow(null),
    cancellationComment: Joi.string().optional().allow(null),
    unapprovedComment: Joi.string().optional().allow(null),
    unfinalizedComment: Joi.string().optional().allow(null),
    rescheduleComment: Joi.string().optional().allow(null),
    droppedEquipmentItem: Joi.string().optional().allow(null),
    csrEmail: Joi.string().optional(),
    paymentMethod: Joi.string().optional(),
    invoiceDate: Joi.date().optional().allow(null),
    notifyDayBefore: Joi.string().optional().allow(null),
    overrideCreditLimit: Joi.boolean().optional(),
    createdBy: Joi.string().optional(),
    mixedPaymentMethods: Joi.string().optional().allow(null),
    applySurcharges: Joi.boolean().optional().allow(null),
    commercialTaxesUsed: Joi.boolean().optional().allow(null),
    purchaseOrderId: id.optional().allow(null),
    independentWorkOrderId: id.optional().allow(null),
    priceId: id.optional().allow(null),
    overrideServicePrice: Joi.boolean().optional(),
    overriddenServicePrice: id.optional().allow(null),
    serviceTotal: id.optional().allow(null),
    invoicedAt: Joi.date().optional().allow(null),
    paidAt: Joi.date().optional().allow(null),
    createdAt: Joi.date().optional().allow(null),
    updatedAt: Joi.date().optional().allow(null),
    surchargesTotal: Joi.number().optional(),
    originDistrictId: id.optional().allow(null),
    csrName: Joi.string().optional().allow(null),
    lineItems: Joi.array().items(validate_1.updateLineItemsInOrder).optional(),
})
    .required();
exports.updateByIdsSchema = Joi.object()
    .keys({
    ids: Joi.array().items().optional(),
    status: Joi.string().required(),
    invoiceDate: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map