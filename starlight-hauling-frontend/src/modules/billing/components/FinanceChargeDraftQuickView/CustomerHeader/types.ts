import { ICustomerGroup, ICustomerWithFinalChargeDraft } from '../../../../../types';

export interface ICustomerHeader {
  customer: ICustomerWithFinalChargeDraft;
  customerGroup?: ICustomerGroup;
  removable: boolean;
  onRemove(): void;
}
