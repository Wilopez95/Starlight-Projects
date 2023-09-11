export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(['customer_job_site', 'customer_job_site_historical'], t => {
    t.column('sales_id').text();
  });
};

export const down = async migrationBuilder => {
  migrationBuilder.alterTables(['customer_job_site', 'customer_job_site_historical'], t => {
    t.drop('sales_id');
  });
};
