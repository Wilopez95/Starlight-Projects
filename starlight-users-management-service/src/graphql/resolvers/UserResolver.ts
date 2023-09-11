/* eslint-disable default-param-last, @typescript-eslint/default-param-last */
import { UserInputError } from 'apollo-server-core';
import {
  Query,
  Resolver,
  Ctx,
  Arg,
  Mutation,
  Int,
  ObjectType,
  Field,
  Authorized,
  FieldResolver,
  Root,
  Directive,
} from 'type-graphql';
import { FindConditions, getConnection, ILike } from 'typeorm';

import { AuditAction } from '../../db/AuditAction';

import { type ResolverContext } from '../../context';
import * as cognito from '../../services/cognito';
import { makeAuditLogRecord } from '../../services/auditLog';
import { userWorkerPool } from '../../workers/pools';

import { User, UserStatus } from '../../entities/User';
import { Role } from '../../entities/Role';

import { UserCreateInput, UserUpdateInput } from '../types/User';
import { UserPolicy } from '../../entities/UserPolicy';
import { AccessLevel, PolicyEntry } from '../../entities/Policy';
import { adaptAccessConfig, adaptActionsList } from '../../services/policyAdapter';
import {
  PolicyEffect,
  PolicyInput,
  PolicyStatementInput,
  UserPolicyStatement,
} from '../types/Policy';
import { UsersFilter, GetUsersFilter, PageConfig } from '../input';
import { GetUsersAndCountFilterConfig, UserService } from '../service';

const mapPolicies = (user: User) => (policy: PolicyInput) => {
  const userPolicy = user.policies.find(p => p.resource === policy.resource) ?? new UserPolicy();

  userPolicy.setEntries(policy.entries);
  userPolicy.user = user;
  userPolicy.resource = policy.resource;

  return userPolicy;
};

const mapLegacyPolicies = (user: User) => (policy: PolicyStatementInput) => {
  const userPolicy = user.policies.find(p => p.resource === policy.resource) ?? new UserPolicy();

  userPolicy.access = adaptActionsList(policy.actions);
  userPolicy.user = user;
  userPolicy.resource = policy.resource;

  return userPolicy;
};

@ObjectType()
export class ListUsersResult {
  @Field(() => [User])
  data!: User[];

  @Field()
  total!: number;
}

@Resolver(() => User)
export class UserResolver {
  @Authorized([
    { 'configuration:users': AccessLevel.READ },
    { 'starlight-admin': AccessLevel.FULL_ACCESS },
  ])
  @Query(() => User, { nullable: true })
  async user(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String, { defaultValue: null }) id: string | null = null,
    @Arg('filter', () => UsersFilter, { defaultValue: new UsersFilter() }) filter: UsersFilter,
  ): Promise<User | undefined> {
    const where: FindConditions<User> = {};

    if (filter.boundToTenant && ctx.userInfo?.tenantId) {
      where.tenantId = ctx.userInfo.tenantId;
    }
    if (filter.email) {
      where.email = filter.email;
    }

    const conditions = {
      where,
      relations: ['policies', 'roles', 'roles.policies'],
    };
    let user;
    if (id) {
      user = await userWorkerPool.putTaskInQueue({ id, includeConfiguration: true }, { key: id });
    } else {
      user = await User.findOne(conditions);
    }
    return user;
  }

  @Query(() => [User], { nullable: 'items', description: 'get users by ids' })
  @Authorized([{ 'configuration:users': AccessLevel.READ }])
  async users(
    @Ctx() ctx: ResolverContext,
    @Arg('ids', () => [String]) ids: string[],
    @Arg('raw', () => Boolean, { defaultValue: false }) raw: boolean,
  ): Promise<(User | undefined)[]> {
    const { tenantName } = ctx.userInfo ?? {};

    const where: FindConditions<User> = {};

    if (tenantName) {
      where.tenantName = tenantName;
    }

    const users = await User.findByIds(ids, {
      where,
      relations: raw ? [] : ['roles', 'policies', 'roles.policies'],
    });

    if (!users.length) {
      return Array.from<undefined>({ length: ids.length }).fill(undefined);
    }

    return ids.map(id => users.find(user => user.id === id));
  }

  @Authorized([
    { 'configuration:users': AccessLevel.READ },
    { 'starlight-admin': AccessLevel.FULL_ACCESS },
  ])
  @Query(() => ListUsersResult, { description: 'get users' })
  async listUsers(
    @Ctx() ctx: ResolverContext,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
    @Arg('limit', () => Int, { defaultValue: 25 }) limit: number,
    @Arg('filter', () => UsersFilter, { defaultValue: new UsersFilter() }) filter: UsersFilter,
    @Arg('query', { nullable: true }) query?: string,
  ): Promise<ListUsersResult> {
    const { tenantName } = ctx.userInfo ?? {};
    const sharedWhere: FindConditions<User> = {};
    if (filter.boundToTenant) {
      sharedWhere.tenantName = tenantName;
    }
    // This will not work long-term since anyone can specify boundToTenant.
    let where: FindConditions<User[]> = [sharedWhere];

    if (query) {
      const like = ILike(`${query}%`);
      where = [
        {
          ...sharedWhere,
          firstName: like,
        },
        {
          ...sharedWhere,
          lastName: like,
        },
        {
          ...sharedWhere,
          email: like,
        },
        {
          ...sharedWhere,
          name: like,
        },
      ];
    }

    const [data, total] = await Promise.all([
      User.find({
        where,
        skip: offset,
        take: limit,
        relations: ['roles'],
        order: {
          name: 'ASC',
        },
      }),
      User.count({ where }),
    ]);

    return {
      // @ts-expect-error it is fine
      data,
      total,
    };
  }

  @Query(() => ListUsersResult, {
    description: `get users by:
      name
      first name,
      last name,
      email,
      permissions with any from specified access levels (in current user's business unit)`,
  })
  async getUsersByFilters(
    @Ctx() ctx: ResolverContext,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
    @Arg('limit', () => Int, { defaultValue: 25 }) limit: number,
    @Arg('filter', () => GetUsersFilter, {
      defaultValue: new GetUsersFilter(),
    })
    filter: GetUsersFilter,
  ) {
    const listUsersResult: ListUsersResult = { data: [], total: 0 };

    const { tenantName, resource } = ctx.userInfo ?? {};

    const filterConfig: GetUsersAndCountFilterConfig = {
      tenantName: filter.boundToTenant ? tenantName : undefined,
      roleOrUserPermissionsFilters: filter.roleOrUserPermissionFilters,
      query: filter.query,
      resource,
    };

    const pageConfig: PageConfig = { offset, limit };

    const result = await new UserService().getUsersAndCount(pageConfig, filterConfig);

    listUsersResult.data = result.length ? result[0] : [];
    listUsersResult.total = result.length ? result[1] : 0;

    return listUsersResult;
  }

  @Authorized([
    { 'customers:create': AccessLevel.FULL_ACCESS },
    { 'customers:view': AccessLevel.FULL_ACCESS },
    { 'customers:edit': AccessLevel.FULL_ACCESS },
  ])
  @Query(() => [User], { description: 'get sales representives by business unit' })
  async getSalesRepresentativesByBU(
    @Ctx() ctx: ResolverContext,
    @Arg('businessUnitId', () => Int) businessUnitId: number,
  ): Promise<User[]> {
    const { tenantName } = ctx.userInfo ?? {};

    // Loading policy statements and stuff here is not super optimised,
    // but it is hard to avoid errors on FE otherwise for now :(
    // TODO: remove extra relations loading after refactoring to use Apollo Client or something.
    const users = await User.createQueryBuilder('user')
      .where('user.tenantName = :tenantName', { tenantName })
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.policies', 'policies')
      .leftJoinAndSelect('user.policies', 'userpolicies')
      .andWhere('user.salesRepresentatives @> :businessUnit', {
        businessUnit: JSON.stringify([{ businessUnitId }]),
      })
      .getMany();

    return users;
  }

  @Mutation(() => User)
  @Authorized([{ 'configuration:users': AccessLevel.FULL_ACCESS }])
  async createUser(
    @Ctx() ctx: ResolverContext,
    @Arg('userData') userData: UserCreateInput,
  ): Promise<User> {
    const { tenantId, tenantName } = ctx.userInfo ?? {};

    const existingUser = await User.findOne({
      where: { email: userData.email, tenantId },
      select: ['id'],
    });

    // It is okay if the user already exists in Cognito, but if it already exists in DB, it is an error.
    if (existingUser) {
      throw new UserInputError('User already exists');
    }

    const user = new User();

    const { roleIds, policyStatements, policies, ...rest } = userData;

    const policiesInput =
      policies?.map(mapPolicies(user)) ?? policyStatements?.map(mapLegacyPolicies(user));

    if (!policiesInput) {
      throw new UserInputError('Either "policyStatements" or "policies" must be provided');
    }

    User.merge(user, rest);

    user.name = `${userData.firstName} ${userData.lastName}`;
    user.tenantId = tenantId;
    user.tenantName = tenantName;
    user.hasPersonalPermissions = policiesInput.some(policy =>
      Object.values(policy.access).some(
        ({ level, overridden }) => overridden && level !== AccessLevel.NO_ACCESS,
      ),
    );

    const roles = await Role.findByIds(roleIds, {
      where: { tenantId },
      relations: ['policies'],
    });

    if (roles.length !== roleIds.length) {
      const invalidIds = roleIds.filter(id => roles.find(role => role.id === id) === undefined);

      throw new UserInputError(`Roles ${invalidIds.join(', ')} do not exist`);
    }

    user.roles = roles;

    const userId = await cognito.createUserIfNotExists({
      tenantId,
      tenantName,
      email: user.email,
      name: user.name,
    });

    user.id = userId;

    user.useContext(ctx);

    await User.save(user);

    await getConnection().transaction(async em => {
      await em.save(user);

      user.policies = policiesInput;
      await em.save(UserPolicy, user.policies);
    });

    if (user.status === UserStatus.DISABLED) {
      await cognito.disableUser(user.email);
    }

    void makeAuditLogRecord(user.id, user, AuditAction.CREATE, ctx.userInfo);

    return user;
  }

  @Authorized([{ 'configuration:users': AccessLevel.MODIFY }])
  @Mutation(() => User)
  async updateUser(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String) id: string,
    @Arg('userData') userData: UserUpdateInput,
  ): Promise<User> {
    const { tenantId, tenantName } = ctx.userInfo ?? {};

    let user: User;
    const where: FindConditions<User> = {};

    if (tenantName) {
      where.tenantName = tenantName;
    }

    try {
      user = await User.findOneOrFail(id, { where, relations: ['policies'] });
    } catch {
      throw new UserInputError(`No user with id ${id}`);
    }

    const prevStatus = user.status;

    const { roleIds, policyStatements, policies, ...rest } = userData;

    const policiesInput =
      policies?.map(mapPolicies(user)) ?? policyStatements?.map(mapLegacyPolicies(user));

    if (!policiesInput) {
      throw new UserInputError('Either "policyStatements" or "policies" must be provided');
    }

    User.merge(user, rest);
    user.tenantId = tenantId;
    user.tenantName = tenantName;
    user.name = `${rest.firstName} ${rest.lastName}`;
    user.hasPersonalPermissions = policiesInput.some(policy =>
      Object.values(policy.access).some(
        ({ level, overridden }) => overridden && level !== AccessLevel.NO_ACCESS,
      ),
    );

    const roles = await Role.findByIds(roleIds, {
      where: { tenantId },
      relations: ['policies'],
    });

    if (roles.length !== roleIds.length) {
      const invalidIds = roleIds.filter(id => roles.find(role => role.id === id) === undefined);

      throw new UserInputError(`Roles ${invalidIds.join(', ')} do not exist`);
    }

    user.roles = roles;

    user.useContext(ctx);

    await getConnection().transaction(async em => {
      user.policies = policiesInput;

      await em.save(UserPolicy, user.policies);
      await em.save(User, user);
    });

    if (user.status !== prevStatus) {
      if (user.status === UserStatus.DISABLED) {
        await cognito.disableUser(user.email);
      } else {
        await cognito.enableUser(user.email);
      }
    }

    void makeAuditLogRecord(user.id, user, AuditAction.MODIFY, ctx.userInfo);

    return user;
  }

  @Authorized([{ 'configuration:users': AccessLevel.FULL_ACCESS }])
  @Mutation(() => Boolean)
  async deleteUser(
    @Ctx() ctx: ResolverContext,
    @Arg('id', () => String) id: string,
  ): Promise<boolean> {
    const { tenantName } = ctx.userInfo ?? {};

    let user: User;
    const where: FindConditions<User> = {};

    if (tenantName) {
      where.tenantName = tenantName;
    }

    try {
      user = await User.findOneOrFail(id, {
        where,
        relations: ['policies'],
      });
    } catch {
      throw new UserInputError(`No user with id ${id}`);
    }

    user.useContext(ctx);

    await getConnection().transaction(async em => {
      await em.remove(user.policies);
      await em.remove(user);
    });

    await cognito.deleteUser(user.email);

    void makeAuditLogRecord(id, user, AuditAction.DELETE, ctx.userInfo);

    return true;
  }

  @FieldResolver(() => [PolicyEntry])
  permissions(@Root() user: User, @Arg('resource', () => String) resource: string): PolicyEntry[] {
    return Object.entries(user.getPermissionsForResource(resource)).map(([subject, config]) => ({
      subject,
      ...config,
    }));
  }

  @FieldResolver(() => [String])
  availableActions(@Root() user: User, @Arg('resource', () => String) resource: string): string[] {
    return adaptAccessConfig(user.getPermissionsForResource(resource));
  }

  // @FieldResolver(() => [AllPermissions])
  // async allPermissions(
  //   @Root() user: User,
  //   @Arg('includeConfigurations', () => Boolean, { defaultValue: false })
  //   includeConfiguration: boolean,
  // ): Promise<AllPermissions[]> {
  //   const { tenantName } = user;

  //   if (!tenantName) {
  //     return [];
  //   }

  //   const resources = await Resource.findByTenantName(tenantName, { configurableOnly: true });

  //   const srns = resources.map((resource) => resource.srn);

  //   const allPermissions = await allPermissionsWorkerPool.putTaskInQueue(
  //     { srns, userData: user, includeConfiguration },
  //     { key: user.id },
  //   );

  //   return allPermissions;
  // }

  @FieldResolver(() => [UserPolicyStatement])
  @Directive('@deprecated(reason: "Please use new Policy API")')
  policyStatements(@Root() user: User): UserPolicyStatement[] {
    return user.policies.map(policy => {
      const statement = new UserPolicyStatement();

      statement.resource = policy.resource;
      statement.actions = adaptAccessConfig(policy.access);
      statement.effect = PolicyEffect.ALLOW;
      statement.name = `Grant access to ${policy.resource}`;
      statement.user = user;

      return statement;
    });
  }
}
