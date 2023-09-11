import { kebabCase } from 'lodash';
import { getConnection } from 'typeorm';
import { AuditAction } from '../db/AuditAction';
import { AccessLevel } from '../entities/Policy';

import { Resource, ResourceType } from '../entities/Resource';
import { User, UserStatus } from '../entities/User';
import { UserPolicy } from '../entities/UserPolicy';
import { makeAuditLogRecord } from '../services/auditLog';
import * as cognito from '../services/cognito';
import { matchesResource } from '../services/resource';
import {
  assignCustomerPortalActions,
  removeMainOnlyActions,
} from '../services/customerPortalActions';
import { logger } from '../services/logger';

interface CustomerContactUpdateMessage {
  firstName: string;
  lastName: string;
  email: string;
  customerId: string;
  tenantName: string;
  tenantId: string;
  isMainContact?: boolean;
  prevMainContactEmail?: string;
  hasCustomerPortalAccess?: boolean;
  label?: string;
  subLabel?: string;
  loginUrl?: string;
}

const getUserStatus = (user: User, currentPolicy: UserPolicy): UserStatus => {
  const otherPolicies =
    user.policies.filter(({ resource }) => !matchesResource(resource, currentPolicy.resource)) ??
    [];

  const isActiveCurrentPolicy = Object.values(currentPolicy.access).some(
    ({ level }) => level !== AccessLevel.NO_ACCESS,
  );
  const existsOtherActivePolicy = otherPolicies.some(policy =>
    Object.values(policy.access).some(({ level }) => level !== AccessLevel.NO_ACCESS),
  );

  const isActiveUser = isActiveCurrentPolicy || existsOtherActivePolicy;
  return isActiveUser ? UserStatus.ACTIVE : UserStatus.DISABLED;
};

const buildCustomerPortalResourceName = (tenantName: string, customerId: string) =>
  `srn:${tenantName}:${kebabCase(ResourceType.CUSTOMER_PORTAL)}:${customerId}`;

export const upsertCustomerUser = async ({
  firstName,
  lastName,
  email,
  tenantName,
  tenantId,
  customerId,
  prevMainContactEmail,
  isMainContact,
  hasCustomerPortalAccess,
  label,
  subLabel,
  loginUrl,
}: CustomerContactUpdateMessage): Promise<void> => {
  const name = `${firstName} ${lastName}`;

  let userId: string;
  try {
    userId = await cognito.createUserIfNotExists({
      email,
      name,
    });
  } catch (error) {
    logger.error(error as Error, `Failed to create customer user ${email}`);
    return;
  }

  const srn = buildCustomerPortalResourceName(tenantName, customerId);

  const user = (await User.findOne(userId, { relations: ['policies'] })) ?? new User();
  const prevStatus = user.status;

  const resource =
    (await Resource.findOne({
      srn,
    })) ?? new Resource();

  if (prevMainContactEmail && isMainContact) {
    const prevMain = await User.findOne({
      where: { email: prevMainContactEmail },
      relations: ['policies'],
    });
    const policy = prevMain?.policies.find(p => p.resource === resource.srn);

    if (policy) {
      removeMainOnlyActions(policy);

      await policy.save();
    }
  }

  Resource.merge(resource, {
    type: ResourceType.CUSTOMER_PORTAL,
    srn,
    id: customerId,
    label,
    subLabel,
    loginUrl,
  });

  let policy = user.policies.find(({ resource: srn }) => resource.srn === srn);

  if (!policy) {
    policy = new UserPolicy();

    policy.user = user;
    policy.resource = resource.srn;
  }

  assignCustomerPortalActions(policy, { isMainContact, hasCustomerPortalAccess });

  const status = getUserStatus(user, policy);
  User.merge(user, {
    name,
    firstName,
    lastName,
    email,
    status,
    tenantName,
    tenantId,
  });
  user.id = userId;

  try {
    await getConnection().transaction(async em => {
      await em.save(User, user);
      await em.save(Resource, resource);
      await em.save(UserPolicy, policy as UserPolicy);
    });
  } catch (error) {
    logger.error(error as Error, 'Failed to save user, resource and permissions');
  }

  logger.info(`Successfully set up user with email ${email} and ID ${userId}`);

  if (status === prevStatus) {
    return;
  }

  if (status === UserStatus.DISABLED) {
    try {
      await cognito.disableUser(email);
    } catch (error) {
      logger.error(error as Error, 'Failed to disable user in Cognito');
    }
  } else {
    try {
      await cognito.enableUser(user.email);
    } catch (error) {
      logger.error(error as Error, 'Failed to enable user in Cognito');
    }
  }

  void makeAuditLogRecord(user.id, user, AuditAction.CREATE, { tenantName });
};
