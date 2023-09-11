export const InvoiceFragment = `
  id
  dueDate
  createdAt
  csrName
  csrEmail
  total
  pdfUrl
  previewUrl
  balance
`;

export const InvoiceCustomer = `
  onAccount
  name
  status
  id
`;

export const getAllQuery = `
query getAllInvoices($offset: Int, $limit: Int, $sortBy: InvoiceSorting, $sortOrder: SortOrder, $from: String, $to: String, $openOnly: Boolean) {
  invoices(offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, from: $from, to: $to, openOnly: $openOnly)
  {
    ${InvoiceFragment}
    customer {
      ${InvoiceCustomer}
    }
  }
  invoicesCount
}`;
