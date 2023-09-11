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
exports.SubscriptionWorkOrdersMedia = void 0;
const typeorm_1 = require("typeorm");
const SubscriptionWorkOrders_1 = require("./SubscriptionWorkOrders");
let SubscriptionWorkOrdersMedia = class SubscriptionWorkOrdersMedia {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersMedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "subscription_work_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersMedia.prototype, "subscriptionWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((target) => SubscriptionWorkOrders_1.SubscriptionWorkOrders, (t) => t.id),
    (0, typeorm_1.JoinColumn)({ name: "subscription_work_order_id" }),
    __metadata("design:type", SubscriptionWorkOrders_1.SubscriptionWorkOrders)
], SubscriptionWorkOrdersMedia.prototype, "subscriptionWorkOrdersFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "url" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMedia.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "timestamp" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMedia.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "author" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMedia.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "file_name" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMedia.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMedia.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMedia.prototype, "updatedAt", void 0);
SubscriptionWorkOrdersMedia = __decorate([
    (0, typeorm_1.Entity)()
], SubscriptionWorkOrdersMedia);
exports.SubscriptionWorkOrdersMedia = SubscriptionWorkOrdersMedia;
//# sourceMappingURL=SubscriptionWorkOrdersMedia.js.map