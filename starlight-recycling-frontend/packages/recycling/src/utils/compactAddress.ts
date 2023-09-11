import { CustomerAddress } from '../graphql/api';
import { compact } from 'lodash-es';

export default function (address: CustomerAddress) {
  return compact([
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zip,
  ]).join(', ');
}
