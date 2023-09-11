import { IForm } from '../types';

export interface IMerchantInput {
  mid: string | null;
  username: string | null;
  password: string | null;
}

export interface IAddEditMerchantForm extends IForm<IMerchantInput> {
  hasApprovedMerchant: boolean;
  title: string;
  initialValues?: Partial<IMerchantInput>;
}
