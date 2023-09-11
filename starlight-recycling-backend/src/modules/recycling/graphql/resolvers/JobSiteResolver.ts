import { ApolloError } from 'apollo-server-koa';
import { Resolver, InputType, Field, Ctx, Mutation, Arg } from 'type-graphql';
import { Length, IsBoolean, IsOptional } from 'class-validator';
import { Feature } from 'geojson';

import {
  HaulingJobSite,
  HaulingJobSiteInput,
  HaulingJobSiteUpdateInput,
} from '../../entities/JobSite';
import { FeatureScalar } from '../types/GeoJSON';
import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { getCompanyRegionalSettings } from '../../../../services/core/companies';
import { createHaulingCRUDResolver } from '../../../../graphql/createHaulingCRUDResolver';
import { haulingJobSiteHttpService } from '../../../../services/core/haulingJobSite';

@InputType()
export class JobSiteInput {
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  active!: boolean;

  @Length(0, 200)
  @Field()
  lineAddress1!: string;

  @IsOptional()
  @Length(0, 200)
  @Field()
  lineAddress2?: string;

  @Length(0, 100)
  @Field()
  state!: string;

  @Length(0, 100)
  @Field()
  city!: string;

  @Length(0, 50)
  @Field()
  zip!: string;

  @Field(() => FeatureScalar)
  geojson!: Feature;

  @Field({ nullable: true })
  county!: string;

  @Field()
  customerId!: number;
}

@InputType()
export class JobSiteFilter {
  @Field(() => Boolean, { defaultValue: null })
  active: boolean | null = null;
}

const BaseResolver = createHaulingCRUDResolver<HaulingJobSite, HaulingJobSiteInput>(
  {
    EntityInput: HaulingJobSiteInput,
    FilterInput: JobSiteFilter,
    EntityUpdateInput: HaulingJobSiteUpdateInput,
    service: haulingJobSiteHttpService,
    name: 'haulingJobSite',
    permissions: {
      list: [],
      entity: [],
    },
  },
  HaulingJobSite,
);

@Resolver(() => HaulingJobSite)
export default class JobSiteResolver extends BaseResolver {
  @Authorized()
  @Mutation(() => HaulingJobSite, { nullable: true })
  async createHaulingJobSiteOnCore(
    @Ctx() ctx: QueryContext,
    @Arg('data', () => JobSiteInput) data: JobSiteInput,
  ): Promise<HaulingJobSite> {
    try {
      const { region } = await getCompanyRegionalSettings(ctx);

      const jobSiteInput = {
        address: {
          addressLine1: data.lineAddress1,
          addressLine2: data.lineAddress2,
          state: data.state,
          city: data.city,
          zip: data.zip,
          region,
        },
        alleyPlacement: false,
        cabOver: false,
        location: data.geojson.geometry,
      };

      return await haulingJobSiteHttpService.create(ctx, jobSiteInput);
    } catch (e) {
      ctx.log.error(e.response?.data || e, e.message);

      if (!e.response?.data) {
        throw e;
      }

      throw new ApolloError(e.response.data.message, e.response.data.code, e.response.data.details);
    }
  }
}
