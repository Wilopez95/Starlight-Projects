import { resolve } from 'path';
import { promises as fs } from 'fs';
import { getAllTablesAndColumns } from '../utils/dbMetadata.js';

const snapshotDirectory = resolve(process.cwd(), './db/snapshot');

const clearSnapshotsDirectory = async () => {
  await fs.rm(snapshotDirectory, { recursive: true });
  await fs.mkdir(snapshotDirectory);
};

const prettyPrintTable = table => `${JSON.stringify(table, null, 4)}\n`;

const writeSnapshots = async knex => {
  const directoryRemovedPromise = clearSnapshotsDirectory();
  const tables = await getAllTablesAndColumns(knex);

  await directoryRemovedPromise;

  const schemata = Object.keys(tables);
  await Promise.all(schemata.map(schema => fs.mkdir(resolve(snapshotDirectory, schema))));

  await Promise.all(
    schemata.flatMap(schema => {
      const schemaTables = tables[schema];

      if (!schemaTables) {
        return Promise.resolve();
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

export default writeSnapshots;
