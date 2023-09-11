export interface IBillableSurcharge {
  id: number;
  businessLineId: number;
  active: boolean;
  description: string;
  calculation: string;
  materialBasedPricing?: boolean;
  createdAt: Date;
  updateAt: Date;
}
