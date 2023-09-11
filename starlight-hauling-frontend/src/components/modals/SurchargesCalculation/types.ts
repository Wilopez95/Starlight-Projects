import { IModal } from '@root/common/Modal/types';
import { INewOrderFormData } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import { INewRecurrentOrderFormData } from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import { Order } from '@root/stores/entities';
import {
  IBillableService,
  IConfigurableOrder,
  IMaterial,
  IOrderLineItem,
  IOrderThreshold,
  VersionedEntity,
} from '@root/types';

export interface ISurchargeModal extends IModal {
  detailsOrder?: Order;
  editOrder?: IConfigurableOrder;
  orders?: INewOrderFormData[];
  centered?: boolean;
  RecurrentOrder?: INewRecurrentOrderFormData;
}

export interface ISurchargesOrder {
  material?: VersionedEntity<IMaterial> | null;
  billableService?: VersionedEntity<IBillableService>;
  thresholds?: IOrderThreshold[];
  billableServiceId?: number | null;
  billableServicePrice?: number;
  billableServiceQuantity?: number;
  materialId?: number | null;
  billableServiceApplySurcharges?: boolean;
  lineItems?: IOrderLineItem | null;
}
