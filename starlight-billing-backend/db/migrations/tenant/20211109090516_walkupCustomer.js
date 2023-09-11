export const up = migrationBuilder =>
  migrationBuilder
    .alterTable('customers', t => {
      t.column('walkup').boolean().notNullable().defaultTo(false);

      t.column('card_connect_ids').arrayOf('text').notNullable().defaultTo('{}');
      t.column('fluid_pay_ids').arrayOf('text').notNullable().defaultTo('{}');
    })
    .alterTable('credit_cards', t => {
      t.column('customer_gateway_id').text();
    });

export const down = migrationBuilder =>
  migrationBuilder
    .alterTable('customers', t => {
      t.dropColumn('walkup');
      t.dropColumn('card_connect_ids');
      t.dropColumn('fluid_pay_ids');
    })
    .alterTable('credit_cards', t => {
      t.dropColumn('customer_gateway_id');
    });
