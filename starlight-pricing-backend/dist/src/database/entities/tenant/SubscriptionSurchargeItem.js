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
exports.SubscriptionSurchargeItem = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const SubscriptionLineItem_1 = require("./SubscriptionLineItem");
const SubscriptionOrders_1 = require("./SubscriptionOrders");
const SubscriptionOrdersLineItems_1 = require("./SubscriptionOrdersLineItems");
const Subscriptions_1 = require("./Subscriptions");
const SubscriptionServiceItem_1 = require("./SubscriptionServiceItem");
let SubscriptionSurchargeItem = class SubscriptionSurchargeItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment"),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Subscriptions_1.Subscriptions, (t) => t.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_id" }),
    __metadata("design:type", Subscriptions_1.Subscriptions)
], SubscriptionSurchargeItem.prototype, "subscriptionFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_service_item_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "subscriptionServiceItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((target) => SubscriptionServiceItem_1.SubscriptionServiceItem, (t) => t.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_service_item_id" }),
    __metadata("design:type", SubscriptionServiceItem_1.SubscriptionServiceItem)
], SubscriptionSurchargeItem.prototype, "subscriptionServiceItemFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_recurring_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "subscriptionRecurringLineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((target) => SubscriptionLineItem_1.SubscriptionLineItem, (t) => t.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_recurring_line_item_id" }),
    __metadata("design:type", SubscriptionLineItem_1.SubscriptionLineItem)
], SubscriptionSurchargeItem.prototype, "subscriptionRecurringLineItemFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_order_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "subscriptionOrderLineItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((target) => SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, (t) => t.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_order_line_item_id" }),
    __metadata("design:type", SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems)
], SubscriptionSurchargeItem.prototype, "subscriptionOrderLineItemFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_order_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "subscriptionOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((target) => SubscriptionOrders_1.SubscriptionOrders, (t) => t.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_order_id" }),
    __metadata("design:type", SubscriptionOrders_1.SubscriptionOrders)
], SubscriptionSurchargeItem.prototype, "subscriptionOrderFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "surcharge_id", nullable: false }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "billable_line_item_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "billable_service_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "material_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "global_rates_surcharges_id", nullable: false }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "globalRatesSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "custom_rates_group_surcharges_id" }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "customRatesGroupSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionSurchargeItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionSurchargeItem.prototype, "updatedAt", void 0);
SubscriptionSurchargeItem = __decorate([
    (0, typeorm_1.Entity)({ name: "subscription_surcharge_item" })
], SubscriptionSurchargeItem);
exports.SubscriptionSurchargeItem = SubscriptionSurchargeItem;
//# sourceMappingURL=SubscriptionSurchargeItem.js.map