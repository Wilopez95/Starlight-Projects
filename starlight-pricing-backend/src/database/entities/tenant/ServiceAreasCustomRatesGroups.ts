/* eslint-disable new-cap */
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomRatesGroups } from './CustomRatesGroups';
@Entity()
export class ServiceAreasCustomRatesGroups {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'service_area_id' })
  serviceAreaId: Date;

  @Column({ name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @ManyToOne(() => CustomRatesGroups)
  @JoinColumn({ name: 'custom_rates_group_id' })
  customRatesGroup: CustomRatesGroups;

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
