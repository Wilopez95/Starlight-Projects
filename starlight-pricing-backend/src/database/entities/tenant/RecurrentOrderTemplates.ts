/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { PriceGroupsHistorical } from './PriceGroupsHistorical';
import { Prices } from './Prices';

@Entity()
@Check(`"custom_frequency_type" IN ('daily', 'weekly', 'monthly')`)
@Check(`"frequency_type" IN ('daily', 'weekly', 'monthly', 'custom')`)
@Check(`"notify_day_before" IN ('byText', 'byEmail')`)
@Check(`"payment_method" IN ('onAccount', 'creditCard', 'cash', 'check', 'mixed')`)
@Check(`"status" IN ('active', 'onHold', 'closed')`)
@Check(
  `((("frequency_type" = 'custom') AND ("custom_frequency_type" IS NOT NULL) AND ("frequency_period" IS NOT NULL)) OR (("frequency_type" <> 'custom') AND ("custom_frequency_type" IS NULL) AND ("frequency_period" IS NULL)))`,
)
export class RecurrentOrderTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'business_line_id' })
  businessLineId: number;

  @Column({ type: 'int4', nullable: false, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'text', nullable: false })
  status: string;

  @Column({ type: 'int4', nullable: true, name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ type: 'int4', nullable: false, name: 'job_site_id' })
  jobSiteId: number;

  @Column({ type: 'int4', nullable: false, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_job_site_id' })
  customerJobSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'project_id' })
  projectId: number;

  @Column({ type: 'int4', nullable: true, name: 'third_party_hauler_id' })
  thirdPartyHaulerId: number;

  @Column({ type: 'int4', nullable: true, name: 'promo_id' })
  promoId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_profile_id' })
  materialProfileId: number;

  @Column({ type: 'int4', nullable: true, name: 'job_site_contact_id' })
  jobSiteContactId: number;

  @Column({ type: 'int4', nullable: true, name: 'order_contact_id' })
  orderContactId: number;

  @Column({ type: 'int4', nullable: true, name: 'permit_id' })
  permitId: number;

  @Column({ type: 'int4', nullable: true, name: 'disposal_site_id' })
  disposalSiteId: number;

  @Column({ name: 'custom_rates_group_id', nullable: true })
  customRatesGroupId: number;

  //TODO: uncomment later
  // @ManyToOne(() => CustomRatesGroups)
  // @JoinColumn({ name: "custom_rates_group_id" })
  // customRatesGroup: CustomRatesGroups;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_services_id' })
  globalRatesServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_services_id',
  })
  customRatesGroupServicesId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'equipment_item_id' })
  equipmentItemId: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'billable_service_price',
  })
  billableServicePrice: number;

  @Column({ type: 'int4', nullable: false, name: 'billable_service_quantity' })
  billableServiceQuantity: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'billable_service_total',
  })
  billableServiceTotal: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'billable_line_items_total',
  })
  billableLineItemsTotal: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'thresholds_total',
  })
  thresholdsTotal: number;

  @Column({ type: 'text', nullable: false, name: 'frequency_type' })
  frequencyType: string;

  @Column({ type: 'int4', nullable: true, name: 'frequency_period' })
  frequencyPeriod: number;

  @Column({ type: 'text', nullable: true, name: 'custom_frequency_type' })
  customFrequencyType: string;

  @Column({
    type: 'int4',
    array: true,
    nullable: true,
    default: [],
    name: 'frequency_days',
  })
  frequencyDays: number[];

  @Column({ type: 'date', nullable: true, name: 'sync_date' })
  syncDate: Date;

  @Column({ type: 'date', nullable: true, name: 'next_service_date' })
  nextServiceDate: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'unlock_overrides',
  })
  unlockOverrides: boolean;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'before_taxes_total',
  })
  beforeTaxesTotal: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new ColumnNumericTransformer(),
    default: 0,
    name: 'grand_total',
  })
  grandTotal: number;

  @Column({ type: 'date', nullable: false, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true, name: 'job_site_note' })
  jobSiteNote: string;

  @Column({ type: 'text', nullable: true, name: 'call_on_way_phone_number' })
  callOnWayPhoneNumber: string;

  @Column({ type: 'text', nullable: true, name: 'text_on_way_phone_number' })
  textOnWayPhoneNumber: string;

  @Column({ type: 'int4', nullable: true, name: 'call_on_way_phone_number_id' })
  callOnWayPhoneNumberId: number;

  @Column({ type: 'int4', nullable: true, name: 'text_on_way_phone_number_id' })
  textOnWayPhoneNumberId: number;

  @Column({ type: 'text', nullable: true, name: 'driver_instructions' })
  driverInstructions: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_from' })
  bestTimeToComeFrom: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_to' })
  bestTimeToComeTo: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'someone_on_site',
  })
  someoneOnSite: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'to_roll' })
  toRoll: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'high_priority',
  })
  highPriority: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'early_pick',
  })
  earlyPick: boolean;

  @Column({ type: 'text', nullable: true, name: 'invoice_notes' })
  invoiceNotes: string;

  @Column({ type: 'text', nullable: false, name: 'csr_email' })
  csrEmail: string;

  @Column({ type: 'boolean', default: false, name: 'alley_placement' })
  alleyPlacement: boolean;

  @Column({ type: 'boolean', default: false, name: 'cab_over' })
  cabOver: boolean;

  @Column({ type: 'boolean', default: false, name: 'signature_required' })
  signatureRequired: boolean;

  @Column({
    type: 'text',
    nullable: false,
    default: 'onAccount',
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column({ type: 'text', nullable: true, name: 'notify_day_before' })
  notifyDayBefore: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'apply_surcharges',
  })
  applySurcharges: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'billable_service_apply_surcharges',
  })
  billableServiceApplySurcharges: boolean;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'surcharges_total',
  })
  surchargesTotal: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'commercial_taxes_used',
  })
  commercialTaxesUsed: boolean;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'on_hold_email_sent',
  })
  onHoldEmailSent: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'on_hold_notify_sales_rep',
  })
  onHoldNotifySalesRep: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'on_hold_notify_main_contact',
  })
  onHoldNotifyMainContact: boolean;

  @Column({ name: 'price_group_id', nullable: true })
  priceGroupId: number;

  // refactor starts here
  @ManyToOne(() => PriceGroupsHistorical, priceGroup => priceGroup.id)
  @JoinColumn({ name: 'price_group_id' })
  priceGroupFK: PriceGroupsHistorical;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  @ManyToOne(() => Prices, prices => prices.id)
  @JoinColumn({ name: 'price_id' })
  priceFK: Prices;

  // end

  @Column({ type: 'date', nullable: true, name: 'last_failure_date' })
  lastFailureDate: Date;

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
