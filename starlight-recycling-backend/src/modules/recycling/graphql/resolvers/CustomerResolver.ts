import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Length } from 'class-validator';

import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { QueryContext } from '../../../../types/QueryContext';
import { Balances } from '../../../../services/billing/graphql/api';
import { getSalesRepresentativesByBU, getUser } from '../../../../services/ums/users';
import { User } from '../../../../services/ums/users';
import { getCustomerBalances } from '../../../../services/billing/customer';
import { customerService } from '../../../../services/core/haulingCustomer';
import {
  HaulingCustomer,
  HaulingCustomerInput,
  HaulingCustomerStatus,
} from '../../../../services/core/types/HaulingCustomer';
import { HaulingEntityFilter } from '../../../../services/core/types/HaulingEntityFilter';
import { coreErrorHandler } from './utils/coreErrorHandler';

@InputType()
export class CustomerInput {}

@InputType()
export class CustomerUpdateInput extends CustomerInput {
  @Field()
  id!: number;
}

@InputType()
export class WalkUpCustomerInput {
  @Field()
  @Length(0, 200)
  businessName!: string;

  @Field()
  requireGrading!: boolean;

  @Length(0, 65535)
  @Field(() => String, { defaultValue: '' })
  generalNotes!: string;

  @Length(0, 65535)
  @Field(() => String, { defaultValue: '' })
  popupNotes!: string;

  @Field()
  gradingNotification!: boolean;
}

@InputType()
export class CustomerFilter extends HaulingEntityFilter {
  @Field(() => [HaulingCustomerStatus], { nullable: true })
  filterByState?: HaulingCustomerStatus[];
  @Field(() => [String], { nullable: true })
  filterByHaulerSrn?: string[];
  @Field(() => Boolean, { nullable: true })
  filterBySelfServiceOrderAllowed?: boolean;
  @Field(() => Boolean, { nullable: true })
  filterByOnAccount?: boolean;
}

const BaseResolver = createHaulingCRUDResolver<HaulingCustomer, HaulingCustomerInput>(
  {
    EntityInput: HaulingCustomerInput,
    FilterInput: CustomerFilter,
    EntityUpdateInput: CustomerUpdateInput,
    service: customerService,
    permissionsPrefix: 'recycling',
    name: 'HaulingCustomer',
    permissionName: 'Customer',
    permissions: {
      list: [
        'recycling:SelfService:list',
        'recycling:Customer:list',
        'recycling:YardConsole:perform',
      ],
    },
  },
  HaulingCustomer,
);
@Resolver(() => HaulingCustomer)
export default class CustomerResolver extends BaseResolver {
  @Authorized(['recycling:Customer:view', 'recycling:YardConsole:perform'])
  @Query(() => HaulingCustomer, { nullable: true })
  async getWalkUpCustomer(@Ctx() ctx: QueryContext): Promise<HaulingCustomer | null> {
    const response = await this.service.get(ctx, { walkup: true });
    const walkup = response.data[0];

    if (walkup) {
      return walkup;
    }

    return null;
  }

  @Authorized([
    'recycling:Customer:view',
    'recycling:SelfService:view',
    'recycling:YardConsole:perform',
  ])
  @FieldResolver(() => Balances, { nullable: true })
  balances(@Ctx() ctx: QueryContext, @Root() customer: HaulingCustomer): Promise<Balances | null> {
    return getCustomerBalances(ctx, `${customer.id}`);
  }

  @Authorized()
  @Query(() => [User])
  salesRepresentatives(@Ctx() ctx: QueryContext): Promise<User[]> {
    return getSalesRepresentativesByBU(ctx);
  }

  @Authorized(['recycling:Customer:view', 'recycling:YardConsole:perform'])
  @FieldResolver(() => User, { nullable: true })
  async saleRepresentative(@Root() customer: HaulingCustomer): Promise<User | null> {
    if (!customer.saleRepresentativeId) {
      return null;
    }

    return getUser({ id: customer.saleRepresentativeId });
  }

  @Authorized(['recycling:Customer:create', 'recycling:YardConsole:perform'])
  @Mutation(() => HaulingCustomer)
  async createHaulingCustomer(
    @Ctx() ctx: QueryContext,
    @Arg('data', () => HaulingCustomerInput) input: HaulingCustomerInput,
  ): Promise<HaulingCustomer> {
    try {
      return await customerService.createCustomer(ctx, input);
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }
}
