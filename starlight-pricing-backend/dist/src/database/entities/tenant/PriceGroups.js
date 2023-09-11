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
exports.PriceGroups = void 0;
const typeorm_1 = require("typeorm");
let PriceGroups = class PriceGroups {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PriceGroups.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "is_general",
    }),
    __metadata("design:type", Boolean)
], PriceGroups.prototype, "isGeneral", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, default: "" }),
    __metadata("design:type", String)
], PriceGroups.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: false,
        default: 0,
        name: "business_unit_id",
    }),
    __metadata("design:type", Number)
], PriceGroups.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: false,
        default: 0,
        name: "business_line_id",
    }),
    __metadata("design:type", Number)
], PriceGroups.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        array: true,
        nullable: false,
        default: [],
        name: "service_area_ids",
    }),
    __metadata("design:type", Array)
], PriceGroups.prototype, "serviceAreaIds", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: true,
        default: null,
        name: "customer_group_id",
    }),
    __metadata("design:type", Number)
], PriceGroups.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: true,
        default: null,
        name: "customer_id",
    }),
    __metadata("design:type", Number)
], PriceGroups.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        nullable: true,
        default: null,
        name: "customer_job_site_id",
    }),
    __metadata("design:type", Number)
], PriceGroups.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: true }),
    __metadata("design:type", Boolean)
], PriceGroups.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "integer",
        array: true,
        nullable: false,
        default: [],
        name: "valid_days",
    }),
    __metadata("design:type", Array)
], PriceGroups.prototype, "validDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "global",
        name: "overweight_setting",
    }),
    __metadata("design:type", String)
], PriceGroups.prototype, "overweightSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "global",
        name: "usage_days_setting",
    }),
    __metadata("design:type", String)
], PriceGroups.prototype, "usageDaysSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "global",
        name: "demurrage_setting",
    }),
    __metadata("design:type", String)
], PriceGroups.prototype, "demurrageSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "material",
        name: "dump_setting",
    }),
    __metadata("design:type", String)
], PriceGroups.prototype, "dumpSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: false,
        default: "material",
        name: "load_setting",
    }),
    __metadata("design:type", String)
], PriceGroups.prototype, "loadSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        nullable: false,
        name: "start_date",
    }),
    __metadata("design:type", Date)
], PriceGroups.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        nullable: false,
        default: false,
        name: "non_service_hours",
    }),
    __metadata("design:type", Boolean)
], PriceGroups.prototype, "nonServiceHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "sp_used" }),
    __metadata("design:type", Boolean)
], PriceGroups.prototype, "spUsed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], PriceGroups.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], PriceGroups.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp without time zone",
        default: null,
        name: "end_date",
    }),
    __metadata("design:type", Date)
], PriceGroups.prototype, "endDate", void 0);
PriceGroups = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"overweight_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"usage_days_setting" IN ('global','canSize','material','canSizeAndMaterial')`),
    (0, typeorm_1.Check)(`"demurrage_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
], PriceGroups);
exports.PriceGroups = PriceGroups;
//# sourceMappingURL=PriceGroups.js.map