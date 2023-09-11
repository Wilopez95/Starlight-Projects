import { IBaseQuickView } from '@root/common/TableTools';

export interface ICustomRateQuickView extends Omit<IBaseQuickView, 'newButtonRef'> {
  onClose(): void;
}
