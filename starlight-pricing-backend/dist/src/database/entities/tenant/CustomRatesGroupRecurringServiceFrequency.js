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
exports.CustomRatesGroupRecurringServiceFrequency = void 0;
const typeorm_1 = require("typeorm");
const CustomRatesGroupServices_1 = require("./CustomRatesGroupServices");
let CustomRatesGroupRecurringServiceFrequency = class CustomRatesGroupRecurringServiceFrequency {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequency.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        name: "billable_service_frequency_id",
    }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequency.prototype, "billableServiceFrequencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_recurring_service_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequency.prototype, "customRatesGroupRecurringServiceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => CustomRatesGroupServices_1.CustomRatesGroupServices, (request) => request.id),
    (0, typeorm_1.JoinColumn)({ name: "custom_rates_group_recurring_service_id" }),
    __metadata("design:type", CustomRatesGroupServices_1.CustomRatesGroupServices)
], CustomRatesGroupRecurringServiceFrequency.prototype, "customRatesGroupRecurringService", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "monthly",
        name: "billing_cycle",
    }),
    __metadata("design:type", String)
], CustomRatesGroupRecurringServiceFrequency.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequency.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequency.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "next_price" }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequency.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequency.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequency.prototype, "updatedAt", void 0);
CustomRatesGroupRecurringServiceFrequency = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"billing_cycle" IN ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`),
    (0, typeorm_1.Unique)([
        "customRatesGroupRecurringServiceId",
        "billableServiceFrequencyId",
        "billingCycle",
    ])
], CustomRatesGroupRecurringServiceFrequency);
exports.CustomRatesGroupRecurringServiceFrequency = CustomRatesGroupRecurringServiceFrequency;
//# sourceMappingURL=CustomRatesGroupRecurringServiceFrequency.js.map