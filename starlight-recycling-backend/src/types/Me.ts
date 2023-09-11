import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'User information associated with provided access token' })
export default class Me {
  @Field(() => String, { defaultValue: null })
  id!: string;

  @Field(() => String, { defaultValue: null })
  firstName: string | null = null;

  @Field(() => String, { defaultValue: null })
  lastName: string | null = null;

  @Field(() => String, { defaultValue: null })
  email: string | null = null;

  @Field(() => String, { defaultValue: null })
  resource: string | null = null;

  @Field(() => [String], { defaultValue: [] })
  permissions: string[] = [];

  @Field()
  tenantId!: number;
}
