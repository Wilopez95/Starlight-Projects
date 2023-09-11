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
exports.SubscriptionsHistorical = void 0;
const typeorm_1 = require("typeorm");
const ColumnNumericTransformer_1 = require("../../../utils/ColumnNumericTransformer");
let SubscriptionsHistorical = class SubscriptionsHistorical {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "original_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "originalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "event_type" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "trace_id" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
        name: "updated_at",
    }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "status" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "csr_email" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "csrEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, name: "last_billed_at" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "lastBilledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "next_billing_date" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "nextBillingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "custom_rates_group_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "customRatesGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_line_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "businessLineId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "business_unit_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "businessUnitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "customer_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_group_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "customerGroupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: false, name: "job_site_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "jobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "service_area_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "serviceAreaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "customer_job_site_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "customerJobSiteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_note" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "jobSiteNote", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "job_site_contact_id" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "jobSiteContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "job_site_contact_text_only" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "jobSiteContactTextOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "driver_instructions" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "driverInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "permit_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "permitId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_from" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "bestTimeToComeFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "best_time_to_come_to" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "bestTimeToComeTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "early_pick" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "earlyPick", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "to_roll" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "toRoll", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "high_priority" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "highPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "someone_on_site" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "someoneOnSite", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "third_party_hauler_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "thirdPartyHaulerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "subscription_contact_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "subscriptionContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "start_date" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "end_date" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_cycle" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "billing_type" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "billingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "anniversary_billing" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "anniversaryBilling", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "next_billing_period_from" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "nextBillingPeriodFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "next_billing_period_to" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "nextBillingPeriodTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "equipment_type", default: "unspecified" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "equipmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "unlock_overrides" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "unlockOverrides", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "paymentMethod", default: "onAccount" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "promo_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "promoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "billable_services_total", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "billableServicesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "billable_line_items_total", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "billableLineItemsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "before_taxes_total", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "beforeTaxesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "initial_grand_total", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "initialGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "grand_total", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "grandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "numeric",
        nullable: true,
        name: "billable_subscription_orders_total",
        default: 0,
        transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer(),
    }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "billableSubscriptionOrdersTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true, name: "current_subscription_price", transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "currentSubscriptionPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "reason" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "reason_description" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "reasonDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "hold_subscription_until" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "holdSubscriptionUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "service_frequency" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "serviceFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "alley_placement" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "alleyPlacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "signature_required" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "signatureRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "rates_changed" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "ratesChanged", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "min_billing_periods" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "minBillingPeriods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "subscription_end_email_sent" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "subscriptionEndEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "subscription_resume_email_sent" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "subscriptionResumeEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "override_credit_limit" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "overrideCreditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "invoiced_date" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "invoicedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false, name: "recurring_grand_total", default: 0, transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "recurringGrandTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: false, name: "paid_total", default: 0, transformer: new ColumnNumericTransformer_1.ColumnNumericTransformer() }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "paidTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "period_from" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "periodFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "period_to" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "periodTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "purchase_order_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "purchase_order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true, name: "csr_comment" }),
    __metadata("design:type", String)
], SubscriptionsHistorical.prototype, "csrComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "po_required" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "poRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "permitRequired" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "permitRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: true, default: false, name: "cab_over" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "cabOver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "on_hold_email_sent" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "onHoldEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "on_hold_notify_sales_rep" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "onHoldNotifySalesRep", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", nullable: false, default: false, name: "on_hold_notify_main_contact" }),
    __metadata("design:type", Boolean)
], SubscriptionsHistorical.prototype, "onHoldNotifyMainContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int4", nullable: true, name: "competitor_id" }),
    __metadata("design:type", Number)
], SubscriptionsHistorical.prototype, "competitorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true, name: "competitor_expiration_date" }),
    __metadata("design:type", Date)
], SubscriptionsHistorical.prototype, "competitorExpirationDate", void 0);
SubscriptionsHistorical = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Check)(`"event_type" IN ('created', 'edited', 'deleted')`)
], SubscriptionsHistorical);
exports.SubscriptionsHistorical = SubscriptionsHistorical;
//# sourceMappingURL=SubscriptionsHistorical.js.map