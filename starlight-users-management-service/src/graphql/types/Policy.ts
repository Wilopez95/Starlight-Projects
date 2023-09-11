import { InputType, Field, ObjectType, registerEnumType, Directive } from 'type-graphql';
import { AccessConfig, AccessLevel, PolicyEntry } from '../../entities/Policy';

import { ResourceType } from '../../entities/Resource';
import { Role } from '../../entities/Role';
import { User } from '../../entities/User';

@ObjectType()
export class AllPermissions {
  @Field()
  resource!: string;

  @Field(() => [PolicyEntry])
  entries!: PolicyEntry[];
}

@InputType()
export class PolicyEntryInput implements AccessConfig {
  @Field()
  subject!: string;

  @Field(() => AccessLevel)
  level!: AccessLevel;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  overridden?: boolean;
}

@InputType()
export class PolicyInput {
  @Field()
  resource!: string;

  @Field(() => [PolicyEntryInput])
  entries!: PolicyEntryInput[];
}

@InputType()
export class PolicyTemplateInput {
  @Field(() => ResourceType)
  resourceType!: ResourceType;

  @Field(() => [PolicyEntryInput])
  entries!: PolicyEntryInput[];
}

/**
 * @deprecated
 */
export enum PolicyEffect {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

registerEnumType(PolicyEffect, {
  name: 'PolicyEffect',
  valuesConfig: {
    ALLOW: { deprecationReason: 'Please use new Policy API' },
    DENY: { deprecationReason: 'Please use new Policy API' },
  },
});

/**
 * @deprecated
 */
@ObjectType({ isAbstract: true })
export class PolicyStatement {
  @Field()
  name!: string;

  @Field()
  resource!: string;

  @Field(() => PolicyEffect)
  effect!: PolicyEffect;

  @Field(() => [String])
  actions!: string[];

  @Field(() => String)
  tenantId?: string;
}

@ObjectType()
@Directive('@deprecated(reason: "Please use new Policy API")')
export class RolePolicyStatement extends PolicyStatement {
  @Field(() => Role)
  role!: Role;
}

@ObjectType()
@Directive('@deprecated(reason: "Please use new Policy API")')
export class UserPolicyStatement extends PolicyStatement {
  @Field(() => User)
  user!: User;
}

@InputType()
@Directive('@deprecated(reason: "Please use new Policy API")')
export class PolicyStatementInput {
  @Field()
  resource!: string;

  @Field()
  effect!: PolicyEffect;

  @Field(() => [String])
  actions!: string[];
}

@InputType()
@Directive('@deprecated(reason: "Please use new Policy API")')
export class PolicyStatementTemplateInput {
  @Field(() => ResourceType)
  resourceType!: ResourceType;

  @Field(() => [String])
  actions!: string[];
}
