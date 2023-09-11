export interface ILandfillSyncRequest {
  recyclingTenantName: string;
  haulingOrderId: number;
  recyclingOrderId: number;
  businessUnitId?: number;
}
