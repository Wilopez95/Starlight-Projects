import { IBusinessUnit } from '@root/types';

export type BusinessUnitRequest = Omit<IBusinessUnit, 'businessLines'>;
export type BusinessUnitFormRequest = Omit<IBusinessUnit, 'businessLines' | 'logoUrl'>;
