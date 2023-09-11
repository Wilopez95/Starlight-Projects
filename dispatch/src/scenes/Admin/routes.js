/* eslint-disable import/max-dependencies */
import { Router, Route, Switch } from 'react-router-dom';
import MapConfig from '@root/scenes/Admin/MapConfig';
import DriverAppConfig from '@root/scenes/Admin/DriverAppConfig';
import Documents from '@root/scenes/Admin/Documents';
import TemplatesContainer from '@root/scenes/Admin/Templates';
import ModifyTemplateContainer from '@root/scenes/Admin/Templates/ModifyTemplate';
// import Locations from 'scenes/Admin/Locations';
import Materials from '@root/scenes/Admin/Materials';
import Sizes from '@root/scenes/Admin/Sizes';
import Waypoints from '@root/scenes/Admin/Waypoints';
import CreateTemplate from '@root/scenes/Admin/Templates/CreateTemplate';
import StructuredManifest from '@root/scenes/Admin/StructuredManifest';
import ManifestCustomers from '@root/scenes/Admin/StructuredManifest/ManifestCustomers';
import InventoryBoardContainer from '@root/scenes/InventoryBoard';
import SizeEditor from '@root/scenes/Admin/Sizes/SizeEditor';
import WaypointEditor from '@root/scenes/Admin/Waypoints/WaypointEditor';
import Trips from '@root/scenes/Admin/Trips';
import EditTrips from '@root/scenes/Admin/Trips/EditTrips';
import Facilities from '@root/scenes/Admin/StructuredManifest/Facilities';
import { history } from '@root/utils/history';
import { Paths } from '@root/routes/routing';
import { Protected } from '@root/auth/components/Protected/Protected';

const routes = (
  <Router history={history}>
    <Switch>
      <Protected permissions="configuration:dispatcher:full-access">
        <Route path={`${Paths.MapSettings}`} component={MapConfig} />
        <Route path={`${Paths.DriverAapSettings}`} component={DriverAppConfig} />
        {/* <Route path="/admin/locations" component={Locations} /> */}
        <Route path={`${Paths.Materials}`} component={Materials} exact />
        <Route path={`${Paths.Sizes}`} component={Sizes} exact />
        <Route path={`${Paths.Sizes}/create`} component={SizeEditor} />
        <Route path={`${Paths.Sizes}/edit/:id`} component={SizeEditor} />
        <Route path={`${Paths.Waypoints}`} component={Waypoints} exact />
        <Route path={`${Paths.Waypoints}/create`} component={WaypointEditor} />
        <Route path={`${Paths.Waypoints}/edit/:id`} component={WaypointEditor} />
        <Route path={`${Paths.Documents}`} component={Documents} />
        <Route path="/configuration/inventory-board" component={InventoryBoardContainer} exact />
        <Route path={`${Paths.Templates}`} component={TemplatesContainer} exact />
        <Route path={`${Paths.Templates}/create`} component={CreateTemplate} />
        <Route path={`${Paths.Trips}/:id/edit-trips`} component={EditTrips} />
        <Route path={`${Paths.Trips}`} component={Trips} exact />
        <Route path={`${Paths.Templates}/:id/edit`} component={ModifyTemplateContainer} />
        <Route path={`${Paths.StructuredManifest}`} exact component={StructuredManifest} />
        <Route path={`${Paths.StructuredManifest}/customers`} component={ManifestCustomers} />
        <Route path={`${Paths.StructuredManifest}/facilities`} component={Facilities} />
        {/* <Route>
          <Redirect to={Paths.Materials} />
        </Route> */}
      </Protected>
    </Switch>
  </Router>
);

export default routes;
