/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThresholdItems } from './ThresholdItems';
import { LineItems } from './LineItems';
import { OrderTaxDistrict } from './OrderTaxDistrict';

@Entity()
@Check(`"type" in ('service', 'material', 'lineItems', 'specificLineItem','threshold')`)
export class OrderTaxDistrictTaxes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_tax_district_id' })
  orderTaxDistrictId: number;

  // @Column({ type: "integer",nullable: false})
  @ManyToOne(() => OrderTaxDistrict, { nullable: false })
  @JoinColumn({ name: 'order_tax_district_id' })
  orderTaxDistrictFK: number;

  @Column({ type: 'numeric', nullable: true, name: 'per_ton_rate' })
  perTonRate: number;

  @Column({ type: 'numeric', nullable: true, default: 0, name: 'percentage_rate' })
  percentageRate: number;

  @Column({ type: 'numeric', nullable: false, name: 'amount' })
  amount: number;

  @Column({ type: 'boolean', default: false, nullable: false, name: 'flat_rate' })
  flat_rate: boolean;

  @Column({ type: 'boolean', default: false, nullable: false, name: 'calculated_per_order' })
  calculatedPerOrder: boolean;

  @Column({ type: 'text', nullable: false, name: 'type' })
  type: string;

  @Column({ type: 'numeric', nullable: true, name: 'line_item_per_quantity_rate' })
  lineItemPerQuantityRate: number;

  @Column({ name: 'line_item_id', nullable: true })
  lineItemId: number;

  @OneToOne(() => LineItems)
  @JoinColumn({ name: 'line_item_id' })
  lineItemFK: LineItems;

  @Column({ name: 'threshold_id', nullable: true })
  thresholdId: number;

  @OneToOne(() => ThresholdItems)
  @JoinColumn({ name: 'threshold_id' })
  ThresholdFK: ThresholdItems;

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
