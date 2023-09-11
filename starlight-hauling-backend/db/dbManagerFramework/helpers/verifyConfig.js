import MigrationError from '../MigrationError.js';

const verifyConfig = config => {
  if (
    !(
      config.logger &&
      typeof config.logger.info === 'function' &&
      typeof config.logger.warn === 'function' &&
      typeof config.logger.debug === 'function' &&
      typeof config.logger.error === 'function'
    )
  ) {
    throw new MigrationError(
      `logger\` must be an object with methods \`info\`, \`warn\`, \`debug\` and \`error\`,
                got ${config.logger}`,
    );
  }

  if (!config.tenantTable) {
    throw new MigrationError('`tenantTable` must be the table with names of all tenants');
  }

  if (!config.tenantMigrationTable) {
    throw new MigrationError(
      '`tenantMigrationTable` must be the name of the table with tenant migrations',
    );
  }

  if (!config.migrationTable) {
    throw new MigrationError(
      '`migrationTable` must be the name of the table where global migrations will be stored',
    );
  }
};

export default verifyConfig;
