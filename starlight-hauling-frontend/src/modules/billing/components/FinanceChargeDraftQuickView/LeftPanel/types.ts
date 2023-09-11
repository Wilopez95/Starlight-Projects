import { ICustomerWithFinalChargeDraft } from '../../../../../types';

export interface ILeftPanel {
  customers: ICustomerWithFinalChargeDraft[];
  currentCustomerIndex: number | null;
  onNavigationChange(index: number): void;
}
