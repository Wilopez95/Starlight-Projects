/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ThresholdItemsHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ type: 'int4', nullable: false, name: 'threshold_id' })
  thresholdId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_thresholds_id' })
  globalRatesThresholdsId: number;

  @Column({ type: 'numeric', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'numeric', nullable: false })
  quantity: number;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

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

  @Column({ type: 'boolean', nullable: false, default: true })
  apply_surcharges: boolean;

  @Column({ name: 'custom_rates_group_thresholds_id', nullable: true })
  customRatesGroupThresholdsId: number;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}

//ALTER TABLE rolloff_solutions.threshold_items ADD CONSTRAINT threshold_items_threshold_id_foreign FOREIGN KEY (threshold_id) REFERENCES rolloff_solutions.thresholds_historical(id) ON DELETE RESTRICT;
