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
exports.SurchargeItem = void 0;
const typeorm_1 = require("typeorm");
const Orders_1 = require("./Orders");
const LineItems_1 = require("./LineItems");
const ThresholdItems_1 = require("./ThresholdItems");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SurchargeItem = class SurchargeItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Orders_1.Orders, (order) => order.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "order_id" }),
    __metadata("design:type", Orders_1.Orders)
], SurchargeItem.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "surcharge_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "threshold_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_surcharges_id" }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "globalRatesSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_surcharges_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "customRatesGroupSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], SurchargeItem.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], SurchargeItem.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        name: "amount_to_display",
        nullable: true,
        default: "",
    }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "amountToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SurchargeItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SurchargeItem.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "line_item_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => LineItems_1.LineItems),
    (0, typeorm_1.JoinColumn)({ name: "line_item_id" }),
    __metadata("design:type", LineItems_1.LineItems)
], SurchargeItem.prototype, "lineItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "threshold_item_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItem.prototype, "thresholdItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => ThresholdItems_1.ThresholdItems, (thresholdItems) => thresholdItems.id),
    (0, typeorm_1.JoinColumn)({ name: "threshold_item_id" }),
    __metadata("design:type", ThresholdItems_1.ThresholdItems)
], SurchargeItem.prototype, "thresholdItem", void 0);
SurchargeItem = __decorate([
    (0, typeorm_1.Entity)()
], SurchargeItem);
exports.SurchargeItem = SurchargeItem;
//# sourceMappingURL=SurchargeItem.js.map