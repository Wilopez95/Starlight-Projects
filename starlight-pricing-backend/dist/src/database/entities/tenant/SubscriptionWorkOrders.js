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
exports.SubscriptionWorkOrders = void 0;
const typeorm_1 = require("typeorm");
const SubscriptionOrders_1 = require("./SubscriptionOrders");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionWorkOrders = class SubscriptionWorkOrders {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "subscriptionOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => SubscriptionOrders_1.SubscriptionOrders, (t) => t.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_order_id" }),
    __metadata("design:type", SubscriptionOrders_1.SubscriptionOrders)
], SubscriptionWorkOrders.prototype, "subscriptionOrderFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: "SCHEDULED" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "cancellation_reason" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "new_equipment_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "newEquipmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_contact_text_only" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "jobSiteContactTextOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "high_priority",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "can_reschedule",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "canReschedule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "equipment_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "equipmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "truck_number" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "truckNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "departed_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "departedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "arrived_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "arrivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "started_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "canceled_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "canceledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "completed_at" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "service_date" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "assigned_route" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "assignedRoute", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_name" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "driverName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "instructions_for_driver" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "instructionsForDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "comment_from_driver" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "commentFromDriver", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "early_pick",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "to_roll",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "signature_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "po_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "poRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        default: false,
        name: "permit_required",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "permitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "service_day_of_week_required_by_customer",
    }),
    __metadata("design:type", Boolean)
], SubscriptionWorkOrders.prototype, "serviceDayOfWeekRequiredByCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "billable_line_items_total",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "blocking_reason" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "blockingReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
        name: "weight",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        type: "timestamp",
        name: "deleted_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "dropped_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "droppedEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "picked_up_equipment_item" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "pickedUpEquipmentItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "sequence_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrders.prototype, "sequenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrders.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrders.prototype, "updatedAt", void 0);
SubscriptionWorkOrders = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(["subscriptionOrderId", "sequenceId"]),
    (0, typeorm_1.Check)(`"status" IN ('SCHEDULED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'NEEDS_APPROVAL', 'APPROVED','CANCELED','FINALIZED','INVOICED')`)
], SubscriptionWorkOrders);
exports.SubscriptionWorkOrders = SubscriptionWorkOrders;
//# sourceMappingURL=SubscriptionWorkOrders.js.map