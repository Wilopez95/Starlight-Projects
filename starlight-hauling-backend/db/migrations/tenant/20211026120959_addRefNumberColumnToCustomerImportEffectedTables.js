export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['customers', 'customers_historical', 'job_sites', 'job_sites_historical'],
    t => {
      t.column('reference_number').text();
    },
  );
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTables(
    ['customers', 'customers_historical', 'job_sites', 'job_sites_historical'],
    t => {
      t.dropColumn('customer_ref_number');
    },
  );
};
