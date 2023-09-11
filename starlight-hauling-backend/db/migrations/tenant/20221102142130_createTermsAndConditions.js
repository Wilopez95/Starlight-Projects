export const up = async migrationBuilder => {
  const { knex } = migrationBuilder;

  await migrationBuilder.createTable('terms_and_conditions', t => {
    t.column('id').integer().identity();
    t.column('tc_ack').boolean().notNullable().defaultTo(false);
    t.column('tc_ack_timestamp').timestamp().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.column('tc_ack_pdf_url').text();
    t.column('tc_phone').text();
    t.column('tc_email').text();
    t.column('tc_req_id').uuid().defaultTo(knex.raw('uuid_generate_v4()'));
    t.check(
      `("tc_ack" = true AND "tc_ack_pdf_url" IS NOT NULL) OR ("tc_ack" = false AND "tc_ack_pdf_url" IS NULL)`,
    );
  });

  await migrationBuilder.alterTable('business_units', t => {
    t.column('tc_flag').boolean().notNullable().defaultTo(false);
    t.column('tc_text').text();
    t.check(
      `("tc_flag" = false and "tc_text" IS NULL) or ("tc_flag" = true and "tc_text" IS NOT NULL)`,
    );
  });

  await migrationBuilder.alterTable('customers', t => {
    t.column('tc_id').integer().references('terms_and_conditions');
  });

  await migrationBuilder.alterTable('customers_historical', t => {
    t.column('tc_id').integer();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('terms_and_conditions');

  await migrationBuilder.alterTable('business_units', t => {
    t.drop_column('tc_flag');
    t.drop_column('tc_text');
  });

  await migrationBuilder.alterTable('customers', t => {
    t.drop_column('tc_id');
  });

  await migrationBuilder.alterTable('customers_historical', t => {
    t.drop_column('tc_id');
  });
};
