import { AccessMap } from '../entities/Policy';
import { actionToLevel, adaptAccessConfig, levelToPriority } from './policyAdapter';

const recyclingToHaulingPermissionMap: Record<string, { action: string; skipMapping?: boolean }> = {
  'recycling:Customer:create': {
    action: 'customers:create:perform',
    skipMapping: true,
  },
  'recycling:Customer:view': {
    action: 'customers:view:perform',
    skipMapping: true,
  },
  'recycling:Customer:update': {
    action: 'customers:edit:perform',
    skipMapping: true,
  },
  'recycling:Customer:list': {
    action: 'customers:view:perform',
    skipMapping: true,
  },
  'recycling:Order:create': {
    action: 'orders:new-order:perform',
    skipMapping: true,
  },
  'recycling:Order:view': {
    action: 'orders:view-all:perform',
    skipMapping: true,
  },
  'recycling:Order:update': {
    action: 'orders:edit:perform',
    skipMapping: true,
  },
  'recycling:Order:list': {
    action: 'orders:view-all:perform',
    skipMapping: true,
  },
  'recycling:Order:complete': {
    action: 'orders:complete:perform',
    skipMapping: true,
  },
  'recycling:Order:approve': {
    action: 'orders:approve:perform',
    skipMapping: true,
  },
  'recycling:Order:finalize': {
    action: 'orders:finalize:perform',
    skipMapping: true,
  },
  'recycling:CustomerContact:create': { action: 'customers:contacts' },
  'recycling:CustomerContact:view': { action: 'customers:contacts' },
  'recycling:CustomerContact:update': { action: 'customers:contacts' },
  'recycling:CustomerContact:delete': { action: 'customers:contacts' },
  'recycling:CustomerContact:list': { action: 'customers:contacts' },

  'recycling:TaxExemption:create': { action: 'customers:tax-exempts' },
  'recycling:TaxExemption:view': { action: 'customers:tax-exempts' },
  'recycling:TaxExemption:update': { action: 'customers:tax-exempts' },
  'recycling:TaxExemption:delete': { action: 'customers:tax-exempts' },
  'recycling:TaxExemption:list': { action: 'customers:tax-exempts' },

  'recycling:PriceGroup:create': { action: 'configuration/price-groups:price-groups' },
  'recycling:PriceGroup:view': { action: 'configuration/price-groups:price-groups' },
  'recycling:PriceGroup:update': { action: 'configuration/price-groups:price-groups' },
  'recycling:PriceGroup:delete': { action: 'configuration/price-groups:price-groups' },
  'recycling:PriceGroup:list': { action: 'configuration/price-groups:price-groups' },

  'recycling:GlobalRackRates:view': { action: 'configuration/price-groups:price-groups' },
  'recycling:GlobalRackRates:update': { action: 'configuration/price-groups:price-groups' },
};

/**
 * For each recycling action, if it has a corresponding hauling action,
 * add the hauling action to the permissions map with the same level as the recycling action
 * @param {AccessMap} permissions - The current permissions object.
 * @returns A new access map with the recycling actions mapped to the hauling actions.
 */
export const extendRecyclingPermissionWithHauling = (permissions: AccessMap): AccessMap => {
  const actions = adaptAccessConfig(permissions);

  actions.forEach(recyclingAction => {
    if (recyclingToHaulingPermissionMap[recyclingAction]) {
      const haulingActionData = recyclingToHaulingPermissionMap[recyclingAction];
      // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
      const [_, __, access] = recyclingAction.split(':');
      const [haulingPrefix, haulingEntity, haulingAccess] = haulingActionData.action.split(':');

      const subject = `${haulingPrefix}:${haulingEntity}`;
      const level = actionToLevel(haulingActionData.skipMapping ? haulingAccess : access);

      if (
        !permissions[subject] ||
        (permissions[subject] &&
          levelToPriority(level) > levelToPriority(permissions[subject].level))
      ) {
        permissions[subject] = {
          level,
          overridden: false,
        };
      }
    }
  });

  return permissions;
};
