/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class CustomRatesGroupRecurringServiceFrequencyHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: true, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, default: 'system', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: true, name: 'trace_id' })
  traceId: string;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'billable_service_frequency_id',
  })
  billableServiceFrequencyId: number;

  @Column({ name: 'custom_rates_group_recurring_service_id' })
  customRatesGroupRecurringServiceId: number;

  @Column({
    type: 'text',
    nullable: false,
    default: 'monthly',
    name: 'billing_cycle',
  })
  billingCycle: string;

  @Column({ type: 'bigint', nullable: false })
  price: number;

  @Column({ type: 'date', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'bigint', nullable: true, name: 'next_price' })
  nextPrice: number;

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
