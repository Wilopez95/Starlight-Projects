interface ISettlementTransaction {
    amount: number;
    adjustment: number;
    fee: number;
    customerName?: string;
    transactionNote?: string;
}
export interface ISettlementBuilder {
    transactions: ISettlementTransaction[];
    settlementDate: Date;
}
export {};
