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
exports.Prices = void 0;
const typeorm_1 = require("typeorm");
const PriceGroups_1 = require("./PriceGroups");
let Prices = class Prices {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Prices.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_group_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "priceGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriceGroups_1.PriceGroups, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "price_group_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "priceGroupFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "entity_type" }),
    __metadata("design:type", String)
], Prices.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "billable_service_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "material_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "threshold_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "surcharge_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "billing_cycle" }),
    __metadata("design:type", String)
], Prices.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "frequency_id" }),
    __metadata("design:type", Number)
], Prices.prototype, "frequencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], Prices.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "next_price" }),
    __metadata("design:type", Number)
], Prices.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: null }),
    __metadata("design:type", Number)
], Prices.prototype, "limit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        nullable: false,
        name: "start_at",
    }),
    __metadata("design:type", Date)
], Prices.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "end_at",
    }),
    __metadata("design:type", Date)
], Prices.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], Prices.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], Prices.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], Prices.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], Prices.prototype, "traceId", void 0);
Prices = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"entity_type" in ('SURCHARGE', 'THRESHOLD', 'ONE_TIME_SERVICE', 'RECURRING_SERVICE', 'ONE_TIME_LINE_ITEM', 'RECURRING_LINE_ITEM')`),
    (0, typeorm_1.Check)(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
], Prices);
exports.Prices = Prices;
//# sourceMappingURL=Prices.js.map