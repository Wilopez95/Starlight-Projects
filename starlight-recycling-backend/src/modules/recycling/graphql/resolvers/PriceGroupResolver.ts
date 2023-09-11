import { Resolver, InputType, Field, Int, Mutation, Ctx, Arg, Query } from 'type-graphql';
import { Length } from 'class-validator';

import { DayOfWeek } from '../../../../graphql/types/DayOfWeek';
import { PriceInput, PriceBasedOnMaterialsInput } from '../types/Prices';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { QueryContext } from '../../../../types/QueryContext';
import { calculateRates, getHaulingPriceGroups } from '../../../../services/core/haulingPriceGroup';
import { HaulingPriceGroupsResult } from '../../../../services/core/types/HaulingPriceGroup';
import {
  HaulingCalculateRatesInput,
  HaulingCalculateRatesResult,
} from '../../../../services/core/types/HaulingOrder';
import { ApolloError } from 'apollo-server-koa';

@InputType()
export class PriceGroupInput {
  @Field({ nullable: true })
  uuid?: string;

  @Field()
  active!: boolean;

  @Field()
  @Length(2, 100)
  description!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => [DayOfWeek])
  validDays!: DayOfWeek[];

  @Field(() => Date, { defaultValue: null })
  endDate?: Date;

  @Field(() => Number, { defaultValue: null })
  customerGroupId?: number;

  @Field(() => Number, { defaultValue: null })
  customerId?: number;

  @Field(() => Number, { defaultValue: null })
  customerJobSiteId?: number;

  @Field(() => Boolean, { defaultValue: false })
  nonWorkingHours?: boolean;
}

@InputType()
export class PriceGroupPricesInput {
  @Field(() => Int)
  id!: number;

  @Field(() => [PriceInput])
  dumpMaterialsPrices!: PriceInput[];

  @Field(() => [PriceInput])
  loadMaterialsPrices!: PriceInput[];

  @Field(() => [PriceInput])
  miscellaneousItemsPrices!: PriceInput[];

  @Field(() => [PriceBasedOnMaterialsInput])
  miscellaneousItemsBasedOnMaterials!: PriceBasedOnMaterialsInput[];

  @Field(() => [PriceInput])
  lineItemsPrices!: PriceInput[];

  @Field(() => [PriceBasedOnMaterialsInput])
  lineItemsBasedOnMaterials!: PriceBasedOnMaterialsInput[];

  @Field(() => [PriceInput])
  nonServiceFeesPrices!: PriceInput[];

  @Field(() => [PriceBasedOnMaterialsInput])
  dumpFeesBasedOnMaterials!: PriceBasedOnMaterialsInput[];

  @Field(() => [PriceBasedOnMaterialsInput])
  loadFeesBasedOnMaterials!: PriceBasedOnMaterialsInput[];
}

@InputType()
export class PriceGroupUpdateInput extends PriceGroupInput {
  @Field(() => Int)
  id!: number;
}

@InputType()
export class PriceGroupFilter {
  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  active?: boolean | null = null;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  customerGroupId?: number;

  @Field(() => Int, { nullable: true })
  customerId?: number;

  @Field(() => Int, { nullable: true })
  customerJobSiteId?: number;

  @Field(() => Boolean, { nullable: true })
  customerNotNull?: boolean;

  @Field(() => Boolean, { nullable: true })
  customerJobSiteNotNull?: boolean;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  current: boolean | null = true;
}

@InputType()
export class HaulingPriceGroupFilterInput {
  @Field()
  customerId!: number;

  @Field(() => Int, { nullable: true })
  customerJobSiteId: number | null = null;
}

@Resolver(() => HaulingPriceGroupsResult)
export default class PriceGroupResolver {
  @Authorized(['configuration/price-groups:price-groups:view', 'recycling:YardConsole:perform'])
  @Query(() => HaulingPriceGroupsResult)
  async haulingPriceGroups(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingPriceGroupFilterInput) filter: HaulingPriceGroupFilterInput,
  ): Promise<HaulingPriceGroupsResult> {
    return getHaulingPriceGroups(ctx, filter);
  }

  @Authorized()
  @Mutation(() => HaulingCalculateRatesResult, { nullable: true })
  async calculateHaulingRates(
    @Ctx() ctx: QueryContext,
    @Arg('input', () => HaulingCalculateRatesInput) input: HaulingCalculateRatesInput,
  ): Promise<HaulingCalculateRatesResult> {
    try {
      return await calculateRates(ctx, input);
    } catch (e) {
      ctx.log.error(e.response?.data || e, e.message);

      if (!e.response?.data) {
        throw e;
      }

      throw new ApolloError(e.response.data.message, e.response.data.code, e.response.data.details);
    }
  }
}
