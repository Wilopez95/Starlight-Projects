import { IOrderRatesCalculateResponse } from '@root/api';
import { JsonConversions } from '@root/types/helpers/JsonConversions';

export interface IRightPanel {
  onRateRequest(
    lineItem?: { lineItemId: number; materialId?: number | null },
    materialId?: number,
  ): Promise<JsonConversions<IOrderRatesCalculateResponse> | null>;
}
