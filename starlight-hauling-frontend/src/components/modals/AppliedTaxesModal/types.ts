import { IModal } from '@starlightpro/shared-components';

import { ITaxesInfo } from '@root/types';

export interface IAppliedTaxesModal extends Pick<IModal, 'isOpen' | 'onClose'> {
  taxesInfo: ITaxesInfo;
}
