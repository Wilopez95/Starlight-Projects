import { ICustomerBalances } from '@root/stores/customer/type';

export interface ICustomerInfoBlock {
  ordersTotal: number;
  readOnly?: boolean;
  onClear(): void;
}

export interface ICustomerInfoBalanceItem {
  label: string;
  key: keyof ICustomerBalances | 'ordersTotal';
  tooltip?: string;
  bold?: boolean;
  highlightNegativeValue?: boolean;
}
