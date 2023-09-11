/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { parentPort, isMainThread } from 'worker_threads';
import { resolve } from 'path';

import { createConnection, getConnectionOptions } from 'typeorm';

import { logger } from '../../services/logger';

import { User } from '../../entities/User';
import { Resource } from '../../entities/Resource';

if (!isMainThread) {
  const onMessage = async ({ id, includeConfiguration = false }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await User.findOne(id, { relations: ['policies', 'roles', 'roles.policies'] });

    const resources = await Resource.findByTenantName(user.tenantName, {
      configurableOnly: true,
    });

    const srns = resources.map(resource => resource.srn);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    user.allPermissions = srns.map(srn => ({
      resource: srn,
      entries: Object.entries(user.getPermissionsForResource(srn, { includeConfiguration })).map(
        ([subject, config]) => ({
          subject,
          ...config,
        }),
      ),
    }));

    parentPort.postMessage(user);
  };

  const entityPath = resolve(__dirname, '../../../src/entities/*.{js,ts}');

  (async () => {
    const options = await getConnectionOptions();

    const connection = await createConnection({
      ...options,
      migrationsRun: false,
      entities: [entityPath],
    });

    logger.info('[worker]: Established DB connection');

    parentPort.on('message', onMessage);

    parentPort.once('close', async () => {
      logger.info('[worker]: Closed DB connection');
      await connection.close();
    });
  })();
}
