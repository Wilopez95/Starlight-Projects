export interface IOrderSurchargeHistorical {
  materialId?: number;
  billableServiceId?: number | null;
  surchargeId?: number;
  billableLineItemId?: number | null;
  globalRatesSurchargesId?: number | null;
  customRatesGroupSurchargesId?: number | null;
  amount?: number;
  quantity: number;
  orderId: number;
}

export interface IOrderSurcharge {
  surchargeId: number;
  materialId?: number | null;
  globalRatesSurchargesId?: number | null;
  customRatesGroupSurchargesId?: number | null;
  amount?: number;
  quantity: number;
  billableServiceId?: number;
  billableLineItemId?: number;
}
