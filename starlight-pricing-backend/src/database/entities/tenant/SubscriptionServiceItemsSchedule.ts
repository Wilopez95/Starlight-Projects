/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
export class SubscriptionServiceItemsSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false, name: 'subscription_id' })
  subscriptionId: number;

  @Column({
    type: 'integer',
    nullable: false,
    name: 'subscription_service_item_id',
  })
  subscriptionServiceItemId: number;

  @Column({ type: 'integer', nullable: false, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'integer', default: null, name: 'material_id' })
  materialId: number;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@OneToOne(() => Prices)
  //@JoinColumn({ name: "price_id" })
  //pricesFK: Prices;

  @Column({ type: 'text', nullable: false, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'integer', default: null, name: 'frequency_id' })
  frequencyId: number;

  @Column({ type: 'jsonb', default: null, name: 'service_days_of_week' })
  serviceDaysOfWeek: JSON;

  @Column({ type: 'integer', default: null })
  quantity: number;

  @Column({ type: 'boolean', default: false, name: 'override_price' })
  overridePrice: boolean;

  @Column({ type: 'boolean', default: false, name: 'override_proration' })
  overrideProration: boolean;

  @Column({ type: 'bigint', nullable: false })
  price: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'bigint', nullable: false, name: 'overridden_price' })
  overriddenPrice: number; //when override_price

  @Column({ type: 'bigint', nullable: true, name: 'next_price' })
  nextPrice: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'bigint', nullable: true })
  amount: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'bigint', nullable: true, name: 'prorated_amount' })
  proratedAmount: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'overridden_prorated_amount',
  })
  overriddenProratedAmount: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'bigint', nullable: true })
  total: number; //show as decimal depending on locale on FE, at least 6 fractional digits

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
    type: 'timestamp without time zone',
    nullable: false,
    name: 'start_at',
  })
  startAt: Date;

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'end_at',
  })
  endAt: Date;

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'invoiced_at',
  })
  invoicedAt: Date;

  @Column({
    type: 'timestamp without time zone',
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
