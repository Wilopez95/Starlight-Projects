import Order from '../modules/recycling/entities/Order';

export enum AUDIT_LOG_ACTION {
  CREATE = 'create',
  MODIFY = 'modify',
  DELETE = 'delete',
}

const orderFields: Array<keyof Order> = [
  'id',
  'arrivedAt',
  'departureAt',
  'weightIn',
  'weightOut',
  'haulingOrderId',
  'materialId',
  'originDistrictId',
  'destinationId',
  'materialsDistribution',
  'miscellaneousMaterialsDistribution',
  'createdAt',
  'updatedAt',
];

export const AUDIT_LOG_ENTITY_MAPPER: { [entityName: string]: any[] } = {
  Order: orderFields,
};
