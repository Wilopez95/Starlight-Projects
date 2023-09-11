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
exports.SubscriptionServiceItemHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionServiceItemHistorical = class SubscriptionServiceItemHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        name: "original_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionServiceItemHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionServiceItemHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionServiceItemHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_cycle" }),
    __metadata("design:type", String)
], SubscriptionServiceItemHistorical.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItemHistorical.prototype, "recalculate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "prorate_total",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "prorateTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "service_frequency_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "serviceFrequencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "subscription_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "billable_service_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "global_rates_recurring_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "globalRatesRecurringServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_services_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "customRatesGroupServicesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "material_id",
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "next_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "is_deleted",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItemHistorical.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true, name: "service_days_of_week" }),
    __metadata("design:type", String)
], SubscriptionServiceItemHistorical.prototype, "serviceDaysOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "proration_effective_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "prorationEffectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "proration_effective_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionServiceItemHistorical.prototype, "prorationEffectivePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionServiceItemHistorical.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "unlock_overrides",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItemHistorical.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        name: "proration_override",
    }),
    __metadata("design:type", Boolean)
], SubscriptionServiceItemHistorical.prototype, "prorationOverride", void 0);
SubscriptionServiceItemHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" in ('created', 'edited', 'deleted')`)
], SubscriptionServiceItemHistorical);
exports.SubscriptionServiceItemHistorical = SubscriptionServiceItemHistorical;
//# sourceMappingURL=SubscriptionServiceItemHistorical.js.map