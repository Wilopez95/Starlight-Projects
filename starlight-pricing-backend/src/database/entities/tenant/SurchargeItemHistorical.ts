/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SurchargeItemHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

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

  @Column({ type: 'numeric', nullable: true })
  amount: number;

  @Column({ type: 'numeric', nullable: true })
  quantity: number;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@Column({ type: "int8"})
  //amount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date; // refactor ends here

  @Column({
    type: 'text',
    nullable: true,
    name: 'amount_to_display',
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

  @Column({ name: 'threshold_item_id', nullable: true })
  thresholdItemId: number;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}
