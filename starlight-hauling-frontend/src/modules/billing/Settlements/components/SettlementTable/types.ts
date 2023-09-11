export interface ISettlementTableHeader {
  onSort(): void;
}

export interface ISettlementTable extends ISettlementTableHeader {
  tableBodyContainer?: React.RefObject<HTMLTableSectionElement>;
}
