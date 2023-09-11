import { getConnection } from 'typeorm';
import { RolePolicyTemplate } from '../entities/PolicyTemplate';
import { Resource, ResourceType } from '../entities/Resource';
import { Role } from '../entities/Role';
import { RolePolicy } from '../entities/RolePolicy';
import { User } from '../entities/User';
import * as cognito from '../services/cognito';
import { ADMIN_ROLE_NAME, getDefaultRolesForTenant } from '../services/defaultRoles';
import { logger } from '../services/logger';

interface CreateTenantMessage {
  id: string;
  name: string;
  rootEmail: string;
}

interface DeleteTenantMessage {
  id: string;
  name: string;
}

export const createTenantResource = async (msg: CreateTenantMessage): Promise<void> => {
  const { id: tenantId, name, rootEmail } = msg;

  const existingUser = await User.findOne({
    where: {
      tenantId,
    },
  });

  if (!existingUser) {
    const rootUser = new User();
    const globalConfiguration = new Resource();

    User.merge(rootUser, {
      email: rootEmail,
      name: 'root',
      tenantId,
      tenantName: name,
    });

    globalConfiguration.srn = Resource.getConfigurationSrn(name);
    globalConfiguration.type = ResourceType.GLOBAL;

    try {
      await Resource.save(globalConfiguration);
    } catch (error) {
      logger.error(error as Error, `Failed to create resource ${globalConfiguration.srn}`);
      return;
    }

    logger.info(`Successfully created tenant resource for tenant ${name}`);

    const { roles, policyTemplates } = getDefaultRolesForTenant(tenantId);

    try {
      await Role.save(roles);
      await RolePolicyTemplate.save(policyTemplates);

      const newPolicies = policyTemplates
        .filter((template) => template.resourceType === globalConfiguration.type)
        .map((template) => template.createPolicyForResource(globalConfiguration));

      await RolePolicy.save(newPolicies);
    } catch (error) {
      logger.error(
        error as Error,
        `Error while saving default policy statement templates for tenant ${name}`,
      );
      return;
    }

    logger.info(`Saved default policy templates for tenant ${name}`);

    const adminRole = roles.find((role) => role.description === ADMIN_ROLE_NAME);

    if (!adminRole) {
      logger.error(`Could not find admin role for tenant ${name} after creation`);
      return;
    }

    rootUser.roles = [adminRole];

    let userId: string;
    try {
      userId = await cognito.createUserIfNotExists({
        email: rootEmail,
        name: 'root',
        tenantId,
        tenantName: name,
      });
    } catch (error) {
      logger.error(error as Error, `Failed to create user ${rootUser.email}`);
      return;
    }

    logger.info(
      `Successfully set up root user for tenant ${name} with email ${rootEmail} and ID ${userId}`,
    );

    rootUser.id = userId;

    try {
      await User.save(rootUser);
    } catch (error) {
      logger.error(error as Error, `Failed to save user ${rootUser.email}`);
    }
  }
};

export const deleteTenantResource = async ({
  id: tenantId,
  name,
}: DeleteTenantMessage): Promise<void> => {
  let users: User[] | undefined;

  logger.info(`Beginning removal of tenant ${name} with id ${tenantId}`);

  try {
    await getConnection().transaction(async (em) => {
      users = await em.find(User, { where: { tenantId }, relations: ['policies'] });

      logger.info(`Removing ${users.length} of tenant ${name} users`);

      await Promise.all(users.map((user) => cognito.disableUser(user.email)));

      logger.info(`Disabled all users of tenant ${name}`);

      await em.remove(users.flatMap((user) => user.policies));
      await em.remove(users);

      const roles = await em.find(Role, {
        where: { tenantId },
        relations: ['policies', 'policyTemplates'],
      });

      await em.remove(roles.flatMap((role) => role.policies));
      await em.remove(roles.flatMap((role) => role.policyTemplates));
      await em.remove(roles);

      const configurationResource = await em.findOne(Resource, {
        where: { srn: Resource.getConfigurationSrn(name) },
      });

      if (configurationResource) {
        await em.remove(Resource, configurationResource);
      }
    });
  } catch (error) {
    logger.error(error as Error, `Error while removing tenant ${name} data`);
  }

  logger.info(`Finished removal of tenant ${name} data`);

  try {
    await Promise.all(users?.map((user) => cognito.deleteUser(user.email)) ?? []);
  } catch (error) {
    logger.error(error as Error, `Error while removing tenant ${name} user accounts`);
  }

  logger.info(`Removed user accounts of tenant ${name}`);
};
