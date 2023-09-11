import type { IBusinessUnit } from '@root/core/types';

export type BusinessUnitRequest = Omit<IBusinessUnit, 'businessLines'>;
export type BusinessUnitFormRequest = Omit<IBusinessUnit, 'businessLines' | 'logoUrl'>;
