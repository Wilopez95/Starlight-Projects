export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_business_unit_mail_settings (
    id int4,
    admin_email text,
    domain_id int4,
    business_unit_id int4,
    statements_from text,
    statements_reply_to text,
    statements_send_copy_to text,
    statements_subject text,
    statements_body text,
    invoices_from text,
    invoices_reply_to text,
    invoices_send_copy_to text,
    invoices_subject text,
    invoices_body text,
    notification_emails _text,
    invoices_disclaimer_text text,
    statements_disclaimer_text text,
    services_from text,
    services_reply_to text,
    services_send_copy_to text,
    services_subject text,
    services_body text,
    receipts_from text,
    receipts_reply_to text,
    receipts_send_copy_to text,
    receipts_subject text,
    receipts_body text,
    receipts_disclaimer_text text,
    created_at timestamp,
    updated_at timestamp,
    "domain" text)
  SERVER fdw_core OPTIONS(table_name 'business_unit_mail_settings')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_business_unit_mail_settings`);
};
