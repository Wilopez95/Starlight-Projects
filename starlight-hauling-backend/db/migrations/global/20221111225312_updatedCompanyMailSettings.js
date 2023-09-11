export const up = async migrationBuilder => {
  await migrationBuilder.alterTable('admin', 'company_mail_settings', t => {
    t.column('terms_and_conditions_from').text();
    t.column('terms_and_conditions_reply_to').text();
    t.column('terms_and_conditions_subject').text();
    t.column('terms_and_conditions_body').text();
  });
};

export const down = async migrationBuilder => {
  await migrationBuilder.alterTable('admin', 'company_mail_settings', t => {
    t.drop_column('terms_and_conditions_from').text();
    t.drop_column('terms_and_conditions_reply_to').text();
    t.drop_column('terms_and_conditions_subject').text();
    t.drop_column('terms_and_conditions_body').text();
  });
};
