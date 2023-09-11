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
exports.CustomRatesGroupSurcharges = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroups_1 = require("./CustomRatesGroups");
let CustomRatesGroupSurcharges = class CustomRatesGroupSurcharges {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupSurcharges.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupSurcharges.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "material_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "surcharge_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "surchargeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupSurcharges.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CustomRatesGroups_1.CustomRatesGroups),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_id" }),
    __metadata("design:type", CustomRatesGroups_1.CustomRatesGroups)
], CustomRatesGroupSurcharges.prototype, "customRatesGroup", void 0);
CustomRatesGroupSurcharges = __decorate([
    (0, typeorm_1.Entity)()
], CustomRatesGroupSurcharges);
exports.CustomRatesGroupSurcharges = CustomRatesGroupSurcharges;
//# sourceMappingURL=CustomRatesGroupSurcharges.js.map