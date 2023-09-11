import { registerEnumType } from 'type-graphql';

enum CustomerType {
  COMMERCIAL = 'COMMERCIAL',
  WALKUP = 'WALKUP',
}

registerEnumType(CustomerType, { name: 'CustomerType' });

export default CustomerType;
