import { Field, InputType, ObjectType, registerEnumType } from 'type-graphql';

export enum HaulingCustomerGroupType {
  COMMERCIAL = 'commercial',
  NON_COMMERCIAL = 'non-commercial',
  WALKUP = 'walk-up',
}

registerEnumType(HaulingCustomerGroupType, { name: 'HaulingCustomerGroupType' });

@ObjectType()
export class HaulingCustomerGroup {
  @Field()
  id!: number;

  @Field()
  active!: boolean;

  @Field()
  description!: string;

  @Field(() => HaulingCustomerGroupType)
  type!: HaulingCustomerGroupType;
}

@InputType()
export class HaulingCustomerGroupInput {
  @Field()
  active!: boolean;

  @Field()
  description!: string;

  @Field(() => HaulingCustomerGroupType)
  type!: HaulingCustomerGroupType;
}
