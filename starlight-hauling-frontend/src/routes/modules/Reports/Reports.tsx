import React from 'react';
import { Route, Switch } from 'react-router';

import { Paths } from '@root/consts';
import CreateReport from '@root/pages/Reports/CreateReport/CreateReport';
import DeleteReport from '@root/pages/Reports/DeleteReport/DeleteReport';
import DuplicateReport from '@root/pages/Reports/DuplicateReport/DuplicateReport';
import EditReport from '@root/pages/Reports/EditReport/EditReport';
import ReportsPage from '@root/pages/Reports/ReportsPage';
import RunReport from '@root/pages/Reports/RunReport/RunReport';
import { DefaultAuthenticatedRedirect } from '@root/routes/DefaultAuthenticatedRoute';

export const ReportsModuleRoutes: React.FC = () => (
  <Switch>
    <Route path={Paths.ReportsModule.View} exact>
      <RunReport />
    </Route>
    <Route path={Paths.ReportsModule.Edit} exact>
      <EditReport />
    </Route>
    <Route path={Paths.ReportsModule.Delete} exact>
      <DeleteReport />
    </Route>
    <Route path={Paths.ReportsModule.Duplicate} exact>
      <DuplicateReport />
    </Route>
    <Route path={Paths.ReportsModule.Create} exact>
      <CreateReport />
    </Route>
    <Route path={Paths.ReportsModule.Reports} exact>
      <ReportsPage />
    </Route>
    <Route path="*">
      <DefaultAuthenticatedRedirect />
    </Route>
  </Switch>
);
