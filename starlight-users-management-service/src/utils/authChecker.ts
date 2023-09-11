import { type ResolverData } from 'type-graphql';
import { type Context, type UserInfo } from '../context';
import { AccessLevel } from '../entities/Policy';
import { isLevelHigherOrEqual } from '../services/policyCompiler';

interface AccessRequirements {
  [subject: string]: AccessLevel;
}

/**
 * If the user has access to all of the requirements, return true
 * @param {UserInfo} user - UserInfo
 * @param {AccessRequirements[]} requirements - An array of objects that describe the access
 * requirements.
 * @returns A boolean value.
 */
export const checkPermissions = (
  user: UserInfo,
  requirements: AccessRequirements[] = [],
): boolean => {
  if (!requirements || Object.keys(requirements).length === 0) {
    return true;
  }

  return requirements.some(requirement =>
    Object.entries(requirement).every(
      ([key, level]) =>
        user.access[key].level && isLevelHigherOrEqual(user.access[key].level, level),
    ),
  );
};

/**
 * If the user is logged in or there is a serviceToken, return true. Otherwise, return false
 * @param resolverData - ResolverData<Context>
 * @param {AccessRequirements[]} requirements - An array of AccessRequirements.
 * @returns A boolean value.
 */
export const authChecker = (
  resolverData: ResolverData<Context>,
  requirements: AccessRequirements[],
): boolean => {
  const { context } = resolverData;

  if (context.serviceToken) {
    return true;
  }

  if (!context.userInfo) {
    return false;
  }

  return checkPermissions(context.userInfo, requirements);
};
