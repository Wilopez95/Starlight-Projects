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

@Check(`"event_type" IN ('created','edited','deleted')`)
@Entity()
export class CustomRatesGroupServiceHistorical {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'numeric', nullable: true })
  price: number;

  @Column({ type: 'numeric', nullable: true, name: 'next_price' })
  nextPrice: number;

  @Column({ type: 'integer', default: null, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'integer', default: null, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'int4', name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'equipment_item_id' })
  equipmentItemId: number;

  @Column({ type: 'timestamp', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @ManyToOne(() => CustomRatesGroups)
  @JoinColumn({ name: 'custom_rates_group_id' })
  customRatesGroup: CustomRatesGroups;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}
