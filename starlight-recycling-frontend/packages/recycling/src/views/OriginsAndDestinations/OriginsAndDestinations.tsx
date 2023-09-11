import React from 'react';
import { Trans } from '../../i18n';
import Tabs from '@material-ui/core/Tabs';
import { Switch, Link, Redirect, useLocation } from 'react-router-dom';
import { ProtectedRoute, ProtectedTab } from '@starlightpro/common';

import Destinations from './Destinations';
import Origins from './Origins';

export const OriginsAndDestinations = () => {
  const location = useLocation();
  const path = location.pathname.replace(/\/((origins|destinations)*$)/gm, '');

  const title = <Trans>Origins and Destinations</Trans>;
  const tabs = (
    <Tabs value={location.pathname} indicatorColor="primary">
      <ProtectedTab
        permissions="recycling:Origin:list"
        component={Link}
        label={<Trans>Origins</Trans>}
        value={`${path}/origins`}
        to={`${path}/origins`}
      />
      <ProtectedTab
        permissions="recycling:Destination:list"
        component={Link}
        label={<Trans>Destinations</Trans>}
        value={`${path}/destinations`}
        to={`${path}/destinations`}
      />
    </Tabs>
  );

  return (
    <Switch>
      <ProtectedRoute
        permissions="recycling:Destination:list"
        exact
        path={`${path}/destinations`}
        component={() => <Destinations tabs={tabs} title={title} />}
      />
      <ProtectedRoute
        permissions="recycling:Origin:list"
        exact
        path={`${path}/origins`}
        component={() => <Origins tabs={tabs} title={title} />}
      />
      <Redirect to={`${path}/origins`} />
    </Switch>
  );
};
