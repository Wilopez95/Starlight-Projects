import { type IModal } from '@root/common/Modal/types';
import { RequestOptions } from '@root/stores/order/types';
import { type CompletedOrApproved } from '@root/types';

export interface IChangeStatusModal extends IModal {
  status: CompletedOrApproved;
  invalidCount: number;
  requestOptions: RequestOptions;
}
