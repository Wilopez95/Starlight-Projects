export const up = async migrationBuilder => {
  await migrationBuilder
    .alterTable('customers_historical', t => {
      t.dropColumn('name');
      t.dropColumn('full_mailing_address');
      t.dropColumn('full_billing_address');
    })
    .alterTable('job_sites_historical', t => {
      t.dropColumn('full_address');
    });

  await migrationBuilder
    .alterTable('customers_historical', t => {
      t.column('name').text().generated(`coalesce(business_name, first_name || ' ' || last_name)`);
      t.column('full_mailing_address').text().notNullable()
        .generated(`(mailing_address_line_1 || ' '
            || coalesce(mailing_address_line_2 || ' ', '')
            || mailing_city || ' ' || mailing_state || ' ' || mailing_zip)`);
      t.column('full_billing_address').text().notNullable()
        .generated(`(billing_address_line_1 || ' '
            || coalesce(billing_address_line_2 || ' ', '')
            || billing_city || ' ' || billing_state || ' ' || billing_zip)`);
    })
    .alterTable('job_sites_historical', t => {
      t.column('full_address').text().notNullable()
        .generated(`(address_line_1 || ' ' || coalesce(address_line_2 || ' ', '')
            || city || ' ' || state || ' ' || zip)`);
    });
};

export const down = async migrationBuilder => {
  await migrationBuilder
    .alterTable('customers_historical', t => {
      t.dropColumn('name');
      t.dropColumn('full_mailing_address');
      t.dropColumn('full_billing_address');
    })
    .alterTable('job_sites_historical', t => {
      t.dropColumn('full_address');
    });

  await migrationBuilder
    .alterTable('customers_historical', t => {
      t.column('name').text();
      t.column('full_mailing_address').text();
      t.column('full_billing_address').text().notNullable();
    })
    .alterTable('job_sites_historical', t => {
      t.column('full_address').text().notNullable();
    });
};
