export enum AuditAction {
  create = 'create',
  modify = 'modify',
  delete = 'delete',
}

export enum AuditEntity {
  'Payout' = 'Payout',
  'Payment' = 'Payment',
  'CreditMemo' = 'CreditMemo',
  'WriteOff' = 'WriteOff',
  'ReversedPayment' = 'ReversedPayment',
  'Invoice' = 'Invoice',
  'CreditCard' = 'CreditCard',
  'BatchStatement' = 'BatchStatement',
  'Statement' = 'Statement',
  'Settlement' = 'Settlement',
  'BankDeposit' = 'BankDeposit',
  'User' = 'User',
  'Role' = 'Role',
  'Promo' = 'Promo',
  'Permit' = 'Permit',
  'ServiceArea' = 'ServiceArea',
  'CustomRatesGroup' = 'CustomRatesGroup',
  'EquipmentItem' = 'EquipmentItem',
  'Material' = 'Material',
  'MaterialProfile' = 'MaterialProfile',
  'Threshold' = 'Threshold',
  'Surcharge' = 'Surcharge',
  'LineItem' = 'LineItem',
  'RecurringLineItem' = 'RecurringLineItem',
  'Service' = 'Service',
  'RecurringService' = 'RecurringService',
  'Broker' = 'Broker',
  'CustomerGroup' = 'CustomerGroup',
  'ThirdPartyHauler' = 'ThirdPartyHauler',
  'DisposalSite' = 'DisposalSite',
  'BusinessLine' = 'BusinessLine',
  'BusinessUnit' = 'BusinessUnit',
  'Company' = 'Company',
  'GeneralRackRates.Service' = 'GeneralRackRates.Service',
  'GeneralRackRates.LineItem' = 'GeneralRackRates.LineItem',
  'GeneralRackRates.Threshold' = 'GeneralRackRates.Threshold',
  'GeneralRackRates.Surcharge' = 'GeneralRackRates.Surcharge',
  'CustomRackRates.Service' = 'CustomRackRates.Service',
  'CustomRackRates.LineItem' = 'CustomRackRates.LineItem',
  'CustomRackRates.Threshold' = 'CustomRackRates.Threshold',
  'CustomRackRates.Surcharge' = 'CustomRackRates.Surcharge',
  'JobSite' = 'JobSite',
  'Customer' = 'Customer',
  'CustomerJobSitePair' = 'CustomerJobSitePair',
  'Project' = 'Project',
  'Contact' = 'Contact',
  'TaxDistrict' = 'TaxDistrict',
  'MaterialCode' = 'MaterialCode',
  'Order' = 'Order',
  'LandfillOperation' = 'LandfillOperation',
  'RecurrentOrderTemplate' = 'RecurrentOrderTemplate',
  'MasterRoute' = 'MasterRoute',
  'Driver' = 'Driver',
  'TruckType' = 'TruckType',
  'Truck' = 'Truck',
  'SubscriptionOrder' = 'SubscriptionOrder',
}

export const entities = Object.keys(AuditEntity);

type EntityData = {
  [key: string]: object;
};

export interface IAuditLogEntry {
  id: string;
  entityId: string;
  businessUnitId: number | null;
  userId: string;
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  timestamp: string;
  data: EntityData;
}
