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
export class CustomRatesGroupSurcharges {
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

  @Column({ type: 'integer', default: null, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'integer', default: null, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'int4', name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: false, name: 'surcharge_id' })
  surchargeId: number;

  @Column({ name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @ManyToOne(() => CustomRatesGroups)
  @JoinColumn({ name: 'custom_rates_group_id' })
  customRatesGroup: CustomRatesGroups;
}
