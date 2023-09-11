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
exports.LineItems = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const Orders_1 = require("./Orders");
let LineItems = class LineItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LineItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id" }),
    __metadata("design:type", Number)
], LineItems.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Orders_1.Orders, (request) => request.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "order_id" }),
    __metadata("design:type", Orders_1.Orders)
], LineItems.prototype, "orderFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], LineItems.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], LineItems.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], LineItems.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_line_items_id",
    }),
    __metadata("design:type", Number)
], LineItems.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], LineItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], LineItems.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "manifest_number" }),
    __metadata("design:type", String)
], LineItems.prototype, "manifestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "landfill_operation",
    }),
    __metadata("design:type", Boolean)
], LineItems.prototype, "landfillOperation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], LineItems.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "override_price",
    }),
    __metadata("design:type", Boolean)
], LineItems.prototype, "overridePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int8", nullable: true, name: "overridden_price" }),
    __metadata("design:type", Number)
], LineItems.prototype, "overriddenPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], LineItems.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], LineItems.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        asExpression: "round(price / 1000000, 2)",
        generatedType: "STORED",
        name: "price_to_display",
    }),
    __metadata("design:type", Number)
], LineItems.prototype, "priceToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], LineItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], LineItems.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: true,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], LineItems.prototype, "applySurcharges", void 0);
LineItems = __decorate([
    (0, typeorm_1.Entity)()
], LineItems);
exports.LineItems = LineItems;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_billable_line_item_id_foreign FOREIGN KEY (billable_line_item_id) REFERENCES rolloff_solutions.billable_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_custom_rates_group_line_items_id_foreign FOREIGN KEY (custom_rates_group_line_items_id) REFERENCES rolloff_solutions.custom_rates_group_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_global_rates_line_items_id_foreign FOREIGN KEY (global_rates_line_items_id) REFERENCES rolloff_solutions.global_rates_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_material_id_foreign FOREIGN KEY (material_id) REFERENCES rolloff_solutions.materials_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES rolloff_solutions.orders(id) ON DELETE CASCADE;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_refactored_price_id_foreign FOREIGN KEY (refactored_price_id) REFERENCES rolloff_solutions.prices(id) ON DELETE RESTRICT;
//# sourceMappingURL=LineItems.js.map