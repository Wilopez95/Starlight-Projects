/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

@Entity()
export class OrdersHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: true, name: 'business_unit_id' })
  businessUnitId: number;

  @Column({ type: 'int4', nullable: true, name: 'business_line_id' })
  businessLineId: number;

  @Column({ name: 'order_request_id', nullable: true })
  orderRequestId: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  draft: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'is_roll_off',
  })
  isRollOff: boolean;

  @Column({ type: 'text', nullable: true, default: 'inProgress' })
  status: string;

  @Column({ type: 'int4', nullable: true, name: 'service_area_id' })
  serviceAreaId: number;

  @Column({ name: 'custom_rates_group_id', nullable: true })
  customRatesGroupId: number;

  @Column({ type: 'int4', nullable: true, name: 'job_site_id' })
  jobSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'job_site_2_id' })
  jobSite2Id: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'int4', nullable: true, name: 'original_customer_id' })
  originalCustomerId: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_group_id' })
  customerGroupId: number;

  @Column({ type: 'int4', nullable: true, name: 'customer_job_site_id' })
  customerJobSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'project_id' })
  projectId: number;

  @Column({ type: 'int4', nullable: true, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'equipment_item_id' })
  equipmentItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'third_party_hauler_id' })
  thirdPartyHaulerId: number;

  @Column({ type: 'int4', nullable: true, name: 'promo_id' })
  promoId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_profile_id' })
  materialProfileId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_services_id' })
  globalRatesServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_services_id',
  })
  customRatesGroupServicesId: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_service_price',
  })
  billableServicePrice: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_service_total',
  })
  billableServiceTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_line_items_total',
    default: 0,
  })
  billableLineItemsTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'thresholds_total',
  })
  thresholdsTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'before_taxes_total',
  })
  beforeTaxesTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: 0,
    name: 'on_account_total',
  })
  onAccountTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'initial_grand_total',
  })
  initialGrandTotal: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'grand_total',
  })
  grandTotal: number;

  @Column({ type: 'timestamp', nullable: true, name: 'service_date' })
  serviceDate: Date;

  @Column({ type: 'int4', nullable: true, name: 'job_site_contact_id' })
  jobSiteContactId: number;

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

  @Column({ type: 'int4', nullable: true, name: 'permit_id' })
  permitId: number;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_from' })
  bestTimeToComeFrom: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_to' })
  bestTimeToComeTo: string;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'someone_on_site',
  })
  someoneOnSite: boolean;

  @Column({ type: 'boolean', nullable: true, default: false, name: 'to_roll' })
  toRoll: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'high_priority',
  })
  highPriority: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'early_pick',
  })
  earlyPick: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'alley_placement',
  })
  alleyPlacement: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'cab_over',
  })
  cabOver: boolean;

  @Column({ type: 'int4', nullable: true, name: 'order_contact_id' })
  orderContactId: number;

  @Column({ type: 'int4', nullable: true, name: 'disposal_site_id' })
  disposalSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'work_order_id' })
  workOrderId: number;

  @Column({ type: 'text', nullable: true, name: 'invoice_notes' })
  invoiceNotes: string;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason_type' })
  cancellationReasonType: string;

  @Column({ type: 'text', nullable: true, name: 'cancellation_comment' })
  cancellationComment: string;

  @Column({ type: 'text', nullable: true, name: 'unapproved_comment' })
  unapprovedComment: string;

  @Column({ type: 'text', nullable: true, name: 'unfinalized_comment' })
  unfinalizedComment: string;

  @Column({ type: 'text', nullable: true, name: 'reschedule_comment' })
  rescheduleComment: string;

  @Column({ type: 'text', nullable: true, name: 'dropped_equipment_item' })
  droppedEquipmentItem: string;

  @Column({ type: 'text', nullable: true, name: 'csr_email' })
  csrEmail: string;

  @Column({
    type: 'text',
    nullable: true,
    default: 'onAccount',
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true, name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ type: 'text', nullable: true, name: 'notify_day_before' })
  notifyDayBefore: string;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'override_credit_limit',
  })
  overrideCreditLimit: boolean;

  @Column({
    type: 'text',
    nullable: true,
    default: 'system',
    name: 'created_by',
  })
  createdBy: string;

  @Column({ type: 'text', nullable: true, name: 'mixed_payment_methods' })
  mixedPaymentMethods: string;

  @Column({
    type: 'boolean',
    nullable: true,
    default: true,
    name: 'apply_surcharges',
  })
  applySurcharges: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: true,
    name: 'commercial_taxes_used',
  })
  commercialTaxesUsed: boolean;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({ type: 'int4', nullable: true, name: 'independent_work_order_id' })
  independentWorkOrderId: number;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@Column({ type: "int8"})
  //billable_service_price: number

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
    name: 'override_service_price',
  })
  overrideServicePrice: boolean;

  @Column({ type: 'int8', nullable: true, name: 'overridden_service_price' })
  overriddenServicePrice: number;

  @Column({ type: 'int8', nullable: true, name: 'service_total' })
  serviceTotal: number;

  //@Column({ type: "int8"})
  //billable_line_items_total: number

  //@Column({ type: "int8"})
  //thresholds_total: number

  //@Column({ type: "int8"})
  //billable_service_total: number

  //@Column({ type: "int8"})
  //before_taxes_total: number

  //@Column({ type: "int8"})
  //on_account_total: number

  //@Column({ type: "int8"})
  //initial_grand_total: number

  //@Column({ type: "int8"})
  //grand_total: number

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  //@Column({ type: "int8"})
  //surcharges_total: number // refactor ends here

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_service_price_to_display',
  })
  billableServicePriceToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_service_total_to_display',
  })
  billableServiceTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_line_items_total_to_display',
  })
  billableLineItemsTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'thresholds_total_to_display',
  })
  thresholdsTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'surcharges_total_to_display',
  })
  surchargesTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'before_taxes_total_to_display',
  })
  beforeTaxesTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'on_account_total_to_display',
  })
  onAccountTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'initial_grand_total_to_display',
  })
  initialGrandTotalToDisplay: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'grand_total_to_display',
  })
  grandTotalToDisplay: number;

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
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'surcharges_total',
  })
  surchargesTotal: number;

  @Column({ type: 'int4', nullable: true, name: 'origin_district_id' })
  originDistrictId: number;

  @Column({ type: 'text', nullable: true, name: 'csr_name' })
  csrName: number;

  @Column({ type: 'integer', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;
}

//ALTER TABLE rolloff_solutions.orders ADD CONSTRAINT orders_order_request_id_foreign FOREIGN KEY (order_request_id) REFERENCES rolloff_solutions.order_requests(id) ON DELETE RESTRICT;
