import { OrderStoreStatusType } from '@root/types';

export const baseRoutingConfig: {
  label: string;
  value: OrderStoreStatusType;
}[] = [
  { label: 'In Progress', value: 'inProgress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Approved', value: 'approved' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Invoiced', value: 'invoiced' },
];
