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
exports.Orders = void 0;
const typeorm_1 = require("typeorm");
const OrderRequests_1 = require("./OrderRequests");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let Orders = class Orders {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Orders.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_request_id", nullable: true }),
    __metadata("design:type", Number)
], Orders.prototype, "orderRequestId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => OrderRequests_1.OrderRequests, (request) => request.id),
    (0, typeorm_1.JoinColumn)({ name: "order_request_id" }),
    __metadata("design:type", OrderRequests_1.OrderRequests)
], Orders.prototype, "orderRequestFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Orders.prototype, "draft", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "is_roll_off",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "isRollOff", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "inProgress" }),
    __metadata("design:type", String)
], Orders.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id", nullable: true }),
    __metadata("design:type", Number)
], Orders.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "job_site_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_2_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "jobSite2Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "customer_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_group_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "original_customer_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "originalCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "project_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_profile_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "materialProfileId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_price",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_service_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableServiceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
        default: 0,
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "thresholds_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "thresholdsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "before_taxes_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
        default: 0,
        name: "on_account_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "onAccountTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
        name: "initial_grand_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "initialGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
        name: "grand_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "service_date" }),
    __metadata("design:type", Date)
], Orders.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], Orders.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], Orders.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], Orders.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "call_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "callOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "text_on_way_phone_number_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "textOnWayPhoneNumberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], Orders.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], Orders.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], Orders.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], Orders.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "high_priority",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "early_pick",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "cab_over",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "cabOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "order_contact_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "orderContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "disposal_site_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "disposalSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "work_order_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "workOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], Orders.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason_type" }),
    __metadata("design:type", String)
], Orders.prototype, "cancellationReasonType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_comment" }),
    __metadata("design:type", String)
], Orders.prototype, "cancellationComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unapproved_comment" }),
    __metadata("design:type", String)
], Orders.prototype, "unapprovedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unfinalized_comment" }),
    __metadata("design:type", String)
], Orders.prototype, "unfinalizedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "reschedule_comment" }),
    __metadata("design:type", String)
], Orders.prototype, "rescheduleComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], Orders.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "csr_email" }),
    __metadata("design:type", String)
], Orders.prototype, "csrEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "onAccount",
        name: "payment_method",
    }),
    __metadata("design:type", String)
], Orders.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoice_date" }),
    __metadata("design:type", Date)
], Orders.prototype, "invoiceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "notify_day_before" }),
    __metadata("design:type", String)
], Orders.prototype, "notifyDayBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "override_credit_limit",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "overrideCreditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "system",
        name: "created_by",
    }),
    __metadata("design:type", String)
], Orders.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "mixed_payment_methods" }),
    __metadata("design:type", String)
], Orders.prototype, "mixedPaymentMethods", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "commercial_taxes_used",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "commercialTaxesUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "independent_work_order_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "independentWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], Orders.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "override_service_price",
    }),
    __metadata("design:type", Boolean)
], Orders.prototype, "overrideServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "overridden_service_price" }),
    __metadata("design:type", Number)
], Orders.prototype, "overriddenServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "service_total" }),
    __metadata("design:type", Number)
], Orders.prototype, "serviceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], Orders.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], Orders.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(billable_service_price,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "billable_service_price_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableServicePriceToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(billable_service_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "billable_service_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableServiceTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(billable_line_items_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "billable_line_items_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "billableLineItemsTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(thresholds_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "thresholds_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "thresholdsTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(surcharges_total / 1000000, 2)",
        generatedType: "STORED",
        name: "surcharges_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "surchargesTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(before_taxes_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "before_taxes_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "beforeTaxesTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(on_account_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "on_account_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "onAccountTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(initial_grand_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "initial_grand_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "initialGrandTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        asExpression: "round(COALESCE(grand_total,0) / 1000000, 2)",
        generatedType: "STORED",
        name: "grand_total_to_display",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "grandTotalToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], Orders.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], Orders.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "surcharges_total",
    }),
    __metadata("design:type", Number)
], Orders.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "origin_district_id" }),
    __metadata("design:type", Number)
], Orders.prototype, "originDistrictId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "csr_name" }),
    __metadata("design:type", Number)
], Orders.prototype, "csrName", void 0);
Orders = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"cancellation_reason_type" IN ('customerCanceled', 'duplicateOrder', 'schedulingError', 'internalError', 'other')`),
    (0, typeorm_1.Check)(`"notify_day_before" IN ('byText', 'byEmail')`),
    (0, typeorm_1.Check)(`"payment_method" IN ('onAccount', 'creditCard', 'cash', 'check', 'mixed')`),
    (0, typeorm_1.Check)(`"status" IN ('inProgress', 'completed', 'approved', 'finalized', 'canceled', 'invoiced')`)
], Orders);
exports.Orders = Orders;
//ALTER TABLE rolloff_solutions.orders ADD CONSTRAINT orders_order_request_id_foreign FOREIGN KEY (order_request_id) REFERENCES rolloff_solutions.order_requests(id) ON DELETE RESTRICT;
//# sourceMappingURL=Orders.js.map