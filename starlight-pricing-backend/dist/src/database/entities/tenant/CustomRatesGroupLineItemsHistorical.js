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
exports.CustomRatesGroupLineItemsHistorical = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroups_1 = require("./CustomRatesGroups");
let CustomRatesGroupLineItemsHistorical = class CustomRatesGroupLineItemsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "event_type" }),
    __metadata("design:type", String)
], CustomRatesGroupLineItemsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "system", name: "user_id" }),
    __metadata("design:type", String)
], CustomRatesGroupLineItemsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], CustomRatesGroupLineItemsHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: true, name: "one_time" }),
    __metadata("design:type", Boolean)
], CustomRatesGroupLineItemsHistorical.prototype, "oneTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => CustomRatesGroups_1.CustomRatesGroups, (request) => request.id),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_id" }),
    __metadata("design:type", CustomRatesGroups_1.CustomRatesGroups)
], CustomRatesGroupLineItemsHistorical.prototype, "customRatesGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "line_item_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItemsHistorical.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false, name: "next_price" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItemsHistorical.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItemsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItemsHistorical.prototype, "updatedAt", void 0);
CustomRatesGroupLineItemsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], CustomRatesGroupLineItemsHistorical);
exports.CustomRatesGroupLineItemsHistorical = CustomRatesGroupLineItemsHistorical;
//# sourceMappingURL=CustomRatesGroupLineItemsHistorical.js.map