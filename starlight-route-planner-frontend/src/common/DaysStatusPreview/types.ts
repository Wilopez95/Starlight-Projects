export enum Status {
  'active' = 'active',
  'inactive' = 'inactive',
  'disabled' = 'disabled',
}

export type DaysIndexes = '0' | '1' | '2' | '3' | '4' | '5' | '6';
export type ServiceDaysOfWeek = {
  [key: number]: ServiceDaysOfWeekValue;
};

export type ServiceDaysOfWeekValue = {
  requiredByCustomer: boolean;
  route?: string;
};

export interface IDaysStatusPreview {
  serviceDaysOfWeek?: ServiceDaysOfWeek;
  assignedServiceDaysList?: number[];
  serviceDaysList?: number[];
  onClick?: (string: string) => void;
  // isLinked prop tell which color paint
  isLinked?: boolean;
}

export type ParsedDay = {
  value: number;
  type: Status;
  isAssigned?: boolean;
  requiredByCustomer?: boolean;
  route?: string;
};

export type ParsedDaysList = {
  [key: number]: ParsedDay;
};
