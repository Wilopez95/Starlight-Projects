import { CalcOrderTaxesInput } from '@root/helpers';
import { INewOrderService } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';

export type TaxesCalculationModalProps = CalcOrderTaxesInput & {
  service: Pick<INewOrderService, 'billableServiceId' | 'materialId'> & {
    hasServiceAppliedSurcharges: boolean | undefined;
    billableServiceQuantity?: number;
  };
  isOpen: boolean;
  businessLineId: string;
  applySurcharges: boolean;
  serviceName?: string;
  materialName?: string;
  isOrderCanceled?: boolean;
  centered?: boolean;
  onClose(): void;
};
