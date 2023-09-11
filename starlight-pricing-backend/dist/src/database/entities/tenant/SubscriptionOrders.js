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
exports.SubscriptionOrders = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const PriceGroupsHistorical_1 = require("./PriceGroupsHistorical");
let SubscriptionOrders = class SubscriptionOrders {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "billed_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "billedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "included", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "add_trip_charge",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "addTripCharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "early_pick" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "unlock_overrides" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        default: 0,
        name: "work_orders_count",
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "workOrdersCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: "SCHEDULED" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "call_on_way_phone_number" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "callOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "text_on_way_phone_number" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "textOnWayPhoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_contact_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "subscriptionContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "signature_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "can_reschedule",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "canReschedule", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "one_time",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "oneTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "instructions_for_driver" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "instructionsForDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "onejob_site_contact_text_onlytime",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "onejobSiteContactTextOnlytime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "someone_on_site" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "high_priority" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "has_comments",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "hasComments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "has_assigned_routes",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "hasAssignedRoutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "started_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "canceled_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "completed_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "po_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "poRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "permit_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "permitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        name: "subscription_service_item_id",
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "subscriptionServiceItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_services_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "globalRatesServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: false, name: "service_date" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "grand_total",
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "service_day_of_week_required_by_customer",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "serviceDayOfWeekRequiredByCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "assigned_route" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "assignedRoute", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_comment" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "cancellationComment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "override_credit_limit",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "overrideCreditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "arrived_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "arrivedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: "timestamp",
        name: "deleted_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "destination_job_site_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "destinationJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "sequence_id" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "sequenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "is_final_for_service" }),
    __metadata("design:type", Boolean)
], SubscriptionOrders.prototype, "isFinalForService", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "surcharges_total" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "before_taxes_total" }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_historical_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "priceGroupHistoricalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceGroupsHistorical_1.PriceGroupsHistorical, (prices_group_historical) => prices_group_historical.id),
    (0, typeorm_1.JoinColumn)({ name: "price_group_historical_id" }),
    __metadata("design:type", PriceGroupsHistorical_1.PriceGroupsHistorical)
], SubscriptionOrders.prototype, "priceGroupHistoricalFK", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "invoice_notes" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "invoiceNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "uncompleted_comment" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "uncompletedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unapproved_comment" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "unapprovedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "unfinalized_comment" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "unfinalizedComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "picked_up_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "pickedUpEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionOrders.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "finish_work_order_date" }),
    __metadata("design:type", Date)
], SubscriptionOrders.prototype, "finishWorkOrderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "weight_unit" }),
    __metadata("design:type", String)
], SubscriptionOrders.prototype, "weightUnit", void 0);
SubscriptionOrders = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"status" IN ('SCHEDULED', 'IN_PROGRESS', 'BLOCKED', 'SKIPPED', 'COMPLETED', 'APPROVED', 'CANCELED', 'FINALIZED', 'INVOICED', 'NEEDS_APPROVAL')`),
    (0, typeorm_1.Check)(`"weight_unit" IN ('yards', 'tons')`),
    (0, typeorm_1.Unique)(["subscriptionId", "sequenceId"])
], SubscriptionOrders);
exports.SubscriptionOrders = SubscriptionOrders;
// );
// ALTER TABLE rolloff_solutions.subscription_orders ADD CONSTRAINT subscription_orders_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES rolloff_solutions.subscriptions(id) ON DELETE CASCADE;
// ALTER TABLE rolloff_solutions.subscription_orders ADD CONSTRAINT subscription_orders_subscription_service_item_id_foreign FOREIGN KEY (subscription_service_item_id) REFERENCES rolloff_solutions.subscription_service_item(id) ON DELETE CASCADE;
//# sourceMappingURL=SubscriptionOrders.js.map