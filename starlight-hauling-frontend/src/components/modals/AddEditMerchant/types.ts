import { IMerchantInput } from '@root/components/forms/AddEditMerchant/types';

import { IFormModal } from '../types';

export interface IAddEditMerchantModal extends IFormModal<IMerchantInput> {
  hasApprovedMerchant: boolean;
  title: string;
  initialValues?: Partial<IMerchantInput>;
}
