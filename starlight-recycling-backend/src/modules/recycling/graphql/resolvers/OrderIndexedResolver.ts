import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
  Root,
} from 'type-graphql';
import { defaults, isNil, keyBy, sumBy } from 'lodash';
import { ObjectLiteral } from 'typeorm';
import bodybuilder from 'bodybuilder';

import { createIndexedResolver } from '../../../../graphql/createIndexedResolver';
import Order, { OrderStatus, OrderType, PaymentMethodType } from '../../entities/Order';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { ObjectLiteralScalar } from '../../../../graphql/types/SearchBody';
import { QueryContext } from '../../../../types/QueryContext';
import { elasticSearch } from '../../../../services/elasticsearch';
import { SearchResponse } from '../../../../graphql/types/Search';
import OrderIndexed from '../../entities/OrderIndexed';
import { HaulingCustomer } from '../../../../services/core/types/HaulingCustomer';
import { getCustomer } from '../../../../services/core/haulingCustomer';
import CustomerTruck from '../../entities/CustomerTruck';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import { GraphQLResolveInfo } from 'graphql';
import PaginationInput from '../../../../graphql/types/PaginationInput';
import SortInput from '../../../../graphql/types/SortInput';
import NonCommercialTruck from '../../entities/NonCommercialTruck';

const serializer = (entity: any): typeof OrderIndexed => ({
  ...entity,
  arrivedAt: entity.arrivedAt ? new Date(entity.arrivedAt) : null,
  departureAt: entity.departureAt ? new Date(entity.departureAt) : null,
  createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
  updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
  weightTicketAttachedAt: entity.weightTicketAttachedAt
    ? new Date(entity.weightTicketAttachedAt)
    : null,
  weightInTimestamp: entity.weightInTimestamp ? new Date(entity.weightInTimestamp) : null,
  weightOutTimestamp: entity.weightOutTimestamp ? new Date(entity.weightOutTimestamp) : null,
  emptyWeightTimestamp: entity.emptyWeightTimestamp ? new Date(entity.emptyWeightTimestamp) : null,
});

const BaseResolver = createIndexedResolver(Order, OrderIndexed, {
  serializer,
});

@ObjectType()
export class OrderTotalByStatus {
  @Field(() => Int, { defaultValue: 0 })
  all = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.LOAD] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.PAYMENT] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.WEIGHT_OUT] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.IN_YARD] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.COMPLETED] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.APPROVED] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.FINALIZED] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.INVOICED] = 0;

  @Field(() => Int, { defaultValue: 0 })
  [OrderStatus.ON_THE_WAY] = 0;
}

@InputType()
export class OrderGroupByStatusTotalInput {
  @Field(() => ObjectLiteralScalar)
  query!: ObjectLiteral;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  aggs: ObjectLiteral | null = null;
}

@ObjectType()
export class YardConsoleActivityTotal {
  @Field(() => Int, { defaultValue: 0 })
  today = 0;

  @Field(() => Int, { defaultValue: 0 })
  inYard = 0;

  @Field(() => Int, { defaultValue: 0 })
  onTheWay = 0;

  @Field(() => Int, { defaultValue: 0 })
  selfService = 0;
}

export enum YardOperationConsoleTabs {
  Today = 'today',
  InYard = 'dumpAndLoad',
  OnTheWay = 'onTheWay',
  SelfService = 'selfService',
}

registerEnumType(YardOperationConsoleTabs, { name: 'YardOperationConsoleTabs' });

@InputType()
export class YardConsoleActivityInput {
  @Field()
  time!: Date;

  @Field()
  activeTab!: YardOperationConsoleTabs;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  query?: ObjectLiteral;
}

@ObjectType()
export class OnTheWayNumber {
  @Field()
  WONumber!: string;

  @Field()
  customerBusinessName!: string;
}

@ObjectType()
export class OrdersIndexedList {
  @Field(() => [OrderIndexed])
  data!: OrderIndexed[];

  @Field()
  total!: number;
}

@InputType()
export class RangeFilter {
  @Field()
  from!: Date;

  @Field()
  to!: Date;
}

@InputType()
export class OrdersIndexedFilter {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [RangeFilter], { nullable: true })
  createdAt?: RangeFilter[];

  @Field(() => [OrderStatus], { nullable: true })
  status?: OrderStatus[];

  @Field(() => [OrderType], { nullable: true })
  type?: OrderType[];

  @Field(() => [PaymentMethodType], { nullable: true })
  paymentMethod?: PaymentMethodType[];

  @Field(() => [String], { nullable: true })
  owner?: string[];

  @Field(() => [Int], { nullable: true })
  materialId?: number[];

  @Field(() => [Int], { nullable: true })
  customerId?: number[];

  @Field(() => [Int], { nullable: true })
  haulingOrderId?: number[];

  @Field({ nullable: true })
  graded?: boolean;

  @Field(() => [String], { nullable: true })
  PONumber?: string[];
}

const buildFilters = (
  filter: OrdersIndexedFilter,
  pagination?: PaginationInput,
  sort?: SortInput<OrderIndexed>[],
) => {
  const qb = bodybuilder();

  if (pagination) {
    qb.from(pagination.page).size(pagination.perPage);
  }

  if (filter?.search) {
    qb.query('multi_match', {
      query: filter.search,
      type: 'cross_fields',
      operator: 'and',
    });
  }

  if (filter?.materialId) {
    qb.andFilter('terms', 'materialId', filter.materialId);
  }

  if (filter?.customerId) {
    qb.andFilter('terms', 'customerId', filter.customerId);
  }

  if (filter?.haulingOrderId) {
    qb.andFilter('terms', 'haulingOrderId', filter.haulingOrderId);
  }

  if (filter?.status) {
    qb.andFilter('terms', 'status.keyword', filter.status);
  }

  if (filter?.owner) {
    qb.andFilter('terms', 'owner.keyword', filter.owner);
  }

  if (filter?.type) {
    qb.andFilter('terms', 'type.keyword', filter.type);
  }

  if (filter?.paymentMethod) {
    qb.andFilter('terms', 'paymentMethod.keyword', filter.paymentMethod);
  }

  if (filter?.PONumber) {
    qb.andFilter('terms', 'PONumber.keyword', filter.PONumber);
  }

  if (!isNil(filter?.graded)) {
    qb.andFilter('term', 'graded', filter.graded);
  }

  if (filter?.createdAt) {
    qb.andFilter(
      'range',
      'createdAt',
      filter.createdAt.map((range) => ({ gte: range.from, lte: range.to })),
    );
  }

  if (sort) {
    qb.sort(sort.map((s) => ({ [s.field]: s.order })));
  }

  return qb.build();
};

@Resolver(() => OrderIndexed)
export default class OrderIndexedResolver extends BaseResolver {
  @FieldResolver(() => HaulingCustomer)
  async customer(@Root() order: OrderIndexed, @Ctx() ctx: QueryContext): Promise<HaulingCustomer> {
    if (order.customer) {
      return order.customer;
    }

    return getCustomer(ctx, order.customerId);
  }

  @FieldResolver(() => CustomerTruck, { nullable: true })
  async customerTruck(
    @Root() order: OrderIndexed,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<CustomerTruck | null> {
    if (order.customerTruck) {
      return order.customerTruck;
    }

    const CtxCustomerTruck = getContextualizedEntity(CustomerTruck)(ctx);

    return CtxCustomerTruck.findOneAndSelectForQuery(info, { id: order.customerTruckId });
  }

  @FieldResolver(() => NonCommercialTruck, { nullable: true })
  async nonCommercialTruck(
    @Root() order: OrderIndexed,
    @Ctx() ctx: QueryContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<NonCommercialTruck | null> {
    if (order.nonCommercialTruck) {
      return order.nonCommercialTruck;
    }

    const CtxNonCommercialTruck = getContextualizedEntity(NonCommercialTruck)(ctx);

    return CtxNonCommercialTruck.findOneAndSelectForQuery(info, { id: order.nonCommercialTruckId });
  }

  @Authorized(['recycling:Order:list', 'recycling:YardConsole:perform'])
  @Query(() => OrderTotalByStatus)
  async indexedOrdersGroupByStatusTotal(
    @Arg('filter', () => OrdersIndexedFilter, { nullable: true, defaultValue: {} })
    filter: OrdersIndexedFilter = {},
    @Ctx() ctx: QueryContext,
  ): Promise<OrderTotalByStatus> {
    const index = await this.getIndex(ctx);
    const query = buildFilters(filter);

    const {
      body: { aggregations },
    } = await elasticSearch.client.search<SearchResponse<Order>, any>({
      index,
      body: {
        ...query,
        aggs: {
          status: {
            terms: { field: 'status.keyword' },
          },
        },
      },
      size: 0,
    });

    const grouped = new OrderTotalByStatus();
    const statuses = [
      OrderStatus.IN_YARD,
      OrderStatus.LOAD,
      OrderStatus.PAYMENT,
      OrderStatus.WEIGHT_OUT,
      OrderStatus.COMPLETED,
      OrderStatus.APPROVED,
      OrderStatus.FINALIZED,
      OrderStatus.INVOICED,
      OrderStatus.ON_THE_WAY,
    ];
    grouped.all = sumBy(aggregations.status.buckets, 'doc_count');
    const keyedBuckets = keyBy(aggregations.status.buckets, 'key');

    statuses.forEach((status) => {
      grouped[status] = keyedBuckets[status]?.doc_count || 0;
    });

    return grouped;
  }

  @Authorized(['recycling:Order:list', 'recycling:YardConsole:perform'])
  @Query(() => YardConsoleActivityTotal)
  async yardOperationConsoleActivity(
    @Arg('input', () => YardConsoleActivityInput) input: YardConsoleActivityInput,
    @Ctx() ctx: QueryContext,
  ): Promise<YardConsoleActivityTotal> {
    const index = await this.getIndex(ctx);

    const selfServiceFilter = {
      bool: {
        filter: [],
        must: [
          {
            term: {
              isSelfService: true,
            },
          },
          {
            terms: {
              'status.keyword': [
                OrderStatus.IN_YARD,
                OrderStatus.LOAD,
                OrderStatus.WEIGHT_OUT,
                OrderStatus.PAYMENT,
              ],
            },
          },
        ],
      },
    };

    const todaysArrive = {
      bool: {
        must: [],
        filter: [
          {
            range: {
              arrivedAt: {
                gte: input.time,
              },
            },
          },
        ],
        must_not: [selfServiceFilter],
      },
    };
    const todaysDeparture = {
      bool: {
        must: [],
        filter: [
          {
            range: {
              departureAt: {
                gte: input.time,
              },
            },
          },
        ],
        must_not: [selfServiceFilter],
      },
    };

    const aggs: { [key in YardOperationConsoleTabs]: any } = {
      today: {
        adjacency_matrix: {
          filters: {
            arrive: todaysArrive,
            departure: todaysDeparture,
          },
        },
      },
      dumpAndLoad: {
        filter: {
          bool: {
            must: [
              {
                terms: {
                  'type.keyword': [OrderType.DUMP, OrderType.LOAD],
                },
              },
            ],
            filter: [],
            must_not: [
              {
                term: {
                  'status.keyword': OrderStatus.ON_THE_WAY,
                },
              },
            ],
          },
        },
        aggs: {
          missingDepartureAt: {
            missing: {
              field: 'departureAt',
            },
          },
        },
      },
      onTheWay: {
        filter: {
          bool: {
            must: [],
            filter: [
              {
                term: {
                  'status.keyword': OrderStatus.ON_THE_WAY,
                },
              },
            ],
          },
        },
      },
      selfService: {
        filter: selfServiceFilter,
      },
    };

    // todo: refactor this crap
    switch (input.activeTab) {
      case YardOperationConsoleTabs.Today:
        aggs[input.activeTab].adjacency_matrix.filters.arrive.bool.must.push(
          ...(input.query?.bool?.must ?? []),
        );
        aggs[input.activeTab].adjacency_matrix.filters.departure.bool.must.push(
          ...(input.query?.bool?.must ?? []),
        );
        aggs[input.activeTab].adjacency_matrix.filters.arrive.bool.filter.push(
          ...(input.query?.bool?.filter ?? []),
        );
        aggs[input.activeTab].adjacency_matrix.filters.departure.bool.filter.push(
          ...(input.query?.bool?.filter ?? []),
        );
        break;
      case YardOperationConsoleTabs.InYard:
        aggs[input.activeTab].filter.bool.must.push(...(input.query?.bool?.must ?? []));
        aggs[input.activeTab].filter.bool.filter.push(...(input.query?.bool?.filter ?? []));
        break;
      case YardOperationConsoleTabs.OnTheWay:
        aggs[input.activeTab].filter.bool.must.push(...(input.query?.bool?.must ?? []));
        aggs[input.activeTab].filter.bool.filter.push(...(input.query?.bool?.filter ?? []));
        break;
      case YardOperationConsoleTabs.SelfService:
        aggs[input.activeTab].filter.bool.must.push(...(input.query?.bool?.must ?? []));
        aggs[input.activeTab].filter.bool.filter.push(...(input.query?.bool?.filter ?? []));
        break;
    }

    const {
      body: { aggregations },
    } = await elasticSearch.client.search<SearchResponse<Order>, any>({
      index,
      size: 0,
      body: {
        aggs,
      },
    });
    const initials = {
      arrive: {
        doc_count: 0,
      },
      departure: {
        doc_count: 0,
      },
      'arrive&departure': {
        doc_count: 0,
      },
    };
    const today = defaults(keyBy(aggregations.today.buckets, 'key'), initials);

    return {
      today:
        today.arrive.doc_count + today.departure.doc_count - today['arrive&departure'].doc_count,
      inYard: aggregations.dumpAndLoad.missingDepartureAt.doc_count,
      onTheWay: aggregations.onTheWay.doc_count,
      selfService: aggregations.selfService.doc_count,
    };
  }

  @Authorized([
    'recycling:Order:view',
    'recycling:YardConsole:perform',
    'recycling:SelfService:perform',
  ])
  @Query(() => [OrderIndexed])
  async ordersByWONumberAndCustomer(
    @Ctx() ctx: QueryContext,
    @Arg('WONumber', () => String) WONumber: string,
    @Arg('customerId', () => Int, { nullable: true }) customerId: number,
    @Arg('onlyAllowSelfService', () => Boolean, { nullable: true }) onlyAllowSelfService: boolean,
  ): Promise<typeof OrderIndexed[]> {
    const index = await this.getIndex(ctx);

    const bodybuilderWithWOFilter = bodybuilder()
      .filter('term', 'status.keyword', OrderStatus.ON_THE_WAY)
      .filter('term', 'WONumber', WONumber);

    if (customerId) {
      bodybuilderWithWOFilter.andFilter('term', 'customer.id', customerId);
    }

    if (onlyAllowSelfService) {
      bodybuilderWithWOFilter.andFilter('term', 'customer.selfServiceOrderAllowed', true);
    }

    const body = bodybuilderWithWOFilter.build();

    const {
      body: {
        hits: { hits },
      },
    } = await elasticSearch.client.search<SearchResponse<Order>, any>({
      index,
      body,
    });

    if (!hits) {
      throw new Error('Order not found');
    }

    return hits.map((hit) => serializer(hit._source));
  }

  @Authorized([
    'recycling:Order:list',
    'recycling:SelfService:list',
    'recycling:YardConsole:perform',
  ])
  @Query(() => [OnTheWayNumber])
  async onTheWayWONumbers(
    @Arg('customerId', () => Int, { nullable: true }) customerId: number,
    @Arg('onlyAllowSelfService', () => Boolean, { nullable: true }) onlyAllowSelfService: boolean,
    @Ctx() ctx: QueryContext,
  ): Promise<OnTheWayNumber[]> {
    const index = await this.getIndex(ctx);

    const bodybuilderWithWOQuery = bodybuilder()
      .size(5000)
      .filter('term', 'status.keyword', OrderStatus.ON_THE_WAY);

    if (customerId) {
      bodybuilderWithWOQuery.andFilter('term', 'customer.id', customerId);
    }

    if (onlyAllowSelfService) {
      bodybuilderWithWOQuery.andFilter('term', 'customer.selfServiceOrderAllowed', true);
    }

    const body = bodybuilderWithWOQuery.build();

    const {
      body: {
        hits: { hits },
      },
    } = await elasticSearch.client.search<SearchResponse<OrderIndexed>, any>({
      index,
      body: {
        ...body,
        _source: ['WONumber', 'customer.*'],
      },
    });

    return hits
      .map((hit) => ({
        WONumber: hit._source.WONumber,
        customerBusinessName: hit._source.customer.businessName,
      }))
      .filter(({ WONumber }) => WONumber !== undefined) as OnTheWayNumber[];
  }

  @Authorized(['recycling:Order:list', 'recycling:YardConsole:perform'])
  @Query(() => OrdersIndexedList)
  async ordersGrid(
    @Arg('pagination', () => PaginationInput, { defaultValue: { page: 1, perPage: 10 } })
    pagination: PaginationInput,
    @Ctx() ctx: QueryContext,
    @Arg('sort', () => [SortInput], { defaultValue: null })
    sort?: SortInput<OrderIndexed>[],
    @Arg('filter', () => OrdersIndexedFilter, { nullable: true, defaultValue: {} })
    filter: OrdersIndexedFilter = {},
  ): Promise<OrdersIndexedList> {
    const query = buildFilters(filter, pagination, sort);

    return super.list(ctx, {
      ...query,
      highlight: {
        require_field_match: false,
        pre_tags: ['<b>'],
        post_tags: ['</b>'],
        fields: {
          WONumber: {
            number_of_fragments: 1,
          },
        },
      },
    });
  }
}
