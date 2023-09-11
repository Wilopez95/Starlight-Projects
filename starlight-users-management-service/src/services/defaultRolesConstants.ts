/**
 * Place where all role constants should be placed in ideal case
 * - it will let us use exported const values instead of duplication of literals which is not a best solution
 * due to human factor mistakes (wrong literals usage - only one wrong char and part of related code/feature will not work).
 * Moreover we need to consider oportunity to move all consts into Enum in context of exported NPM(yarn) package for preventing
 * previously described scenario in other services that could consume roles literals.
 */

export const subscriptionOwner = 'subscriptions:owner';
export const subscriptionOwnerFullAccess = `${subscriptionOwner}:full-access`;
export const subscriptionOwnerUpdate = `${subscriptionOwner}:update`;
export const subscriptionOwnerView = `${subscriptionOwner}:view`;
export const allSubscriptionOwnerFilters = [
  subscriptionOwnerFullAccess,
  subscriptionOwnerUpdate,
  subscriptionOwnerView,
];

export const orderOwner = 'order:owner';
export const orderOwnerFullAccess = `${orderOwner}:full-access`;
export const orderOwnerUpdate = `${orderOwner}:update`;
export const orderOwnerView = `${orderOwner}:view`;
export const baseOrderOwnerPermissions = [orderOwnerUpdate, orderOwnerView];
export const allOrderOwnerPermissions = [orderOwnerFullAccess, ...baseOrderOwnerPermissions];
