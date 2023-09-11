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
exports.ThresholdItemsHistorical = void 0;
const typeorm_1 = require("typeorm");
let ThresholdItemsHistorical = class ThresholdItemsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "order_id" }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "threshold_id" }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "global_rates_thresholds_id" }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "globalRatesThresholdsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false, default: 0 }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_id", nullable: true }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "priceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "invoiced_at" }),
    __metadata("design:type", Date)
], ThresholdItemsHistorical.prototype, "invoicedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "paid_at" }),
    __metadata("design:type", Date)
], ThresholdItemsHistorical.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "price_to_display"
    }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "priceToDisplay", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], ThresholdItemsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], ThresholdItemsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: true }),
    __metadata("design:type", Boolean)
], ThresholdItemsHistorical.prototype, "apply_surcharges", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_thresholds_id", nullable: true }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "customRatesGroupThresholdsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], ThresholdItemsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], ThresholdItemsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], ThresholdItemsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], ThresholdItemsHistorical.prototype, "traceId", void 0);
ThresholdItemsHistorical = __decorate([
    (0, typeorm_1.Entity)()
], ThresholdItemsHistorical);
exports.ThresholdItemsHistorical = ThresholdItemsHistorical;
//ALTER TABLE rolloff_solutions.threshold_items ADD CONSTRAINT threshold_items_threshold_id_foreign FOREIGN KEY (threshold_id) REFERENCES rolloff_solutions.thresholds_historical(id) ON DELETE RESTRICT;
//# sourceMappingURL=ThresholdItemsHistorical.js.map