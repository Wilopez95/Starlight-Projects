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
export class SubscriptionLineItemHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'int4', nullable: true, name: 'subscription_service_item_id' })
  subscriptionServiceItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'global_rates_recurring_line_items_billing_cycle_id',
  })
  globalRatesRecurringLineItemsBillingCycleId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_recurring_line_item_billing_cycle_id',
  })
  customRatesGroupRecurringLineItemBillingCycleId: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'price',
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'quantity',
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'next_price',
    transformer: new ColumnNumericTransformer(),
  })
  next_price: number;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'unlock_overrides' })
  unlockOverrides: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'proration_override' })
  prorationOverride: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'proration_effective_date' })
  prorationEffectiveDate: Date;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'proration_effective_price',
    transformer: new ColumnNumericTransformer(),
  })
  prorationEffectivePrice: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_date' })
  invoicedDate: Date;

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

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}
