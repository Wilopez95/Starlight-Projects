import knex from 'knex';

import { SKIP_MIGRATION, GENERATE_SNAPSHOTS } from '../config.js';
import { logger } from '../utils/logger.js';
import config from './config.js';

import dbManager from './dbManagerFramework/dbManager.js';

import writeSnapshots from './writeSnapshots.js';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config.knexConfig);

db.sync = async () => {
  if (SKIP_MIGRATION) {
    return logger.info('DB: migrations setup is skipped');
  }

  try {
    logger.info('DB: running migrations...');

    await dbManager.migrate.latest(db, config);

    logger.info('DB: all migrations ran.');

    if (environment === 'local' || environment === 'development') {
      logger.info('DB: seeding...');

      await dbManager.seed.run(db, config);

      logger.info('DB: seeds ran.');

      if (GENERATE_SNAPSHOTS) {
        await writeSnapshots(db);
      }
    }

    logger.info('DB setup is successful.');
  } catch (error) {
    logger.info('DB setup failed! Exiting...');
    throw error;
  }
  return logger.info('DB Sycn is successful');
};

db.getTenantList = () =>
  db('admin.tenants')
    .select('name')
    .then(tenants => tenants.map(({ name }) => name));

export default db;
