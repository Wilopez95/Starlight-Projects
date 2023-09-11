import { ITaxCalculation } from '@root/types';

export interface ISummaryTaxItem {
  taxCalculation: ITaxCalculation;
  showLabels?: boolean;
}
