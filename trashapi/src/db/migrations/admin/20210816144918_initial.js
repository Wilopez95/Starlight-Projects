export const up = async knex => {
  // squashed on 20.10.2021
  await knex.schema.createTable('tenants', (table) => {
    table.increments('id').primary();

    table.text('name').notNullable().unique();
    table.text('legal_name').notNullable().unique();

    table
      .timestamp('created_date')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('modified_date')
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').unsigned().unique();
    table
      .foreign('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.text('logo_url');
    table.text('official_website');
    table.text('phone');

    table.text('physical_address_line_1');
    table.text('physical_address_line_2');
    table.text('physical_city');
    table.text('physical_state');
    table.text('physical_zip');

    table
      .timestamp('created_date')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('modified_date')
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('company_configs', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').unsigned().unique();
    table
      .foreign('tenant_id')
      .references('id')
      .inTable('tenants')
      .onDelete('CASCADE');

    table.string('twilio_number', 15);
    table
      .boolean('enable_signature')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('enable_manifest')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('enable_whip_around')
      .notNullable()
      .defaultTo(false);
    table
      .boolean('enable_wingmate')
      .notNullable()
      .defaultTo(false);

    table
      .timestamp('created_date')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('modified_date')
      .notNullable()
      .defaultTo(knex.fn.now());
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('company_configs');
  await knex.schema.dropTableIfExists('companies');
  await knex.schema.dropTableIfExists('tenants');
};
