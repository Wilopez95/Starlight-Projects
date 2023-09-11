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
      t.column('name').text();
      t.column('full_mailing_address').text();
      t.column('full_billing_address').text();
    })
    .alterTable('job_sites_historical', t => {
      t.column('full_address').text();
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
      t.column('full_billing_address').text();
    })
    .alterTable('job_sites_historical', t => {
      t.column('full_address').text();
    });
};
