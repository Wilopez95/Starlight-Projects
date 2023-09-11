import type { IAddress, ICustomer, IOrder, IInvoicingSubscriptions } from '../../types';
export interface IBuilder {
    customer: ICustomer;
    orders: IOrder[];
    logoUrl?: string;
    physicalAddress?: IAddress;
    preview?: boolean;
}
export interface ISubsBuilder {
    payments?: number;
    logoUrl?: string;
    physicalAddress?: IAddress;
    attachMediaPref?: boolean;
    customerId?: number;
    subscriptions?: IInvoicingSubscriptions[];
}
