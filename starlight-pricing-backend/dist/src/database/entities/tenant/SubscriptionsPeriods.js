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
exports.SubscriptionsPeriods = void 0;
const typeorm_1 = require("typeorm");
const PriceGroupsHistorical_1 = require("./PriceGroupsHistorical");
let SubscriptionsPeriods = class SubscriptionsPeriods {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_historical_id" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "priceGroupHistoricalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => PriceGroupsHistorical_1.PriceGroupsHistorical, (priceGroups) => priceGroups.id),
    (0, typeorm_1.JoinColumn)({ name: "price_group_historical_id" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "priceGroupHistorical", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], SubscriptionsPeriods.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_cycle" }),
    __metadata("design:type", String)
], SubscriptionsPeriods.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_type" }),
    __metadata("design:type", String)
], SubscriptionsPeriods.prototype, "billingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "override_proration" }),
    __metadata("design:type", Boolean)
], SubscriptionsPeriods.prototype, "overrideProration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "recurring_services_amount" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringServicesAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_services_prorated_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringServicesProratedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_services_overridden_prorated_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringServicesOverriddenProratedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "recurring_services_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringServicesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_line_items_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringLineItemsAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_line_items_overridden_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringLineItemsOverriddenAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_line_items_total",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_line_items_overridden_total",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringLineItemsOverriddenTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "recurring_amount" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_overridden_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringOverriddenAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "recurring_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "recurring_overridden_total",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "recurringOverriddenTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "one_time_amount" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "oneTimeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "one_time_overridden_amount",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "oneTimeOverriddenAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "one_time_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "oneTimeTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "one_time_overridden_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "oneTimeOverriddenTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "before_taxes_grand_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "beforeTaxesGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "before_taxes_overridden_grand_total",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "beforeTaxesOverriddenGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int8",
        nullable: true,
        name: "surcharges_total",
    }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "surchargesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "grand_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "overridden_grand_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "overriddenGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "next_grand_total" }),
    __metadata("design:type", Number)
], SubscriptionsPeriods.prototype, "nextGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        nullable: false,
        name: "start_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: null,
        name: "end_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: null,
        name: "invoiced_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: null,
        name: "paid_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsPeriods.prototype, "updatedAt", void 0);
SubscriptionsPeriods = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`),
    (0, typeorm_1.Check)(`"status" in ('active', 'onHold', 'closed', 'draft')`),
    (0, typeorm_1.Check)(`"billing_type" in ('arrears', 'inAdvance')`)
], SubscriptionsPeriods);
exports.SubscriptionsPeriods = SubscriptionsPeriods;
//ALTER TABLE rolloff_solutions.subscriptions_periods ADD CONSTRAINT subscriptions_periods_price_group_historical_id_foreign FOREIGN KEY (price_group_historical_id) REFERENCES price_groups_historical(id) ON DELETE RESTRICT;
//ALTER TABLE rolloff_solutions.subscriptions_periods ADD CONSTRAINT subscriptions_periods_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE RESTRICT;
//# sourceMappingURL=SubscriptionsPeriods.js.map