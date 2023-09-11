/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomRatesGroups } from './CustomRatesGroups';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class CustomRatesGroupLineItemsHistorical {
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

  @Column({ type: 'int4', nullable: false, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'int4', nullable: false, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'boolean', nullable: false, default: true, name: 'one_time' })
  oneTime: boolean;

  @Column({ name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @ManyToOne(_type => CustomRatesGroups, request => request.id)
  @JoinColumn({ name: 'custom_rates_group_id' })
  customRatesGroup: CustomRatesGroups;

  @Column({ type: 'int4', nullable: false, name: 'line_item_id' })
  lineItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'bigint', nullable: false })
  price: number;

  @Column({ type: 'date', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'bigint', nullable: false, name: 'next_price' })
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
