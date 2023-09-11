import { Field, ObjectType, registerEnumType } from 'type-graphql';

@ObjectType()
export class HaulingPriceGroup {
  @Field()
  id!: number;

  @Field()
  description!: string;
}

export enum HaulingPriceGroupsResultLevel {
  global = 'global',
  custom = 'custom',
}
registerEnumType(HaulingPriceGroupsResultLevel, { name: 'HaulingPriceGroupsResultLevel' });

@ObjectType()
export class HaulingPriceGroupsResult {
  @Field(() => HaulingPriceGroupsResultLevel)
  level!: HaulingPriceGroupsResultLevel;

  @Field(() => [HaulingPriceGroup], { nullable: true })
  customRatesGroups?: HaulingPriceGroup[];

  @Field({ nullable: true })
  selectedId!: number;
}
