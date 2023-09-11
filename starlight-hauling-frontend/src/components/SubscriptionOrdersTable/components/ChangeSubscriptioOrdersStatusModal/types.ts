import { type IModal } from '@root/common/Modal/types';
import { type INeedsApprovalOrApprovedStatus } from '@root/types';

export interface IChangeSubscriptionOrdersStatusModal extends IModal {
  invalidCount: number;
  showValidOnly: boolean;
  status: INeedsApprovalOrApprovedStatus;
  handleChangeStatus(isValid: boolean): void;
}
