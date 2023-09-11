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
@Check(`"payment_method" IN ('onAccount', 'creditCard', 'cash', 'check', 'mixed')`)
@Check(`"status" IN ('requested', 'confirmed', 'history', 'check', 'rejected')`)
export class OrderRequests {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'customer_id' })
  customerId: number;

  @Column({ type: 'int4', nullable: false, name: 'contractor_id' })
  contractorId: number;

  @Column({ type: 'text', nullable: false, default: 'requested' })
  status: string;

  @Column({ type: 'int4', nullable: false, name: 'job_site_id' })
  jobSiteId: number;

  @Column({ type: 'int4', nullable: true, name: 'job_site_2_id' })
  jobSite2Id: number;

  @Column({ type: 'int4', nullable: false, name: 'billable_service_id' })
  billableServiceId: number;

  @Column({ type: 'int4', nullable: true, name: 'equipment_item_id' })
  equipmentItemId: number;

  @Column({ type: 'int4', nullable: false, name: 'material_id' })
  materialId: number;

  @Column({ type: 'date', nullable: false, name: 'service_date' })
  serviceDate: Date;

  @Column({ type: 'numeric', nullable: false, name: 'billable_service_price' })
  billableServicePrice: number;

  @Column({
    type: 'numeric',
    nullable: false,
    default: 1,
    name: 'billable_service_quantity',
  })
  billableServiceQuantity: number;

  @Column({ type: 'numeric', nullable: true, name: 'billable_service_total' })
  billableServiceTotal: number;

  @Column({ type: 'numeric', nullable: true, name: 'initial_grand_total' })
  initialGrandTotal: number;

  @Column({ type: 'numeric', nullable: true, name: 'grand_total' })
  grandTotal: number;

  @Column({ type: 'text', nullable: true, name: 'media_urls' })
  mediaUrls: string;

  @Column({ type: 'text', nullable: true, name: 'driver_instructions' })
  driverInstructions: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'alley_placement',
  })
  alleyPlacement: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'someone_on_site',
  })
  someoneOnSite: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'send_receipt',
  })
  sendReceipt: boolean;

  @Column({ type: 'text', nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'int4', nullable: true, name: 'credit_card_id' })
  creditCardId: number;

  @Column({ type: 'int4', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: number;

  @Column({ type: 'int4', nullable: true, name: 'service_area_id' })
  serviceAreaId: number;

  //   @Column({ type: "int8" })
  //   refactored_billable_service_price: number;

  //   @Column({ type: "int8" })
  //   refactored_billable_service_total: number;

  //   @Column({ type: "int8" })
  //   refactored_initial_grand_total: number;

  //   @Column({ type: "int8" })
  //   refactored_grand_total: number;

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
