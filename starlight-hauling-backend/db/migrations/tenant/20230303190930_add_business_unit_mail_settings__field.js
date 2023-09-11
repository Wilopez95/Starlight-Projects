export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.business_unit_mail_settings add column domain text;`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.business_unit_mail_settings drop column domain;`,
    [schema],
  );
};
