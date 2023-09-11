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

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { SubscriptionWorkOrders } from './SubscriptionWorkOrders';

@Entity()
export class SubscriptionWorkOrdersLineItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'subscription_work_order_id', nullable: true })
  subscriptionWorkOrderId: number;

  @ManyToOne(_ => SubscriptionWorkOrders, subscriptionWorkOrders => subscriptionWorkOrders.id)
  @JoinColumn({ name: 'subscription_work_order_id' })
  subscriptionWorkOrderFK: SubscriptionWorkOrders;

  @Column({ type: 'int4', name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', name: 'global_rates_line_items_id' })
  globalRatesLineItemsId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_line_items_id',
  })
  customRatesGroupLineItemsId: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  price: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'material_id',
  })
  materialId: number;

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
