import { Arg, Ctx, Field, InputType, ObjectType, Query, Resolver } from 'type-graphql';
import { createIndexedResolver } from '../../../../graphql/createIndexedResolver';
import CustomerTruck from '../../entities/CustomerTruck';
import CustomerTruckIndexed from '../../entities/CustomerTruckIndexed';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import PaginationInput from '../../../../graphql/types/PaginationInput';
import { QueryContext } from '../../../../types/QueryContext';
import SortInput from '../../../../graphql/types/SortInput';
import bodybuilder from 'bodybuilder';

const BaseResolver = createIndexedResolver(CustomerTruck, CustomerTruckIndexed);

@InputType()
export class CustomerTruckIndexedFilter {
  @Field({ nullable: true })
  customerId?: number;

  @Field({ nullable: true })
  activeOnly?: boolean;

  @Field({ nullable: true })
  search?: string;
}

@ObjectType()
export class CustomerTrucksListIndexed {
  @Field(() => [CustomerTruckIndexed])
  data!: CustomerTruckIndexed[];

  @Field()
  total!: number;
}

@Resolver()
export default class CustomerTruckIndexedResolver extends BaseResolver {
  @Authorized()
  @Query(() => CustomerTrucksListIndexed, { name: 'customerTrucksIndexed' })
  async list(
    @Arg('pagination', () => PaginationInput, { defaultValue: { page: 1, perPage: 10 } })
    pagination: PaginationInput,
    @Ctx() ctx: QueryContext,
    @Arg('sort', () => [SortInput], { defaultValue: null })
    sort?: SortInput<CustomerTruckIndexed>[],
    @Arg('filter', () => CustomerTruckIndexedFilter, { defaultValue: {} })
    filter?: CustomerTruckIndexedFilter,
  ): Promise<CustomerTrucksListIndexed> {
    const qb = bodybuilder().from(pagination.page).size(pagination.perPage);

    if (filter?.customerId) {
      qb.andFilter('match', 'customerId', filter.customerId);
    }

    if (filter?.activeOnly) {
      qb.andFilter('match', 'active', true);
    }

    if (filter?.search) {
      qb.query('term', 'truckNumber', filter.search);
    }

    if (sort) {
      qb.sort(sort.map((s) => ({ [s.field]: s.order })));
    }

    return super.list(ctx, {
      ...qb.build(),
      highlight: {
        require_field_match: false,
        pre_tags: ['<b>'],
        post_tags: ['</b>'],
        fields: {
          truckNumber: {
            number_of_fragments: 1,
          },
        },
      },
    });
  }
}
