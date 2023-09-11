/* eslint-disable new-cap */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { SubscriptionLineItem } from './SubscriptionLineItem';
import { SubscriptionOrders } from './SubscriptionOrders';
import { SubscriptionOrdersLineItems } from './SubscriptionOrdersLineItems';
import { Subscriptions } from './Subscriptions';
import { SubscriptionServiceItem } from './SubscriptionServiceItem';

@Entity({ name: 'subscription_surcharge_item' })
export class SubscriptionSurchargeItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int4', name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscriptions, t => t.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscriptionFK: Subscriptions;

  @Column({ type: 'int4', name: 'subscription_service_item_id' })
  subscriptionServiceItemId: number;

  @ManyToOne(_ => SubscriptionServiceItem, t => t.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_service_item_id' })
  subscriptionServiceItemFK: SubscriptionServiceItem;

  @Column({ type: 'int4', name: 'subscription_recurring_line_item_id' })
  subscriptionRecurringLineItemId: number;

  @ManyToOne(_ => SubscriptionLineItem, t => t.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_recurring_line_item_id' })
  subscriptionRecurringLineItemFK: SubscriptionLineItem;

  @Column({ type: 'int4', name: 'subscription_order_line_item_id' })
  subscriptionOrderLineItemId: number;

  @ManyToOne(_ => SubscriptionOrdersLineItems, t => t.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_order_line_item_id' })
  subscriptionOrderLineItemFK: SubscriptionOrdersLineItems;

  @Column({ type: 'int4', name: 'subscription_order_id' })
  subscriptionOrderId: number;

  @ManyToOne(_ => SubscriptionOrders, t => t.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_order_id' })
  subscriptionOrderFK: SubscriptionOrders;

  @Column({ type: 'int4', name: 'surcharge_id', nullable: false })
  surchargeId: number;

  @Column({ type: 'int4', name: 'billable_line_item_id', nullable: true })
  billableLineItemId: number;

  @Column({ type: 'int4', name: 'billable_service_id', nullable: true })
  billableServiceId: number;

  @Column({ type: 'int4', name: 'material_id', nullable: true })
  materialId: number;

  @Column({ type: 'int4', name: 'global_rates_surcharges_id', nullable: false })
  globalRatesSurchargesId: number;

  @Column({ type: 'int4', name: 'custom_rates_group_surcharges_id' })
  customRatesGroupSurchargesId: number;

  // @ManyToOne((target) => CustomRatesGroupSurchargesHistorical, (t) => t.id)
  // @JoinColumn({ name: "custom_rates_group_surcharges_id" })
  // customRatesGroupSurchargesFK: CustomRatesGroupSurchargesHistorical;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

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
}
