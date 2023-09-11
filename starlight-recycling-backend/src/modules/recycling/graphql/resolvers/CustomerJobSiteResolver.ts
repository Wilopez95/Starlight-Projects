import { ApolloError } from 'apollo-server-koa';
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver } from 'type-graphql';

import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { HaulingCustomerJobSite } from '../../entities/CustomerJobSite';
import {
  createHaulingCustomerJobSite,
  getHaulingCustomerJobSite,
  getHaulingCustomerJobSitePair,
  getHaulingCustomerJobSites,
  getHaulingCustomerJobSitesAll,
} from '../../../../services/core/haulingJobSite';
import { HaulingEntityFilter } from '../../../../services/core/types/HaulingEntityFilter';

@InputType()
export class HaulingCustomerJobSiteInput {
  @Field()
  customerId!: number;

  @Field()
  jobSiteId!: number;

  @Field({ nullable: true })
  active!: boolean;

  @Field({ nullable: true })
  poRequired?: boolean;

  @Field({ nullable: true })
  PONumberRequired?: boolean;

  @Field({ nullable: true })
  popupNote?: string;
}

@InputType()
export class CustomerJobSiteFilterInput {
  @Field(() => Int, { defaultValue: null })
  customerId?: number;

  @Field(() => Int, { defaultValue: null })
  jobSiteId?: number;

  @Field(() => Boolean, { defaultValue: null })
  active: boolean | null = null;
}

@InputType()
export class HaulingCustomerJobSiteFilterInput extends HaulingEntityFilter {
  @Field()
  customerId!: number;

  @Field({ nullable: true })
  activeOnly?: boolean;
}

@InputType()
export class HaulingCustomerJobSitePairFilterInput {
  @Field()
  customerId!: number;

  @Field()
  jobSiteId!: number;
}

@InputType()
export class HaulingCustomerJobSitePairByIdFilterInput {
  @Field()
  customerId!: number;

  @Field()
  jobSiteId!: number;
}

@Resolver(() => HaulingCustomerJobSite)
export default class CustomerJobSiteResolver {
  @Authorized()
  @Mutation(() => HaulingCustomerJobSite)
  async createHaulingCustomerJS(
    @Ctx() ctx: QueryContext,
    @Arg('data', () => HaulingCustomerJobSiteInput) data: HaulingCustomerJobSiteInput,
  ): Promise<HaulingCustomerJobSite> {
    try {
      const customerJobSiteInput = {
        customerId: data.customerId,
        jobSiteId: data.jobSiteId,
        active: data.active,
        poRequired: data.PONumberRequired,
        popupNote: data.popupNote || null,
      };

      return await createHaulingCustomerJobSite(ctx, customerJobSiteInput);
    } catch (e) {
      ctx.log.error(e.response?.data || e, e.message);

      if (!e.response?.data) {
        throw e;
      }

      throw new ApolloError(e.response.data.message, e.response.data.code, e.response.data.details);
    }
  }

  @Authorized(
    'customers:view:perform',
    'recycling:SelfService:list',
    'recycling:YardConsole:perform',
  )
  @Query(() => [HaulingCustomerJobSite])
  async haulingCustomerJobSites(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingCustomerJobSiteFilterInput)
    filter: HaulingCustomerJobSiteFilterInput,
  ): Promise<HaulingCustomerJobSite[]> {
    return getHaulingCustomerJobSites(ctx, filter);
  }

  @Authorized([
    'customers:view:perform',
    'recycling:SelfService:perform',
    'recycling:YardConsole:perform',
  ])
  @Query(() => [HaulingCustomerJobSite])
  async haulingCustomerJobSitesAll(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingCustomerJobSiteFilterInput)
    filter: HaulingCustomerJobSiteFilterInput,
  ): Promise<HaulingCustomerJobSite[]> {
    return getHaulingCustomerJobSitesAll(ctx, filter);
  }

  @Authorized([
    'customers:view:perform',
    'recycling:SelfService:perform',
    'recycling:YardConsole:perform',
  ])
  @Query(() => HaulingCustomerJobSite)
  async haulingCustomerJobSitePair(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingCustomerJobSitePairFilterInput)
    filter: HaulingCustomerJobSitePairFilterInput,
  ): Promise<HaulingCustomerJobSite> {
    return getHaulingCustomerJobSitePair(ctx, filter);
  }

  @Authorized(['customers:view:perform', 'recycling:YardConsole:perform'])
  @Query(() => HaulingCustomerJobSite)
  async haulingCustomerJobSite(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingCustomerJobSitePairByIdFilterInput)
    filter: HaulingCustomerJobSitePairByIdFilterInput,
  ): Promise<HaulingCustomerJobSite> {
    return getHaulingCustomerJobSite(ctx, filter);
  }
}
