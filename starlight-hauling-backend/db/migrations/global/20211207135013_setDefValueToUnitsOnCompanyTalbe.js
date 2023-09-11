import { MEASUREMENT_UNIT } from '../../../consts/units.js';

export const up = async migrationBuilder => {
  await migrationBuilder.knex.raw(
    `update companies set unit = '${MEASUREMENT_UNIT.us}' where unit is null;`,
  );
  await migrationBuilder.alterTable('companies', t => {
    t.column('unit').text().notNullable().defaultTo(MEASUREMENT_UNIT.us).alter();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.knex.raw(`alter table companies alter column unit drop not null;`);
  await migrationBuilder.alterTable('companies', t => {
    t.column('unit').text().defaultTo(null).alter();
  });
};
