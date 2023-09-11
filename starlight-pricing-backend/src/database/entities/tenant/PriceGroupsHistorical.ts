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
@Check(`"event_type" IN ('created','edited','deleted')`)
export class PriceGroupsHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false, name: 'is_general' })
  isGeneral: boolean;

  @Column({ type: 'text', default: null })
  description: string;

  @Column({ type: 'integer', default: null, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'integer', default: null, name: 'business_line_id' })
  businessLineId: number;

  @Column({
    type: 'integer',
    array: true,
    default: null,
    name: 'service_area_ids',
  })
  serviceAreaIds: number[];

  @Column({ type: 'integer', default: null, name: 'customer_group_id' })
  customerGroupId: number;

  @Column({ type: 'integer', default: null, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'integer', default: null, name: 'customer_job_site_id' })
  customerJobSiteId: number;

  @Column({ type: 'boolean', default: null })
  active: boolean;

  @Column({ type: 'integer', array: true, default: null, name: 'valid_days' })
  validDays: number[];

  @Column({ type: 'text', default: null, name: 'overweight_setting' })
  overweightSetting: string;

  @Column({ type: 'text', default: null, name: 'usage_days_setting' })
  usageDaysSetting: string;

  @Column({ type: 'text', default: null, name: 'demurrage_setting' })
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

  @Column({ type: 'timestamp', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({
    type: 'timestamp without time zone',
    default: null,
    name: 'end_date',
  })
  endDate: Date;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

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

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}
