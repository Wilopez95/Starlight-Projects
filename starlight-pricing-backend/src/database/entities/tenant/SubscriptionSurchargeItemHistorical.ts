/* eslint-disable new-cap */
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

@Entity({ name: 'subscription_surcharge_item_historical' })
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionSurchargeItemHistorical {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int4', name: 'original_id', nullable: false })
  originalId: number;

  @Column({ type: 'text', name: 'event_type', nullable: false })
  eventType: string;

  @Column({
    type: 'text',
    name: 'user_id',
    nullable: false,
    default: () => "'system'::text",
  })
  userId: string;

  @Column({ type: 'text', name: 'trace_id:', nullable: true })
  traceId: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ type: 'int4', name: 'subscription_id', nullable: true })
  subscriptionId: number;

  @Column({
    type: 'int4',
    name: 'subscription_service_item_id',
    nullable: true,
  })
  subscriptionServiceItemId: number;

  @Column({
    type: 'int4',
    name: 'subscription_recurring_line_item_id',
    nullable: true,
  })
  subscriptionRecurringLineItemId: number;

  @Column({
    type: 'int4',
    name: 'subscription_order_line_item_id',
    nullable: true,
  })
  subscriptionOrderLineItemId: number;

  @Column({ type: 'int4', name: 'subscription_order_id', nullable: true })
  subscriptionOrderId: number;

  @Column({ type: 'int4', name: 'surcharge_id', nullable: true })
  surchargeId: number;

  @Column({ type: 'int4', name: 'billable_line_item_id', nullable: true })
  billableLineItemId: number;

  @Column({ type: 'int4', name: 'billable_service_id', nullable: true })
  billableServiceId: number;

  @Column({ type: 'int4', name: 'material_id', nullable: true })
  materialId: number;

  @Column({ type: 'int4', name: 'global_rates_surchages_id', nullable: true })
  globalRatesSurchagesId: number;

  @Column({
    type: 'int4',
    name: 'custom_rates_group_surchages_id',
    nullable: true,
  })
  customRatesGroupSurchagesId: number;

  @Column({
    type: 'numeric',
    name: 'amount',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'numeric',
    name: 'quantity',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;
}
