import { AccessLevel, Policy } from '../entities/Policy';

interface AssignPermissionsParams {
  isMainContact?: boolean;
  hasCustomerPortalAccess?: boolean;
}

const baseAccess = {
  'customer-portal:profile': { level: AccessLevel.READ },
  'customer-portal:credit-cards': { level: AccessLevel.FULL_ACCESS },
  'customer-portal:statements': { level: AccessLevel.READ },
  'customer-portal:payments': { level: AccessLevel.FULL_ACCESS },
  'customer-portal:payout': { level: AccessLevel.READ },
  'customer-portal:invoices': { level: AccessLevel.READ },
  'customer-portal:subscriptions': { level: AccessLevel.READ },
  'customer-portal:reports': { level: AccessLevel.FULL_ACCESS },
};

const mainContactOnlyAccess = {
  'customer-portal:profile': { level: AccessLevel.MODIFY },
  'customer-portal:contacts': { level: AccessLevel.FULL_ACCESS },
};

export const assignCustomerPortalActions = (
  policy: Policy,
  { isMainContact, hasCustomerPortalAccess }: AssignPermissionsParams,
): void => {
  if (!hasCustomerPortalAccess) {
    policy.access = {};

    return;
  }

  policy.access = { ...baseAccess };

  if (isMainContact) {
    policy.access = { ...policy.access, ...mainContactOnlyAccess };
  }
};

export const removeMainOnlyActions = (policy: Policy): void => {
  policy.access = { ...baseAccess };
};
