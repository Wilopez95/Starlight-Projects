import {
  MeasurementType,
  MeasurementUnit,
  OrderType,
  PaymentMethodType,
} from '../../../graphql/api';
import { CreateOrderFormValues } from '../../YardOperationConsole/components/CreateOrderForm';

export const defaultCreateOrderFormValues: CreateOrderFormValues = {
  type: OrderType.Dump,
  customer: null,
  project: null,
  material: null,
  customerJobSite: null,
  weightIn: 0,
  weightInSource: null,
  weightInTimestamp: null,
  weightInType: MeasurementType.Hardware,
  weightInUnit: MeasurementUnit.Kilogram,
  isSelfService: true,
  paymentMethod: PaymentMethodType.OnAccount,
  WONumber: null,
  containerWeight: 0,
};
