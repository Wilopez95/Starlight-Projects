export const up = async migrationBuilder => {
  await migrationBuilder.knex.raw(`create extension if not exists "uuid-ossp"`);
};

export const down = async migrationBuilder => {
  await migrationBuilder.knex.raw(`drop extension if exists "uuid-ossp"`);
};
