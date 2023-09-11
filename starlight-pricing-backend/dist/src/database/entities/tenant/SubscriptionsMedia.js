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
exports.SubscriptionsMedia = void 0;
const typeorm_1 = require("typeorm");
const Subscriptions_1 = require("./Subscriptions");
let SubscriptionsMedia = class SubscriptionsMedia {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", Number)
], SubscriptionsMedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "url" }),
    __metadata("design:type", String)
], SubscriptionsMedia.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "file_name" }),
    __metadata("design:type", String)
], SubscriptionsMedia.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "author" }),
    __metadata("design:type", String)
], SubscriptionsMedia.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsMedia.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsMedia.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionsMedia.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Subscriptions_1.Subscriptions, (subscriptions) => subscriptions.id, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_id" }),
    __metadata("design:type", Subscriptions_1.Subscriptions)
], SubscriptionsMedia.prototype, "subscriptionFK", void 0);
SubscriptionsMedia = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Unique)(["subscriptionId", "url"])
], SubscriptionsMedia);
exports.SubscriptionsMedia = SubscriptionsMedia;
//# sourceMappingURL=SubscriptionsMedia.js.map