import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType, InputType, Float, Int } from 'type-graphql';

import { HaulingBillableItem } from './BillableItem';
import Order from './Order';
import BaseEntity from '../../../entities/BaseEntity';
import { HaulingMaterial } from '../../../services/core/types/HaulingMaterial';

export enum OrderPriceSourceType {
  MANUAL = 'MANUAL',
  PRICE_GROUP = 'PRICE_GROUP',
  GLOBAL_RACK_RATES = 'GLOBAL_RACK_RATES',
  NO_PRICE = 'NO_PRICE',
}

export enum OrderBillableItemType {
  MATERIAL = 'MATERIAL',
  LINE = 'LINE',
  MISCELLANIES = 'MISCELLANIES',
  FEE = 'FEE',
}

registerEnumType(OrderBillableItemType, { name: 'OrderBillableItemType' });
registerEnumType(OrderPriceSourceType, { name: 'OrderPriceSourceType' });

@InputType('OrderBillableItemInput')
export class OrderBillableItemInput {
  @Field()
  uuid!: string;

  @Field(() => Number, { nullable: true })
  materialId: number | null = null;

  @Field(() => Number, { nullable: true })
  billableItemId: number | null = null;

  @Field({ defaultValue: false })
  readonly!: boolean;

  @Field(() => String, { nullable: true })
  priceSource?: string | null;

  @Field(() => OrderPriceSourceType, { nullable: true })
  priceSourceType?: OrderPriceSourceType;

  @Field(() => Float)
  price!: number;

  @Field(() => OrderBillableItemType)
  type!: OrderBillableItemType;

  @Field()
  quantity!: number;

  @Field({ nullable: true })
  globalRatesLineItemsId?: number;

  @Field({ nullable: true })
  customRatesGroupLineItemsId?: number;

  @Field({ nullable: true })
  auto?: boolean;

  @Field({ nullable: true })
  thresholdId?: number;
  @Field({ nullable: true })
  applySurcharges?: boolean;
  @Field(() => Int, { nullable: true })
  globalRatesThresholdsId?: number | null;
  @Field(() => Int, { nullable: true })
  customRatesGroupThresholdsId?: number | null;
  @Field(() => Int, { nullable: true })
  globalRatesServiceId?: number | null;
  @Field(() => Int, { nullable: true })
  customRatesGroupServicesId?: number | null;
  @Field(() => Float, { nullable: true })
  quantityConverted?: number | null;
}

@Entity()
@ObjectType()
export class OrderBillableItem extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  materialId?: number;

  @Field(() => HaulingMaterial, { nullable: true })
  material?: HaulingMaterial;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  billableItemId: number | null = null;

  @Field(() => HaulingBillableItem, { nullable: true })
  billableItem: HaulingBillableItem | null = null;

  @Field()
  @Column({ default: false })
  readonly?: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  orderId!: number;

  @ManyToOne(() => Order, (order) => order.billableItems)
  order!: Order;

  @Field(() => String, { nullable: true })
  @Column('varchar', { nullable: true })
  priceSource?: string | null;

  @Field(() => OrderPriceSourceType, { nullable: true })
  @Column('enum', { enum: OrderPriceSourceType, default: OrderPriceSourceType.NO_PRICE })
  priceSourceType?: OrderPriceSourceType;

  @Field()
  @Column({ type: 'numeric', default: 0 })
  price!: number;

  @Field(() => OrderBillableItemType)
  @Column({ enum: OrderBillableItemType })
  type!: OrderBillableItemType;

  @Field()
  @Column({ type: 'numeric', default: 0 })
  quantity!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  globalRatesLineItemsId?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customRatesGroupLineItemsId?: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  thresholdId?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  applySurcharges?: boolean;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  globalRatesThresholdsId?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  customRatesGroupThresholdsId?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  globalRatesServiceId?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  customRatesGroupServicesId?: number | null;

  @Field()
  @Column({ type: 'boolean', default: false })
  auto!: boolean;

  @Field(() => Float, { nullable: true })
  quantityConverted?: number | null;
}
