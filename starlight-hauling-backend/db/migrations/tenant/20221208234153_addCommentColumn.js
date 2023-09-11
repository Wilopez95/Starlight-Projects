export const up = async migrationBuilder => {
  await migrationBuilder.alterTables(['job_sites', 'job_sites_historical'], t => {
    t.column('comment').text();
  });
};

export const down = async migrationBuilder => {
  migrationBuilder.alterTables(['job_sites', 'job_sites_historical'], t => {
    t.drop('comment');
  });
};
