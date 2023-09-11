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
exports.OrderRequests = void 0;
const typeorm_1 = require("typeorm");
let OrderRequests = class OrderRequests {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderRequests.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "customer_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "contractor_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "contractorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "requested" }),
    __metadata("design:type", String)
], OrderRequests.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "job_site_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "job_site_2_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "jobSite2Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "billable_service_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "billableServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "equipment_item_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "equipmentItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "material_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: false, name: "service_date" }),
    __metadata("design:type", Date)
], OrderRequests.prototype, "serviceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false, name: "billable_service_price" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "billableServicePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: false,
        default: 1,
        name: "billable_service_quantity",
    }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "billableServiceQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "billable_service_total" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "billableServiceTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "initial_grand_total" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "initialGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "grand_total" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "media_urls" }),
    __metadata("design:type", String)
], OrderRequests.prototype, "mediaUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], OrderRequests.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "alley_placement",
    }),
    __metadata("design:type", Boolean)
], OrderRequests.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "someone_on_site",
    }),
    __metadata("design:type", Boolean)
], OrderRequests.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "send_receipt",
    }),
    __metadata("design:type", Boolean)
], OrderRequests.prototype, "sendReceipt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "payment_method" }),
    __metadata("design:type", String)
], OrderRequests.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "credit_card_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "creditCardId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], OrderRequests.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], OrderRequests.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], OrderRequests.prototype, "updatedAt", void 0);
OrderRequests = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"payment_method" IN ('onAccount', 'creditCard', 'cash', 'check', 'mixed')`),
    (0, typeorm_1.Check)(`"status" IN ('requested', 'confirmed', 'history', 'check', 'rejected')`)
], OrderRequests);
exports.OrderRequests = OrderRequests;
//# sourceMappingURL=OrderRequests.js.map