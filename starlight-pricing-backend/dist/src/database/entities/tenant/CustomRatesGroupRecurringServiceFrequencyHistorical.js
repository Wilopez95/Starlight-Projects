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
exports.CustomRatesGroupRecurringServiceFrequencyHistorical = void 0;
const typeorm_1 = require("typeorm");
let CustomRatesGroupRecurringServiceFrequencyHistorical = class CustomRatesGroupRecurringServiceFrequencyHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "event_type" }),
    __metadata("design:type", String)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "system", name: "user_id" }),
    __metadata("design:type", String)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int4",
        nullable: false,
        name: "billable_service_frequency_id",
    }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "billableServiceFrequencyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "custom_rates_group_recurring_service_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "customRatesGroupRecurringServiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "monthly",
        name: "billing_cycle",
    }),
    __metadata("design:type", String)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "effective_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint", nullable: true, name: "next_price" }),
    __metadata("design:type", Number)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "nextPrice", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupRecurringServiceFrequencyHistorical.prototype, "updatedAt", void 0);
CustomRatesGroupRecurringServiceFrequencyHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], CustomRatesGroupRecurringServiceFrequencyHistorical);
exports.CustomRatesGroupRecurringServiceFrequencyHistorical = CustomRatesGroupRecurringServiceFrequencyHistorical;
//# sourceMappingURL=CustomRatesGroupRecurringServiceFrequencyHistorical.js.map