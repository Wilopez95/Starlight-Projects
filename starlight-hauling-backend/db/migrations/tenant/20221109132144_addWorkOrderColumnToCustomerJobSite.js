export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('customer_job_site', t => {
    t.column('work_order_notes').text();
  });
  await migrationBuilder.alterTable('customer_job_site_historical', t => {
    t.column('work_order_notes').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('customer_job_site', t => {
    t.dropColumn('work_order_notes');
  });
  await migrationBuilder.alterTable('customer_job_site_historical', t => {
    t.dropColumn('work_order_notes');
  });
};
