import { ApolloError } from 'apollo-server-koa';
import { Resolver, InputType, Field, Ctx, Query, Arg } from 'type-graphql';
import { Length, IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { HaulingBillableItem } from '../../entities/BillableItem';
import {
  HaulingBillableItemType,
  HaulingBillableItemUnit,
  BillableItemType,
} from '../../entities/BillableItem';
import { OrderType } from '../../entities/Order';
import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { HaulingBillableItemsHttpService } from '../../../../services/core/haulingBillableItems';
import { getBusinessUnit } from '../../../../services/core/business_units';
import { HaulingHttpCrudService } from '../../../../graphql/createHaulingCRUDResolver';

@InputType()
export class HaulingBillableItemFilterInput {
  @IsOptional()
  @Field(() => Boolean)
  active: boolean | undefined;

  @Field(() => [HaulingBillableItemType])
  types!: HaulingBillableItemType[];
}

@InputType()
export class BillableItemInput {
  @IsBoolean()
  @Field()
  active!: boolean;

  @Length(0, 100)
  @Field()
  description!: string;

  @Field(() => HaulingBillableItemUnit)
  @IsEnum(HaulingBillableItemUnit)
  units!: HaulingBillableItemUnit;

  @Field(() => BillableItemType)
  @IsEnum(BillableItemType)
  type!: BillableItemType;

  @Field()
  @IsBoolean()
  pricingBasedOnMaterial!: boolean;

  @Field()
  @IsBoolean()
  taxable!: boolean;

  @Field(() => [Number])
  materialIds!: number[];

  @Field(() => [OrderType])
  orderTypes: OrderType[] = [];
}

@InputType()
export class BillableItemUpdateInput extends BillableItemInput {
  @Field()
  id!: number;
}

@InputType()
export class BillableItemFilter {
  @Field(() => BillableItemType, { defaultValue: null })
  type: BillableItemType | null = null;

  @Field(() => Boolean, { defaultValue: null })
  active: boolean | null = null;

  @Field(() => Boolean, { defaultValue: true, nullable: true })
  current: boolean | null = true;

  @Field(() => Boolean, { defaultValue: null })
  uuid: boolean | null = null;

  @Field(() => Number, { defaultValue: null })
  id: number | null = null;
}

export const getHaulingBillableItems = async (
  ctx: QueryContext,
  search: HaulingBillableItemFilterInput,
): Promise<HaulingBillableItem[]> => {
  const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx);
  const businessUnit = await getBusinessUnit(ctx, auth);

  if (!businessUnit) {
    throw new Error('Business Unit not found');
  }

  const response = await new HaulingBillableItemsHttpService().get(
    ctx,
    { activeOnly: search.active, businessLineIds: businessUnit.businessLines[0].id },
    undefined,
    undefined,
    auth,
  );

  return response.data.filter((item) => search.types.includes(item.type));
};

@Resolver(() => HaulingBillableItem)
export default class BillableItemResolver {
  @Authorized(['configuration:billable-items:list', 'recycling:YardConsole:perform'])
  @Query(() => [HaulingBillableItem], { name: 'getHaulingBillableItems' })
  async getHaulingBillableItems(
    @Arg('search', () => HaulingBillableItemFilterInput) search: HaulingBillableItemFilterInput,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingBillableItem[]> {
    try {
      return await getHaulingBillableItems(ctx, search);
    } catch (e) {
      ctx.log.error(e.response?.data || e, e.message);

      if (!e.response?.data) {
        throw e;
      }

      throw new ApolloError(e.response.data.message, e.response.data.code, e.response.data.details);
    }
  }
}
