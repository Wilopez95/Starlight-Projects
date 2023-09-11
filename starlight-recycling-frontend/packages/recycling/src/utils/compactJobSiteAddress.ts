import { compact } from 'lodash-es';
import { HaulingJobSiteAddress } from '../graphql/api';

export default function (
  address: Pick<HaulingJobSiteAddress, 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zip'>,
) {
  return compact([
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zip,
  ]).join(', ');
}
