import { type IBusinessUnit, IBusinessLine, IServiceDaysAndTime } from '@root/types';

export type BusinessUnitFormRequest = Omit<IBusinessUnit, 'businessLines' | 'logoUrl'> & {
  businessLines?: Partial<IBusinessLine>[];
};

export type ServiceDaysFormRequest = {
  serviceDays: Partial<IServiceDaysAndTime>[];
};
