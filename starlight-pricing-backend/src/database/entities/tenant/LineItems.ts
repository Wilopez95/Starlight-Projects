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

import { Orders } from './Orders';

@Entity()
export class LineItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(_ => Orders, request => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  orderFK: Orders;

  @Column({ type: 'int4', nullable: false, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_line_items_id' })
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
    default: 0,
  })
  price: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  quantity: number;

  @Column({ type: 'text', nullable: true, name: 'manifest_number' })
  manifestNumber: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'landfill_operation',
  })
  landfillOperation: boolean;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@OneToOne(() => Prices)
  //@JoinColumn({ name: "price_id" })
  //priceFK: Prices;

  //   @Column({ type: "int8" })
  //   price: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'override_price',
  })
  overridePrice: boolean;

  @Column({ type: 'int8', nullable: true, name: 'overridden_price' })
  overriddenPrice: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({
    type: 'numeric',
    asExpression: 'round(price / 1000000, 2)',
    generatedType: 'STORED',
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
}

// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_billable_line_item_id_foreign FOREIGN KEY (billable_line_item_id) REFERENCES rolloff_solutions.billable_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_custom_rates_group_line_items_id_foreign FOREIGN KEY (custom_rates_group_line_items_id) REFERENCES rolloff_solutions.custom_rates_group_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_global_rates_line_items_id_foreign FOREIGN KEY (global_rates_line_items_id) REFERENCES rolloff_solutions.global_rates_line_items_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_material_id_foreign FOREIGN KEY (material_id) REFERENCES rolloff_solutions.materials_historical(id) ON DELETE RESTRICT;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES rolloff_solutions.orders(id) ON DELETE CASCADE;
// ALTER TABLE rolloff_solutions.line_items ADD CONSTRAINT line_items_refactored_price_id_foreign FOREIGN KEY (refactored_price_id) REFERENCES rolloff_solutions.prices(id) ON DELETE RESTRICT;
