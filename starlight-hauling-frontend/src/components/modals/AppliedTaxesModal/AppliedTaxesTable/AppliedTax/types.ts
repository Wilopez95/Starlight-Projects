import { ITaxCalculation } from '@root/types';

export interface IAppliedTax {
  taxCalculation: ITaxCalculation;
  showLabels?: boolean;
}
