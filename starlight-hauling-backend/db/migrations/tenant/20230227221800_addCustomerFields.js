export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.customers add column main_phone_number text, add column card_connect_id text, add column fluid_pay_id text;`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(
    `ALTER TABLE if exists ??.customers drop column main_phone_number, drop column card_connect_id, drop column fluid_pay_id;`,
    [schema],
  );
};
