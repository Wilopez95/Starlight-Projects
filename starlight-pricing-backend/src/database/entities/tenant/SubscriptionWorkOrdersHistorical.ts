/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionWorkOrdersHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, default: 'system', name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: true, name: 'trace_id' })
  traceId: string;

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

  @Column({ type: 'int4', nullable: true, name: 'subscription_order_id' })
  subscriptionOrderId: number;

  @Column({ type: 'text', nullable: true })
  status: string;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string;

  @Column({ type: 'text', nullable: true, name: 'new_equipment_number' })
  newEquipmentNumber: string;

  @Column({ type: 'text', nullable: true, name: 'job_site_note' })
  jobSiteNote: string;

  @Column({ type: 'text', nullable: true, name: 'job_site_contact_text_only' })
  jobSiteContactTextOnly: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_from' })
  bestTimeToComeFrom: string;

  @Column({ type: 'text', nullable: true, name: 'best_time_to_come_to' })
  bestTimeToComeTo: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'someone_on_site',
  })
  someoneOnSite: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'high_priority',
  })
  highPriority: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'can_reschedule',
  })
  canReschedule: boolean;

  @Column({ type: 'text', nullable: true, name: 'equipment_number' })
  equipmentNumber: string;

  @Column({ type: 'text', nullable: true, name: 'truck_number' })
  truckNumber: string;

  @Column({ type: 'timestamp', nullable: true, name: 'departed_at' })
  departedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'arrived_at' })
  arrivedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'canceled_at' })
  canceledAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completed_at: Date;

  @Column({ type: 'date', nullable: true, name: 'service_date' })
  serviceDate: Date;

  @Column({ type: 'text', nullable: true, name: 'assigned_route' })
  assignedRoute: string;

  @Column({ type: 'text', nullable: true, name: 'driver_name' })
  driverName: string;

  @Column({ type: 'text', nullable: true, name: 'instructions_for_driver' })
  instructionsForDriver: string;

  @Column({ type: 'text', nullable: true, name: 'comment_from_driver' })
  commentFromDriver: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'early_pick',
  })
  earlyPick: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'to_roll',
  })
  toRoll: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'signature_required',
  })
  signatureRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'alley_placement',
  })
  alleyPlacement: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'po_required',
  })
  poRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'permit_required',
  })
  permitRequired: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'service_day_of_week_required_by_customer',
  })
  serviceDayOfWeekRequiredByCustomer: boolean;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'billable_line_items_total',
  })
  billableLineItemsTotal: number;

  @Column({ type: 'int4', nullable: true, name: 'third_party_hauler_id' })
  thirdPartyHaulerId: number;

  @Column({ type: 'text', nullable: true, name: 'blocking_reason' })
  blockingReason: string;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    name: 'weight',
  })
  weight: number;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'dropped_equipment_item' })
  droppedEquipmentItem: string;

  @Column({ type: 'text', nullable: true, name: 'picked_up_equipment_item' })
  pickedUpEquipmentItem: string;

  @Column({ type: 'text', nullable: true, name: 'sequence_id' })
  sequenceId: string;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: number;
}
