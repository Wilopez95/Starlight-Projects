export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`CREATE FOREIGN TABLE ${schema}.f_customer_job_site (
      id int4,
      active bool,
      job_site_id int4,
      customer_id int4,
      popup_note text,
      po_required bool,
      permit_required bool,
      signature_required bool,
      alley_placement bool,
      cab_over bool,
      send_invoices_to_job_site bool,
      invoice_emails _text,
      created_at timestamp,
      updated_at timestamp,
      work_order_notes text)
    SERVER fdw_core OPTIONS(table_name 'customer_job_site')`);
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.raw(`DROP FOREIGN TABLE ${schema}.f_customer_job_site`);
};
