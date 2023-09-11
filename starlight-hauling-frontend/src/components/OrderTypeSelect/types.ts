import { BusinessLineType, ClientRequestType } from '@root/consts';
import { SvgComponent } from '@root/types';

export interface IOrderType {
  icon: SvgComponent;
  type: ClientRequestType;
  title: string;
  subtitle?: string;
  disabled?: boolean;
  onClick(type: ClientRequestType): void;
}

export interface IOrderTypeSelect {
  businessLineType: BusinessLineType;
  onOrderTypeSelect(type: ClientRequestType): void;
}
