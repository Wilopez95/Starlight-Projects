export const up = async migrationBuilder => {
  await migrationBuilder.createTable('linked_customers', t => {
    t.column('id').integer().identity();
    t.column('customer_id').integer().notNullable().references('customers');
    t.column('linked_customer_id').integer().notNullable().references('customers');

    t.unique(['customer_id', 'linked_customer_id']);
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.dropTable('linked_customers');
};
