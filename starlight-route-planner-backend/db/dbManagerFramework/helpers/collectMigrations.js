import { join, resolve } from 'path';
import { promises as fsPromises } from 'fs';
import { pathToFileURL } from 'url';

import handleIoError from './handleIoError.js';
import stripFileExtension from './stripFileExtension.js';

const getType = filename => (filename.endsWith('.sql') ? 'sql' : 'js');

const loadFile = async migrationFile => {
  let migration;
  let type;

  if (getType(migrationFile) === 'sql') {
    type = 'sql';
    migration = await fsPromises.readFile(migrationFile);
  } else {
    type = 'js';

    migration = await import(pathToFileURL(migrationFile));
  }

  return { name: stripFileExtension(migrationFile), type, migration };
};

const mergeSqlMigrations = migrationsList =>
  migrationsList.reduce((acc, migration) => {
    if (migration.type !== 'sql') {
      acc.push(migration);
      return acc;
    }

    let kind;
    let baseName;

    // SQL migrations should end with __up or __down for up and down migrations
    if (migration.name.endsWith('__up')) {
      baseName = migration.name.slice(0, -4);
      kind = 'up';
    } else if (migration.name.endsWith('__down')) {
      baseName = migration.name.slice(0, -6);
      kind = 'down';
    }

    const addedMigration = acc.find(m => m.name === baseName);

    if (addedMigration) {
      addedMigration.migration[kind] = migration.migration;
    } else {
      acc.push({ ...migration, migration: { [kind]: migration.migration } });
    }

    return acc;
  }, []);

const collectMigrations = async ({ migrationsDirectory }) => {
  const dirs = [join(migrationsDirectory, './tenant'), join(migrationsDirectory, './global')];

  const readdirResults = await Promise.allSettled(dirs.map(dirname => fsPromises.readdir(dirname)));

  const [tenantFiles, globalFiles] = readdirResults.map((result, i) =>
    result.status === 'fulfilled' ? result.value : handleIoError(dirs[i], result.reason, []),
  );

  const tenantMigrationFiles = tenantFiles.map(file => resolve(dirs[0], file));
  const globalMigrationFiles = globalFiles.map(file => resolve(dirs[1], file));

  const [tenantMigrations, globalMigrations] = [
    await Promise.all(tenantMigrationFiles.map(loadFile)),
    await Promise.all(globalMigrationFiles.map(loadFile)),
  ].map(mergeSqlMigrations);

  return { tenant: tenantMigrations, global: globalMigrations };
};

export default collectMigrations;
