export interface IInvoiceTableHeader {
  showCustomer?: boolean;
  selectable?: boolean;
  onSort(): void;
}
