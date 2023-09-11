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
exports.SubscriptionSurchargeItemHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionSurchargeItemHistorical = class SubscriptionSurchargeItemHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("increment"),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "original_id", nullable: false }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "event_type", nullable: false }),
    __metadata("design:type", String)
], SubscriptionSurchargeItemHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        name: "user_id",
        nullable: false,
        default: () => "'system'::text",
    }),
    __metadata("design:type", String)
], SubscriptionSurchargeItemHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", name: "trace_id:", nullable: true }),
    __metadata("design:type", String)
], SubscriptionSurchargeItemHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionSurchargeItemHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionSurchargeItemHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        name: "subscription_service_item_id",
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "subscriptionServiceItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        name: "subscription_recurring_line_item_id",
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "subscriptionRecurringLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        name: "subscription_order_line_item_id",
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "subscriptionOrderLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "subscription_order_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "subscriptionOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "surcharge_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "billable_line_item_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "billable_service_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "material_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "global_rates_surchages_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "globalRatesSurchagesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        name: "custom_rates_group_surchages_id",
        nullable: true,
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "customRatesGroupSurchagesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        name: "amount",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        name: "quantity",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionSurchargeItemHistorical.prototype, "quantity", void 0);
SubscriptionSurchargeItemHistorical = __decorate([
    (0, typeorm_1.Entity)({ name: "subscription_surcharge_item_historical" }),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionSurchargeItemHistorical);
exports.SubscriptionSurchargeItemHistorical = SubscriptionSurchargeItemHistorical;
//# sourceMappingURL=SubscriptionSurchargeItemHistorical.js.map