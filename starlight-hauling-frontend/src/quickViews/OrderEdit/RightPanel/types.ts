import { IOrderRatesCalculateResponse } from '@root/api';
import { JsonConversions } from '@root/types';

export interface IOrderEditRightPanel {
  onRateRequest(
    lineItem?: { lineItemId: number; materialId?: number | null },
    materialId?: number,
  ): Promise<JsonConversions<IOrderRatesCalculateResponse> | null>;
}

export interface IOrderEditQuickView {
  isDeferredPage?: boolean;
}
