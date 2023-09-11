/* eslint-disable camelcase, react/prop-types */

import { PureComponent } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Error404 from '@root/components/Error404';
import { fetchDrivers } from '@root/state/modules/drivers';
import { Paths } from '@root/routes/routing';
import { Protected } from '@root/auth/components/Protected/Protected';
import CreateWorkOrder from '../WorkOrders/CreateWorkOrder';
import SuspendWorkOrder from '../WorkOrders/SuspendWorkOrder';
import Dispatcher from './Dispatcher';

// type Props = {
//   location: Object,
//   dispatch: Function,
//   history: Object,
//   hasPermission: any,
//   currentUser: any,
// };

class DispatcherRoutes extends PureComponent {
  componentDidMount() {
    if (this.props.match.params.businessUnit && this.props.hasPermission) {
      this.props.dispatch(fetchDrivers({ businessUnitId: this.props.match.params.businessUnit }));
    }
  }

  // @TODO: deprecated lifecycle method
  UNSAFE_componentWillUpdate(nextProps) {
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!window.location.state || !window.location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  previousLocation = this.props.location;

  render() {
    const isModal = Boolean(
      window.location.state &&
        window.location.state.modal &&
        this.previousLocation !== window.location,
    );
    return (
      <>
        <Switch location={isModal ? this.previousLocation : window.location}>
          <Route path={`${Paths.Dispatcher}`}>
            <Protected permissions="dispatcher:app:full-access">
              <Dispatcher currentUser={this.props.currentUser} />
            </Protected>
          </Route>
          <Route path={`${Paths.DispatcherCreate}`}>
            <CreateWorkOrder />
          </Route>
          <Route component={Error404} />
        </Switch>
        <Route path={`${Paths.Dispatcher}/create`} component={CreateWorkOrder} />
        <Route
          path={`${Paths.Dispatcher}/suspend/:woaction/:step/:driverId/:workOrderId`}
          component={SuspendWorkOrder}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  drivers: state.drivers,
});

const WithRouterDispatcherRoutes = withRouter(DispatcherRoutes);
export default connect(mapStateToProps)(WithRouterDispatcherRoutes);
