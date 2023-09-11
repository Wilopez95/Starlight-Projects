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
exports.SubscriptionsMediaHistorical = void 0;
const typeorm_1 = require("typeorm");
let SubscriptionsMediaHistorical = class SubscriptionsMediaHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionsMediaHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionsMediaHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsMediaHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsMediaHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "url" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "file_name" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "author" }),
    __metadata("design:type", String)
], SubscriptionsMediaHistorical.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionsMediaHistorical.prototype, "subscriptionId", void 0);
SubscriptionsMediaHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionsMediaHistorical);
exports.SubscriptionsMediaHistorical = SubscriptionsMediaHistorical;
//# sourceMappingURL=SubscriptionsMediaHistorical.js.map