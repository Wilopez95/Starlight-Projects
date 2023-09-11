/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Check,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomRatesGroupServices } from './CustomRatesGroupServices';

@Entity()
@Check(`"billing_cycle" IN ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
@Unique(['customRatesGroupRecurringServiceId', 'billableServiceFrequencyId', 'billingCycle'])
export class CustomRatesGroupRecurringServiceFrequency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'billable_service_frequency_id',
  })
  billableServiceFrequencyId: number;

  @Column({ name: 'custom_rates_group_recurring_service_id' })
  customRatesGroupRecurringServiceId: number;

  @ManyToOne(_type => CustomRatesGroupServices, request => request.id)
  @JoinColumn({ name: 'custom_rates_group_recurring_service_id' })
  customRatesGroupRecurringService: CustomRatesGroupServices;

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
