import { ACCOUNT_TYPES } from '../../../consts/qbAccountTypes.js';

export const up = async migrationBuilder => {
  //IM NOT ADDING UNIQUE BACK ON MIGRATION DOWN BECAUSE IT WAS NOT INTENDED TO BE A UNIQUE AND NO RECORDS GET BROKEN WITH THIS CHANGE
  await migrationBuilder.knex.schema.table('quick_books_configuration', t => {
    t.dropUnique('tenant_id');
  });
  await migrationBuilder.alterTable('quick_books_configuration', t => {
    t.column('owner_id').text();
    t.column('file_id').text();
    t.renameColumn('default_account_income(_credit)', 'default_account_income');
    t.renameColumn('default_account_tax(_credit)', 'default_account_tax');
    t.renameColumn('default_account_fin_charges(_credit)', 'default_account_fin_charges');
    t.renameColumn('writeoff_account(_debit)', 'writeoff_account');
    t.renameColumn('credit_memo_account(_debit)', 'credit_memo_account');
  });
  await migrationBuilder.dropTable('quick_books_accounts');
  await migrationBuilder.createTable('quick_books_services', t => {
    t.column('id').integer().identity();
    t.column('configuration_id').integer().notNullable().references('quick_books_configuration');
    t.column('description').text();
    t.column('type')
      .text()
      .in(...ACCOUNT_TYPES)
      .notNullable();
    t.column('customer_group').text();
    t.column('customer_group_id').integer();
    t.column('account_name').text();
    t.column('district_type').text();
    t.timestamps();
  });
  await migrationBuilder.createTable('quick_books_accounts', t => {
    t.column('id').integer().identity();
    t.column('integration_id').integer();
    t.column('quick_books_id').text();
    t.column('name').text();
    t.column('full_name').text();
    t.column('type').text();
    t.timestamps();
  });
  await migrationBuilder.alterTable('quick_books_services', t => {
    t.column('line_of_bussiness_id').text();
    t.column('subscription_billing_cycle').text();
    t.column('material_id').text();
    t.column('equipment_id').text();
    t.column('payment_method_id').text();
  });
  await migrationBuilder.knex.schema.table('quick_books_accounts', t => {
    t.unique(['integration_id', 'name']);
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('quick_books_configuration', t => {
    t.dropColumn('owner_id');
    t.dropColumn('file_id');
    t.renameColumn('default_account_income', 'default_account_income(_credit)');
    t.renameColumn('default_account_tax', 'default_account_tax(_credit)');
    t.renameColumn('default_account_fin_charges', 'default_account_fin_charges(_credit)');
    t.renameColumn('writeoff_account', 'writeoff_account(_debit)');
    t.renameColumn('credit_memo_account', 'credit_memo_account(_debit)');
  });
  await migrationBuilder.dropTable('quick_books_accounts');
  await migrationBuilder.dropTable('quick_books_services');
  await migrationBuilder.createTable('quick_books_accounts', t => {
    t.column('id').integer().identity();
    t.column('configuration_id').integer().notNullable().references('quick_books_configuration');
    t.column('description').text();
    t.column('type')
      .text()
      .in(...ACCOUNT_TYPES)
      .notNullable();
    t.column('customer_group').text();
    t.column('customer_group_id').integer();
    t.column('account_name').text();
    t.column('district_type').text();
    t.timestamps();
  });
};
