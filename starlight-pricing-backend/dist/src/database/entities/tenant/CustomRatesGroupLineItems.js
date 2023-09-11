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
exports.CustomRatesGroupLineItems = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroups_1 = require("./CustomRatesGroups");
let CustomRatesGroupLineItems = class CustomRatesGroupLineItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: true, name: "one_time" }),
    __metadata("design:type", Boolean)
], CustomRatesGroupLineItems.prototype, "oneTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => CustomRatesGroups_1.CustomRatesGroups, (request) => request.id),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_id" }),
    __metadata("design:type", CustomRatesGroups_1.CustomRatesGroups)
], CustomRatesGroupLineItems.prototype, "customRatesGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "line_item_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "lineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "material_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItems.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false, name: "next_price" }),
    __metadata("design:type", Number)
], CustomRatesGroupLineItems.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupLineItems.prototype, "updatedAt", void 0);
CustomRatesGroupLineItems = __decorate([
    (0, typeorm_1.Entity)()
], CustomRatesGroupLineItems);
exports.CustomRatesGroupLineItems = CustomRatesGroupLineItems;
//# sourceMappingURL=CustomRatesGroupLineItems.js.map