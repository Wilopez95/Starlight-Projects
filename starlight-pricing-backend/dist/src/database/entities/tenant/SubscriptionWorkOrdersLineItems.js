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
exports.SubscriptionWorkOrdersLineItems = void 0;
const typeorm_1 = require("typeorm");
const SubscriptionWorkOrders_1 = require("./SubscriptionWorkOrders");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionWorkOrdersLineItems = class SubscriptionWorkOrdersLineItems {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "subscription_work_order_id", nullable: true }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "subscriptionWorkOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => SubscriptionWorkOrders_1.SubscriptionWorkOrders, (subscriptionWorkOrders) => subscriptionWorkOrders.id),
    (0, typeorm_1.JoinColumn)({ name: "subscription_work_order_id" }),
    __metadata("design:type", SubscriptionWorkOrders_1.SubscriptionWorkOrders)
], SubscriptionWorkOrdersLineItems.prototype, "subscriptionWorkOrderFK", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "billable_line_item_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "billableLineItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", name: "global_rates_line_items_id" }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "globalRatesLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "custom_rates_group_line_items_id",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "customRatesGroupLineItemsId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
        nullable: false,
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: true,
        name: "material_id",
    }),
    __metadata("design:type", Number)
], SubscriptionWorkOrdersLineItems.prototype, "materialId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersLineItems.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionWorkOrdersLineItems.prototype, "updatedAt", void 0);
SubscriptionWorkOrdersLineItems = __decorate([
    (0, typeorm_1.Entity)()
], SubscriptionWorkOrdersLineItems);
exports.SubscriptionWorkOrdersLineItems = SubscriptionWorkOrdersLineItems;
//# sourceMappingURL=SubscriptionWorkOrdersLineItems.js.map