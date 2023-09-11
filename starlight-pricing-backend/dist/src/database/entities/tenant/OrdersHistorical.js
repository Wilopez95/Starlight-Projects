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
exports.OrdersHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let OrdersHistorical = class OrdersHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "business_unit_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "business_line_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_request_id", nullable: true }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "orderRequestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "draft", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "is_roll_off",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "isRollOff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, default: "inProgress" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id", nullable: true }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_2_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "jobSite2Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "original_customer_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "originalCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_group_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "project_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_profile_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "materialProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_price",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableServiceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
        default: 0,
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "thresholds_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "thresholdsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "before_taxes_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        default: 0,
        name: "on_account_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "onAccountTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "initial_grand_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "initialGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "grand_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "service_date" }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "call_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "callOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "text_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "textOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "high_priority",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "early_pick",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "cab_over",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "cabOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "order_contact_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "orderContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "disposal_site_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "disposalSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "work_order_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "workOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason_type" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "cancellationReasonType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_comment" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "cancellationComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unapproved_comment" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "unapprovedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unfinalized_comment" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "unfinalizedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "reschedule_comment" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "rescheduleComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "csr_email" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "csrEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        default: "onAccount",
        name: "payment_method",
    }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoice_date" }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "notify_day_before" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "notifyDayBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "override_credit_limit",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "overrideCreditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        default: "system",
        name: "created_by",
    }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "mixed_payment_methods" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "mixedPaymentMethods", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: true,
        name: "commercial_taxes_used",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "commercialTaxesUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "independent_work_order_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "independentWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "override_service_price",
    }),
    __metadata("design:type", Boolean)
], OrdersHistorical.prototype, "overrideServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "overridden_service_price" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "overriddenServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "service_total" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "serviceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_price_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableServicePriceToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableServiceTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "billableLineItemsTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "thresholds_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "thresholdsTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "surcharges_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "surchargesTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "before_taxes_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "beforeTaxesTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "on_account_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "onAccountTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "initial_grand_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "initialGrandTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "grand_total_to_display",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "grandTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], OrdersHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "surcharges_total",
    }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "origin_district_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "originDistrictId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "csr_name" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "csrName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], OrdersHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], OrdersHistorical.prototype, "traceId", void 0);
OrdersHistorical = __decorate([
    (0, typeorm_1.Entity)()
], OrdersHistorical);
exports.OrdersHistorical = OrdersHistorical;
//ALTER TABLE rolloff_solutions.orders ADD CONSTRAINT orders_order_request_id_foreign FOREIGN KEY (order_request_id) REFERENCES rolloff_solutions.order_requests(id) ON DELETE RESTRICT;
//# sourceMappingURL=OrdersHistorical.js.map