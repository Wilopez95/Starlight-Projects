import * as React from 'react';
import { Route, Switch } from 'react-router';

import FinishLogin from '@root/pages/Login/FinishLogin';
import Login from '@root/pages/Login/Login';
import LobbyPage from '@root/components/LobbyPage/LobbyPage';
import DispatcherRoutes from '@root/scenes/Dispatcher/DispatchRoutes';
import WorkOrdersRoutes from '@root/scenes/WorkOrders';
import InventoryRoutes from '@root/scenes/Inventory/InventoryRoutes';
import InventoryBoardContainer from '@root/scenes/InventoryBoard';
import ReportsLayout from '@root/scenes/Reports';
import { Admin } from '@root/scenes/Admin/Admin';
import { useUserContext } from '@root/auth/hooks/useUserContext';
import { userHasPermission } from '@root/auth/hooks/permission/permission';
import { Paths } from './routing';
import { DefaultAuthenticatedRedirect } from './DefaultAuthenticatedRoute';
import { BusinessUnitRedirect } from './BusinessUnitRedirect';
import { SystemConfigurationRedirect } from './SystemConfigurationRedirect';

export const AuthenticatedRoutes: React.FC = () => {
  const { currentUser } = useUserContext();
  const hasPermission = userHasPermission(currentUser, [
    'dispatcher:app:full-access',
  ]);
  return (
    <Switch>
        <Route path={Paths.LobbyFinishLogin}>
          <FinishLogin />
        </Route>
        <Route path={Paths.LobbyLogin}>
          <Login />
        </Route>
        <Route path={Paths.Lobby}>
          <LobbyPage />
        </Route>
        <Route path={Paths.BusinessUnitLogin.FinishLogin}>
          <FinishLogin />
        </Route>
        <Route path={Paths.BusinessUnitLogin.Login}>
          <Login />
        </Route>
        <Route path={Paths.BusinessUnitLogin.LoginRedirect} exact>
          <BusinessUnitRedirect />
        </Route>
        <Route path={Paths.GlobalSystemConfigurationModule.Login}>
          <Login />
        </Route>
        <Route path={Paths.GlobalSystemConfigurationModule.FinishLogin}>
          <FinishLogin />
        </Route>
        <Route path={Paths.GlobalSystemConfigurationModule.LoginRedirect} exact>
          <SystemConfigurationRedirect />
        </Route>
        <Route path={Paths.Dispatcher}>
          <DispatcherRoutes
            currentUser={currentUser}
            {...(currentUser
              ? { hasPermission }
              : { hasPermission: undefined })}
          />
        </Route>
        <Route path={Paths.Work}>
          <WorkOrdersRoutes />
        </Route>
        <Route path={Paths.Inventory}>
          <InventoryRoutes />
        </Route>
        <Route path={Paths.InventoryBoard}>
          <InventoryBoardContainer />
        </Route>
        <Route path={Paths.Reports}>
          <ReportsLayout />
        </Route>
        <Route path={Paths.Configuration}>
          <Admin />
        </Route>
        <Route path="*">
          <DefaultAuthenticatedRedirect />
        </Route>
      </Switch>
  );
};
