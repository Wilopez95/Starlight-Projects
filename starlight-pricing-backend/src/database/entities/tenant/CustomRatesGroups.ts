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
@Check(`"overweight_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
@Check(`"usage_days_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
@Check(`"demurrage_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
@Check(`"load_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
@Check(`"dump_setting" IN ('global','canSize','material','canSizeAndMaterial')`)
export class CustomRatesGroups {
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

  @Column({ type: 'integer', default: null, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'integer', default: null, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'boolean', default: null })
  active: boolean;

  @Column({ type: 'text', default: null })
  description: string;

  @Column({ type: 'text', default: null, name: 'overweight_setting' })
  overweightSetting: string;

  @Column({ type: 'text', default: null, name: 'usage_days_setting' })
  usageDaysSetting: string;

  @Column({ type: 'text', default: null, name: 'demurrage_setting' })
  demurrageSetting: string;

  @Column({ type: 'integer', default: null, name: 'customer_group_id' })
  customerGroupId: number;

  @Column({ type: 'integer', default: null, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'integer', default: null, name: 'customer_job_site_id' })
  customerJobSiteId: number;

  @Column({
    type: 'text',
    nullable: false,
    default: 'material',
    name: 'dump_setting',
  })
  dumpSetting: string;

  @Column({
    type: 'text',
    nullable: false,
    default: 'material',
    name: 'load_setting',
  })
  loadSetting: string;

  @Column({ type: 'boolean', default: null, name: 'non_service_hours' })
  nonServiceHours: boolean;

  @Column({ type: 'boolean', default: null, name: 'sp_used' })
  spUsed: boolean;

  @Column({ type: 'integer', array: true, default: null, name: 'valid_days' })
  validDays: number[];

  @Column({ type: 'timestamp', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'end_date',
  })
  endDate: Date;
}
