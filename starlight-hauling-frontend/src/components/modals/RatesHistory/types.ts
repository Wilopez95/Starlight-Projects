import { IModal } from '@root/common/Modal/types';

export interface RatesHistoryModalProps extends IModal {
  title?: string;
  onClose(): void;
}
