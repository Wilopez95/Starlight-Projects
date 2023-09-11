/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

import { Orders } from './Orders';

@Entity()
export class ThresholdItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(_ => Orders, order => order.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  orders: Orders;

  @Column({ type: 'int4', nullable: false, name: 'threshold_id' })
  thresholdId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_thresholds_id' })
  globalRatesThresholdsId: number;

  @Column({
    type: 'numeric',
    nullable: false,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  //TODO: remove nullable true
  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@ManyToOne((type) => Prices, (prices) => prices.id)
  //@JoinColumn({ name: "price_id" })
  //prices: Prices; // refactor starts here

  //@Column({ type: "int8"})
  //price: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date; // refactor ends here

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'price_to_display',
  })
  priceToDisplay: number;

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

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'apply_surcharges',
  })
  applySurcharges: boolean;

  //TODO: remove nullable true
  @Column({ name: 'custom_rates_group_thresholds_id', nullable: true })
  customRatesGroupThresholdsId: number;

  //@ManyToOne(() => CustomRatesGroupThresholds)
  //@JoinColumn({ name: "custom_rates_group_thresholds_id" })
  //customRatesGroupThresholds: Prices;
}
