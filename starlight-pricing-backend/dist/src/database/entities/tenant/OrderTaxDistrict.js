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
exports.OrderTaxDistrict = void 0;
const typeorm_1 = require("typeorm");
const Orders_1 = require("./Orders");
let OrderTaxDistrict = class OrderTaxDistrict {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderTaxDistrict.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "tax_district_id" }),
    __metadata("design:type", Number)
], OrderTaxDistrict.prototype, "taxDistrictId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "order_id" }),
    __metadata("design:type", Number)
], OrderTaxDistrict.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Orders_1.Orders, (request) => request.id, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "order_id" }),
    __metadata("design:type", Orders_1.Orders)
], OrderTaxDistrict.prototype, "orderFK", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], OrderTaxDistrict.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], OrderTaxDistrict.prototype, "updatedAt", void 0);
OrderTaxDistrict = __decorate([
    (0, typeorm_1.Entity)()
], OrderTaxDistrict);
exports.OrderTaxDistrict = OrderTaxDistrict;
//# sourceMappingURL=OrderTaxDistrict.js.map