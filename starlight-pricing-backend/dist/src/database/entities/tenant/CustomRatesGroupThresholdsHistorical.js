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
exports.CustomRatesGroupThresholdsHistorical = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroups_1 = require("./CustomRatesGroups");
let CustomRatesGroupThresholdsHistorical = class CustomRatesGroupThresholdsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupThresholdsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupThresholdsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "limit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "material_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "threshold_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "thresholdId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CustomRatesGroups_1.CustomRatesGroups),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_id" }),
    __metadata("design:type", CustomRatesGroups_1.CustomRatesGroups)
], CustomRatesGroupThresholdsHistorical.prototype, "customRatesGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupThresholdsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], CustomRatesGroupThresholdsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], CustomRatesGroupThresholdsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], CustomRatesGroupThresholdsHistorical.prototype, "traceId", void 0);
CustomRatesGroupThresholdsHistorical = __decorate([
    (0, typeorm_1.Check)(`"event_type" IN ('created','edited','deleted')`),
    (0, typeorm_1.Entity)()
], CustomRatesGroupThresholdsHistorical);
exports.CustomRatesGroupThresholdsHistorical = CustomRatesGroupThresholdsHistorical;
//# sourceMappingURL=CustomRatesGroupThresholdsHistorical.js.map