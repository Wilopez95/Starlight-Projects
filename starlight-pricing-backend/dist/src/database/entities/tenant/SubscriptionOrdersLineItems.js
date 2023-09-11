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
exports.SubscriptionOrdersLineItems = void 0;
const typeorm_1 = require("typeorm");
const SubscriptionOrders_1 = require("./SubscriptionOrders");
let SubscriptionOrdersLineItems = class SubscriptionOrdersLineItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_work_order_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "subscriptionWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "custom_rates_group_line_items_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "work_order_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "workOrderLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "unlock_overrides" }),
    __metadata("design:type", Boolean)
], SubscriptionOrdersLineItems.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItems.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItems.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionOrdersLineItems.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_order_id" }),
    __metadata("design:type", Number)
], SubscriptionOrdersLineItems.prototype, "subscriptionOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SubscriptionOrders_1.SubscriptionOrders, (subscriptionOrders) => subscriptionOrders.id, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_order_id" }),
    __metadata("design:type", SubscriptionOrders_1.SubscriptionOrders)
], SubscriptionOrdersLineItems.prototype, "subscriptionOrder", void 0);
SubscriptionOrdersLineItems = __decorate([
    (0, typeorm_1.Entity)()
], SubscriptionOrdersLineItems);
exports.SubscriptionOrdersLineItems = SubscriptionOrdersLineItems;
//# sourceMappingURL=SubscriptionOrdersLineItems.js.map