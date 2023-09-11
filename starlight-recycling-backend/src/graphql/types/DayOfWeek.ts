import { registerEnumType } from 'type-graphql';

export enum DayOfWeek {
  Mo = 'Mo',
  Tu = 'Tu',
  We = 'We',
  Th = 'Th',
  Fr = 'Fr',
  Sa = 'Sa',
  Su = 'Su',
}

export enum DayToDayOfWeek {
  monday = 'Mo',
  tuesday = 'Tu',
  wednesday = 'We',
  thursday = 'Th',
  friday = 'Fr',
  saturday = 'Sa',
  sunday = 'Su',
}

registerEnumType(DayOfWeek, { name: 'DayOfWeek' });
