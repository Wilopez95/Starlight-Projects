import MigrationBuilder from './builders/MigrationBuilder.js';
import getLatest from './helpers/getLatest.js';
import getPending from './helpers/getPending.js';
import recordMigrations from './helpers/recordMigrations.js';
import removeMigrations from './helpers/removeMigrations.js';

const runJsMigration = async (knex, migration, internalSchema, tenant, logger) => {
  // This is possible if we only define an UP or only a DOWN migration.
  // For data-only migrations, only UP migrations might make sense, for instance.
  if (typeof migration !== 'function') {
    return;
  }

  const migrationBuilder = new MigrationBuilder(knex, logger);

  if (tenant) {
    await knex.raw(`set search_path to ${tenant},${internalSchema},public`);
  } else {
    await knex.raw(`set search_path to ${internalSchema},public`);
  }

  await migration(migrationBuilder, tenant);
};

const runSqlMigration = async (knex, migration, internalSchema, tenant) => {
  // This is possible if we only define an UP or only a DOWN migration.
  // For data-only migrations, only UP migrations might make sense, for instance.
  if (migration === undefined) {
    return;
  }

  await knex.raw('set client_min_messages to notice');

  if (tenant) {
    await knex.raw(`set search_path to ${tenant},${internalSchema},public`);
  } else {
    await knex.raw(`set search_path to ${internalSchema},public`);
  }

  await knex.raw(migration);
};

export const migrateDown = async (knex, config, count) => {
  const latest = await getLatest(knex, config, count);
  // Order must be tenant first, global last
  const latestSorted = Object.entries(latest).sort(([scope1], [scope2]) => {
    if (scope1 === 'global') {
      return 1;
    }
    if (scope2 === 'global') {
      return -1;
    }

    return 0;
  });

  await latestSorted.reduce(
    (prevPromise, [scope, migrations]) =>
      prevPromise.then(() => {
        const tenant = scope === 'global' ? undefined : scope;
        return migrations.reduce(
          (prev, curr) =>
            prev.then(() =>
              curr.type === 'js'
                ? runJsMigration(
                    knex,
                    curr.migration.down,
                    config.internalSchema,
                    tenant,
                    config.logger,
                  )
                : runSqlMigration(knex, curr.migration.down, config.internalSchema, tenant),
            ),
          Promise.resolve(),
        );
      }),
    Promise.resolve(),
  );

  await removeMigrations(knex, latest, config);

  if (Object.keys(latest).length > 0) {
    config.logger.info(
      `Rolled back migrations:\n${Object.values(latest)
        .flatMap(migrations => migrations.map(m => m.name))
        .join('\n')}`,
    );
  } else {
    config.logger.info('No migrations to rollback');
  }
};

export const migrateUp = async (knex, config, batch, count) => {
  const pending = await getPending(knex, config);

  // Order must be global first
  const pendingSorted = Object.entries(pending).sort(([scope1], [scope2]) => {
    if (scope1 === 'global') {
      return -1;
    }
    if (scope2 === 'global') {
      return 1;
    }

    return 0;
  });

  await pendingSorted.reduce(
    (prevPromise, [scope, migrations]) =>
      prevPromise.then(() => {
        if (count) {
          migrations.splice(count);
        }

        const tenant = scope === 'global' ? undefined : scope;
        return migrations.reduce(
          (prev, curr) =>
            prev.then(() =>
              curr.type === 'js'
                ? runJsMigration(
                    knex,
                    curr.migration.up,
                    config.internalSchema,
                    tenant,
                    config.logger,
                  )
                : runSqlMigration(knex, curr.migration.up, config.internalSchema, tenant),
            ),
          Promise.resolve(),
        );
      }),
    Promise.resolve(),
  );

  await recordMigrations(knex, pending, batch, config);

  if (Object.keys(pending).length > 0) {
    config.logger.info(
      `Finished migrations:\n${Object.values(pending)
        .flatMap(migrations => migrations.map(m => m.name))
        .join('\n')}`,
    );
  } else {
    config.logger.info('No pending migrations!');
  }
};
