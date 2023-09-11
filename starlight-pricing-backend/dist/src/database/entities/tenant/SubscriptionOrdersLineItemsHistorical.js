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
exports.SubscriptionOrdersLineItemsHistorical = void 0;
const typeorm_1 = require("typeorm");
let SubscriptionOrdersLineItemsHistorical = class SubscriptionOrdersLineItemsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionOrdersLineItemsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionOrdersLineItemsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionOrdersLineItemsHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItemsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItemsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_work_order_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "subscriptionWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_line_items_id",
    }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "work_order_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "workOrderLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "unlock_overrides",
    }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersLineItemsHistorical.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "invoiced_at", nullable: true }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItemsHistorical.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", name: "paid_at", nullable: true }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItemsHistorical.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_order_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItemsHistorical.prototype, "subscriptionOrderId", void 0);
SubscriptionOrdersLineItemsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionOrdersLineItemsHistorical);
exports.SubscriptionOrdersLineItemsHistorical = SubscriptionOrdersLineItemsHistorical;
//# sourceMappingURL=SubscriptionOrdersLineItemsHistorical.js.map