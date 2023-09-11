import {
  Resolver,
  InputType,
  Field,
  Int,
  Query,
  Arg,
  Ctx,
  ID,
  Mutation,
  ObjectType,
} from 'type-graphql';
import { isEmpty } from 'lodash';

import {
  api,
  GetCreditCardQuery,
  GetCreditCardsQuery,
  UpdateCreditCardMutation,
  EditCreditCardInput,
  AddCreditCardInput,
  CreateCreditCardMutation,
  Scalars,
  Maybe,
} from '../../../../services/billing/graphql/api';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { QueryContext } from '../../../../types/QueryContext';
import { parseFacilitySrn } from '../../../../utils/srn';
import { createToken } from '../../../../utils/serviceToken';
import { ApolloError } from 'apollo-server-koa';

@InputType()
class CreditCardFilter {
  @Field(() => Int, { defaultValue: null })
  customerId?: number;

  @Field(() => Int, { defaultValue: null })
  jobSiteId?: number;

  @Field(() => Boolean, { defaultValue: true })
  relevantOnly?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  activeOnly?: boolean;
}

@ObjectType('BillingJobSite')
export class JobSite {
  @Field(() => ID)
  id!: Scalars['ID'];

  @Field(() => String)
  addressLine1!: Scalars['String'];

  @Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @Field(() => String)
  city!: Scalars['String'];

  @Field(() => String)
  state!: Scalars['String'];

  @Field(() => String)
  zip!: Scalars['String'];
}

@ObjectType()
export class CreditCard {
  @Field(() => ID)
  id!: Scalars['ID'];

  @Field(() => Boolean)
  active!: Scalars['Boolean'];

  @Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @Field(() => String)
  cardType!: Scalars['String'];

  @Field(() => String)
  cardNumberLastDigits!: Scalars['String'];

  @Field(() => Int)
  ccAccountId!: Scalars['Int'];

  @Field(() => String)
  ccAccountToken!: Scalars['String'];

  @Field(() => [JobSite], { nullable: true })
  jobSites!: Maybe<Array<JobSite>>;

  @Field(() => String, { nullable: true })
  nameOnCard!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  expirationDate!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  addressLine1!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  city!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  state!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  zip!: Maybe<Scalars['String']>;

  @Field(() => String, { nullable: true })
  expDate!: Maybe<Scalars['String']>;

  @Field(() => Boolean, { nullable: true })
  expiredLabel!: Maybe<Scalars['Boolean']>;

  @Field(() => String)
  customerId!: string;

  @Field(() => String, { nullable: true })
  paymentGateway!: 'cardConnect' | 'fluidPay';

  @Field(() => Boolean, { nullable: true })
  isAutopay!: boolean;
}

@Resolver(() => CreditCard)
export default class CreditCardResolver {
  @Authorized(['recycling:CreditCard:list', 'recycling:YardConsole:perform'])
  @Query(() => [CreditCard], { nullable: true })
  async creditCards(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => CreditCardFilter, { defaultValue: {} })
    filter: CreditCardFilter,
  ): Promise<GetCreditCardsQuery['creditCards']> {
    if (!ctx.userInfo.resource) {
      throw new Error('Failed to get resource from context');
    }

    const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

    const token = await createToken(
      {
        schemaName: tenantName,
      },
      {
        audience: 'billing',
        subject: ctx.userInfo.id,
        requestId: ctx.reqId,
      },
    );

    const Authorization = `ServiceToken ${token}`;

    try {
      const { creditCards } = await api.getCreditCards(
        {
          customerId: filter.customerId ? `${filter.customerId}` : null,
          jobSiteId: filter.jobSiteId ? `${filter.jobSiteId}` : null,
          activeOnly: filter.activeOnly,
          relevantOnly: filter.relevantOnly,
        },
        { Authorization },
      );

      return creditCards;
    } catch (e) {
      if (e.response && !isEmpty(e.response.errors)) {
        throw new ApolloError(
          e.response.errors[0].message,
          e.response.errors[0].code,
          e.response.errors[0].extensions,
        );
      }
      ctx.log.error(e, 'Failed to fetch credit cards');
      throw e;
    }
  }

  @Authorized(['recycling:CreditCard:update', 'recycling:YardConsole:perform'])
  @Mutation(() => CreditCard, { nullable: true })
  async updateCreditCard(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => ID) id: string,
    @Arg('data', () => EditCreditCardInput) data: EditCreditCardInput,
  ): Promise<UpdateCreditCardMutation['updateCreditCard']> {
    if (!ctx.userInfo.resource) {
      throw new Error('Failed to get resource from context');
    }

    const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

    const token = await createToken(
      {
        schemaName: tenantName,
      },
      {
        audience: 'billing',
        subject: ctx.userInfo.id,
        requestId: ctx.reqId,
      },
    );

    const Authorization = `ServiceToken ${token}`;

    try {
      const { updateCreditCard } = await api.updateCreditCard({ id, data }, { Authorization });

      return updateCreditCard;
    } catch (e) {
      if (e.response && !isEmpty(e.response.errors)) {
        throw new ApolloError(
          e.response.errors[0].message,
          e.response.errors[0].code,
          e.response.errors[0].extensions,
        );
      }
      ctx.log.error(e, 'Failed to update credit card');
      throw e;
    }
  }

  @Authorized(['recycling:CreditCard:view', 'recycling:YardConsole:perform'])
  @Query(() => CreditCard, { nullable: true })
  async creditCard(
    @Ctx() ctx: QueryContext,
    @Arg('id', () => ID) id: string,
  ): Promise<GetCreditCardQuery['creditCard']> {
    if (!ctx.userInfo.resource) {
      throw new Error('Failed to get resource from context');
    }

    const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

    const token = await createToken(
      {
        schemaName: tenantName,
      },
      {
        audience: 'billing',
        subject: ctx.userInfo.id,
        requestId: ctx.reqId,
      },
    );

    const Authorization = `ServiceToken ${token}`;

    const { creditCard } = await api.getCreditCard({ id }, { Authorization });

    return creditCard;
  }

  @Authorized(['recycling:CreditCard:create', 'recycling:YardConsole:perform'])
  @Mutation(() => CreditCard, { nullable: true })
  async createCreditCard(
    @Ctx() ctx: QueryContext,
    @Arg('customerId', () => Int) customerId: number,
    @Arg('data', () => AddCreditCardInput) data: AddCreditCardInput,
  ): Promise<CreateCreditCardMutation['addCreditCard']> {
    if (!ctx.userInfo.resource) {
      throw new Error('Failed to get resource from context');
    }

    const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

    const token = await createToken(
      {
        schemaName: tenantName,
        userId: ctx.userInfo.id,
      },
      {
        audience: 'billing',
        subject: ctx.userInfo.id,
        requestId: ctx.reqId,
      },
    );

    const Authorization = `ServiceToken ${token}`;

    try {
      const { addCreditCard } = await api.createCreditCard(
        { customerId: `${customerId}`, data },
        { Authorization },
      );

      return addCreditCard;
    } catch (e) {
      if (e.response && !isEmpty(e.response.errors)) {
        throw new ApolloError(
          e.response.errors[0].message,
          e.response.errors[0].code,
          e.response.errors[0].extensions,
        );
      }
      ctx.log.error(e, 'Failed to add credit card');
      throw e;
    }
  }
}
