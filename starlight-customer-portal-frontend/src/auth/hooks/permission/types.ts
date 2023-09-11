export enum Action {
  Update = 'update',
  Create = 'create',
  View = 'view',
  List = 'list',
  Delete = 'delete',
}

export type EntityName =
  | 'profile'
  | 'statements'
  | 'payments'
  | 'invoices'
  | 'subscriptions'
  | 'contacts'
  | 'credit-cards'
  | 'reports';
