import { resolve, dirname } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import * as helpers from './dbMetadata.js';

const snapshotDirectory = resolve(dirname(fileURLToPath(import.meta.url)), './snapshot');

const clearSnapshotsDirectory = async () => {
  await fs.rmdir(snapshotDirectory, { recursive: true });
  await fs.mkdir(snapshotDirectory);
};

const prettyPrintTable = table => `${JSON.stringify(table, null, 4)}\n`;

const generateSnapshot = async knex => {
  let tables;
  let directoryRemovedPromise;

  await knex.transaction(async trx => {
    await trx.raw('lock table ??.?? in exclusive mode', ['admin', 'migrations']);

    directoryRemovedPromise = clearSnapshotsDirectory();

    tables = await helpers.getAllTablesAndColumns(trx);
  });

  await directoryRemovedPromise;

  const schemata = Object.keys(tables);
  await Promise.all(schemata.map(schema => fs.mkdir(resolve(snapshotDirectory, schema))));

  await Promise.all(
    schemata.flatMap(schema => {
      const schemaTables = tables[schema];

      if (!schemaTables) {
        return undefined;
      }

      return Object.entries(schemaTables).map(([tableName, table]) =>
        fs.writeFile(
          resolve(snapshotDirectory, schema, `${tableName}.json`),
          prettyPrintTable(table),
        ),
      );
    }),
  );
};

export default generateSnapshot;
