export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('generation_jobs', t => {
    t.column('start_time').timestamp();
    t.column('end_time').timestamp();
    t.column('duration_in_sec').integer();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('generation_jobs', t => {
    t.dropColumn('start_time');
    t.dropColumn('end_time');
    t.dropColumn('duration_in_sec');
  });
};
