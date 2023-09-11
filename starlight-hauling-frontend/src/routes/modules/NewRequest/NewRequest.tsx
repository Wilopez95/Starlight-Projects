import React from 'react';
import { Route, Switch } from 'react-router';

import { Paths } from '@root/consts';
import NewRequestPage from '@root/pages/NewRequest/NewRequest';
import { DefaultAuthenticatedRedirect } from '@root/routes/DefaultAuthenticatedRoute';

//Todo split  NewRequestPage to small sub Pages
const paths = [
  Paths.RequestModule.OrderRequest.Edit,
  Paths.RequestModule.Order.Edit,
  Paths.RequestModule.Subscription.Edit,
  Paths.RequestModule.Subscription.Clone,
  Paths.RequestModule.SubscriptionOrder.Create,
  Paths.RequestModule.SubscriptionNonService.Create,
  Paths.RequestModule.Request,
];

export const NewRequestModuleRoutes: React.FC = () => (
  <Switch>
    <Route path={paths}>
      <NewRequestPage />
    </Route>
    <Route path="*">
      <DefaultAuthenticatedRedirect />
    </Route>
  </Switch>
);
