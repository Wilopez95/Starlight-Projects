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
exports.RecurrentOrderTemplateLineItems = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
const Prices_1 = require("./Prices");
const RecurrentOrderTemplates_1 = require("./RecurrentOrderTemplates");
let RecurrentOrderTemplateLineItems = class RecurrentOrderTemplateLineItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "recurrent_order_template_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "recurrentOrderTemplateId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RecurrentOrderTemplates_1.RecurrentOrderTemplate, (recurrentOrderTemplate) => recurrentOrderTemplate.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "recurrent_order_template_id" }),
    __metadata("design:type", RecurrentOrderTemplates_1.RecurrentOrderTemplate)
], RecurrentOrderTemplateLineItems.prototype, "recurrentOrderTemplateFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_line_items_id",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "apply_surcharges",
    }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateLineItems.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItems.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Prices_1.Prices, (prices) => prices.id),
    (0, typeorm_1.JoinColumn)({ name: "price_id" }),
    __metadata("design:type", Prices_1.Prices)
], RecurrentOrderTemplateLineItems.prototype, "priceFK", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateLineItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateLineItems.prototype, "updatedAt", void 0);
RecurrentOrderTemplateLineItems = __decorate([
    (0, typeorm_1.Entity)()
], RecurrentOrderTemplateLineItems);
exports.RecurrentOrderTemplateLineItems = RecurrentOrderTemplateLineItems;
//# sourceMappingURL=RecurrentOrderTemplateLineItems.js.map