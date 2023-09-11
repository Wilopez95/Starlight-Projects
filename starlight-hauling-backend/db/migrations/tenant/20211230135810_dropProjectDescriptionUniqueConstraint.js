import { getDuplicatedRecordsIds, removeWhereIn } from '../../../utils/dbHelpers.js';

export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('projects', t => {
    t.dropConstraint('projects_description_unique');
  });
};

export const down = async migrationBuilder => {
  const { knex } = migrationBuilder;

  const duplicatedRecordsIds = await getDuplicatedRecordsIds({
    knex,
    table: 'projects',
    uniqueKeyFields: ['description'],
  });
  await removeWhereIn({
    knex,
    table: 'projects',
    field: 'id',
    values: duplicatedRecordsIds,
  });

  await migrationBuilder.alterTable('projects', t => {
    t.unique(['description'], {
      constraint: true,
      indexName: 'projects_description_unique',
    });
  });
};
