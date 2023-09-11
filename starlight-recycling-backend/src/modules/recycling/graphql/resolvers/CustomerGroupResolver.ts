import { Resolver, InputType, Field, Ctx, Query, Arg } from 'type-graphql';
import { Length, IsBoolean, IsEnum } from 'class-validator';

import CustomerType from '../types/CustomerType';
import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import {
  HaulingCustomerGroup,
  HaulingCustomerGroupType,
} from '../../../../services/core/types/HaulingCustomerGroup';
import { getCustomerGroups } from '../../../../services/core/haulingCustomerGroup';

@InputType()
export class CustomerGroupInput {
  @Field()
  @Length(0, 100)
  description!: string;

  @Field()
  @IsBoolean()
  active!: boolean;

  @Field(() => CustomerType, { defaultValue: CustomerType.COMMERCIAL })
  @IsEnum(CustomerType)
  type!: CustomerType;
}

@InputType()
export class CustomerGroupUpdateInput extends CustomerGroupInput {
  @Field()
  id!: number;
}

@InputType()
export class CustomerGroupFilter {
  @Field(() => Boolean, { defaultValue: null })
  active: boolean | null = null;

  @Field(() => CustomerType, { defaultValue: null })
  type: CustomerType | null = null;
}

@InputType()
export class HaulingCustomerGroupFilter {
  @Field(() => Boolean, { nullable: true })
  activeOnly: boolean | null = null;

  @Field(() => HaulingCustomerGroupType, { nullable: true })
  type?: HaulingCustomerGroupType;
}

@Resolver()
export default class CustomerGroupResolver {
  @Authorized(['configuration:customer-groups:list', 'recycling:YardConsole:perform'])
  @Query(() => [HaulingCustomerGroup])
  async haulingCustomerGroups(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingCustomerGroupFilter, { nullable: true })
    filter?: HaulingCustomerGroupFilter,
  ): Promise<HaulingCustomerGroup[]> {
    return getCustomerGroups(ctx, filter);
  }
}
