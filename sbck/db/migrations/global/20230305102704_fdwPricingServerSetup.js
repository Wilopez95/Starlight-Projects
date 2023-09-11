
import config from '../../dbConfig.js';

const REMOTE_SERVER_NAME = 'fdw_pricing',
  EXTENSION_NAME = 'postgres_fdw'

export const up = async (migrationBuilder, ) => {
  const { user: localUser } = config.knexForMigrationsConfig.connection;
  const { host, database, port, user, password } = config.knexForMigrationsConfig.remote.pricing;

  // Create extension
  await migrationBuilder.createExtension('public', EXTENSION_NAME);

  // Create server mapping
  await migrationBuilder.createRemoteServer(REMOTE_SERVER_NAME, EXTENSION_NAME, { host, database, port });

  // Create user mapping
  await migrationBuilder.createUserMapping(localUser, REMOTE_SERVER_NAME, { user, password });

};

export const down = async (migrationBuilder) => {
  const { user } = config.knexForMigrationsConfig.connection;
  await migrationBuilder.dropUserMapping(user, REMOTE_SERVER_NAME);
  await migrationBuilder.dropRemoteServer(REMOTE_SERVER_NAME);
  await migrationBuilder.dropExtension(EXTENSION_NAME);
};
