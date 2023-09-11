import { AccessLevel, AccessMap } from '../entities/Policy';
import { isLevelHigherOrEqual } from './policyCompiler';

const recyclingPrecompletePermissions = ['inyard', 'weightout', 'load', 'payment'];
const recyclingSpecialCases = [
  'recycling:Order:complete',
  'recycling:Order:approve',
  'recycling:Order:finalize',
  'recycling:Order:invoice',
];

const isRecyclingSpecialCase = (subject: string, action: string) =>
  subject === 'recycling:Order' && recyclingSpecialCases.includes(action);

const isRecyclingPrecomplete = (subject: string, action: string) =>
  subject === 'recycling:Order' && recyclingPrecompletePermissions.includes(action);

export const actionToLevel = (action: string): AccessLevel => {
  switch (action) {
    case 'perform':
    case 'full-access':
    case 'create':
    case 'delete':
      return AccessLevel.FULL_ACCESS;
    case 'update':
      return AccessLevel.MODIFY;
    case 'view':
    case 'list':
      return AccessLevel.READ;
    default:
      return AccessLevel.NO_ACCESS;
  }
};

export const levelToPriority = (level: AccessLevel): number => {
  switch (level) {
    case AccessLevel.FULL_ACCESS:
      return 3;
    case AccessLevel.MODIFY:
      return 2;
    case AccessLevel.READ:
      return 1;
    case AccessLevel.NO_ACCESS:
      return 0;
    default:
      return 0;
  }
};

const levelToActions = (level: AccessLevel) => {
  // eslint-disable-next-line default-case
  switch (level) {
    case AccessLevel.NO_ACCESS:
      return [];
    case AccessLevel.READ:
      return ['view', 'list'];
    case AccessLevel.MODIFY:
      return ['view', 'list', 'update'];
    case AccessLevel.FULL_ACCESS:
      return ['view', 'list', 'update', 'perform', 'full-access', 'create', 'delete'];
  }
};

/**
 * It takes a list of actions and returns an access map
 * @param {string[]} actions - string[]
 */
export const adaptActionsList = (actions: string[]): AccessMap =>
  actions.reduce<AccessMap>((acc, action) => {
    // Special case
    if (action === 'starlight-admin') {
      return Object.assign(acc, { 'starlight-admin': { level: AccessLevel.FULL_ACCESS } });
    }

    const [prefix, entity, access] = action.split(':');
    const subject = `${prefix}:${entity}`;

    if (isRecyclingSpecialCase(subject, access)) {
      return Object.assign(acc, {
        [action]: { level: AccessLevel.FULL_ACCESS },
      });
    }
    if (isRecyclingPrecomplete(subject, access)) {
      return Object.assign(acc, {
        'recycling:Order:precomplete': { level: AccessLevel.FULL_ACCESS },
      });
    }

    const level = actionToLevel(access);
    const currentLevel = acc[subject];

    if (!currentLevel || isLevelHigherOrEqual(level, currentLevel.level)) {
      return Object.assign(acc, { [subject]: { level } });
    }

    return acc;
  }, {});

/**
 * It takes an object that looks like this:
 * @param {AccessMap} access - AccessMap - this is the access map that you get from the API.
 */
export const adaptAccessConfig = (access: AccessMap): string[] =>
  Object.entries(access).flatMap(([subject, { level }]) => {
    if (subject === 'starlight-admin') {
      return ['starlight-admin'];
    }
    if (subject === 'recycling:Order:precomplete' && level === AccessLevel.FULL_ACCESS) {
      return recyclingPrecompletePermissions.map(
        specialAction => `recycling:Order:${specialAction}`,
      );
    }
    if (recyclingSpecialCases.includes(subject) && level === AccessLevel.FULL_ACCESS) {
      return subject;
    }

    return levelToActions(level).map(action => `${subject}:${action}`);
  });
