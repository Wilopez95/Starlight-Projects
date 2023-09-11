/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

@Entity()
@Check(`"event_type" in ('created', 'edited', 'deleted')`)
export class SubscriptionServiceItemHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'original_id',
  })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

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

  @Column({ type: 'text', nullable: true, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'date', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'boolean', nullable: true })
  recalculate: boolean;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'prorate_total',
    transformer: new ColumnNumericTransformer(),
  })
  prorateTotal: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'service_frequency_id',
  })
  serviceFrequencyId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'subscription_id',
  })
  subscriptionId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'billable_service_id',
  })
  billableServiceId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'global_rates_recurring_services_id',
  })
  globalRatesRecurringServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_services_id',
  })
  customRatesGroupServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'material_id',
  })
  materialId: number;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'next_price',
    transformer: new ColumnNumericTransformer(),
  })
  nextPrice: number;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'service_days_of_week' })
  serviceDaysOfWeek: string;

  @Column({ type: 'date', nullable: true, name: 'proration_effective_date' })
  prorationEffectiveDate: Date;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'proration_effective_price',
    transformer: new ColumnNumericTransformer(),
  })
  prorationEffectivePrice: number;

  @Column({ type: 'date', nullable: true, name: 'invoiced_date' })
  invoicedDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'unlock_overrides',
  })
  unlockOverrides: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'proration_override',
  })
  prorationOverride: boolean;
}
