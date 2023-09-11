import { Resolver, InputType, Field, Int, Query, Ctx, Arg, ObjectType } from 'type-graphql';
import { Length, IsBoolean, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { FindConditions, ObjectLiteral } from 'typeorm';
import bodybuilder from 'bodybuilder';

import CustomerTruck, { CustomerTruckTypes } from '../../entities/CustomerTruck';
import { createCRUDResolver } from '../../../../graphql/createCRUDResolver';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import { SearchOption, SearchResponse } from '../../../../graphql/types/Search';
import { SearchBodyInput } from '../../../../graphql/types/SearchBody';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { QueryContext } from '../../../../types/QueryContext';
import { getIndex } from '../../utils/getIndex';
import { elasticSearch } from '../../../../services/elasticsearch';
import Order, { OrderStatus } from '../../entities/Order';
import { MeasurementType, MeasurementUnit } from '../types/Measurements';
import { getCustomer } from '../../../../services/core/haulingCustomer';

@InputType()
export class CustomerTruckInput {
  @Field({ nullable: true })
  @Length(0, 100)
  description?: string;

  @Field(() => Int)
  customerId!: number;

  @Field()
  @IsBoolean()
  active!: boolean;

  @Field(() => CustomerTruckTypes)
  @IsEnum(CustomerTruckTypes)
  type!: string;

  @Field()
  @Length(0, 25)
  truckNumber!: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 25)
  licensePlate?: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  emptyWeight?: number;

  @Field(() => MeasurementUnit, { nullable: true })
  emptyWeightUnit?: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  emptyWeightType?: MeasurementType;

  @Field({ nullable: true })
  emptyWeightSource?: string;

  @Field({ nullable: true })
  emptyWeightTimestamp?: Date;

  @Field({ nullable: true })
  emptyWeightUser?: string;
}

@ObjectType()
class CustomerTruckForOrderCreate extends CustomerTruck {
  @Field()
  isInUse!: boolean;
}

@InputType()
export class CustomerTruckUpdateInput extends CustomerTruckInput {
  @Field()
  id!: number;
}

@InputType()
export class TrucksForOrderCreateFilterInput {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefinedEmptyWeight?: boolean;
}

@InputType()
export class CustomerTruckFilter {
  @Field(() => Boolean, { defaultValue: null })
  active: boolean | null = null;

  @Field(() => Int)
  customerId: number | null = null;

  @Field(() => SearchBodyInput)
  search: SearchBodyInput | null = null;

  @Field(() => String)
  description: string | null = null;
}

const BaseResolver = createCRUDResolver<CustomerTruck>(
  {
    EntityInput: CustomerTruckInput,
    FilterInput: CustomerTruckFilter,
    EntityUpdateInput: CustomerTruckUpdateInput,
    idType: Int,
    permissionsPrefix: 'recycling',
    permissions: {
      entity: ['recycling:SelfService:view', 'recycling:Customer:view'],
    },
    modifyListParamsWithFilters(filter: CustomerTruckFilter, params): void {
      const { active, customerId, search } = filter;
      const where:
        | FindConditions<CustomerTruck & SearchOption>
        | ObjectLiteral = (params.where = {});

      if (active !== null) {
        where.active = active;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (search) {
        where.search = search;
      }
    },
    async onCreate(customerTruck: CustomerTruck, { customerId }: CustomerTruckInput, ctx) {
      const customer = await getCustomer(ctx, customerId);

      if (!customer) {
        throw ctx.throw(400, 'Customer not found');
      }

      customerTruck.emptyWeightUser = ctx.userInfo.id;

      const ContextualizedCustomerTruckEntity = getContextualizedEntity<typeof CustomerTruck>(
        CustomerTruck,
      )(ctx);
      const truck = await ContextualizedCustomerTruckEntity.findOne({
        truckNumber: customerTruck.truckNumber,
        type: customerTruck.type,
        customerId,
      });

      if (truck) {
        throw new Error('Truck with this type and number already exists');
      }
    },
    async onUpdate(truck: CustomerTruck, _input, ctx) {
      truck.emptyWeightUser = ctx.userInfo.id;

      const ContextualizedCustomerTruckEntity = getContextualizedEntity<typeof CustomerTruck>(
        CustomerTruck,
      )(ctx);

      await ContextualizedCustomerTruckEntity.findOneOrFail({
        id: truck.id,
        customerId: truck.customerId,
      });

      await truck.save();
    },
  },
  CustomerTruck,
);

@Resolver()
export default class CustomerTruckResolver extends BaseResolver {
  @Authorized([
    'recycling:CustomerTruck:view',
    'recycling:SelfService:view',
    'recycling:YardConsole:perform',
  ])
  @Query(() => [CustomerTruckForOrderCreate])
  async trucksForOrderCreate(
    @Ctx()
    ctx: QueryContext,
    @Arg('customerId', () => Int)
    customerId: number,
    @Arg('filter', () => TrucksForOrderCreateFilterInput, { defaultValue: {} })
    filter?: TrucksForOrderCreateFilterInput,
  ): Promise<CustomerTruckForOrderCreate[]> {
    const indexName = await getIndex(ctx, Order);

    const qb = bodybuilder()
      .filter('term', 'customer.id', customerId)
      .filter('terms', 'status.keyword', [
        OrderStatus.IN_YARD,
        OrderStatus.WEIGHT_OUT,
        OrderStatus.LOAD,
        OrderStatus.ON_THE_WAY,
      ])
      .aggregation('terms', 'customerTruck.id', 'trucksInUse');

    if (filter?.isDefinedEmptyWeight) {
      qb.andFilter('range', 'customerTruck.emptyWeight', { gt: 0 });
    }

    const body = qb.build();

    const {
      body: { aggregations },
    } = await elasticSearch.client.search<SearchResponse<Order>, any>({
      index: indexName,
      body,
    });

    const truckInUseIds: number[] = aggregations.trucksInUse.buckets.map(
      (bucket: any) => bucket.key,
    );

    const ContextualizedCustomerTruckEntity = getContextualizedEntity(CustomerTruck)(ctx);

    const customerTrucks = await ContextualizedCustomerTruckEntity.find({
      where: {
        customerId: customerId,
        active: true,
      },
      take: 200, // TODO add pagination
    });

    return customerTrucks.map((truck) => ({
      ...truck,
      isInUse: truckInUseIds.includes(truck.id),
    })) as CustomerTruckForOrderCreate[];
  }
}
