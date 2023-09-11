/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomRatesGroups } from './CustomRatesGroups';

@Entity()
export class CustomRatesGroupServices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'int4', nullable: false, name: 'business_line_id' })
  businessLineId: number;

  @Column({ name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @ManyToOne(_type => CustomRatesGroups, request => request.id)
  @JoinColumn({ name: 'custom_rates_group_id' })
  customRatesGroup: CustomRatesGroups;

  @Column({ type: 'int4', nullable: false, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: false, name: 'equipment_item_id' })
  equipmentItemId: number;

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
