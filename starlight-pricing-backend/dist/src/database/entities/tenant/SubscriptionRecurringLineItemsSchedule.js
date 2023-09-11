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
exports.SubscriptionRecurringLineItemsSchedule = void 0;
const typeorm_1 = require("typeorm");
let SubscriptionRecurringLineItemsSchedule = class SubscriptionRecurringLineItemsSchedule {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: false,
        name: "subscription_recurring_line_item_id",
    }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "subscriptionRecurringLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "billing_cycle" }),
    __metadata("design:type", String)
], SubscriptionRecurringLineItemsSchedule.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "override_price" }),
    __metadata("design:type", Boolean)
], SubscriptionRecurringLineItemsSchedule.prototype, "overridePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "override_proration" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "overrideProration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false, name: "overridden_price" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "overriddenPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "next_price" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "prorated_amount" }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "proratedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "bigint",
        nullable: true,
        name: "overridden_prorated_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "overriddenProratedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionRecurringLineItemsSchedule.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        nullable: false,
        name: "start_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "end_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "invoiced_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "paid_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionRecurringLineItemsSchedule.prototype, "updatedAt", void 0);
SubscriptionRecurringLineItemsSchedule = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
], SubscriptionRecurringLineItemsSchedule);
exports.SubscriptionRecurringLineItemsSchedule = SubscriptionRecurringLineItemsSchedule;
//# sourceMappingURL=SubscriptionRecurringLineItemsSchedule.js.map