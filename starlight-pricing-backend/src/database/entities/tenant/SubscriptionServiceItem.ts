/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { IMaterial } from '../../../Interfaces/Material';
import { Subscriptions } from './Subscriptions';
import { SubscriptionOrders } from './SubscriptionOrders';

@Entity()
@Check(`"billing_cycle" in ('daily', 'weekly', 'monthly', '28days', 'quarterly', 'yearly')`)
export class SubscriptionServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true, name: 'billing_cycle' })
  billingCycle: string;

  @Column({ type: 'date', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'boolean', nullable: true, default: false })
  recalculate: boolean;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'prorate_total',
    transformer: new ColumnNumericTransformer(),
  })
  prorateTotal: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'service_frequency_id',
  })
  serviceFrequencyId: number;

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(_ => Subscriptions, request => request.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscriptionIdFK: Subscriptions;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'billable_service_id',
  })
  billableServiceId: number;

  //This is a FK
  @Column({
    type: 'int4',
    nullable: true,
    name: 'global_rates_recurring_services_id',
  })
  globalRatesRecurringServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_services_id',
  })
  customRatesGroupServicesId: number;

  //@ManyToOne(() => CustomRatesGroupServiceHistorical)
  //@JoinColumn({ name: "custom_rates_group_services_id" })
  //customRatesGroupServicesIdFK: CustomRatesGroupServiceHistorical;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'material_id',
  })
  materialId: number;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @Column({
    type: 'numeric',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'next_price',
    transformer: new ColumnNumericTransformer(),
  })
  nextPrice: number;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'service_days_of_week' })
  serviceDaysOfWeek: string;

  @Column({ type: 'date', nullable: true, name: 'proration_effective_date' })
  prorationEffectiveDate: Date;

  @Column({
    type: 'numeric',
    nullable: true,
    name: 'proration_effective_price',
    transformer: new ColumnNumericTransformer(),
  })
  prorationEffectivePrice: number;

  @Column({ type: 'date', nullable: true, name: 'invoiced_date' })
  invoicedDate: Date;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'unlock_overrides',
  })
  unlockOverrides: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'proration_override',
  })
  prorationOverride: boolean;

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

  @OneToMany(
    () => SubscriptionOrders,
    subscriptionOrder => subscriptionOrder.subscriptionServiceItemId,
  )
  subscriptionOrders?: SubscriptionOrders[];

  material?: IMaterial;
}
