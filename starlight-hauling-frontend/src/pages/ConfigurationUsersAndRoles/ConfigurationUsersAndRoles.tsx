import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';

import { TablePageContainer } from '@root/common/TableTools';

import RolesPage from './components/Role/RolesPage';
import UsersPage from './components/User/UsersPage';
import { rolesPath, usersPath } from './navigationConfig';

export const ConfigurationUsersAndRoles: React.FC = () => {
  const { t } = useTranslation();

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.UsersAndRoles')} />

      <Switch>
        <Route path={usersPath}>
          <UsersPage />
        </Route>
        <Route path={rolesPath}>
          <RolesPage />
        </Route>
        <Route path="*">
          <Redirect to={usersPath} />
        </Route>
      </Switch>
    </TablePageContainer>
  );
};
