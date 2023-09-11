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
exports.RecurrentOrderTemplate = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const PriceGroupsHistorical_1 = require("./PriceGroupsHistorical");
const Prices_1 = require("./Prices");
let RecurrentOrderTemplate = 
// CONSTRAINT recurrent_order_templates_check CHECK ((((frequency_type = 'custom'::text) AND (custom_frequency_type IS NOT NULL) AND (frequency_period IS NOT NULL)) OR ((frequency_type <> 'custom'::text) AND (custom_frequency_type IS NULL) AND (frequency_period IS NULL)))),
class RecurrentOrderTemplate {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "job_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "customer_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "project_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_profile_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "materialProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "order_contact_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "orderContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "disposal_site_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "disposalSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "billable_service_price",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "billableServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_service_quantity" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "billableServiceQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "billable_service_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "billableServiceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "thresholds_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "thresholdsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "frequency_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "frequencyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "frequency_period" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "frequencyPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "custom_frequency_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "customFrequencyType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        array: true,
        nullable: true,
        default: [],
        name: "frequency_days",
    }),
    __metadata("design:type", Array)
], RecurrentOrderTemplate.prototype, "frequencyDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "sync_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "syncDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "next_service_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "nextServiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "unlock_overrides",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "before_taxes_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        default: 0,
        name: "grand_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false, name: "start_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "call_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "callOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "text_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "textOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "high_priority",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "early_pick",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "csr_email" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "csrEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "alley_placement" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "cab_over" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "cabOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "signature_required" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "onAccount",
        name: "payment_method",
    }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "notify_day_before" }),
    __metadata("design:type", String)
], RecurrentOrderTemplate.prototype, "notifyDayBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "billable_service_apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "billableServiceApplySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "surcharges_total",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "commercial_taxes_used",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "commercialTaxesUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "on_hold_email_sent",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "onHoldEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "on_hold_notify_sales_rep",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "onHoldNotifySalesRep", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "on_hold_notify_main_contact",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplate.prototype, "onHoldNotifyMainContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "priceGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceGroupsHistorical_1.PriceGroupsHistorical, (priceGroup) => priceGroup.id),
    (0, typeorm_1.JoinColumn)({ name: "price_group_id" }),
    __metadata("design:type", PriceGroupsHistorical_1.PriceGroupsHistorical)
], RecurrentOrderTemplate.prototype, "priceGroupFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplate.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Prices_1.Prices, (prices) => prices.id),
    (0, typeorm_1.JoinColumn)({ name: "price_id" }),
    __metadata("design:type", Prices_1.Prices)
], RecurrentOrderTemplate.prototype, "priceFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "last_failure_date" }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "lastFailureDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplate.prototype, "updatedAt", void 0);
RecurrentOrderTemplate = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"custom_frequency_type" IN ('daily', 'weekly', 'monthly')`),
    (0, typeorm_1.Check)(`"frequency_type" IN ('daily', 'weekly', 'monthly', 'custom')`),
    (0, typeorm_1.Check)(`"notify_day_before" IN ('byText', 'byEmail')`),
    (0, typeorm_1.Check)(`"payment_method" IN ('onAccount', 'creditCard', 'cash', 'check', 'mixed')`),
    (0, typeorm_1.Check)(`"status" IN ('active', 'onHold', 'closed')`),
    (0, typeorm_1.Check)(`((("frequency_type" = 'custom') AND ("custom_frequency_type" IS NOT NULL) AND ("frequency_period" IS NOT NULL)) OR (("frequency_type" <> 'custom') AND ("custom_frequency_type" IS NULL) AND ("frequency_period" IS NULL)))`)
    // CONSTRAINT recurrent_order_templates_check CHECK ((((frequency_type = 'custom'::text) AND (custom_frequency_type IS NOT NULL) AND (frequency_period IS NOT NULL)) OR ((frequency_type <> 'custom'::text) AND (custom_frequency_type IS NULL) AND (frequency_period IS NULL)))),
], RecurrentOrderTemplate);
exports.RecurrentOrderTemplate = RecurrentOrderTemplate;
//# sourceMappingURL=RecurrentOrderTemplates.js.map