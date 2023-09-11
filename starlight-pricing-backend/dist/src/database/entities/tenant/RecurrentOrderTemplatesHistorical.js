"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurrentOrderTemplateHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const PriceGroupsHistorical_1 = require("./PriceGroupsHistorical");
const Prices_1 = require("./Prices");
let RecurrentOrderTemplateHistorical = class RecurrentOrderTemplateHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "business_line_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "business_unit_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "project_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_profile_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "materialProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "order_contact_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "orderContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "disposal_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "disposalSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_price",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "billableServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_quantity" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "billableServiceQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "billableServiceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "thresholds_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "thresholdsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "frequency_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "frequencyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "frequency_period" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "frequencyPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "custom_frequency_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "customFrequencyType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        array: true,
        nullable: true,
        default: [],
        name: "frequency_days",
    }),
    __metadata("design:type", Array)
], RecurrentOrderTemplateHistorical.prototype, "frequencyDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "sync_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "syncDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "next_service_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "nextServiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "unlock_overrides" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "before_taxes_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "grand_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "start_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "call_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "callOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "text_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "textOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "someone_on_site" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "to_roll" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "high_priority" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "early_pick" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "csr_email" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "csrEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "alley_placement" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "cab_over" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "cabOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "signature_required" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "payment_method" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "notify_day_before" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateHistorical.prototype, "notifyDayBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "apply_surcharges" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "billable_service_apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "billableServiceApplySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "surcharges_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "commercial_taxes_used" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "commercialTaxesUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "on_hold_email_sent" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "onHoldEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "on_hold_notify_sales_rep" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "onHoldNotifySalesRep", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "on_hold_notify_main_contact",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateHistorical.prototype, "onHoldNotifyMainContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "priceGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceGroupsHistorical_1.PriceGroupsHistorical, (priceGroup) => priceGroup.id),
    (0, typeorm_1.JoinColumn)({ name: "price_group_id" }),
    __metadata("design:type", PriceGroupsHistorical_1.PriceGroupsHistorical)
], RecurrentOrderTemplateHistorical.prototype, "priceGroupFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Prices_1.Prices, (prices) => prices.id),
    (0, typeorm_1.JoinColumn)({ name: "price_id" }),
    __metadata("design:type", Prices_1.Prices)
], RecurrentOrderTemplateHistorical.prototype, "priceFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "last_failure_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateHistorical.prototype, "lastFailureDate", void 0);
RecurrentOrderTemplateHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], RecurrentOrderTemplateHistorical);
exports.RecurrentOrderTemplateHistorical = RecurrentOrderTemplateHistorical;
//# sourceMappingURL=RecurrentOrderTemplatesHistorical.js.map