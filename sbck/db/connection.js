import Knex from 'knex';
import objection from 'objection';

import { logger } from '../utils/logger.js';
import { SKIP_MIGRATION, GENERATE_SNAPSHOTS } from '../config.js';
import config from './dbConfig.js';
import dbManager from './dbManagerFramework/dbManager.js';

import generateSnapshot from './generateSnapshot.js';

const { Model } = objection;

const environment = process.env.NODE_ENV || 'development';
const knex = Knex(config.knexForModelsConfig);

Model.knex(knex);

const syncDb = async () => {
  if (SKIP_MIGRATION) {
    return logger.info('DB: migrations setup is skipped');
  }

  try {
    logger.info('DB: running migrations...');

    await dbManager.applyLatest(config);

    logger.info('DB: all migrations ran.');

    if (environment === 'local' || environment === 'development') {
      logger.info('DB: seeding...');

      await dbManager.runSeeds(config);

      logger.info('DB: seeds ran.');

      if (GENERATE_SNAPSHOTS) {
        await generateSnapshot(dbManager.knex);
      }
    }

    logger.info('DB setup is successful.');
  } catch (error) {
    logger.info('DB setup failed! Exiting...');
    throw error;
  } finally {
    // TODO: that affects add new tenant operation
    // dbManager?.knex.destroy();
  }
  return true;
};

export { dbManager, syncDb };

export default knex;
