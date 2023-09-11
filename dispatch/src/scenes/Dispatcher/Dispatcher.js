/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-did-update-set-state, react/prop-types, max-lines */
import { Component } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import ReactDOM, { render } from 'react-dom';
import isEqual from 'lodash/isEqual';
import * as Sentry from '@sentry/react';
import { Helmet } from 'react-helmet';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { fetchWaypointsIfNeeded, selectWaypoints } from '@root/state/modules/locations';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { fetchDriversInitially, updateDriverLocations } from '@root/state/modules/drivers';
import {
  fetchWorkOrders,
  fetchSuspendedWorkOrders,
  updateWorkOrder,
  createSelectFilteredWos,
} from '@root/state/modules/workOrders';
import { fetchCans, selectFilteredCans } from '@root/state/modules/cans';
import { fetchAllWorkOrderNotes } from '@root/state/modules/workOrderNotes';
import { selectCurrentUser } from '@root/state/modules/session';
import {
  addUnpublishedChange,
  clearUnpublishedChanges,
  resetDispatcherFilter,
} from '@root/state/modules/dispatcher';
import constants from '@root/helpers/constants.json';
import {
  DriverNotesPopup,
  PublishBanner,
  WorkOrderListItem,
  DispatchMap,
  DriversPanel,
  Wrapper,
  Page,
  Header,
} from '@root/components/index';
import { Paths } from '@root/routes/routing';
import { pathToUrl } from '@root/helpers/pathToUrl';

const { orderConfigs } = constants;

const invisibleWOStyle = {
  position: 'absolute',
  left: '-500px',
  width: '299px',
  display: 'none',
  fontSize: 'small',
  zIndex: '12',
};

class Dispatcher extends Component {
  static displayName = 'Dispatcher';

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    setting: PropTypes.object.isRequired,
    cans: PropTypes.array.isRequired,
    waypoints: PropTypes.array.isRequired,
    drivers: PropTypes.object.isRequired,
    filter: PropTypes.object,
    workOrders: PropTypes.array.isRequired,
    workOrderNotes: PropTypes.object.isRequired,
    unpublished: PropTypes.number,
    history: PropTypes.object.isRequired,
    isUpdating: PropTypes.bool,
    suspended: PropTypes.array,
  };

  static defaultProps = {
    filter: {},
    suspended: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      sidebarOpen: true,
      unassigned: this.props.workOrders
        .filter((item) => item.status !== 'COMPLETED')
        .filter((item) => item.status !== 'ASSIGNED')
        .filter((item) => item.status !== 'INPROGRESS')
        .filter((item) => item.status !== 'CANCELED')
        .filter((item) => !!item.suspensionLocation && !item.suspensionLocation.id),
      suspended: this.props.suspended,
      hasClosedBanner: false,
      showingBanner: false,
      prevFilter: this.props.filter,
    };
    this.pollingInterval = false;
    this.unassigned = [];
    this.suspended = this.props.suspended;
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.dispatch(resetDispatcherFilter());
    this.initialDataFetch();

    this.driversInterval = setInterval(
      () =>
        this.props.dispatch(
          updateDriverLocations({
            businessUnitId: this.props.match.params.businessUnit,
          }),
        ),
      2e4,
    );

    window.addEventListener('forceEvent', this.forceEvent);
  }

  componentDidUpdate(prevProps) {
    if (this.props.isUpdating || prevProps.isUpdating) {
      this.manageWoPollingInterval(false);
      return;
    }
    if (!isEqual(prevProps.filter, this.props.filter)) {
      this.setState({ prevFilter: prevProps.filter });
    }
    if (prevProps.unpublished > 0 && this.props.unpublished > 0 && this.pollingInterval !== false) {
      this.manageWoPollingInterval(false);
    }
    if (this.props.unpublished === 0 && this.pollingInterval === false) {
      this.manageWoPollingInterval(true);
    }
    if (this.props.workOrders.length !== prevProps.workOrders.length) {
      this.props.dispatch(fetchWaypointsIfNeeded());
    }
    if (
      this.props.drivers.list.length &&
      this.props.workOrders.length &&
      this.props.workOrderNotes &&
      (prevProps.workOrders.length === 0 || prevProps.drivers.list.length === 0)
    ) {
      this.manageWoPollingInterval(false);
      this.forceUnassigned();
      this.forceSuspended();

      this.props.drivers.list.forEach((driver) => {
        this.matchDriverToWorkOrder(driver);
      });

      // initial reorder assigns an index to newly created work orders with no index
      this.setState({
        ...this._drivers,
        unassigned: this.unassigned,
        suspended: this.suspended,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('forceEvent', this.forceEvent);
    this.manageWoPollingInterval(false);

    clearInterval(this.driversInterval);
    this._isMounted = false;
    // clear the unpublished changes on page change
    this.props.dispatch(clearUnpublishedChanges());
  }

  _isMounted = false;

  _drivers = {};

  /**
   * Calls all the functions which fetch the initial required data for the Dispatcher
   * @memberof Dispatcher
   */
  initialDataFetch = () => {
    Promise.all([
      this.props.dispatch(fetchConstantsIfNeeded()),
      this.props.dispatch(fetchWaypointsIfNeeded()),
      this.props.dispatch(fetchSettingByKey('map', this.props.match.params.businessUnit)),
      this.props.dispatch(
        fetchDriversInitially({
          businessUnitId: this.props.match.params.businessUnit,
        }),
      ),
      this.props.dispatch(fetchCans()),
      this.props.dispatch(fetchSuspendedWorkOrders(this.props.match.params.businessUnit)),
      this.props.dispatch(
        fetchWorkOrders({
          ...this.props.filter,
          businessUnitId: this.props.match.params.businessUnit,
        }),
      ),
    ]).then(() => {
      this.forceUnassigned();
      this.forceSuspended();
      this.forceDrivers(false, false);
      this.forceUpdateState(true);
      this.manageWoPollingInterval(true);
    });
  };

  /**
   * @memberof Dispatcher
   *
   * Creates an interval to fetch work orders every 15 seconds or
   * clears the interval depending on what is passed to enable
   * @param {boolean} enable true/false to create this.pollingInterval which
   * fetches workOrders on a 15 second interval. Passing enable as true, will not
   * create a new interval if the interval already exists.
   */
  manageWoPollingInterval = (enable) => {
    if (enable && this.pollingInterval === false) {
      this.pollingInterval = setInterval(() => {
        if (this.props.isUpdating || !!this.props.unpublished) {
          return;
        }
        this.props
          .dispatch(fetchSuspendedWorkOrders(this.props.match.params.businessUnit))
          .then(() => {
            this.setState({ suspended: this.props.suspended });
          });
        this.props.dispatch(
          fetchWorkOrders({
            ...this.props.filter,
            businessUnitId: this.props.match.params.businessUnit,
          }),
        );
        this.forceUnassigned();
        this.forceSuspended();
        this.forceDrivers(false, false);
        this.forceUpdateState(true);
        this.manageWoPollingInterval(true);
      }, 1000 * 25);
    } else {
      clearInterval(this.pollingInterval);
      this.pollingInterval = false;
    }
  };

  hideBanner = () => {
    this.setState({
      showingBanner: false,
    });
  };

  /**
   * Sets the dispatcher reducer's unpublishedChanges count to 0
   */
  resetUnpublishedChanges = () => {
    this.props.dispatch(clearUnpublishedChanges());
  };

  forceEvent = () => {
    this.force({});
  };

  /**
   * Click handler for toggling visibility of the sidebar
   *
   * @memberof Dispatcher
   */
  toggleSidebar = () => {
    this.setState((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  };

  forceUnassigned = () => {
    this.unassigned = this.props.workOrders
      .filter((workOrder) => workOrder.status !== 'COMPLETED')
      .filter((workOrder) => workOrder.status !== 'CANCELED')

      .filter((workOrder) => !workOrder.driver.id || workOrder.driver.id === 0)
      .filter((workOrder) => !!workOrder.suspensionLocation && !workOrder.suspensionLocation.id)
      .sort((a, b) => a.index - b.index);
  };

  forceSuspended = () => {
    this.suspended = this.props.suspended
      .filter((workOrder) => workOrder.status !== 'COMPLETED')
      .filter((workOrder) => workOrder.status !== 'CANCELED');
  };

  matchDriverToWorkOrder = (driver) => {
    this._drivers[driver.id] = this.props.workOrders
      .filter((workOrder) => workOrder.status !== 'COMPLETED')
      .filter((workOrder) => workOrder.status !== 'CANCELED')
      .filter((workOrder) => workOrder.driver.id === driver.id)
      .sort((a, b) => a.index - b.index);
  };

  driverPickupCan = (driver) => {
    this[`${driver.id}`] = this.props.workOrders
      .filter((workOrder) => workOrder.status !== 'COMPLETED')
      .filter((workOrder) => workOrder.status !== 'CANCELED')
      .filter((workOrder) => workOrder.driver.id === driver.id)
      .sort((a, b) => {
        if (a.index === b.index) {
          if (a.action === 'PICKUP CAN' && b.action === 'PICKUP CAN') {
            return Date.parse(a.createdDate) - Date.parse(b.createdDate);
          }
          if (a.action === 'PICKUP CAN' && b.action !== 'PICKUP CAN') {
            return -1;
          }
          return Date.parse(b.createdDate) - Date.parse(a.createdDate);
        }
        return a.index - b.index;
      });
  };

  driverDropOff = (driver) => {
    this._drivers[driver.id] = this.props.workOrders
      .filter((workOrder) => workOrder.status !== 'COMPLETED')
      .filter((workOrder) => workOrder.status !== 'CANCELED')
      .filter((workOrder) => workOrder.driver.id === driver.id)
      .sort((a, b) => {
        if (a.index === b.index) {
          return Date.parse(a.createdDate) - Date.parse(b.createdDate);
        }
        return a.index - b.index;
      });
  };

  forceDrivers = (addPickupCan, addDropoffCan) => {
    this.manageWoPollingInterval(false);
    this.props.drivers.list.forEach((driver) => {
      this.matchDriverToWorkOrder(driver);

      if (addPickupCan) {
        this.driverPickupCan(driver);
      }

      if (addDropoffCan) {
        this.driverDropOff(driver);
      }
    });
  };

  forceUpdateState = (isValid) => {
    this.manageWoPollingInterval(false);
    if (this._isMounted) {
      this.setState(
        {
          ...this._drivers,
          unassigned: this.unassigned,
          suspended: this.suspended,
        },
        () => {
          if (!isValid) {
            const data = [];
            this.props.drivers.added.forEach((driver) => {
              for (let i = 0; i < this.state[driver.id].length; i++) {
                data.push({
                  ...this.state[driver.id][i],
                  index: i,
                  driverId: driver.id,
                });
              }
            });
            for (let i = 0; i < this.state.unassigned.length; i++) {
              data.push({
                ...this.state.unassigned[i],
                index: i,
                driverId: null,
              });
            }
            for (let i = 0; i < this.state.suspended.length; i++) {
              data.push({
                ...this.state.suspended[i],
                index: i,
                driverId: null,
              });
            }
            const payload = [];
            data.forEach((datum) => {
              datum.locationId2 = datum.location2.id;
              payload.push(pick(datum, ['id', 'driverId', 'status', 'index', 'locationId2']));
            });
            this.props.dispatch(updateWorkOrder(payload, this.props.filter));
          }
        },
      );
    }
  };

  /**
   * Forces a re-render
   * @memberof Dispatcher
   * @note the only reason fetchOrders was added is to prevent fetching on the drivers panel
   * when adding a driver.
   * @param {Object} filter the dispatcher reducer's filter
   * @param {Boolean} isValid true if state is valid, false otherwise
   * @param {Boolean} addPickupCan true if should add a pickup can to drivers
   * @param {Boolean} addDropoffCan true if should add a dropoff can to drivers
   * @param {Boolean} fetchOrders true if should force fetch work orders
   */
  force = (
    filter = {},
    isValid = false,
    addPickupCan = false,
    addDropoffCan = false,
    fetchOrders = true,
  ) => {
    if (this._isMounted) {
      if (fetchOrders) {
        this.props
          .dispatch(
            fetchWorkOrders({
              ...this.props.filter,
              ...filter,
              businessUnitId: this.props.match.params.businessUnit,
            }),
          )
          .then(() => {
            this.forceUnassigned();
            this.forceSuspended();
            this.forceDrivers(addPickupCan, addDropoffCan);
            this.forceUpdateState(isValid);
          });
      } else {
        this.forceUnassigned();
        this.forceSuspended();
        this.forceDrivers(addPickupCan, addDropoffCan);
        this.forceUpdateState(isValid);
      }
    }
  };

  onClick = (workOrder, driverNotes) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: `Opened driver notes from work order #"${workOrder.id}"`,
      level: 'info',
      type: 'user',
    });
    this.props.dispatch(fetchAllWorkOrderNotes(workOrder.id)).then(() => {
      render(
        <DriverNotesPopup
          workOrder={workOrder}
          driverNotes={driverNotes}
          id={workOrder.id}
          workOrderNotes={this.props.workOrderNotes}
        />,
        document.getElementById(`driverNotesPopup`),
      );
    });
  };

  /**
   * Listener for dragEnd on a work order puzzle piece.
   *
   * @memberof Dispatcher
   * @param {Object} workOrder The work order data displayed on the draggable puzzle piece.
   * @param {number | string} from The originating location of the drag event, usually a driver or 'unassigned'. Can also be the map.
   * @param {number | string} to The ending location of the drag event, usually a driver or 'unassigned'. Can also be the map.
   */
  onDragEnd = (workOrder, from, to) => {
    // eslint-disable-next-line eqeqeq
    if (to == from) {
      this.setState((prevState) => {
        const toArray = prevState[to].filter((order) => order.id !== workOrder.id).slice();
        toArray.splice(workOrder.index, 0, workOrder);
        for (let i = 0; i < toArray.length; i++) {
          toArray[i].index = i;
        }
        if (JSON.stringify(prevState[to]) !== JSON.stringify(toArray)) {
          this.props.dispatch(addUnpublishedChange());
          return {
            showingBanner: true,
            [to]: toArray,
          };
        }
        return {
          [to]: toArray,
        };
      });
    } else {
      // this.props.dispatch(addUnpublishedChange());
      // filter out those orders with the same ids for dupes
      this.setState((prevState) => {
        const toArray = prevState[to].filter((order) => order.id !== workOrder.id).slice();
        toArray.splice(workOrder.index, 0, workOrder);
        for (let i = 0; i < toArray.length; i++) {
          toArray[i].index = i;
        }

        if (!prevState[from]) {
          return {
            showingBanner: false,
            [to]: toArray,
          };
        }
        this.props.dispatch(addUnpublishedChange());
        return {
          showingBanner: true,
          [to]: toArray,
          [from]: prevState[from].filter((order) => order.id !== workOrder.id),
        };
      });
    }
  };

  /**
   * Click handler for hiding / showing the publish banner.
   *
   * @memberof Dispatcher
   */
  handleClickBanner = () => {
    this.setState((state) => ({
      showingBanner: !state.showingBanner,
      hasClosedBanner: true,
    }));
  };

  render() {
    const { user, setting, waypoints, drivers } = this.props;
    const IS_READ_ONLY = user.roleId === 4;
    return (
      <Wrapper>
        <Helmet title="Dispatcher" />
        <div
          onClick={() => {
            const element = document.getElementById('driverNotesPopup');
            ReactDOM.unmountComponentAtNode(element);
          }}
        >
          <Header>
            <div className="header__column--actions">
              {IS_READ_ONLY ? null : (
                <Link
                  className="button button__primary button__lrg"
                  to={{
                    pathname: pathToUrl(`${Paths.DispatcherCreate}`, {
                      businessUnit: this.props.match.params.businessUnit,
                    }),
                    state: { modal: true },
                  }}
                >
                  Create work order
                </Link>
              )}
            </div>
          </Header>
          <Page name="dispatcher">
            <PublishBanner
              showingBanner={this.state.showingBanner}
              hasClosedBanner={this.state.hasClosedBanner}
              unpublishedChanges={this.props.unpublished}
              onClickBanner={this.handleClickBanner}
            />

            <div
              id="driverNotesPopup"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="driverNotesPopup"
            />
            {setting.map && setting.map.lon && setting.fetchStatus === 'DONE' ? (
              <DispatchMap
                id="map"
                drivers={drivers.added}
                locations={this.props.waypoints}
                cans={this.props.cans}
                sidebarOpen={this.state.sidebarOpen}
                options={{
                  center: {
                    lat: setting.map.lat,
                    lng: setting.map.lon,
                  },
                  zoom: parseInt(setting.map.zoom, 10),
                }}
                updatedState={this.state}
                workOrderNotes={this.props.workOrderNotes}
                onClick={this.onClick}
                force={this.force}
                dispatch={this.props.dispatch}
                unpublishedChanges={this.props.unpublished}
                onDragEnd={this.onDragEnd}
                filter={this.props.filter}
                manageWoPollingInterval={this.manageWoPollingInterval}
              />
            ) : null}
            <DriversPanel
              force={this.force}
              waypoints={waypoints}
              updatedState={this.state}
              unpublishedChanges={this.props.unpublished}
              drivers={drivers}
              sidebarOpen={this.state.sidebarOpen}
              hideBanner={this.hideBanner}
              toggleSidebar={this.toggleSidebar}
              resetUnpublishedChanges={this.resetUnpublishedChanges}
              toggleWorkOrderListener={this.toggleWorkOrderListener}
              onDragEnd={this.onDragEnd}
              manageWoPollingInterval={this.manageWoPollingInterval}
              history={this.props.history}
            />
            {this.props.workOrders
              .filter(
                (workOrder) => workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELED',
              )
              .sort((a, b) => a.index - b.index)
              .map((workOrder) => {
                const orderConfig = orderConfigs.filter(
                  (config) => config.name.toLowerCase() === workOrder.action.toLowerCase(),
                )[0];
                return (
                  <WorkOrderListItem
                    key={workOrder.id}
                    style={invisibleWOStyle}
                    orderConfig={orderConfig}
                    workOrder={workOrder}
                    drivers={this.props.drivers.added}
                    manageWoPollingInterval={this.manageWoPollingInterval}
                    workOrders={this.props.workOrders
                      .filter(
                        (workOrder) =>
                          workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELED',
                      )
                      .sort((a, b) => a.index - b.index)}
                    id={`drag-offscreen${workOrder.id}`}
                    class="hidden-workOrder"
                    index={workOrder.index}
                    suppressSVG
                  />
                );
              })}
            {this.props.suspended
              .filter((order) => !order.driver?.id)
              .map((workOrder) => {
                const orderConfig = orderConfigs.filter(
                  (config) => config.name.toLowerCase() === workOrder.action.toLowerCase(),
                )[0];
                return (
                  <WorkOrderListItem
                    key={workOrder.id}
                    style={invisibleWOStyle}
                    orderConfig={orderConfig}
                    workOrder={workOrder}
                    drivers={this.props.drivers.added}
                    manageWoPollingInterval={this.manageWoPollingInterval}
                    workOrders={this.props.suspended
                      .filter(
                        (workOrder) =>
                          workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELED',
                      )
                      .sort((a, b) => a.index - b.index)}
                    id={`drag-offscreen${workOrder.id}`}
                    class="hidden-workOrder suspended"
                    index={workOrder.index}
                    suppressSVG
                  />
                );
              })}
          </Page>
        </div>
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => {
  const { suspended } = state.workOrders;
  const selectCans = selectFilteredCans();
  const selectWorkOrders = createSelectFilteredWos();
  return {
    unpublished: state.dispatcher.unpublished,
    filter: state.dispatcher.filter,
    setting: state.setting,
    user: selectCurrentUser(state),
    waypoints: selectWaypoints(state),
    drivers: state.drivers,
    workOrders: selectWorkOrders(state),
    suspended,
    workOrderNotes: state.workOrderNotes,
    cans: selectCans(state),
    isUpdating: state.workOrders.isUpdating,
  };
};

export default withRouter(connect(mapStateToProps)(Dispatcher));
