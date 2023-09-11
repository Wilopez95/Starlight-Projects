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
exports.CustomRatesGroupsHistorical = void 0;
const typeorm_1 = require("typeorm");
let CustomRatesGroupsHistorical = class CustomRatesGroupsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], CustomRatesGroupsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_unit_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_line_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: null }),
    __metadata("design:type", Boolean)
], CustomRatesGroupsHistorical.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "overweight_setting" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "overweightSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "usage_days_setting" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "usageDaysSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "demurrage_setting" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "demurrageSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_group_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], CustomRatesGroupsHistorical.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "material", name: "dump_setting" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "dumpSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "material", name: "load_setting" }),
    __metadata("design:type", String)
], CustomRatesGroupsHistorical.prototype, "loadSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: null, name: "non_service_hours" }),
    __metadata("design:type", Boolean)
], CustomRatesGroupsHistorical.prototype, "nonServiceHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: null, name: "sp_used" }),
    __metadata("design:type", Boolean)
], CustomRatesGroupsHistorical.prototype, "spUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", array: true, default: null, name: "valid_days" }),
    __metadata("design:type", Array)
], CustomRatesGroupsHistorical.prototype, "validDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: false, name: "start_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupsHistorical.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp without time zone", default: null, name: "end_date" }),
    __metadata("design:type", Date)
], CustomRatesGroupsHistorical.prototype, "endDate", void 0);
CustomRatesGroupsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"overweight_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"usage_days_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"demurrage_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"load_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"dump_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"event_type" IN ('created','edited','deleted')`)
], CustomRatesGroupsHistorical);
exports.CustomRatesGroupsHistorical = CustomRatesGroupsHistorical;
//# sourceMappingURL=CustomRatesGroupsHistorical.js.map