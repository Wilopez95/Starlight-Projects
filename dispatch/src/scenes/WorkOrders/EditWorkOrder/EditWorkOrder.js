/* eslint-disable react/no-unused-prop-types, react/prop-types, no-unused-expressions */
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import cn from 'classnames';
import { loadTemplates } from '@root/state/modules/templates';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { selectCurrentUser } from '@root/state/modules/session';
import { selectWaypoints, fetchWaypointsIfNeeded } from '@root/state/modules/locations';
import { forgetWorkOrder } from '@root/state/modules/workOrders';
import WorkOrderHistory from '@root/components/WorkOrderHistory';
import WorkOrderRoute from '@root/components/WorkOrderRoute';
// Forms
import FormEditWorkOrder from '@root/forms/EditWorkOrder/EditWorkOrder';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

// type WorkOrderParams = {
//   action: string,
//   workOrderId: number,
// };

// export type Props = {
//   user: UserType,
//   params: WorkOrderParams,
//   match: Object,
//   templates: Object,
//   fetchSettingByKey: string => Object,
//   forgetWorkOrder: () => void,
//   mapConfig: Object,
//   history: Object,
//   loadTemplates: Function,
//   location: RouterLocation,
//   fetchWaypointsIfNeeded: () => void,
//   waypoints: Array<LocationType>,
// };

export class EditWorkOrder extends PureComponent {
  static displayName = 'EditWorkOrder';

  componentDidMount() {
    this.props.loadTemplates();

    if (this.props.location.pathname.includes('table')) {
      this.props.fetchSettingByKey('map');
    }
    this.props.fetchWaypointsIfNeeded();
  }

  componentWillUnmount() {
    this.props.forgetWorkOrder();
  }

  handleClose = () => {
    // redirecting to table or map depending on path once modal closed to persist searching for workorder table
    if (this.props.location.pathname.includes('map')) {
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

  handleClickPrint = () => {
    const {
      match: {
        params: { workOrderId },
      },
    } = this.props;

    this.props.history.push(`/print/workorder/${workOrderId}`);
  };

  renderContent() {
    const {
      match: {
        params: { action, workOrderId },
      },
    } = this.props;
    switch (action) {
      case 'history':
        return (
          <WorkOrderHistory
            workOrderId={workOrderId}
            timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
            mapConfig={this.props.mapConfig}
          />
        );
      case 'route':
        return (
          <WorkOrderRoute
            workOrderId={workOrderId}
            timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
            mapConfig={this.props.mapConfig}
          />
        );

      default:
        return (
          <FormEditWorkOrder
            workOrderId={workOrderId}
            action="edit"
            onDismiss={this.handleClose}
            onSuccessSubmit={this.handleClose}
            templates={this.props.templates}
            mapConfig={this.props.mapConfig}
            waypoints={this.props.waypoints}
          />
        );
    }
  }

  render() {
    const {
      match: {
        path,
        params: { workOrderId },
      },
    } = this.props;

    const isTable = path.includes('table');
    return (
      <div
        className={cn({
          page: true,
          'page--workordersIndex': !isTable,
        })}
      >
        <div className="router-popup popup-work-order-actions--popup">
          <div className="router-popup--inner">
            <header className="router-popup--header">
              <h2 className="router-popup--title">{`Edit Work Order #${workOrderId}`}</h2>
              <nav className="router-popup--nav">
                <NavLink
                  to={{
                    pathname: pathToUrl(
                      isTable ? Paths.WorkOrdersEditTable : Paths.WorkOrdersEdit,
                      {
                        businessUnit: this.props.match.params.businessUnit,
                        id: workOrderId,
                      },
                    ),
                  }}
                  className="router-popup--nav-item"
                  activeClassName="router-popup--nav-item--active"
                >
                  Details
                </NavLink>
                <NavLink
                  to={{
                    pathname: pathToUrl(
                      isTable ? Paths.WorkOrdersTableEditHistory : Paths.WorkOrdersMapEditHistory,
                      {
                        businessUnit: this.props.match.params.businessUnit,
                        id: workOrderId,
                      },
                    ),
                  }}
                  className="router-popup--nav-item"
                  activeClassName="router-popup--nav-item--active"
                >
                  History
                </NavLink>
                <NavLink
                  to={{
                    pathname: pathToUrl(
                      isTable ? Paths.WorkOrdersTableEditRoute : Paths.WorkOrdersMapEditRoute,
                      {
                        businessUnit: this.props.match.params.businessUnit,
                        id: workOrderId,
                      },
                    ),
                  }}
                  className="router-popup--nav-item"
                  activeClassName="router-popup--nav-item--active"
                >
                  Route
                </NavLink>
              </nav>
            </header>
            <div className="router-popup--body">
              {this.renderContent()}

              <button
                type="button"
                onClick={this.handleClickPrint}
                className="btn btn__default btn__small btn__print"
              >
                <i className="far fa-print" /> Print
              </button>
            </div>
            <button className="router-popup--close" type="button" onClick={this.handleClose} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  workOrder: state.workOrder,
  user: selectCurrentUser(state),
  mapConfig: state.setting.map,
  templates: state.templates,
  waypoints: selectWaypoints(state),
});
function mapDispatchToProps(dispatch) {
  return {
    loadTemplates: () => dispatch(loadTemplates()),
    fetchSettingByKey: (key) => dispatch(fetchSettingByKey(key)),
    fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
    forgetWorkOrder: () => dispatch(forgetWorkOrder()),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditWorkOrder));
