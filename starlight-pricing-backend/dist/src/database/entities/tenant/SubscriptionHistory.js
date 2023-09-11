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
exports.SubscriptionHistory = void 0;
const typeorm_1 = require("typeorm");
const Subscriptions_1 = require("./Subscriptions");
let SubscriptionHistory = class SubscriptionHistory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "subscription_id" }),
    __metadata("design:type", Number)
], SubscriptionHistory.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => Subscriptions_1.Subscriptions, (request) => request.id, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "subscription_id" }),
    __metadata("design:type", Subscriptions_1.Subscriptions)
], SubscriptionHistory.prototype, "subscriptionFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "action" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "attribute" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "attribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "entity" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "entity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "entity_action" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "entityAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "made_by" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "madeBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "made_by_id" }),
    __metadata("design:type", String)
], SubscriptionHistory.prototype, "madeById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], SubscriptionHistory.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true, name: "description" }),
    __metadata("design:type", Object)
], SubscriptionHistory.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionHistory.prototype, "updatedAt", void 0);
SubscriptionHistory = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"action" IN ('added', 'changed', 'removed', 'other')`)
], SubscriptionHistory);
exports.SubscriptionHistory = SubscriptionHistory;
//ALTER TABLE rolloff_solutions.subscription_history
//ADD CONSTRAINT subscription_history_subscription_id_foreign FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE;
//# sourceMappingURL=SubscriptionHistory.js.map