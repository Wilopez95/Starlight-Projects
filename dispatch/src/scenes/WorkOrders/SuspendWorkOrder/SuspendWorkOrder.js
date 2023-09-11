/* eslint-disable react/no-unused-prop-types, react/prop-types, no-unused-expressions */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { selectCurrentUser } from '@root/state/modules/session';
import { fetchSuspendedWorkOrders } from '@root/state/modules/workOrders';
import { selectWaypoints, fetchWaypointsIfNeeded } from '@root/state/modules/locations';
// import type { UserType, RouterLocation, LocationType } from 'types/index';
// Forms
import FormSuspendWorkOrder from '@root/forms/SuspendWorkOrder/SuspendWorkOrder';
import ModalRoute from '@root/components/ModalRoute';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

// type WorkOrderParams = {
//   action: string,
//   user: UserType,
//   workOrderId: number,
//   step: string,
// };

// export type Props = {
//   user: UserType,
//   params: WorkOrderParams,
//   match: Object,
//   templates: Object,
//   fetchSettingByKey: string => Object,
//   mapConfig: Object,
//   history: Object,
//   loadTemplates: Function,
//   location: RouterLocation,
//   fetchWaypointsIfNeeded: () => void,
//   fetchSuspendedWorkOrders: () => void,
//   waypoints: Array<LocationType>,
// };

export class SuspendWorkOrder extends PureComponent {
  static displayName = 'SuspendWorkOrder';

  componentDidMount() {
    if (this.props.location.pathname.includes('table')) {
      this.props.fetchSettingByKey('map');
    }
    this.props.fetchWaypointsIfNeeded();
  }

  handleClose = () => {
    // redirecting to table or map depending on path once modal closed to persist searching for workorder table
    if (this.props.location.pathname.includes('dispatcher')) {
      this.props.history.push(
        pathToUrl(Paths.Dispatcher, {
          businessUnit: this.props.match.params.businessUnit,
        }),
      );
    } else if (this.props.location.pathname.includes('map')) {
      this.props.history.push(
        pathToUrl(Paths.WorkOrders, {
          businessUnit: this.props.match.params.businessUnit,
        }),
      );
    } else {
      this.props.history.push(
        pathToUrl(Paths.WorkOrdersTable, {
          businessUnit: this.props.match.params.businessUnit,
        }),
      );
    }
  };

  render() {
    const {
      match: {
        params: { workOrderId, woaction, step, driverId },
      },
    } = this.props;

    const title = `Suspend Order #${workOrderId}`;
    return (
      <ModalRoute title={title}>
        <FormSuspendWorkOrder
          workOrderId={workOrderId}
          driverId={driverId}
          woaction={decodeURIComponent(woaction)}
          action="edit"
          step={decodeURIComponent(step)}
          onDismiss={this.handleClose}
          onSuccessSubmit={this.handleClose}
          templates={this.props.templates}
          mapConfig={this.props.mapConfig}
          waypoints={this.props.waypoints}
          location={this.props.location}
          history={this.props.history}
          fetchSuspendedWorkOrders={this.props.fetchSuspendedWorkOrders}
        />
      </ModalRoute>
    );
  }
}

const mapStateToProps = (state) => ({
  user: selectCurrentUser(state),
  mapConfig: state.setting.map,
  templates: state.templates,
  waypoints: selectWaypoints(state),
});
function mapDispatchToProps(dispatch) {
  return {
    fetchSettingByKey: (key) => dispatch(fetchSettingByKey(key)),
    fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
    fetchSuspendedWorkOrders: (businessUnitId) =>
      dispatch(fetchSuspendedWorkOrders(businessUnitId)),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SuspendWorkOrder));
