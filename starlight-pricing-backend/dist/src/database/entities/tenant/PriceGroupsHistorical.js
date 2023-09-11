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
exports.PriceGroupsHistorical = void 0;
const typeorm_1 = require("typeorm");
let PriceGroupsHistorical = class PriceGroupsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false, name: "is_general" }),
    __metadata("design:type", Boolean)
], PriceGroupsHistorical.prototype, "isGeneral", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_unit_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "business_line_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        array: true,
        default: null,
        name: "service_area_ids",
    }),
    __metadata("design:type", Array)
], PriceGroupsHistorical.prototype, "serviceAreaIds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_group_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", default: null, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: null }),
    __metadata("design:type", Boolean)
], PriceGroupsHistorical.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", array: true, default: null, name: "valid_days" }),
    __metadata("design:type", Array)
], PriceGroupsHistorical.prototype, "validDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "overweight_setting" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "overweightSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "usage_days_setting" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "usageDaysSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", default: null, name: "demurrage_setting" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "demurrageSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "material",
        name: "dump_setting",
    }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "dumpSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "material",
        name: "load_setting",
    }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "loadSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: false, name: "start_date" }),
    __metadata("design:type", Date)
], PriceGroupsHistorical.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "end_date",
    }),
    __metadata("design:type", Date)
], PriceGroupsHistorical.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "integer", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], PriceGroupsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "user_id" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], PriceGroupsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], PriceGroupsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "trace_id" }),
    __metadata("design:type", String)
], PriceGroupsHistorical.prototype, "traceId", void 0);
PriceGroupsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created','edited','deleted')`)
], PriceGroupsHistorical);
exports.PriceGroupsHistorical = PriceGroupsHistorical;
//# sourceMappingURL=PriceGroupsHistorical.js.map