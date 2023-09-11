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
exports.RecurrentOrderTemplateLineItemsHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let RecurrentOrderTemplateLineItemsHistorical = class RecurrentOrderTemplateLineItemsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "event_type" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "system", name: "user_id" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "recurrent_order_template_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "recurrentOrderTemplateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_line_items_id",
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, name: "apply_surcharges" }),
    __metadata("design:type", Boolean)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "applySurcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "price_id" }),
    __metadata("design:type", Number)
], RecurrentOrderTemplateLineItemsHistorical.prototype, "priceId", void 0);
RecurrentOrderTemplateLineItemsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], RecurrentOrderTemplateLineItemsHistorical);
exports.RecurrentOrderTemplateLineItemsHistorical = RecurrentOrderTemplateLineItemsHistorical;
//# sourceMappingURL=RecurrentOrderTemplateLineItemsHistorical.js.map