import {
  Query,
  Resolver,
  Ctx,
  Arg,
  Mutation,
  FieldResolver,
  Root,
  Int,
  Field,
  ObjectType,
  InputType,
  Authorized,
  Directive,
} from 'type-graphql';
import { FindConditions, getConnection } from 'typeorm';
import { UserInputError } from 'apollo-server-core';

import { AuditAction } from '../../db/AuditAction';

import { makeAuditLogRecord } from '../../services/auditLog';

import { ResolverContext } from '../../context';
import { RoleInput } from '../types/Role';
import { RolePolicy } from '../../entities/RolePolicy';
import { RolePolicyTemplate } from '../../entities/PolicyTemplate';
import { Role } from '../../entities/Role';
import { adaptAccessConfig, adaptActionsList } from '../../services/policyAdapter';
import { AccessLevel } from '../../entities/Policy';
import {
  PolicyEffect,
  PolicyInput,
  PolicyStatementInput,
  PolicyStatementTemplateInput,
  PolicyTemplateInput,
  RolePolicyStatement,
} from '../types/Policy';

const mapPolicies = (role: Role) => (policy: PolicyInput) => {
  const rolePolicy = role.policies.find(p => p.resource === policy.resource) ?? new RolePolicy();

  rolePolicy.setEntries(policy.entries);
  rolePolicy.role = role;
  rolePolicy.resource = policy.resource;

  return rolePolicy;
};

const mapLegacyPolicies = (role: Role) => (policy: PolicyStatementInput) => {
  const rolePolicy = role.policies.find(p => p.resource === policy.resource) ?? new RolePolicy();

  rolePolicy.access = adaptActionsList(policy.actions);
  rolePolicy.role = role;
  rolePolicy.resource = policy.resource;

  return rolePolicy;
};

const mapPolicyTemplates = (role: Role) => (policy: PolicyTemplateInput) => {
  const rolePolicy =
    role.policyTemplates.find(p => p.resourceType === policy.resourceType) ??
    new RolePolicyTemplate();

  rolePolicy.setEntries(policy.entries);
  rolePolicy.role = role;
  rolePolicy.resourceType = policy.resourceType;

  return rolePolicy;
};

const mapLegacyPolicyTemplates = (role: Role) => (policy: PolicyStatementTemplateInput) => {
  const rolePolicy =
    role.policyTemplates.find(p => p.resourceType === policy.resourceType) ??
    new RolePolicyTemplate();

  rolePolicy.access = adaptActionsList(policy.actions);
  rolePolicy.role = role;
  rolePolicy.resourceType = policy.resourceType;

  return rolePolicy;
};

@ObjectType()
export class ListRolesResult {
  @Field(() => [Role])
  data!: Role[];

  @Field()
  total!: number;
}

@InputType()
export class RolesFilter {
  @Field(() => Boolean, { defaultValue: true })
  boundToTenant = true;
}

@Resolver(() => Role)
export class RoleResolver {
  @Authorized([
    { 'configuration:users': AccessLevel.READ },
    { 'starlight-admin': AccessLevel.FULL_ACCESS },
  ])
  @Query(() => Role, { nullable: true })
  async role(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String) id: string,
  ): Promise<Role | undefined> {
    const { tenantId } = ctx.userInfo ?? {};

    const where: FindConditions<Role> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const role = await Role.findOne(id, {
      where,
      relations: ['policies', 'policyTemplates'],
    });

    return role;
  }

  @Authorized([
    { 'configuration:users': AccessLevel.READ },
    { 'starlight-admin': AccessLevel.FULL_ACCESS },
  ])
  @Query(() => ListRolesResult)
  async listRoles(
    @Ctx() ctx: ResolverContext,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
    @Arg('limit', () => Int, { defaultValue: 25 }) limit: number,
    @Arg('filter', () => RolesFilter, { defaultValue: new RolesFilter() }) filter: RolesFilter,
  ): Promise<ListRolesResult> {
    const { tenantId } = ctx.userInfo ?? {};
    const where: FindConditions<Role> = {};

    if (filter.boundToTenant && tenantId) {
      where.tenantId = tenantId;
    }

    const [data, total] = await Role.findAndCount({
      where,
      relations: ['policies', 'policyTemplates'],
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });

    return {
      data,
      total,
    };
  }

  @Query(() => [Role])
  async roles(@Ctx() ctx: ResolverContext): Promise<(Role | undefined)[]> {
    const { tenantId } = ctx.userInfo ?? {};

    const roles = await Role.find({
      where: { tenantId },
    });

    return roles;
  }

  @Mutation(() => Role)
  async createRole(
    @Ctx() ctx: ResolverContext,
    @Arg('roleData') roleData: RoleInput,
  ): Promise<Role> {
    const { tenantId } = ctx.userInfo ?? {};

    const role = new Role();

    const { policies, policyTemplates, policyStatements, policyStatementTemplates, ...rest } =
      roleData;

    const policiesInput =
      policies?.map(mapPolicies(role)) ?? policyStatements?.map(mapLegacyPolicies(role));
    const templateInput =
      policyTemplates?.map(mapPolicyTemplates(role)) ??
      policyStatementTemplates?.map(mapLegacyPolicyTemplates(role));

    if (!policiesInput || !templateInput) {
      throw new UserInputError('Either "policyStatements" or "policies" must be provided');
    }

    role.useContext(ctx);

    await getConnection().transaction(async em => {
      Role.merge(role, rest);
      role.tenantId = tenantId;
      role.policies = policiesInput;
      role.policyTemplates = templateInput;

      await em.save(Role, role);
      await em.save(RolePolicy, role.policies);
      await em.save(RolePolicyTemplate, role.policyTemplates);
    });

    void makeAuditLogRecord(role.id, role, AuditAction.CREATE, ctx.userInfo);

    return role;
  }

  @Mutation(() => Role)
  async updateRole(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String) id: string,
    @Arg('roleData') roleData: RoleInput,
  ): Promise<Role> {
    const { tenantId } = ctx.userInfo ?? {};

    let role: Role;
    const where: FindConditions<Role> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    try {
      role = await Role.findOneOrFail(id, {
        relations: ['policies', 'policyTemplates'],
      });
    } catch {
      throw new UserInputError(`Role with ID ${id} does not exist`);
    }

    role.useContext(ctx);

    const { policies, policyTemplates, policyStatements, policyStatementTemplates, ...rest } =
      roleData;

    const policiesInput =
      policies?.map(mapPolicies(role)) ?? policyStatements?.map(mapLegacyPolicies(role));
    const templateInput =
      policyTemplates?.map(mapPolicyTemplates(role)) ??
      policyStatementTemplates?.map(mapLegacyPolicyTemplates(role));

    if (!policiesInput || !templateInput) {
      throw new UserInputError('Either "policyStatements" or "policies" must be provided');
    }

    await getConnection().transaction(async em => {
      Role.merge(role, rest);
      role.tenantId = tenantId;
      role.policies = policiesInput;
      role.policyTemplates = templateInput;

      await em.save(RolePolicy, role.policies);
      await em.save(RolePolicyTemplate, role.policyTemplates);
      await em.save(Role, role);
    });

    void makeAuditLogRecord(role.id, role, AuditAction.MODIFY, ctx.userInfo);

    return role;
  }

  @Mutation(() => Boolean)
  async deleteRole(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String) id: string,
  ): Promise<boolean> {
    const { tenantId } = ctx.userInfo ?? {};

    let role: Role;

    const where: FindConditions<Role> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    try {
      role = await Role.findOneOrFail(id, {
        where: { tenantId },
        relations: ['policies', 'policyTemplates'],
      });
    } catch {
      throw new UserInputError(`No role with id ${id}`);
    }

    role.useContext(ctx);

    await getConnection().manager.remove([...role.policyTemplates, ...role.policies, role]);

    void makeAuditLogRecord(id, role, AuditAction.DELETE, ctx.userInfo);

    return true;
  }

  @FieldResolver(() => Int)
  usersCount(@Root() role: Role): Promise<number> {
    return role.usersCount();
  }

  @FieldResolver(() => [RolePolicyStatement])
  @Directive('@deprecated(reason: "Please use new Policy API")')
  policyStatements(@Root() role: Role): RolePolicyStatement[] {
    return role.policies.map(policy => {
      const statement = new RolePolicyStatement();

      statement.resource = policy.resource;
      statement.actions = adaptAccessConfig(policy.access);
      statement.effect = PolicyEffect.ALLOW;
      statement.name = `Grant access to ${policy.resource}`;
      statement.role = role;

      return statement;
    });
  }
}
