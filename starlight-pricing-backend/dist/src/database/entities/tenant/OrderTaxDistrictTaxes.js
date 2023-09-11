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
exports.OrderTaxDistrictTaxes = void 0;
const ThresholdItems_1 = require("./ThresholdItems");
const typeorm_1 = require("typeorm");
const LineItems_1 = require("./LineItems");
const OrderTaxDistrict_1 = require("./OrderTaxDistrict");
let OrderTaxDistrictTaxes = class OrderTaxDistrictTaxes {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_tax_district_id" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "orderTaxDistrictId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => OrderTaxDistrict_1.OrderTaxDistrict, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "order_tax_district_id" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "orderTaxDistrictFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "per_ton_rate" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "perTonRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, default: 0, name: "percentage_rate" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "percentageRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false, name: "amount" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: false, name: "flat_rate" }),
    __metadata("design:type", Boolean)
], OrderTaxDistrictTaxes.prototype, "flat_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, nullable: false, name: "calculated_per_order" }),
    __metadata("design:type", Boolean)
], OrderTaxDistrictTaxes.prototype, "calculatedPerOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "type" }),
    __metadata("design:type", String)
], OrderTaxDistrictTaxes.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "line_item_per_quantity_rate" }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "lineItemPerQuantityRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "line_item_id", nullable: true }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => LineItems_1.LineItems),
    (0, typeorm_1.JoinColumn)({ name: "line_item_id" }),
    __metadata("design:type", LineItems_1.LineItems)
], OrderTaxDistrictTaxes.prototype, "lineItemFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "threshold_id", nullable: true }),
    __metadata("design:type", Number)
], OrderTaxDistrictTaxes.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => ThresholdItems_1.ThresholdItems),
    (0, typeorm_1.JoinColumn)({ name: "threshold_id" }),
    __metadata("design:type", ThresholdItems_1.ThresholdItems)
], OrderTaxDistrictTaxes.prototype, "ThresholdFK", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], OrderTaxDistrictTaxes.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], OrderTaxDistrictTaxes.prototype, "updatedAt", void 0);
OrderTaxDistrictTaxes = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"type" in ('service', 'material', 'lineItems', 'specificLineItem','threshold')`)
], OrderTaxDistrictTaxes);
exports.OrderTaxDistrictTaxes = OrderTaxDistrictTaxes;
//# sourceMappingURL=OrderTaxDistrictTaxes.js.map