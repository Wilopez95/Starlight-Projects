import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ExcelJS from 'exceljs';

import knex from '../db/connection.js';
import { logger } from '../utils/logger.js';
import writeSnapshots from '../db/generateSnapshot.js';
import { getAllTablesAndColumns } from '../db/dbMetadata.js';

process.once('unhandledRejection', error => {
  logger.error(error.message);
  throw error;
});

const isUnique = (prop, constraints) =>
  Object.values(constraints).some(
    constraint => constraint.startsWith('UNIQUE') && constraint.includes(prop),
  );

const allowedValues = (prop, constraints) =>
  Object.values(constraints)
    .filter(constraint => constraint.startsWith('CHECK') && constraint.includes(prop))
    .flatMap(constraint =>
      /[=] ?ANY ?\( ?ARRAY\[/.test(constraint)
        ? Array.from(constraint.matchAll(/('(?<values>\w+)'::\w+),?/g))
        : [],
    )
    .flatMap(({ groups: { values } }) => values)
    .join('; ');

const convertProperties = (name, properties, constraints) => {
  const { type, isNullable, defaultTo } = properties;
  return [
    name,
    type,
    isNullable ? 'true' : '',
    isUnique(name, constraints) ? 'true' : '',
    defaultTo,
    allowedValues(name, constraints),
  ];
};

yargs(hideBin(process.argv))
  .usage('Usage: yarn snapshot <command> [options]')
  .command('generate', 'Update DB snapshots', async () => {
    await writeSnapshots(knex);
    logger.info('Successfully generated snapshots!');

    knex.destroy();
  })
  .command(
    'export',
    'Export DB snapshots to a spreadsheet',
    y =>
      y
        .option('schema', {
          type: 'string',
          default: 'tenant',
          describe: 'Database schema for export',
        })
        .option('output', {
          alias: 'o',
          default: 'db_snapshot.xlsx',
          type: 'string',
          describe: 'The file to write the spreadsheet to',
        }),
    async args => {
      const allTables = await getAllTablesAndColumns(knex);
      const tables = allTables[args.schema];
      const workbook = new ExcelJS.Workbook();
      const columnsConfig = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Optional', key: 'isNullable', width: 10 },
        { header: 'Unique', key: 'isUnique', width: 10 },
        { header: 'Default value', key: 'defaultTo', width: 30 },
        { header: 'Allowed values', key: 'allowedValues', width: 80 },
      ];

      const similarTableNames = Object.keys(tables).reduce((acc, table) => {
        const truncated = table.slice(0, 25);

        if (!acc[truncated]) {
          acc[truncated] = [];
        }

        acc[truncated].push(table);

        return acc;
      }, {});

      const formattedTableNames = {};

      Object.entries(similarTableNames).forEach(([key, names]) => {
        if (names.length === 1) {
          formattedTableNames[names[0]] = key;
          return;
        }

        names.forEach((name, index) => {
          const suffix = `_${index}`;
          formattedTableNames[name] = key + suffix;
        });
      });

      Object.entries(tables).forEach(([tableName, { attributes, constraints }]) => {
        const sheet = workbook.addWorksheet(formattedTableNames[tableName]);

        sheet.columns = columnsConfig;
        sheet.addRows(
          Object.entries(attributes)
            .filter(column => column[0] !== 'created_at' && column[0] !== 'updated_at')
            .map(([name, properties]) => convertProperties(name, properties, constraints)),
        );
        sheet.insertRow(1, [tableName], '0');
      });

      await workbook.xlsx.writeFile(args.output);

      knex.destroy();
    },
  )
  .example('yarn snapshot generate', 'Re-generate DB snapshots')
  .demandCommand()
  .recommendCommands()
  .strict()
  .help('h')
  .alias('h', 'help').argv;
