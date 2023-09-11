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
exports.SubscriptionWorkOrdersMediaHistorical = void 0;
const typeorm_1 = require("typeorm");
let SubscriptionWorkOrdersMediaHistorical = class SubscriptionWorkOrdersMediaHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersMediaHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersMediaHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "subscription_work_order_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersMediaHistorical.prototype, "subscriptionWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "url" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "timestamp" }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMediaHistorical.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "author" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "file_name" }),
    __metadata("design:type", String)
], SubscriptionWorkOrdersMediaHistorical.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMediaHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersMediaHistorical.prototype, "updatedAt", void 0);
SubscriptionWorkOrdersMediaHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionWorkOrdersMediaHistorical);
exports.SubscriptionWorkOrdersMediaHistorical = SubscriptionWorkOrdersMediaHistorical;
//# sourceMappingURL=SubscriptionWorkOrdersMediaHistorical.js.map