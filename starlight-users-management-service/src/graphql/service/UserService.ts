/* eslint-disable no-array-constructor, no-param-reassign, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { SelectQueryBuilder } from 'typeorm';
import { User } from '../../entities/User';
import { PageConfig, PermissionUserOrRoleFilter } from '../input';
import { AccessLevel } from '../../entities/Policy';
import { AccessLevelFilterConfig, GetUsersAndCountFilterConfig } from './input';

const userQueryColumns = ['firstName', 'lastName', 'name'];
const MAX_RECORDS_TO_RETURN = 25;

export class UserService {
  public async getUsersAndCount(
    pageConfig: PageConfig,
    filterConfig: GetUsersAndCountFilterConfig,
  ) {
    const { limit, offset } = pageConfig;
    const { tenantName, roleOrUserPermissionsFilters, resource, query } = filterConfig;

    if (limit > MAX_RECORDS_TO_RETURN) {
      throw new Error(
        `The limitation for the max records to return was violated.
          Max number of possible records to return is ${MAX_RECORDS_TO_RETURN}`,
      );
    }

    let userQuery = User.createQueryBuilder('user');

    if (tenantName?.length) {
      userQuery = userQuery.where('user.tenantName = :tenantName', { tenantName });
    }

    if (roleOrUserPermissionsFilters) {
      userQuery = this.applyRoleOrUserPermissionsFilters(
        roleOrUserPermissionsFilters,
        userQuery,
        resource,
      );
    }

    if (query?.length) {
      const iLikeValue = `ilike '${query}%'`;
      const queryCases = userQueryColumns.map(queryColumn => `user.${queryColumn} ${iLikeValue}`);

      userQuery = userQuery.andWhere(`(${queryCases.join(' OR ')})`);
    }
    userQuery = userQuery.groupBy('"user".id').orderBy('"user".name').limit(limit).offset(offset);
    return userQuery.getManyAndCount();
  }

  private applyRoleOrUserPermissionsFilters(
    roleOrUserPermissionsFilters: PermissionUserOrRoleFilter[],
    userQuery: SelectQueryBuilder<User>,
    resource?: string,
  ) {
    userQuery = userQuery.leftJoin('user.roles', 'roles');

    const rolePoliciesCondition = resource?.length
      ? `policies.resource ilike '${resource}'`
      : undefined;
    const userPoliciesCondition = resource?.length
      ? `userpolicies.resource ilike '${resource}'`
      : undefined;
    userQuery = userQuery
      .innerJoin('roles.policies', 'policies', rolePoliciesCondition)
      .leftJoin('user.policies', 'userpolicies', userPoliciesCondition);

    const { rolePoliciesFilterStack, userPoliciesFilterStack, noAccessPoliciesFilterStack } =
      this.getPermissionFiltersByCategory(roleOrUserPermissionsFilters);

    userQuery.andWhere(
      `(
        ${rolePoliciesFilterStack.join(' AND ')}
        OR
        ${userPoliciesFilterStack.join(' AND ')}
      )
      AND (
        ${noAccessPoliciesFilterStack.join(' AND ')}
      )`,
    );
    return userQuery;
  }

  private getPermissionFiltersByCategory(
    roleOrUserPermissionsFilters: PermissionUserOrRoleFilter[],
  ) {
    const rolePoliciesFilterStack = new Array<string>();
    const userPoliciesFilterStack = new Array<string>();
    const noAccessPoliciesFilterStack = new Array<string>();

    roleOrUserPermissionsFilters.forEach(condition => {
      const { accessLevels, permission } = condition;

      if (permission.length && accessLevels.length) {
        const generalAccessLevelSubFilterCfg: AccessLevelFilterConfig = {
          accessLevels,
          isAnyAccessLevelShouldBeSetOnForPermission: true,
        };

        const excludeAccessLevelSubFilterCfg: AccessLevelFilterConfig = {
          accessLevels: [AccessLevel.NO_ACCESS],
          isAnyAccessLevelShouldBeSetOnForPermission: false,
        };

        rolePoliciesFilterStack.push(
          this.gePermissionQuerySubfilter('policies', permission, generalAccessLevelSubFilterCfg),
        );
        userPoliciesFilterStack.push(
          this.gePermissionQuerySubfilter(
            'userpolicies',
            permission,
            generalAccessLevelSubFilterCfg,
          ),
        );
        noAccessPoliciesFilterStack.push(
          this.gePermissionQuerySubfilter(
            'userpolicies',
            permission,
            excludeAccessLevelSubFilterCfg,
          ),
        );
      }
    });

    return { rolePoliciesFilterStack, userPoliciesFilterStack, noAccessPoliciesFilterStack };
  }

  /**
   * Get a part of personal or role permissions filters
   *  for specific type of permissions container(e.g. role permissions or user permissions)
   *  with any of specified permission access level.
   * @param permissionContainerName - the table name where permission string stored
   * @param permission - the permission id string e.g. 'role:owner'
   * @param accessLevelsFiltersCfg - the permission subfilter config
   * @returns string
   */
  private gePermissionQuerySubfilter(
    permissionContainerName: string,
    permission: string,
    accessLevelsFiltersCfg: AccessLevelFilterConfig,
  ) {
    const { accessLevels, isAnyAccessLevelShouldBeSetOnForPermission: useEqualOperator } =
      accessLevelsFiltersCfg;

    const mainFilterPart = `${permissionContainerName}."access"-> '${permission}'`;

    const commaSeparatedAccessLeveles = accessLevels
      .map(accessLevel => `'${accessLevel}'`)
      .join(',');

    const operator = useEqualOperator ? '=' : '!=';
    const basePermissionFilter = `${mainFilterPart}->>'level' ${operator} any(array[${commaSeparatedAccessLeveles}])`;

    if (!useEqualOperator) {
      return `(${basePermissionFilter} OR ${mainFilterPart} ISNULL)`;
    }

    return basePermissionFilter;
  }
}
