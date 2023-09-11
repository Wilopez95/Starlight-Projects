import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import Profile from './Profile';

export const ProfilePageConfig: IRoute = {
  Component: Profile,
  entity: 'profile',
  name: 'Profile',
  path: Paths.Profile,
  header: true,
  exact: true,
};
