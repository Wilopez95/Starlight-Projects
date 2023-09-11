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
exports.SubscriptionWorkOrdersHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionWorkOrdersHistorical = class SubscriptionWorkOrdersHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "system", name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "subscriptionOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "new_equipment_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "newEquipmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_contact_text_only" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "jobSiteContactTextOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "high_priority",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "can_reschedule",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "canReschedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "equipment_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "equipmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "truck_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "truckNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "departed_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "departedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "arrived_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "arrivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "started_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "canceled_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "completed_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "service_date" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "assigned_route" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "assignedRoute", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_name" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "driverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "instructions_for_driver" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "instructionsForDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "comment_from_driver" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "commentFromDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "early_pick",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "to_roll",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "signature_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "po_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "poRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "permit_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "permitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "service_day_of_week_required_by_customer",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrdersHistorical.prototype, "serviceDayOfWeekRequiredByCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "blocking_reason" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "blockingReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "weight",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "deleted_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersHistorical.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "picked_up_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "pickedUpEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "sequence_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersHistorical.prototype, "sequenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersHistorical.prototype, "purchaseOrderId", void 0);
SubscriptionWorkOrdersHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionWorkOrdersHistorical);
exports.SubscriptionWorkOrdersHistorical = SubscriptionWorkOrdersHistorical;
//# sourceMappingURL=SubscriptionWorkOrdersHistorical.js.map