import { IFinanceChargeDraftData } from '@root/modules/billing/types';

import { IModal } from '../../../../../common/Modal/types';

export interface IStatusModal extends IModal {
  data: IFinanceChargeDraftData[];
}
