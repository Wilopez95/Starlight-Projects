import { OrderActionType, OrderStatusType } from '@root/types';

export type ButtonConfig = Record<OrderStatusType, OrderActionType[]>;

export interface IBaseButton {
  config: OrderActionType[];
}

export interface ILeftButton extends IBaseButton {
  onCancel(): void;
  onUnapprove(): void;
  onUnfinalize(): void;
}

export interface IMainButton extends IBaseButton {
  onComplete(): void;
  onFinalize(): void;
}

export interface IRightButton extends IBaseButton {
  onClick(): void;
  onApprove(): void;
}
