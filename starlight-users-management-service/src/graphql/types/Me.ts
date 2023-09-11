import { ObjectType, Field, ID, Directive } from 'type-graphql';

import { User } from '../../entities/User';

@Directive('@key(fields: "id")')
@ObjectType({ description: 'User information associated with provided access token' })
export class Me {
  @Field(() => String)
  id!: string;

  @Field(() => String, { defaultValue: 'system' })
  name?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => ID, { nullable: true })
  tenantId?: string;

  @Field({ nullable: true })
  tenantName?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => [String])
  permissions!: string[];

  @Field({ nullable: true })
  resource?: string;

  user?: User;
}
