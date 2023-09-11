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
exports.SubscriptionServiceItem = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const Subscriptions_1 = require("./Subscriptions");
let SubscriptionServiceItem = class SubscriptionServiceItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_cycle" }),
    __metadata("design:type", String)
], SubscriptionServiceItem.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItem.prototype, "recalculate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "prorate_total",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "prorateTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "service_frequency_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "serviceFrequencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Subscriptions_1.Subscriptions, (request) => request.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_id" }),
    __metadata("design:type", Subscriptions_1.Subscriptions)
], SubscriptionServiceItem.prototype, "subscriptionIdFK", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "billable_service_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "global_rates_recurring_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "globalRatesRecurringServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "material_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "next_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "is_deleted",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItem.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true, name: "service_days_of_week" }),
    __metadata("design:type", String)
], SubscriptionServiceItem.prototype, "serviceDaysOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "proration_effective_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "prorationEffectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "proration_effective_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItem.prototype, "prorationEffectivePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "unlock_overrides",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItem.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "proration_override",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItem.prototype, "prorationOverride", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionServiceItem.prototype, "updatedAt", void 0);
SubscriptionServiceItem = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
], SubscriptionServiceItem);
exports.SubscriptionServiceItem = SubscriptionServiceItem;
//# sourceMappingURL=SubscriptionServiceItem.js.map