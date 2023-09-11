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
exports.CustomRatesGroupServices = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroups_1 = require("./CustomRatesGroups");
let CustomRatesGroupServices = class CustomRatesGroupServices {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => CustomRatesGroups_1.CustomRatesGroups, (request) => request.id),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_id" }),
    __metadata("design:type", CustomRatesGroups_1.CustomRatesGroups)
], CustomRatesGroupServices.prototype, "customRatesGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_service_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupServices.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "next_price" }),
    __metadata("design:type", Number)
], CustomRatesGroupServices.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupServices.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupServices.prototype, "updatedAt", void 0);
CustomRatesGroupServices = __decorate([
    (0, typeorm_1.Entity)()
], CustomRatesGroupServices);
exports.CustomRatesGroupServices = CustomRatesGroupServices;
//# sourceMappingURL=CustomRatesGroupServices.js.map