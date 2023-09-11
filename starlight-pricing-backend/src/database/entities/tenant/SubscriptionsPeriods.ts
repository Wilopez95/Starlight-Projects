/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PriceGroupsHistorical } from './PriceGroupsHistorical';

@Entity()
@Check(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
@Check(`"status" in ('active', 'onHold', 'closed', 'draft')`)
@Check(`"billing_type" in ('arrears', 'inAdvance')`)
export class SubscriptionsPeriods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'subscription_id' })
  subscriptionId: number;

  @Column({ name: 'price_group_historical_id' })
  priceGroupHistoricalId: number;

  @ManyToOne(_ => PriceGroupsHistorical, priceGroups => priceGroups.id)
  @JoinColumn({ name: 'price_group_historical_id' })
  priceGroupHistorical: number;

  @Column({ type: 'text', nullable: true })
  status: string;

  @Column({ type: 'text', nullable: true, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'text', nullable: true, name: 'billing_type' })
  billingType: string;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'override_proration' })
  overrideProration: boolean;

  @Column({ type: 'int8', nullable: true, name: 'recurring_services_amount' })
  recurringServicesAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_services_prorated_amount',
  })
  recurringServicesProratedAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_services_overridden_prorated_amount',
  })
  recurringServicesOverriddenProratedAmount: number;

  @Column({ type: 'int8', nullable: true, name: 'recurring_services_total' })
  recurringServicesTotal: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_line_items_amount',
  })
  recurringLineItemsAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_line_items_overridden_amount',
  })
  recurringLineItemsOverriddenAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_line_items_total',
  })
  recurringLineItemsTotal: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_line_items_overridden_total',
  })
  recurringLineItemsOverriddenTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'recurring_amount' })
  recurringAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_overridden_amount',
  })
  recurringOverriddenAmount: number;

  @Column({ type: 'int8', nullable: true, name: 'recurring_total' })
  recurringTotal: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'recurring_overridden_total',
  })
  recurringOverriddenTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'one_time_amount' })
  oneTimeAmount: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'one_time_overridden_amount',
  })
  oneTimeOverriddenAmount: number;

  @Column({ type: 'int8', nullable: true, name: 'one_time_total' })
  oneTimeTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'one_time_overridden_total' })
  oneTimeOverriddenTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'before_taxes_grand_total' })
  beforeTaxesGrandTotal: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'before_taxes_overridden_grand_total',
  })
  beforeTaxesOverriddenGrandTotal: number;

  @Column({
    type: 'int8',
    nullable: true,
    name: 'surcharges_total',
  })
  surchargesTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'grand_total' })
  grandTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'overridden_grand_total' })
  overriddenGrandTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'next_grand_total' })
  nextGrandTotal: number;
  /*
    -- transition between billing periods must split records
    -- so if this item has dates range limited by start_date and end_date
    -- that intersects with multiple billing periods
    -- then we have to split this item into multiple records
    -- and all of result records must be in range
    -- of appropriate billing period
    -- (or start_date/end_date if it restricts more)
    -- the same logic applies to invoicing - start_date and end_date of
    -- an invoice both can split this record onto multiple parts
    -- limited by own date range and invoice date range
    */
  @Column({
    type: 'timestamp',
    nullable: false,
    name: 'start_at',
  })
  startAt: Date;

  @Column({
    type: 'timestamp',
    default: null,
    name: 'end_at',
  })
  endAt: Date;

  @Column({
    type: 'timestamp',
    default: null,
    name: 'invoiced_at',
  })
  invoicedAt: Date;

  @Column({
    type: 'timestamp',
    default: null,
    name: 'paid_at',
  })
  paidAt: Date;

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
}
