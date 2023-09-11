/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PriceGroups } from './PriceGroups';

@Entity()
@Check(
  `"entity_type" in ('SURCHARGE', 'THRESHOLD', 'ONE_TIME_SERVICE', 'RECURRING_SERVICE', 'ONE_TIME_LINE_ITEM', 'RECURRING_LINE_ITEM')`,
)
@Check(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
export class Prices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'price_group_id' })
  priceGroupId: number;

  // @Column({ type: "integer",nullable: false})
  @ManyToOne(() => PriceGroups, { nullable: false })
  @JoinColumn({ name: 'price_group_id' })
  priceGroupFK: number;

  @Column({ type: 'text', nullable: false, name: 'entity_type' })
  entityType: string;

  @Column({ type: 'integer', default: null, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'integer', default: null, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'integer', default: null, name: 'equipment_item_id' })
  equipmentItemId: number;

  @Column({ type: 'integer', default: null, name: 'material_id' })
  materialId: number;

  @Column({ type: 'integer', default: null, name: 'threshold_id' })
  thresholdId: number;

  @Column({ type: 'integer', default: null, name: 'surcharge_id' })
  surchargeId: number;

  @Column({ type: 'text', default: null, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'integer', default: null, name: 'frequency_id' })
  frequencyId: number;

  @Column({ type: 'bigint', nullable: false })
  price: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'bigint', nullable: true, name: 'next_price' })
  nextPrice: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({ type: 'numeric', default: null })
  limit: number; //show as decimal depending on locale on FE, at least 6 fractional digits

  @Column({
    type: 'timestamp without time zone',
    nullable: false,
    name: 'start_at',
  })
  startAt: Date;

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'end_at',
  })
  endAt: Date;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

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

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}
