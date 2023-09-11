import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { HaulingMaterial } from '../../../services/core/types/HaulingMaterial';

export enum BillableItemType {
  MISCELLANIES = 'MISCELLANIES',
  LINE = 'LINE',
  FEE = 'FEE',
}

registerEnumType(BillableItemType, {
  name: 'BillableItemType',
});

export enum HaulingBillableItemType {
  MISCELLANIES = 'miscellaneousItem',
  LINE = 'none',
}

registerEnumType(HaulingBillableItemType, {
  name: 'HaulingBillableItemType',
});

export enum HaulingBillableItemUnit {
  NONE = 'none',
  EACH = 'each',
  TON = 'ton',
  YARD = 'yard',
  GALLON = 'gallon',
  MILE = 'mile',
  MIN = 'min',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ORDER = 'order',
}

registerEnumType(HaulingBillableItemUnit, {
  name: 'HaulingBillableItemUnit',
});

@ObjectType()
export class HaulingBillableItem {
  @Field(() => Number)
  id!: number;

  @Field(() => Number)
  originalId!: number;

  @Field()
  active!: boolean;

  @Field(() => String)
  description!: string;

  @Field(() => HaulingBillableItemUnit)
  unit!: HaulingBillableItemUnit;

  @Field(() => HaulingBillableItemType)
  type!: HaulingBillableItemType;

  @Field()
  materialBasedPricing!: boolean;

  @Field(() => [Number], { nullable: true })
  materialIds?: number[];

  @Field(() => [HaulingMaterial], { nullable: true })
  materials?: HaulingMaterial[];

  @Field()
  businessLineId!: number;
}
