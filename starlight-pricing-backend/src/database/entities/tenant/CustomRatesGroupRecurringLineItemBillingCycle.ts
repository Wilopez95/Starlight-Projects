/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CustomRatesGroupRecurringLineItemBillingCycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'billable_line_item_billing_cycle_id',
  })
  billableLineItemBillingCycleId: number;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'custom_rates_group_recurring_line_item_id',
  })
  customRatesGroupRecurringLineItemId: number;

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
