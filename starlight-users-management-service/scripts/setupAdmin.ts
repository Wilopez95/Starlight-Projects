import { resolve } from 'path';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { logger } from '../src/services/logger';
import * as cognito from '../src/services/cognito';
import { User } from '../src/entities/User';
import { Role, RoleStatus } from '../src/entities/Role';
import { RolePolicy } from '../src/entities/RolePolicy';
import { Resource, ResourceType } from '../src/entities/Resource';
import { generateRandomPassword } from '../src/services/crypto';
import { AccessLevel } from '../src/entities/Policy';

const adminUserData = {
  name: 'admin',
  email: 'admin@starlightpro.net',
};

let connection: Connection | undefined;

const setupAdmin = async () => {
  const options = await getConnectionOptions();

  connection = await createConnection({
    ...options,
    migrationsRun: false,
    entities: [resolve(__dirname, '../src/entities/*.{js,ts}')],
  });

  logger.info('Established DB connection');

  let user = await User.findOne(
    {
      email: adminUserData.email,
    },
    { relations: ['roles'] },
  );

  let userId = await cognito.findUserByEmail(adminUserData.email, { logger });

  if (!userId || !user) {
    const temporaryPassword = generateRandomPassword();

    user = new User();

    User.merge(user, adminUserData);

    logger.info(
      `No admin user found. Creating new user with email ${user.email}, name ${user.name} and temporary password ${temporaryPassword}`,
    );

    if (!userId || user.id !== userId) {
      userId = await cognito.createUserIfNotExists({
        email: user.email,
        name: user.name,
        temporaryPassword,
      });
    }

    user.id = userId;

    await User.delete({ email: user.email });

    await User.save(user);
  } else {
    logger.info(`Admin user already exists and has ID ${userId}`);
  }

  let adminResource = await Resource.findOne({ srn: Resource.ADMIN_RESOURCE });

  if (!adminResource) {
    logger.info('Create admin resource');

    adminResource = Resource.merge(new Resource(), {
      srn: Resource.ADMIN_RESOURCE,
      type: ResourceType.GLOBAL,
    });

    await adminResource.save();
  }

  let adminRole = await Role.findOne({ tenantId: Resource.ADMIN_RESOURCE });

  if (!adminRole) {
    logger.info('Create admin role');

    const adminPolicy = RolePolicy.merge(new RolePolicy(), {
      resource: Resource.ADMIN_RESOURCE,
      access: { 'starlight-admin': { level: AccessLevel.FULL_ACCESS } },
    });

    adminRole = Role.merge(new Role(), {
      description: 'Starlight Admin Role',
      status: RoleStatus.ACTIVE,
      policies: [adminPolicy],
    });
    adminPolicy.role = adminRole;

    user.roles = [...(user.roles || []), adminRole];

    await adminRole.save();
    await adminPolicy.save();
    await user.save();
  }

  logger.info(`Bootstrapped environment with admin user ${userId}`);
};

setupAdmin()
  .catch((error) => {
    logger.error(error, 'Failed to bootstrap environment');
  })
  .then(() => connection?.close())
  .catch((error) => {
    logger.error(error, 'Failed to close the connection');
  });
