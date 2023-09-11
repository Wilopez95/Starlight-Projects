import { MeasurementType, MeasurementUnit, OrderType } from '../../../graphql/api';
import { CreateOrderFormValues } from '../components/CreateOrderForm';

export const defaultCreateOrderFormValues: CreateOrderFormValues = {
  type: OrderType.Dump,
  customer: null,
  project: null,
  material: null,
  customerJobSite: null,
  customerTruck: null,
  weightIn: null,
  weightInSource: null,
  weightInTimestamp: null,
  weightInType: MeasurementType.Hardware,
  weightInUnit: MeasurementUnit.Kilogram,
  WONumber: null,
};
