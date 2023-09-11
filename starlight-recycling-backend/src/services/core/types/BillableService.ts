import { Field, ObjectType, registerEnumType } from 'type-graphql';

export enum BillableServiceUnit {
  none = 'none',
  each = 'each',
  ton = 'ton',
  yard = 'yard',
  hourly = 'hourly',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  mile = 'mile',
  minute = 'minute',
  gallon = 'gallon',
}

registerEnumType(BillableServiceUnit, {
  name: 'BillableServiceUnit',
});

export enum BillableServiceAction {
  dump = 'dump',
  load = 'load',
}
registerEnumType(BillableServiceAction, { name: 'BillableServiceAction' });

@ObjectType()
export class BillableService {
  @Field()
  id!: number;

  @Field()
  active!: boolean;

  @Field(() => BillableServiceAction)
  action!: BillableServiceAction;

  @Field()
  description!: string;

  @Field(() => BillableServiceUnit)
  unit!: BillableServiceUnit;

  @Field()
  businessLineId!: number;

  @Field()
  equipmentItemId!: number;

  @Field()
  materialBasedPricing!: boolean;
}
