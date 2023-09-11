import { IBaseQuickView } from '@root/common/TableTools';
import {
  IBillableService,
  ILineItem,
  IMaterial,
  IThreshold,
  PercentageOrFlatTax,
} from '@root/types';

export type TaxRatesConfigType =
  | 'services'
  | 'recurringServices'
  | 'lineItems'
  | 'materials'
  | 'recurringLineItems';

export interface ITaxRatesQuickView
  extends Omit<IBaseQuickView, 'tbodyContainerRef' | 'newButtonRef'> {
  commercialTaxesUsed: boolean;
  onClose(): void;
}

export type FormikTaxItem = {
  id: number;
  value: string;
  description: string;
  enabled: boolean;
  isThreshold?: boolean;
};

export type FormikTax = PercentageOrFlatTax & {
  group: boolean;
  value: string;
  items: FormikTaxItem[];
  type: TaxRatesConfigType;
};

export type TaxGroupItem = ILineItem | IMaterial | IBillableService | IThreshold;
