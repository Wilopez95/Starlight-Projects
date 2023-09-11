/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionsHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: true, name: 'trace_id' })
  traceId: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  public updatedAt: Date;

  @Column({ type: 'text', nullable: false, name: 'status' })
  status: string;

  @Column({ type: 'text', nullable: false, name: 'csr_email' })
  csrEmail: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_billed_at' })
  lastBilledAt: Date;

  @Column({ type: 'date', nullable: true, name: 'next_billing_date' })
  nextBillingDate: Date;

  @Column({ type: 'int4', nullable: true, name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @Column({ type: 'int4', nullable: false, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'int4', nullable: false, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'int4', nullable: false, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_group_id' })
  customerGroupId: number;

  @Column({ type: 'int4', nullable: false, name: 'job_site_id' })
  jobSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_job_site_id' })
  customerJobSiteId: number;

  @Column({ type: 'text', nullable: true, name: 'job_site_note' })
  jobSiteNote: string;

  @Column({ type: 'text', nullable: true, name: 'job_site_contact_id' })
  jobSiteContactId: string;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'job_site_contact_text_only' })
  jobSiteContactTextOnly: boolean;

  @Column({ type: 'text', nullable: true, name: 'driver_instructions' })
  driverInstructions: string;

  @Column({ type: 'int4', nullable: true, name: 'permit_id' })
  permitId: number;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_from' })
  bestTimeToComeFrom: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_to' })
  bestTimeToComeTo: string;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'early_pick' })
  earlyPick: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'to_roll' })
  toRoll: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'high_priority' })
  highPriority: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'someone_on_site' })
  someoneOnSite: boolean;

  @Column({ type: 'int4', nullable: true, name: 'third_party_hauler_id' })
  thirdPartyHaulerId: number;

  @Column({ type: 'int4', nullable: true, name: 'subscription_contact_id' })
  subscriptionContactId: number;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'text', nullable: true, name: 'billing_type' })
  billingType: string;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'anniversary_billing' })
  anniversaryBilling: boolean;

  @Column({ type: 'date', nullable: true, name: 'next_billing_period_from' })
  nextBillingPeriodFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'next_billing_period_to' })
  nextBillingPeriodTo: Date;

  @Column({ type: 'text', nullable: false, name: 'equipment_type', default: 'unspecified' })
  equipmentType: string;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'unlock_overrides' })
  unlockOverrides: boolean;

  @Column({ type: 'text', nullable: false, name: 'paymentMethod', default: 'onAccount' })
  paymentMethod: string;

  @Column({ type: 'int4', nullable: true, name: 'promo_id' })
  promoId: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'billable_services_total',
    transformer: new ColumnNumericTransformer(),
  })
  billableServicesTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'billable_line_items_total',
    transformer: new ColumnNumericTransformer(),
  })
  billableLineItemsTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'before_taxes_total',
    transformer: new ColumnNumericTransformer(),
  })
  beforeTaxesTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'initial_grand_total',
    transformer: new ColumnNumericTransformer(),
  })
  initialGrandTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'grand_total',
    transformer: new ColumnNumericTransformer(),
  })
  grandTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'billable_subscription_orders_total',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  billableSubscriptionOrdersTotal: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'current_subscription_price',
    transformer: new ColumnNumericTransformer(),
  })
  currentSubscriptionPrice: number;

  @Column({ type: 'text', nullable: true, name: 'reason' })
  reason: string;

  @Column({ type: 'text', nullable: true, name: 'reason_description' })
  reasonDescription: string;

  @Column({ type: 'date', nullable: true, name: 'hold_subscription_until' })
  holdSubscriptionUntil: Date;

  @Column({ type: 'text', nullable: true, name: 'service_frequency' })
  serviceFrequency: string;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'alley_placement' })
  alleyPlacement: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'signature_required' })
  signatureRequired: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'rates_changed' })
  ratesChanged: boolean;

  @Column({ type: 'int4', nullable: true, name: 'min_billing_periods' })
  minBillingPeriods: number;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'subscription_end_email_sent' })
  subscriptionEndEmailSent: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'subscription_resume_email_sent',
  })
  subscriptionResumeEmailSent: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'override_credit_limit' })
  overrideCreditLimit: boolean;

  @Column({ type: 'date', nullable: true, name: 'invoiced_date' })
  invoicedDate: Date;

  @Column({
    type: 'numeric',
    nullable: false,
    name: 'recurring_grand_total',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  recurringGrandTotal: number;

  @Column({
    type: 'numeric',
    nullable: false,
    name: 'paid_total',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  paidTotal: number;

  @Column({ type: 'date', nullable: true, name: 'period_from' })
  periodFrom: Date;

  @Column({ type: 'date', nullable: true, name: 'period_to' })
  periodTo: Date;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchase_order_id: number;

  @Column({ type: 'text', nullable: true, name: 'csr_comment' })
  csrComment: string;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'po_required' })
  poRequired: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'permitRequired' })
  permitRequired: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'cab_over' })
  cabOver: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'on_hold_email_sent' })
  onHoldEmailSent: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'on_hold_notify_sales_rep' })
  onHoldNotifySalesRep: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'on_hold_notify_main_contact' })
  onHoldNotifyMainContact: boolean;

  @Column({ type: 'int4', nullable: true, name: 'competitor_id' })
  competitorId: number;

  @Column({ type: 'date', nullable: true, name: 'competitor_expiration_date' })
  competitorExpirationDate: Date;
}
