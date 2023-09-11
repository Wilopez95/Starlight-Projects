export interface IInvoiceTableHeader {
  tableScrollContainer: React.RefObject<HTMLDivElement>;
  selectable?: boolean;
  onSort(): void;
}
