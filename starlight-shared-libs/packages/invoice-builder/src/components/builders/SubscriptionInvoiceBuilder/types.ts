import { ICustomer } from 'packages/invoice-builder/src/types';

import { ISubsBuilder } from '../types';

export interface IInvoiceBuilder extends ISubsBuilder {
  preview: boolean;
  customer: ICustomer;
}
