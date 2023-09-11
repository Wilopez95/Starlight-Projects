import {
  Field,
  InputType,
  Resolver,
  Mutation,
  Ctx,
  Arg,
  Query,
  FieldResolver,
  Root,
  Maybe,
} from 'type-graphql';
import { Length, IsOptional } from 'class-validator';

import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import Company from '../../entities/Company';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import { Context } from '../../../../types/Context';
import { HaulingCompanyGeneralSettings } from '../../../../services/core/types/HaulingCompany';
import { getCompanyGeneralSettings } from '../../../../services/core/companies';

@InputType()
export class CompanyInput {
  @Length(0, 250)
  @IsOptional()
  @Field()
  yardInstructions?: string;
}

@InputType()
export class CompanyUpdateInput extends CompanyInput {
  @Field()
  id!: number;
}

@Resolver(() => Company)
export default class CompanyResolver {
  @Authorized([
    'recycling:YardConsole:view',
    'recycling:GradingInterface:view',
    'recycling:SelfService:full-access',
  ])
  @Query(() => Company, { name: 'company' })
  async entity(@Ctx() ctx: QueryContext): Promise<Company> {
    const ContextualizedCompany = getContextualizedEntity(Company)(ctx);
    const company = await ContextualizedCompany.findOneOrFail(1);

    return company || null;
  }

  @Authorized(['recycling:YardConsole:perform', 'recycling:GradingInterface:perform'])
  @Mutation(() => Company, {
    name: 'updateCompany',
  })
  async updateCompany(
    @Arg('data', () => CompanyUpdateInput) input: CompanyUpdateInput,
    @Ctx() ctx: QueryContext,
  ): Promise<Company> {
    const ContextualizedCompanyEntity = getContextualizedEntity(Company)(ctx);
    const company = await ContextualizedCompanyEntity.findOneOrFail(1);

    Object.assign(company, input);

    await company.save();

    return company;
  }

  @Authorized()
  @FieldResolver(() => String)
  async facilityAddress(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.physicalAddress.addressLine1;
  }

  @Authorized()
  @FieldResolver(() => String)
  async facilityAddress2(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.physicalAddress.addressLine2;
  }

  @Authorized()
  @FieldResolver(() => String, { nullable: true })
  async printNodeApiKey(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.printNodeApiKey;
  }

  @Authorized()
  @FieldResolver(() => Number)
  async businessUnitId(@Root() company: Company, @Ctx() ctx: Context): Promise<number> {
    const bu = await company.fetchBU(ctx);

    return bu.id;
  }

  @Authorized()
  @FieldResolver(() => Number)
  async businessLineId(@Root() company: Company, @Ctx() ctx: Context): Promise<number> {
    const bu = await company.fetchBU(ctx);

    if (bu.businessLines.length === 0) {
      throw new Error('Failed to get business line id');
    }

    return bu.businessLines[0].id;
  }

  @Authorized()
  @FieldResolver(() => Number, { nullable: true })
  async jobSiteId(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<number | null | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.jobSiteId;
  }

  @Authorized()
  @FieldResolver(() => Boolean)
  async requireDestinationOnWeightOut(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<boolean> {
    const bu = await company.fetchBU(ctx);

    return bu.requireDestinationOnWeightOut;
  }

  @Authorized()
  @FieldResolver(() => Boolean)
  async requireOriginOfInboundLoads(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<boolean> {
    const bu = await company.fetchBU(ctx);

    return bu.requireOriginOfInboundLoads;
  }

  @Authorized()
  @FieldResolver(() => String)
  async facilityCity(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.physicalAddress.city;
  }

  @Authorized()
  @FieldResolver(() => String)
  async facilityState(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.physicalAddress.state;
  }

  @Authorized()
  @FieldResolver(() => String)
  async facilityZip(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.physicalAddress.zip;
  }

  @Authorized()
  @FieldResolver(() => String)
  async mailingAddress(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.mailingAddress.addressLine1;
  }

  @Authorized()
  @FieldResolver(() => String)
  async mailingAddress2(
    @Root() company: Company,
    @Ctx() ctx: Context,
  ): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.mailingAddress.addressLine2;
  }

  @Authorized()
  @FieldResolver(() => String)
  async mailingCity(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.mailingAddress.city;
  }

  @Authorized()
  @FieldResolver(() => String)
  async mailingState(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.mailingAddress.state;
  }

  @Authorized()
  @FieldResolver(() => String)
  async mailingZip(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.mailingAddress.zip;
  }

  @Authorized()
  @FieldResolver(() => String)
  async website(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.website;
  }

  @Authorized()
  @FieldResolver(() => String)
  async email(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.email;
  }

  @Authorized()
  @FieldResolver(() => String)
  async phone(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.phone;
  }

  @Authorized()
  @FieldResolver(() => String)
  async fax(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.fax;
  }

  @Authorized()
  @FieldResolver(() => String)
  async timezone(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.timeZoneName;
  }

  @Authorized()
  @FieldResolver(() => String)
  async logoUrl(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.logoUrl;
  }

  @Authorized()
  @FieldResolver(() => String)
  async companyName1(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.nameLine1;
  }

  @Authorized()
  @FieldResolver(() => String)
  async companyName2(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchBU(ctx);

    return bu.nameLine2;
  }

  @Authorized()
  @FieldResolver(() => String)
  async region(@Root() company: Company, @Ctx() ctx: Context): Promise<string | undefined> {
    const bu = await company.fetchRegionalSettings(ctx);

    return bu.region;
  }

  @Authorized([
    'configuration:company-settings:view',
    'recycling:GradingInterface:full-access',
    'recycling:SelfService:full-access',
    'recycling:YardConsole:perform',
  ])
  @Query(() => HaulingCompanyGeneralSettings, { nullable: true })
  async haulingCompanyGeneralSettings(
    @Ctx() ctx: Context,
  ): Promise<Maybe<HaulingCompanyGeneralSettings>> {
    return getCompanyGeneralSettings(ctx);
  }

  @Mutation(() => Company)
  @Authorized(['recycling:Company:update', 'recycling:YardConsole:perform'])
  async setCompanyYardInstructions(
    @Arg('yardInstructions', () => String) yardInstructions: string,
    @Ctx() ctx: QueryContext,
  ): Promise<Company> {
    const ContextualizedCompany = getContextualizedEntity(Company)(ctx);
    const company = await ContextualizedCompany.findOne({
      id: 1,
    });

    if (!company) {
      throw new Error('Cannot find Company');
    }

    company.yardInstructions = yardInstructions;

    await company.save();

    return company;
  }
}
