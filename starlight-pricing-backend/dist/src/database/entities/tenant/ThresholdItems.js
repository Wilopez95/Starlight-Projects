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
exports.ThresholdItems = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const Orders_1 = require("./Orders");
let ThresholdItems = class ThresholdItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id" }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Orders_1.Orders, (order) => order.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "order_id" }),
    __metadata("design:type", Orders_1.Orders)
], ThresholdItems.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "threshold_id" }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_thresholds_id" }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "globalRatesThresholdsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        default: 0,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], ThresholdItems.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], ThresholdItems.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "price_to_display",
    }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "priceToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], ThresholdItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], ThresholdItems.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], ThresholdItems.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_thresholds_id", nullable: true }),
    __metadata("design:type", Number)
], ThresholdItems.prototype, "customRatesGroupThresholdsId", void 0);
ThresholdItems = __decorate([
    (0, typeorm_1.Entity)()
], ThresholdItems);
exports.ThresholdItems = ThresholdItems;
//ALTER TABLE rolloff_solutions.threshold_items ADD CONSTRAINT threshold_items_threshold_id_foreign FOREIGN KEY (threshold_id) REFERENCES rolloff_solutions.thresholds_historical(id) ON DELETE RESTRICT;
//# sourceMappingURL=ThresholdItems.js.map