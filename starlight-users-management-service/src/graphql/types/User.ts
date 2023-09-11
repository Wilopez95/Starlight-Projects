import { ID, InputType, Field } from 'type-graphql';
import { UserStatus } from '../../entities/User';

import { AddressInput } from './Address';
import { PhoneInput } from './Phone';
import { PolicyInput, PolicyStatementInput } from './Policy';
import { SalesRepresentativeInput } from './SalesRepresentative';

@InputType()
export class UserCreateInput {
  @Field()
  email!: string;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [ID])
  roleIds!: string[];

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  title!: string;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field(() => [PhoneInput], { nullable: true })
  phones?: PhoneInput[];

  @Field(() => [PolicyInput], { nullable: true })
  policies?: PolicyInput[];

  @Field(() => [SalesRepresentativeInput], { nullable: true })
  salesRepresentatives?: SalesRepresentativeInput[];

  @Field(() => [PolicyStatementInput], { nullable: true })
  policyStatements?: PolicyStatementInput[];
}

@InputType()
export class UserUpdateInput {
  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [String])
  roleIds!: string[];

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  title!: string;

  @Field(() => AddressInput, { nullable: true })
  address?: AddressInput;

  @Field(() => [PhoneInput], { nullable: true })
  phones?: PhoneInput[];

  @Field(() => [PolicyInput], { nullable: true })
  policies?: PolicyInput[];

  @Field(() => [SalesRepresentativeInput], { nullable: true })
  salesRepresentatives?: SalesRepresentativeInput[];

  @Field(() => [PolicyStatementInput], { nullable: true })
  policyStatements?: PolicyStatementInput[];
}
