export interface IProcessServiceItemsResponse {
  price: number;
  serviceItemId: number;
  serviceName?: string;
  serviceItemsApplicable: unknown[];
  lineItemsProrationInfo: unknown[];
}
