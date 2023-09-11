/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { SubscriptionServiceItem } from './SubscriptionServiceItem';

@Entity()
export class SubscriptionLineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'subscription_service_item_id',
  })
  subscriptionServiceItemId: number;

  @ManyToOne(_ => SubscriptionServiceItem, request => request.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_service_item_id' })
  subscriptionServiceItemFK: SubscriptionServiceItem;

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
  nextPrice: number;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'unlock_overrides',
  })
  unlockOverrides: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'proration_override',
  })
  prorationOverride: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'proration_effective_date',
  })
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
}
