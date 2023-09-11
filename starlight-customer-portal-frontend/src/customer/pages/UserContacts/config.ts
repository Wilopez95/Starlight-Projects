import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import Contacts from './UserContacts';

export const UserContactsConfig: IRoute = {
  name: 'Users',
  entity: 'contacts',
  Component: Contacts,
  path: Paths.Users,
  header: true,
  exact: true,
};
