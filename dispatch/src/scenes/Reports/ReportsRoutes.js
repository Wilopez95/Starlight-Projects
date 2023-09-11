import { Router, Route, Switch } from 'react-router-dom';
import { history } from '@root/utils/history';
import { Paths } from '@root/routes/routing';
import DriversHaulTimeReport from './DriversHaulTimeReport';
import CansAgingReport from './CansAgingReport';
import ReportsHome from './ReportsHome';
import WorkorderNotesReport from './WorkorderNotesReport';

const routes = (
  <Router history={history}>
    <Switch>
      <Route path={`${Paths.Reports}/drivers/haul-time`}>
        <DriversHaulTimeReport />
      </Route>
      <Route path={`${Paths.Reports}/cans/cans-aging`}>
        <CansAgingReport />
      </Route>
      <Route path={`${Paths.Reports}/workorders/workorder-notes`}>
        <WorkorderNotesReport />
      </Route>
      <Route path={Paths.Reports} component={ReportsHome} exact />
    </Switch>
  </Router>
);

export default routes;
