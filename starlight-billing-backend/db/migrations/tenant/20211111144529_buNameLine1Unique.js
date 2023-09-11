export const up = (migrationBuilder, schemaName) =>
  migrationBuilder.knex.raw(
    `ALTER TABLE ??.business_units
    ADD CONSTRAINT name_line_1_unique UNIQUE (name_line_1);`,
    [schemaName],
  );

export const down = migrationBuilder =>
  migrationBuilder.alterTable('business_units', t => {
    t.dropConstraint('name_line_1_unique');
  });
