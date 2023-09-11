/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionOrders } from './SubscriptionOrders';

@Entity()
export class SubscriptionOrdersLineItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: true, name: 'subscription_work_order_id' })
  subscriptionWorkOrderId: number;

  @Column({ type: 'int4', nullable: false, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', nullable: false, name: 'global_rates_line_items_id' })
  globalRatesLineItemsId: number;

  @Column({ type: 'int4', nullable: true, name: 'custom_rates_group_line_items_id' })
  customRatesGroupLineItemsId: number;

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ type: 'numeric', nullable: false })
  quantity: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'work_order_line_item_id' })
  workOrderLineItemId: number;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'unlock_overrides' })
  unlockOverrides: boolean;

  // refactor starts here

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
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

  @Column({ name: 'subscription_order_id' })
  subscriptionOrderId: number;

  @ManyToOne(() => SubscriptionOrders, subscriptionOrders => subscriptionOrders.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'subscription_order_id' })
  subscriptionOrder: SubscriptionOrders;
}
