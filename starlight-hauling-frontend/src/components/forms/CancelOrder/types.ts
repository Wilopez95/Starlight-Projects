export interface ICancelOrderData {
  addTripCharge: boolean;
  reasonType: number | string;
  comment?: string;
}

export enum CancelOrderTypesEnum {
  Order = 'Order',
  SubscriptionOrder = 'SubscriptionOrder',
}
export interface ICancelOrderProps {
  orderType?: CancelOrderTypesEnum;
}
