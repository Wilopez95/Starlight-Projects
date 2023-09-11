import { Field, InputType } from 'type-graphql';

@InputType()
export class UsersFilter {
  @Field(() => Boolean, { defaultValue: true })
  boundToTenant = true;

  @Field(() => Boolean, {
    defaultValue: false,
    description: `Set this flag to True for applying query only to users who able to change Subscription Orders Owner. 
                  Can be used together with 'selectSubscriptionOwnerEditors'`,
  })
  selectOrderOwnerEditors = false;

  @Field(() => Boolean, {
    defaultValue: false,
    description: `Set this flag to True for applying query only to users who able to change Subscription Owner. 
                  Can be used together with 'selectOrderOwnerEditors'`,
  })
  selectSubscriptionOwnerEditors = false;

  @Field(() => String, { defaultValue: null })
  email: string | null = null;
}
