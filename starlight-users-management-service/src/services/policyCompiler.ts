import { mergeWith } from 'lodash';

import { AccessConfig, AccessLevel, AccessMap, PolicyLike } from '../entities/Policy';

const levelOrder = [
  AccessLevel.NO_ACCESS,
  AccessLevel.READ,
  AccessLevel.MODIFY,
  AccessLevel.FULL_ACCESS,
];

export const isLevelHigherOrEqual = (level: AccessLevel, other: AccessLevel): boolean =>
  levelOrder.indexOf(level) - levelOrder.indexOf(other) >= 0;

const selectHigherLevel = (value: AccessConfig | undefined, other: AccessConfig) =>
  value && isLevelHigherOrEqual(value.level, other.level) ? value : other;

const selectPrioritizedLevel = (value: AccessConfig | undefined, other: AccessConfig) =>
  value?.overridden ? value : other;

const mergeAccessLevels = (objects: AccessMap[]) =>
  mergeWith({}, ...objects, selectHigherLevel) as AccessMap;

const mergeAccessLevelsPrioritized = (base: AccessMap, objects: AccessMap[]) =>
  mergeWith({ ...base }, ...objects, selectPrioritizedLevel) as AccessMap;

export const compilePolicies = (
  policies: PolicyLike[],
  basePolicies: PolicyLike[] = [],
): AccessMap => {
  if (policies.length === 0 && basePolicies.length === 0) {
    return {};
  }

  return mergeAccessLevelsPrioritized(
    mergeAccessLevels(policies.map((policy) => policy.access)),
    basePolicies.map((policy) => policy.access),
  );
};
