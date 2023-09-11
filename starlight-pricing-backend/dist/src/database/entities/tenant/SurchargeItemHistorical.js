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
exports.SurchargeItemHistorical = void 0;
const typeorm_1 = require("typeorm");
let SurchargeItemHistorical = class SurchargeItemHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "surcharge_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "billable_service_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "threshold_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_surcharges_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "globalRatesSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_surcharges_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "customRatesGroupSurchargesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], SurchargeItemHistorical.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], SurchargeItemHistorical.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
        name: "amount_to_display",
        default: ""
    }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "amountToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SurchargeItemHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SurchargeItemHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "line_item_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "threshold_item_id", nullable: true }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "thresholdItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SurchargeItemHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SurchargeItemHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SurchargeItemHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], SurchargeItemHistorical.prototype, "traceId", void 0);
SurchargeItemHistorical = __decorate([
    (0, typeorm_1.Entity)()
], SurchargeItemHistorical);
exports.SurchargeItemHistorical = SurchargeItemHistorical;
//# sourceMappingURL=SurchargeItemHistorical.js.map