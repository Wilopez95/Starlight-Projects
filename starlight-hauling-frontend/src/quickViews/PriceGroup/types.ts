import { IBaseQuickView } from '@root/common/TableTools';

export interface IPriceGroupQuickView extends Omit<IBaseQuickView, 'newButtonRef'> {
  onClose(): void;
}

export type RatesConfigType =
  | 'services'
  | 'recurringServices'
  | 'lineItems'
  | 'recurringLineItems'
  | 'thresholds'
  | 'surcharges';
