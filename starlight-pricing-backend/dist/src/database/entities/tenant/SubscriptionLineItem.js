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
exports.SubscriptionLineItem = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const SubscriptionServiceItem_1 = require("./SubscriptionServiceItem");
let SubscriptionLineItem = class SubscriptionLineItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        name: "subscription_service_item_id",
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "subscriptionServiceItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => SubscriptionServiceItem_1.SubscriptionServiceItem, (request) => request.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_service_item_id" }),
    __metadata("design:type", SubscriptionServiceItem_1.SubscriptionServiceItem)
], SubscriptionLineItem.prototype, "subscriptionServiceItemFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "global_rates_recurring_line_items_billing_cycle_id",
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "globalRatesRecurringLineItemsBillingCycleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_recurring_line_item_billing_cycle_id",
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "customRatesGroupRecurringLineItemBillingCycleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "quantity",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "next_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "is_deleted",
    }),
    __metadata("design:type", Boolean)
], SubscriptionLineItem.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "unlock_overrides",
    }),
    __metadata("design:type", Boolean)
], SubscriptionLineItem.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: true,
        default: false,
        name: "proration_override",
    }),
    __metadata("design:type", Boolean)
], SubscriptionLineItem.prototype, "prorationOverride", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        nullable: true,
        name: "proration_effective_date",
    }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "prorationEffectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "proration_effective_price",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionLineItem.prototype, "prorationEffectivePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionLineItem.prototype, "updatedAt", void 0);
SubscriptionLineItem = __decorate([
    (0, typeorm_1.Entity)()
], SubscriptionLineItem);
exports.SubscriptionLineItem = SubscriptionLineItem;
//ALTER TABLE rolloff_solutions.subscription_line_item ADD CONSTRAINT subscription_line_item_billable_line_item_id_foreign FOREIGN KEY (billable_line_item_id) REFERENCES billable_line_items_historical(id) ON DELETE RESTRICT;
//ALTER TABLE rolloff_solutions.subscription_line_item ADD CONSTRAINT subscription_line_item_custom_rates_group_recurring_line_item_b FOREIGN KEY (custom_rates_group_recurring_line_item_billing_cycle_id) REFERENCES custom_rates_group_recurring_line_item_billing_cycle_historical(id) ON DELETE RESTRICT;
//ALTER TABLE rolloff_solutions.subscription_line_item ADD CONSTRAINT subscription_line_item_global_rates_recurring_line_items_billin FOREIGN KEY (global_rates_recurring_line_items_billing_cycle_id) REFERENCES global_rates_recurring_line_items_billing_cycle_historical(id) ON DELETE RESTRICT;
//ALTER TABLE rolloff_solutions.subscription_line_item ADD CONSTRAINT subscription_line_item_subscription_service_item_id_foreign FOREIGN KEY (subscription_service_item_id) REFERENCES subscription_service_item(id) ON DELETE CASCADE;
//# sourceMappingURL=SubscriptionLineItem.js.map