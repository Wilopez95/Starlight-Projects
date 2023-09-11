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
export class PriceGroups {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'is_general',
  })
  isGeneral: boolean;

  @Column({ type: 'text', nullable: false, default: '' })
  description: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'business_unit_id',
  })
  businessUnitId: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    name: 'business_line_id',
  })
  businessLineId: number;

  @Column({
    type: 'integer',
    array: true,
    nullable: false,
    default: [],
    name: 'service_area_ids',
  })
  serviceAreaIds: number[];

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    name: 'customer_group_id',
  })
  customerGroupId: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    name: 'customer_id',
  })
  customerId: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    name: 'customer_job_site_id',
  })
  customerJobSiteId: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  active: boolean;

  @Column({
    type: 'integer',
    array: true,
    nullable: false,
    default: [],
    name: 'valid_days',
  })
  validDays: number[];

  @Column({
    type: 'text',
    nullable: false,
    default: 'global',
    name: 'overweight_setting',
  })
  overweightSetting: string;

  @Column({
    type: 'text',
    nullable: false,
    default: 'global',
    name: 'usage_days_setting',
  })
  usageDaysSetting: string;

  @Column({
    type: 'text',
    nullable: false,
    default: 'global',
    name: 'demurrage_setting',
  })
  demurrageSetting: string;

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

  @Column({
    type: 'timestamp without time zone',
    nullable: false,
    name: 'start_date',
  })
  startDate: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'non_service_hours',
  })
  nonServiceHours: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'sp_used' })
  spUsed: boolean;

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

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'end_date',
  })
  endDate: Date;
}
