import { AccessLevel, IAccessConfig } from '@root/types';

import { PermissionSectionConfig } from '../config';

type ChildrenCheckedResult = boolean | 'indeterminate';

export const levelsOrder = [
  AccessLevel.NO_ACCESS,
  AccessLevel.READ,
  AccessLevel.MODIFY,
  AccessLevel.FULL_ACCESS,
];

export const isLevelGreaterOrEqual = (level: AccessLevel, other: AccessLevel) =>
  levelsOrder.indexOf(level) >= levelsOrder.indexOf(other);

export const areChildrenChecked = (
  permission: PermissionSectionConfig,
  policy: { access: Record<string, IAccessConfig> },
  level: AccessLevel,
): ChildrenCheckedResult => {
  let hasChecked = false;
  let hasUnchecked = false;

  for (const value of Object.values(permission.items)) {
    if (!Array.isArray(value)) {
      const childResult = areChildrenChecked(value, policy, level);

      if (childResult === 'indeterminate') {
        return childResult;
      } else if (childResult) {
        hasChecked = true;
      } else {
        hasUnchecked = true;
      }
    } else {
      const isLevelAvailable = value[1][levelsOrder.indexOf(level) - 1];

      if (isLevelAvailable && isLevelGreaterOrEqual(policy.access[value[0]]?.level, level)) {
        hasChecked = true;
      } else if (isLevelAvailable) {
        hasUnchecked = true;
      }
    }
  }

  if (hasChecked && hasUnchecked) {
    return 'indeterminate';
  } else if (hasChecked && !hasUnchecked) {
    return true;
  } else {
    return false;
  }
};

export const computeCheckboxStates = (
  permission: PermissionSectionConfig,
  policy: { access: Record<string, IAccessConfig> },
): [ChildrenCheckedResult, ChildrenCheckedResult, ChildrenCheckedResult] => [
  areChildrenChecked(permission, policy, AccessLevel.READ),
  areChildrenChecked(permission, policy, AccessLevel.MODIFY),
  areChildrenChecked(permission, policy, AccessLevel.FULL_ACCESS),
];

export const prevLevel = (level: AccessLevel) => levelsOrder[levelsOrder.indexOf(level) - 1];

export const hasPermissions = (policyLike: { access: Record<string, IAccessConfig> }) =>
  Object.values(policyLike.access).some(({ level }) =>
    isLevelGreaterOrEqual(level, AccessLevel.NO_ACCESS),
  );
