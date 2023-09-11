import {
  AfterLoad,
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType, Float, Int } from 'type-graphql';

import CustomerTruck from './CustomerTruck';
import { OrderMaterialDistribution } from './OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from './OrderMiscellaneousMaterialDistribution';
import BaseEntityWithHistory from '../../../entities/BaseEntityWithHistory';
import { OrderBillableItem } from './OrderBillableItem';
import { User } from '../../../services/ums/users';
import { MeasurementType, MeasurementUnit } from '../graphql/types/Measurements';
import { HaulingCustomer } from '../../../services/core/types/HaulingCustomer';
import { HaulingDestination } from '../../../services/core/types/HaulingDestination';
import { HaulingOriginDistrict } from '../../../services/core/types/HaulingOriginDistrict';
import { Equipment } from '../../../services/core/types/Equipment';
import { HaulingProject } from '../../../services/core/types/HaulingProject';
import { HaulingCustomerJobSite } from './CustomerJobSite';
import { HaulingPriceGroupsResult } from '../../../services/core/types/HaulingPriceGroup';
import NonCommercialTruck from './NonCommercialTruck';

export enum OrderType {
  DUMP = 'DUMP',
  LOAD = 'LOAD',
  NON_SERVICE = 'NON_SERVICE',
}

export enum PaymentMethodType {
  ON_ACCOUNT = 'ON_ACCOUNT',
  CASH = 'CASH',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum OrderStatus {
  IN_YARD = 'IN_YARD',
  WEIGHT_OUT = 'WEIGHT_OUT',
  LOAD = 'LOAD',
  PAYMENT = 'PAYMENT',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  FINALIZED = 'FINALIZED',
  INVOICED = 'INVOICED',
  ON_THE_WAY = 'ON_THE_WAY',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(OrderType, { name: 'OrderType' });
registerEnumType(PaymentMethodType, { name: 'PaymentMethodType' });

@ObjectType()
@InputType('OrderMaterialInput')
export class OrderMaterial {
  @Field()
  id!: number;

  @Field({ nullable: true })
  uuid?: string;

  @Field()
  description!: string;

  @Field({ nullable: true })
  price?: number;

  @Field({ nullable: true })
  taxable?: boolean;
}

@ObjectType()
@InputType('MiscellaneousItemDistributionInput')
export class MiscellaneousItemDistribution {
  @Field()
  id!: number;

  @Field()
  description!: string;

  @Field(() => String, { nullable: true })
  code: string | null = null;

  @Field()
  recycle!: boolean;

  @Field()
  quantity!: number;
}

@ObjectType()
@InputType('OrderImageInput')
export class OrderImage {
  @Field()
  url!: string;

  @Field()
  filename!: string;
}

@Entity()
@ObjectType()
export default class Order extends BaseEntityWithHistory {
  @Field()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Field(() => OrderType)
  @Column('enum', { enum: OrderType })
  type!: OrderType;

  @Field(() => OrderStatus)
  @Column('enum', { enum: OrderStatus, nullable: false, default: OrderStatus.IN_YARD })
  status?: OrderStatus = OrderStatus.IN_YARD;

  @Field({ nullable: true })
  @Column('varchar', { length: 250, nullable: true })
  note?: string;

  @Field({ nullable: true })
  @Column('varchar', { length: 200, nullable: true })
  WONumber?: string;

  @Field({ nullable: true })
  @Column('varchar', { length: 200, nullable: true })
  PONumber?: string;

  @Field({ nullable: true })
  @Column('float', { nullable: true })
  weightIn?: number;

  @Field({ nullable: true })
  @Column('float', { nullable: true })
  weightOut?: number;

  @OneToMany(
    () => OrderMaterialDistribution,
    (materialDistribution) => materialDistribution.order,
    { cascade: true },
  )
  materialsDistribution!: OrderMaterialDistribution[];

  @OneToMany(() => OrderMiscellaneousMaterialDistribution, (item) => item.order, {
    cascade: true,
  })
  miscellaneousMaterialsDistribution!: OrderMiscellaneousMaterialDistribution[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  priceGroupId?: number;

  priceGroup?: HaulingPriceGroupsResult;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  arrivedAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamp with time zone' })
  departureAt?: Date;

  @Field(() => Date, { defaultValue: null })
  @DeleteDateColumn()
  deleteDate: Date | null = null;

  @Field()
  @Column()
  customerId!: number;

  customer!: HaulingCustomer;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customerTruckId?: number;

  @ManyToOne(() => CustomerTruck, { nullable: true })
  customerTruck?: CustomerTruck;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nonCommercialTruckId?: number;

  @ManyToOne(() => NonCommercialTruck, { nullable: true })
  nonCommercialTruck?: NonCommercialTruck;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customerJobSiteId?: number;

  customerJobSite?: HaulingCustomerJobSite;

  @Field({ nullable: true })
  @Column({ nullable: true })
  jobSiteId?: number;

  jobSite?: HaulingCustomerJobSite;

  @Field({ nullable: true })
  @Column({ nullable: true })
  projectId?: number;

  project?: HaulingProject;

  @Field({ nullable: true })
  @Column({ nullable: true })
  materialId?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  destinationId?: number;

  destination?: HaulingDestination;

  @Field({ nullable: true })
  @Column({ nullable: true })
  originDistrictId?: number;

  originDistrict?: HaulingOriginDistrict;

  @Field(() => [OrderImage], { nullable: true })
  @Column({ type: 'simple-json', default: [] })
  images!: OrderImage[];

  @Field(() => PaymentMethodType, { nullable: true })
  @Column('enum', { enum: PaymentMethodType, nullable: true })
  paymentMethod?: PaymentMethodType;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  creditCardId?: string | null;

  @OneToMany(() => OrderBillableItem, (billableItem) => billableItem.order, {
    cascade: true,
  })
  billableItems!: OrderBillableItem[];

  @Field(() => String, { defaultValue: null })
  @Column({ nullable: true })
  owner!: string;

  @Field(() => Float)
  @Column({ type: 'numeric', default: 0 })
  beforeTaxesTotal = 0;

  @Field(() => Float)
  @Column({ type: 'numeric', default: 0 })
  taxTotal = 0;

  @Field(() => Float)
  @Column({ type: 'numeric', default: 0 })
  grandTotal = 0;

  @Field(() => Float)
  @Column({ type: 'numeric', default: 0 })
  initialOrderTotal = 0;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  bypassScale = false;

  // great place to use GraphQL Federation for User entity
  // @Directive('@provides(fields: "id")')
  @Column({ nullable: true })
  saleRepresentativeId?: string;

  @Field(() => Float)
  @Column('numeric', { default: 0 })
  amount = 0;

  @Field(() => String, { nullable: true })
  @Column({ type: 'character varying', nullable: true })
  checkNumber: string | null = null;

  @Field()
  @Column({ default: false })
  isAch!: boolean;

  @Field(() => Int, { nullable: true })
  @Column('int', { nullable: true })
  haulingOrderId?: number | null;

  @Field(() => Date, { defaultValue: null, nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  weightTicketAttachedAt?: Date | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  weightTicketCreatorId?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  weightTicketPrivateUrl?: string | null;

  @Field(() => MeasurementUnit, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementUnit, nullable: true })
  weightInUnit!: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementType, nullable: true })
  weightInType!: MeasurementType;

  @Field({ nullable: true })
  @Column('varchar', { nullable: true })
  weightInSource!: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  weightInTimestamp!: Date;

  @Field(() => User, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  weightInUser!: string;

  @Field(() => MeasurementUnit, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementUnit, nullable: true })
  weightOutUnit!: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementType, nullable: true })
  weightOutType!: MeasurementType;

  @Field({ nullable: true })
  @Column('varchar', { nullable: true })
  weightOutSource!: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  weightOutTimestamp!: Date;

  @Field(() => User, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  weightOutUser!: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isSelfService!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  containerId?: number;

  container?: Equipment;

  @Field({ nullable: true })
  @Column({ nullable: true })
  useTare?: boolean;

  @Field({ nullable: true })
  @Column({ type: 'numeric', nullable: true })
  truckTare?: number;

  @Field({ nullable: true })
  @Column({ type: 'numeric', nullable: true })
  canTare?: number;

  @Column('int', { nullable: true })
  truckOnWayId?: number | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  weightScaleUom!: string | null;

  @Field({ nullable: true })
  originalWeightIn?: number;

  @Field({ nullable: true })
  originalWeightOut?: number;

  @AfterLoad()
  protected afterLoad?(): void {
    this.originalWeightIn = this.weightIn;
    this.originalWeightOut = this.weightOut;
  }
}
