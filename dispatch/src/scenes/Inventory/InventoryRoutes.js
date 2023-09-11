/* eslint-disable react/prop-types */
/* eslint-disable camelcase */
import { Switch, Route, withRouter } from 'react-router-dom';
import Error404 from '@root/components/Error404';
import { Paths } from '@root/routes/routing';
import ImportCans from '@root/scenes/Inventory/ImportCans';
import ExportCans from '@root/scenes/Inventory/ExportCans';
import InventoryContainer from './InventoryContainer';
import EditCan from './EditCan/EditCanRoutes';
import AddCan from './AddCan';

function InventoryRoutes(props) {
  return (
    <>
      <Switch location={props.location}>
        <Route path={Paths.Inventory} component={InventoryContainer} />
        <Route path={`${Paths.Inventory}/can/create`} component={AddCan} />
        <Route path={`${Paths.InventoryEdit}`} component={EditCan} />
        <Route path={`${Paths.Inventory}/export`} component={ExportCans} />
        <Route path={`${Paths.Inventory}/import`} component={ImportCans} />
        <Route component={Error404} />
      </Switch>
      <Route path={`${Paths.Inventory}/export`} component={ExportCans} />
      <Route path={`${Paths.Inventory}/import`} component={ImportCans} />
      <Route path={`${Paths.Inventory}/can/create`} component={AddCan} />
      <Route path={`${Paths.InventoryEdit}`} component={EditCan} />
    </>
  );
}

export default withRouter(InventoryRoutes);
