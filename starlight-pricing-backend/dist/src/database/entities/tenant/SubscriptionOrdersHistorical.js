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
exports.SubscriptionOrdersHistorical = void 0;
const typeorm_1 = require("typeorm");
let SubscriptionOrdersHistorical = class SubscriptionOrdersHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "billed_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "billedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "included", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "add_trip_charge",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "addTripCharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "early_pick" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "unlock_overrides" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        default: 0,
        name: "work_orders_count",
    }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "workOrdersCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: "SCHEDULED" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_contact_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "subscriptionContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "signature_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "can_reschedule",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "canReschedule", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "one_time",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "oneTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "instructions_for_driver" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "instructionsForDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "onejob_site_contact_text_only",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "onejobSiteContactTextOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "someone_on_site" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "high_priority" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "has_comments",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "hasComments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "has_assigned_routes",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "hasAssignedRoutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "started_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "canceled_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "completed_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "po_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "poRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "permit_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "permitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "subscription_service_item_id",
    }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "subscriptionServiceItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "service_date" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "grand_total" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "service_day_of_week_required_by_customer",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "serviceDayOfWeekRequiredByCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "assigned_route" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "assignedRoute", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_comment" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "cancellationComment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "override_credit_limit",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "overrideCreditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "arrived_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "arrivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "deleted_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "destination_job_site_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "destinationJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "sequence_id" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "sequenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "is_final_for_service" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersHistorical.prototype, "isFinalForService", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "surcharges_total" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "before_taxes_total" }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_historical_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "priceGroupHistoricalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "uncompleted_comment" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "uncompletedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unapproved_comment" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "unapprovedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unfinalized_comment" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "unfinalizedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "picked_up_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "pickedUpEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersHistorical.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "finish_work_order_date" }),
    __metadata("design:type", Date)
], SubscriptionOrdersHistorical.prototype, "finishWorkOrderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "weight_unit" }),
    __metadata("design:type", String)
], SubscriptionOrdersHistorical.prototype, "weightUnit", void 0);
SubscriptionOrdersHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionOrdersHistorical);
exports.SubscriptionOrdersHistorical = SubscriptionOrdersHistorical;
//# sourceMappingURL=SubscriptionOrdersHistorical.js.map