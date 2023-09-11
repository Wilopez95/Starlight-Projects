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
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionOrdersLineItemsHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
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

  @Column({ type: 'int4', nullable: true, name: 'subscription_work_order_id' })
  subscriptionWorkOrderId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_line_items_id' })
  globalRatesLineItemsId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_line_items_id',
  })
  customRatesGroupLineItemsId: number;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ type: 'numeric', nullable: true })
  quantity: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'work_order_line_item_id' })
  workOrderLineItemId: number;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'unlock_overrides',
  })
  unlockOverrides: boolean;

  // refactor starts here

  @Column({ type: 'timestamp', name: 'invoiced_at', nullable: true })
  invoicedAt: Date;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  @Column({ name: 'subscription_order_id', nullable: true })
  subscriptionOrderId: number;
}
