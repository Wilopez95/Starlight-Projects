export interface ISettlementQuickView {
  tbodyContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  tableScrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export enum SettlementTabKey {
  settled = 'settled',
  unconfirmed = 'unconfirmed',
}
