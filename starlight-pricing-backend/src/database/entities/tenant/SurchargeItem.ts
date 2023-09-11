/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { Orders } from './Orders';
import { LineItems } from './LineItems';
import { ThresholdItems } from './ThresholdItems';

@Entity()
export class SurchargeItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(_ => Orders, order => order.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  orders: Orders;

  @Column({ type: 'int4', nullable: false, name: 'surcharge_id' })
  surchargeId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'threshold_id' })
  thresholdId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_surcharges_id' })
  globalRatesSurchargesId: number;

  @Column({ name: 'custom_rates_group_surcharges_id', nullable: true })
  customRatesGroupSurchargesId: number;

  //@OneToOne(() => CustomRatesGroupSurcharges)
  //@JoinColumn({ name: "custom_rates_group_surcharges_id" })
  //customRatesGroupSurcharges: CustomRatesGroupSurcharges;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  amount: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  quantity: number;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@ManyToOne((type) => Prices, (prices) => prices.id)
  //@JoinColumn({ name: "price_id" })
  //pricesFK: Prices; // refactor starts here

  //@Column({ type: "int8"})
  //amount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date; // refactor ends here

  @Column({
    type: 'text',
    name: 'amount_to_display',
    nullable: true,
    default: '',
  })
  amountToDisplay: number;

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

  @Column({ name: 'line_item_id', nullable: true })
  lineItemId: number;

  @OneToOne(() => LineItems)
  @JoinColumn({ name: 'line_item_id' })
  lineItem: LineItems;

  @Column({ name: 'threshold_item_id', nullable: true })
  thresholdItemId: number;

  @ManyToOne(_ => ThresholdItems, thresholdItems => thresholdItems.id)
  @JoinColumn({ name: 'threshold_item_id' })
  thresholdItem: ThresholdItems;
}
