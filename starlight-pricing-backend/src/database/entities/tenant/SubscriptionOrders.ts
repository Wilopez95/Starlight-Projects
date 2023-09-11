/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { PriceGroupsHistorical } from './PriceGroupsHistorical';
import { SubscriptionServiceItem } from './SubscriptionServiceItem';

@Entity()
@Check(
  `"status" IN ('SCHEDULED', 'IN_PROGRESS', 'BLOCKED', 'SKIPPED', 'COMPLETED', 'APPROVED', 'CANCELED', 'FINALIZED', 'INVOICED', 'NEEDS_APPROVAL')`,
)
@Check(`"weight_unit" IN ('yards', 'tons')`)
@Unique(['subscriptionId', 'sequenceId'])
export class SubscriptionOrders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true, name: 'billed_at' })
  billedAt: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  included: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'add_trip_charge',
  })
  addTripCharge: boolean;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string;

  @Column({ type: 'int4', nullable: true, name: 'job_site_contact_id' })
  jobSiteContactId: number;

  @Column({ type: 'int4', nullable: true, name: 'permit_id' })
  permitId: number;

  @Column({ type: 'int4', nullable: true, name: 'promo_id' })
  promoId: number;

  @Column({ type: 'int4', nullable: true, name: 'third_party_hauler_id' })
  thirdPartyHaulerId: number;

  @Column({ type: 'boolean', nullable: true, name: 'early_pick' })
  earlyPick: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'unlock_overrides' })
  unlockOverrides: boolean;

  @Column({
    type: 'int4',
    nullable: false,
    default: 0,
    name: 'work_orders_count',
  })
  workOrdersCount: number;

  @Column({ type: 'text', default: 'SCHEDULED' })
  status: string;

  @Column({ type: 'text', nullable: true, name: 'call_on_way_phone_number' })
  callOnWayPhoneNumber: string;

  @Column({ type: 'text', nullable: true, name: 'text_on_way_phone_number' })
  textOnWayPhoneNumber: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'alley_placement',
  })
  alleyPlacement: boolean;

  @Column({ type: 'boolean', nullable: false, default: false, name: 'to_roll' })
  toRoll: boolean;

  @Column({ type: 'int4', nullable: true, name: 'subscription_contact_id' })
  subscriptionContactId: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'signature_required',
  })
  signatureRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'can_reschedule',
  })
  canReschedule: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'one_time',
  })
  oneTime: boolean;

  @Column({ type: 'text', nullable: true, name: 'instructions_for_driver' })
  instructionsForDriver: string;

  @Column({ type: 'text', nullable: true, name: 'job_site_note' })
  jobSiteNote: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'onejob_site_contact_text_onlytime',
  })
  onejobSiteContactTextOnlytime: boolean;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_from' })
  bestTimeToComeFrom: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_to' })
  bestTimeToComeTo: string;

  @Column({ type: 'boolean', nullable: true, name: 'someone_on_site' })
  someoneOnSite: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'high_priority' })
  highPriority: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'has_comments',
  })
  hasComments: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'has_assigned_routes',
  })
  hasAssignedRoutes: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'canceled_at' })
  canceledAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'po_required',
  })
  poRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'permit_required',
  })
  permitRequired: boolean;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'subscription_service_item_id',
  })
  subscriptionServiceItemId: number;

  @ManyToOne(
    () => SubscriptionServiceItem,
    subscriptionServiceItem => subscriptionServiceItem.subscriptionOrders,
  )
  @JoinColumn({ name: 'subscription_service_item_id' })
  subscriptionServiceItem: SubscriptionServiceItem;

  @Column({ type: 'int4', nullable: true, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: true, name: 'global_rates_services_id' })
  globalRatesServicesId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_services_id',
  })
  customRatesGroupServicesId: number;

  @Column({ type: 'timestamp', nullable: false, name: 'service_date' })
  serviceDate: Date;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  price: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'grand_total',
  })
  grandTotal: number;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'service_day_of_week_required_by_customer',
  })
  serviceDayOfWeekRequiredByCustomer: boolean;

  @Column({ type: 'text', nullable: true, name: 'assigned_route' })
  assignedRoute: string;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_line_items_total',
  })
  billableLineItemsTotal: number;

  @Column({ type: 'text', nullable: true, name: 'cancellation_comment' })
  cancellationComment: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'override_credit_limit',
  })
  overrideCreditLimit: boolean;

  @Column({ type: 'date', nullable: true, name: 'invoiced_date' })
  invoicedDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'arrived_at' })
  arrivedAt: Date;

  // @Column({ type: "timestamp", nullable: true, name: "deleted_at" })
  // deletedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
  })
  public deletedAt?: Date;

  @Column({ type: 'int4', nullable: true, name: 'custom_rates_group_id' })
  customRatesGroupId: number;

  @Column({ type: 'int4', nullable: true, name: 'destination_job_site_id' })
  destinationJobSiteId: number;

  @Column({ type: 'int4', nullable: false, name: 'subscription_id' })
  subscriptionId: number;

  @Column({ type: 'text', nullable: false, name: 'sequence_id' })
  sequenceId: string;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'apply_surcharges',
  })
  applySurcharges: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_final_for_service' })
  isFinalForService: boolean;

  // refactor starts here

  @Column({ type: 'int8', nullable: true, name: 'surcharges_total' })
  surchargesTotal: number;

  @Column({ type: 'int8', nullable: true, name: 'before_taxes_total' })
  beforeTaxesTotal: number;

  @Column({ type: 'timestamp', nullable: true, name: 'invoiced_at' })
  invoicedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  //@ManyToOne(() => Prices, (prices) => prices.id)
  //@JoinColumn({ name: "price_id" })
  //priceFK: Prices;

  @Column({ name: 'price_group_historical_id', nullable: true })
  priceGroupHistoricalId: number;

  @ManyToOne(() => PriceGroupsHistorical, prices_group_historical => prices_group_historical.id)
  @JoinColumn({ name: 'price_group_historical_id' })
  priceGroupHistoricalFK: PriceGroupsHistorical;

  //end

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

  @Column({ type: 'text', nullable: true, name: 'invoice_notes' })
  invoiceNotes: string;

  @Column({ type: 'text', nullable: true, name: 'uncompleted_comment' })
  uncompletedComment: string;

  @Column({ type: 'text', nullable: true, name: 'unapproved_comment' })
  unapprovedComment: string;

  @Column({ type: 'text', nullable: true, name: 'unfinalized_comment' })
  unfinalizedComment: string;

  @Column({ type: 'text', nullable: true, name: 'dropped_equipment_item' })
  droppedEquipmentItem: string;

  @Column({ type: 'text', nullable: true, name: 'picked_up_equipment_item' })
  pickedUpEquipmentItem: string;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  weight: number;

  @Column({ type: 'timestamp', nullable: true, name: 'finish_work_order_date' })
  finishWorkOrderDate: Date;

  @Column({ type: 'text', nullable: true, name: 'weight_unit' })
  weightUnit: string;
}
