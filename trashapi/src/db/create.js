import knex from './connection.js';
import { getMigratingDirs } from './helpers.js';

export const createSeed = async ({ schema, fileName }) => {
  const seedConfig = {
    directory: getMigratingDirs(schema).seeds,
  };
  await knex.seed.make(fileName, seedConfig);
};

export const createMigration = async ({ schema, fileName }) => {
  const migrationConfig = {
    directory: getMigratingDirs(schema).migrations,
  };
  await knex.migrate.make(fileName, migrationConfig);
};
