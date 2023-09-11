/* eslint-disable no-negated-condition */
/* eslint-disable complexity */
/* eslint-disable react/prop-types */
/* eslint-disable  max-lines, array-callback-return, max-depth, eqeqeq */
import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faPrint,
  faFilter,
  faExclamationCircle,
} from '@fortawesome/pro-regular-svg-icons';
import { connect } from 'react-redux';
// import moment from 'moment';
import * as Sentry from '@sentry/react';
import ReactToPrint from 'react-to-print';
// import { omit } from 'lodash';
import DroppableList from '@root/components/DroppableList';
import DroppableDriverList from '@root/components/DroppableDriverList';
import DriversPanelHeader from '@root/components/DriversPanelHeader';
import Driver from '@root/components/Driver';
import AddDrivers from '@root/components/AddDrivers';
import PrintableWorkOrders from '@root/components/PrintableWorkOrders';
import FilterForm from '@root/forms/WorkOrdersDispatchFilter';
import { dispatchFilterChange } from '@root/state/modules/dispatcher';
import DriverPanelFooter from '@root/components/DriverPanelFooter';
import { removeAddedDriver } from '@root/state/modules/drivers';
import {
  updateWorkOrder,
  updateSingleWorkOrder,
  updateSingleWorkOrderWithDriver,
  createWorkOrder,
} from '@root/state/modules/workOrders';

import { labelAndValueExtractor } from '../../helpers/functions';

// type Props = {
//   force: () => void,
//   waypoints: Array<LocationType>,
//   updatedState: Object,
//   unpublishedChanges: number,
//   drivers: Object,
//   sidebarOpen: boolean,
//   hideBanner: () => void,
//   toggleSidebar: () => void,
//   resetUnpublishedChanges: () => void,
//   toggleWorkOrderListener: () => void,
//   onDragEnd: () => void,
//   filter: Object,
//   sizes: Array<Params>,
//   actions: Array<Params>,
//   materials: Array<Params>,
//   actionTypes: Array<Params>,
//   isUpdating: boolean,
//   dispatch: Function,
//   manageWoPollingInterval: boolean => void,
//   history: History,
//   workOrders: Object,
// };
const suspendedActions = [
  'DUMP & RETURN RESUME',
  'FINAL RESUME',
  'SWITCH RESUME',
  'LIVE LOAD RESUME',
];

const arrayContains = (action, arrayOfActions) => arrayOfActions.indexOf(action) > -1;

class DriversPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingAddDrivers: false,
      showingFilters: false,
      showingCalendar: false,
      showingUnassignedOrders: true,
      showingSuspendedOrders: true,
      unassignedVisible: true,
      suspendedVisible: true,
      isListItem: true,
    };
    props.drivers.list.forEach((driver) => {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state[`showing${driver.id}`] = true;
    });
    this.modifiedDrivers = [];
    this.modifiedSuspendedWorkOrders = [];
    this.modifiedUnassignedWorkOrders = [];
    this.clientY = 0;
  }

  componentDidMount() {
    this.unmounted = false;
    window.addEventListener('driverExpand', this.handleDriverExpand);
    window.addEventListener('addModifiedDriver', this.handleAddModifiedDriver);
    window.addEventListener('addModifiedUnassignedOrder', this.handleAddModifiedUnassignedOrder);
    window.addEventListener('addModifiedSuspendedOrder', this.handleAddModifiedSuspendedOrder);
    window.addEventListener('setIsListItem', this.setIsListItem);
    setTimeout(() => {
      const map = document.getElementById('map');
      if (map) {
        map.addEventListener('click', this.closeFilters);
      }
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener('driverExpand', this.handleDriverExpand);
    window.removeEventListener('addModifiedDriver', this.handleAddModifiedDriver);
    window.removeEventListener('addModifiedUnassignedOrder', this.handleAddModifiedUnassignedOrder);
    window.removeEventListener('addModifiedSuspendedOrder', this.handleAddModifiedSuspendedOrder);
    window.removeEventListener('setIsListItem', this.setIsListItem);
    const map = document.getElementById('map');
    if (map) {
      map.removeEventListener('click', this.closeFilters);
    }
    // set to false
    this.props.sizes.map((size) => {
      this.props.filter[size.value] = false;
    });
    this.props.actions.map((action) => {
      this.props.filter[action.value] = false;
    });
    this.props.materials.map((material) => {
      this.props.filter[material.value] = false;
    });
    // reset the filters
    this.props.filter.action = '';
    this.props.filter.alleyPlacement = false;
    this.props.filter.cabOver = false;
    this.props.filter.cow = false;
    this.props.filter.customerProvidedProfile = false;
    this.props.filter.earlyPickUp = false;
    this.props.filter.material = '';
    this.props.filter.negotiatedFill = false;
    this.props.filter.okToRoll = false;
    this.props.filter.permittedCan = false;
    this.props.filter.priority = false;
    this.props.filter.scheduledStartAM = false;
    this.props.filter.scheduledStartPM = false;
    this.props.filter.search = '';
    this.props.filter.size = '';
    this.props.filter.sos = false;
    this.props.filter.status = '';
    this.props.sizes.map((size) => {
      delete this.props.filter[size.value];
    });
    this.props.actions.map((action) => delete this.props.filter[action.value]);
    this.props.materials.map((material) => {
      delete this.props.filter[material.value];
    });

    this.onFilterChange(this.props.filter);
    this.unmounted = true;
  }

  unmounted = true;

  setIsListItem = (e) => {
    this.setState({ isListItem: e.detail.isListItem });
  };

  closeFilters = (e) => {
    if (e.target.className === 'hoverButton') {
      return;
    }
    if (this.unmounted) {
      return;
    }
    this.setState({
      showingFilters: false,
    });
  };

  handleAddModifiedDriver = (e) => {
    if (!this.modifiedDrivers.includes(e.detail.to)) {
      this.modifiedDrivers.push(e.detail.to);
    }
    if (!this.modifiedDrivers.includes(e.detail.from)) {
      this.modifiedDrivers.push(e.detail.from);
    }
  };

  handleAddModifiedUnassignedOrder = (e) => {
    if (!this.modifiedUnassignedWorkOrders.map((order) => order.id).includes(e.detail.id)) {
      this.modifiedUnassignedWorkOrders.push(e.detail);
    }
  };

  handleAddModifiedSuspendedOrder = (e) => {
    if (!this.modifiedSuspendedWorkOrders.map((order) => order.id).includes(e.detail.id)) {
      this.modifiedSuspendedWorkOrders.push(e.detail);
    }
  };

  handleRemoveDriver = (driver) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Remove driver',
      level: 'info',
      type: 'user',
    });
    this.props.dispatch(removeAddedDriver(driver));
  };

  handleDriverExpand = (e) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Expand driver',
      level: 'info',
      type: 'user',
    });
    this.setState({
      [`showing${e.detail.destination}`]: true,
    });
  };

  onDriverClick = (driver) => {
    this.setState((state) => ({
      [`showing${driver.id}`]: !state[`showing${driver.id}`],
    }));
  };

  addDriver = () => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Add driver clicked',
      level: 'info',
      type: 'user',
    });
    this.setState({
      showingCalendar: false,
      showingAddDrivers: true,
    });
  };

  showCalendar = () => {
    this.setState((state) => ({
      showingCalendar: !state.showingCalendar,
    }));
  };

  toggleAddDrivers = () => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Add all drivers clicked',
      level: 'info',
      type: 'user',
    });
    this.setState((state) => ({
      showingAddDrivers: !state.showingAddDrivers,
    }));
  };

  onFilterChange = (filter = {}) => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Filter change',
      level: 'info',
      type: 'user',
    });
    this.props.dispatch(dispatchFilterChange(filter));
    this.props.force(filter, true);
  };

  handlePublish = () => {
    Sentry.addBreadcrumb({
      category: 'ui',
      message: 'Publish button clicked.',
      level: 'info',
      type: 'user',
    });
    const data = [];
    this.props.drivers.added.forEach((driver) => {
      if (this.modifiedDrivers.includes(driver.id)) {
        for (let i = 0; i < this.props.updatedState[driver.id].length; i++) {
          data.push({
            id: this.props.updatedState[driver.id][i].id,
            size: this.props.updatedState[driver.id][i].size,
            material: this.props.updatedState[driver.id][i].material,
            location1: this.props.updatedState[driver.id][i].location1,
            location2: this.props.updatedState[driver.id][i].location2,
            suspensionLocationId: this.props.updatedState[driver.id][i].suspensionLocation.id,
            scheduledDate: this.props.updatedState[driver.id][i].scheduledDate,
            action: this.props.updatedState[driver.id][i].action,
            index: i,
            driverId: driver.id,
            status: this.props.updatedState[driver.id][i].status,
          });
        }
      }
    });

    for (let i = 0; i < this.modifiedUnassignedWorkOrders.length; i++) {
      if (!data.map((datum) => datum.id).includes(this.modifiedUnassignedWorkOrders[i].id)) {
        data.push({
          id: this.modifiedUnassignedWorkOrders[i].id,
          size: this.modifiedUnassignedWorkOrders[i].size,
          material: this.modifiedUnassignedWorkOrders[i].material,
          location1: this.modifiedUnassignedWorkOrders[i].location1,
          location2: this.modifiedUnassignedWorkOrders[i].location2,
          scheduledDate: this.modifiedUnassignedWorkOrders[i].scheduledDate,
          action: this.modifiedUnassignedWorkOrders[i].action,
          index: i,
          driverId: null,
          status: 'UNASSIGNED',
        });
      }
    }

    if (!data.length) {
      return;
    }

    // data.forEach(datum => omit(datum, ['driver', 'location1']));
    data.forEach((datum) => {
      delete datum.driver;
      delete datum.location1;
      datum.locationId2 = datum.location2.id;
      delete datum.location2;
      delete datum.size;
      delete datum.material;
      delete datum.action;
    });

    // data.forEach(datum => delete dataum.location);
    this.modifiedDrivers = [];
    this.modifiedUnassignedWorkOrders = [];
    this.modifiedSuspendedWorkOrders = [];
    this.props.dispatch(updateWorkOrder(data));
    this.props.hideBanner();
    this.props.resetUnpublishedChanges();
  };

  handleUpdateSingleWorkOrder = async (payload) => {
    await this.props.dispatch(updateSingleWorkOrder(payload, this.props.filter));
    this.props.force({}, true, false, false, false);
  };

  handleUpdateSingleWorkOrderWDriver = async (payload, driver) => {
    await this.props.dispatch(updateSingleWorkOrderWithDriver(payload, driver));
    this.props.force({}, true, false, false, true);
  };

  handleCreateWorkOrder = async (payload) => {
    await this.props.dispatch(createWorkOrder(payload));
  };

  handleUnassignedVisibility = (e) => {
    e.stopPropagation();
    if (!this.unmounted) {
      this.setState(
        (state) => ({
          unassignedVisible: !state.unassignedVisible,
        }),
        () => {
          const event = new CustomEvent('hideUnassignedOrders', {
            detail: {
              driverId: 'unassigned',
              visible: this.state.unassignedVisible,
            },
          });
          window.dispatchEvent(event);
        },
      );
    }
  };

  handleSuspendedVisibility = (e) => {
    e.stopPropagation();
    if (!this.unmounted) {
      this.setState(
        (state) => ({
          suspendedVisible: !state.suspendedVisible,
        }),
        () => {
          const event = new CustomEvent('hideSuspendedOrders', {
            detail: {
              driverId: 'suspended',
              visible: this.state.suspendedVisible,
            },
          });
          window.dispatchEvent(event);
        },
      );
    }
  };

  handleOnDrop = (e, driver) => {
    e.preventDefault();
    let data;

    try {
      data = JSON.parse(e.dataTransfer.getData('text'));
      // eslint-disable-next-line
    } catch (err) {
      return;
    }
    const from = data.isSuspended ? 'suspended' : data.driverId || 'unassigned';
    const to = driver === 'suspended' ? 'suspended' : (driver && driver.id) || 'unassigned';

    // allow workorder index to go to bottom if driver is closed
    let index = 0;
    let driverElement = null;
    let topOrder = 1;

    if (driver === 'suspended') {
      driverElement = document.getElementById(`driverOrdersSuspended`);
    } else if (driver) {
      driverElement = document.getElementById(`driverOrders${driver.id}`);
    } else {
      driverElement = document.getElementById(`driverOrdersUnassigned`);
    }

    // allow for workorder to be placed in correct location for driver if opened
    if (driverElement !== null) {
      const { children } = driverElement;
      for (const element of children) {
        element.children[0].style.marginBottom = '0';
        element.children[0].style.marginTop = '0';
      }
      for (let i = 0; i < children.length; i++) {
        if (i === children.length - 1) {
          index = children.length;
          break;
        }
        if (
          i === 0 &&
          children[i].getBoundingClientRect().bottom -
            children[i].getBoundingClientRect().height / 2 >
            e.clientY
        ) {
          index = 0;

          if (
            data.isMapOrder &&
            children[i].getBoundingClientRect().bottom -
              children[i].getBoundingClientRect().height / 2 >
              e.clientY
          ) {
            topOrder = 0;
          }
          break;
        }
        if (
          children[i].getBoundingClientRect().bottom -
            children[i].getBoundingClientRect().height / 2 <
            e.clientY &&
          children[i + 1].getBoundingClientRect().bottom -
            children[i + 1].getBoundingClientRect().height / 2 >
            e.clientY
        ) {
          // eslint-disable-next-line eqeqeq
          if (this.clientY >= e.clientY || to != from) {
            index = i + 1;
            break;
          } else {
            index = i;
            break;
          }
        }
      }
    }
    // allow for the workorders to be indexed as the last workorder if driver is not expanded and dragged from drivers panel
    if (driverElement === null) {
      const orders = this.props.updatedState[to];

      if (orders.length > 0) {
        index = orders.length;
      } else {
        index = 0;
      }
    }

    if (data.isMapOrder) {
      if (index === 0 && topOrder !== 0) {
        index = this.props.updatedState[to].filter((workOrder) => workOrder.driver.id == to).length;
      }
      if (topOrder === 0) {
        index = 0;
      }
    }

    if (
      (index === data.workOrder.index && to == from) ||
      (to == 'unassigned' && from == 'unassigned') ||
      to == 'suspended' ||
      (to === 'unassigned' && from === 'suspended')
    ) {
      return;
    }

    if (!this.modifiedDrivers.includes(to)) {
      this.modifiedDrivers.push(to);
    }
    if (!this.modifiedDrivers.includes(from)) {
      this.modifiedDrivers.push(from);
    }
    if (to === 'unassigned' && !this.modifiedUnassignedWorkOrders.includes(data.workOrder)) {
      this.modifiedUnassignedWorkOrders.push(data.workOrder);
    }
    if (to === 'suspended' && !this.modifiedSuspendedWorkOrders.includes(data.workOrder)) {
      this.modifiedSuspendedWorkOrders.push(data.workOrder);
    }
    this.props.onDragEnd(
      {
        ...data.workOrder,
        status: to === 'unassigned' ? 'UNASSIGNED' : 'ASSIGNED',
        index,
        driver: { ...data.workOrder.driver, id: to },
      },
      from,
      to,
    );
  };

  handleOnDragOver = (e) => {
    e.preventDefault();
  };

  handleClickOrderFilterUnassigned = () => {
    this.setState((state) => ({
      showingFiltersUnassigned: !state.showingFiltersUnassigned,
    }));
  };

  handleToggleUnassigned = () => {
    this.setState((state) => ({
      showingUnassignedOrders: !state.showingUnassignedOrders,
    }));
  };

  handleToggleSuspended = () => {
    this.setState((state) => ({
      showingSuspendedOrders: !state.showingSuspendedOrders,
    }));
  };

  handleManagePollingInterval = (enable) => {
    this.props.manageWoPollingInterval(enable);
  };

  render() {
    return (
      <div
        className="driversPanel"
        style={this.props.sidebarOpen ? { right: '0' } : { right: '-395px' }}
        onMouseDown={(e) => (this.clientY = e.clientY)}
      >
        <span className="closeButtonPanel" onClick={this.props.toggleSidebar}>
          |||
        </span>
        <PrintableWorkOrders
          workOrders={this.props.updatedState.unassigned}
          style={{ position: 'absolute' }}
          ref={(el) => (this.componentRef = el)}
        />
        <PrintableWorkOrders
          workOrders={this.props.updatedState.suspended}
          style={{ position: 'absolute' }}
          ref={(el) => (this.suspendedRef = el)}
        />
        {this.props.drivers.added
          ? this.props.drivers.added.map((driver) => (
              <PrintableWorkOrders
                key={driver.id}
                driver={driver}
                workOrders={this.props.updatedState[driver.id]}
                style={{ position: 'absolute' }}
                ref={(el) => (this[`ref${driver.id}`] = el)}
              />
            ))
          : null}
        <PrintableWorkOrders
          workOrders={this.props.workOrders.filtered}
          style={{ position: 'absolute' }}
          ref={(el) => (this.allOrders = el)}
        />
        <div className="driversPanelContent">
          {this.state.showingAddDrivers ? (
            <AddDrivers toggleAddDrivers={this.toggleAddDrivers} force={this.props.force} />
          ) : null}
          {!this.state.showingAddDrivers ? <ul className="listview" id="listview">
              <DriversPanelHeader
                addDriver={this.addDriver}
                showCalendar={this.showCalendar}
                force={this.props.force}
                workOrders={this.props.workOrders.filtered}
                unpublishedChanges={this.props.unpublishedChanges}
              />
              <li
                className="listview-unassigned"
                onDrop={(e) => this.handleOnDrop(e, 'suspended')}
                onDragOver={this.handleOnDragOver}
                style={{ borderTop: '1px solid #888' }}
              >
                <div className="listview-unassigned-inner">
                  <div className="listview-unassigned-icon">
                    <svg
                      style={{
                        width: 24,
                        height: 24,
                        position: 'absolute',
                        left: 15,
                      }}
                      viewBox="0 0 24 24"
                      onClick={this.handleToggleSuspended}
                    >
                      <path
                        fill="currentColor"
                        d="M18.73,18C15.4,21.69 9.71,22 6,18.64C2.33,15.31 2.04,9.62 5.37,5.93C6.9,4.25 9,3.2 11.27,3C7.96,6.7 8.27,12.39 12,15.71C13.63,17.19 15.78,18 18,18C18.25,18 18.5,18 18.73,18Z"
                      />
                    </svg>
                  </div>
                  <div className="listview-unassigned-title" onClick={this.handleToggleSuspended}>
                    <div className="listview-flex--row">
                      <label>SUSPENDED ORDERS</label>
                    </div>
                    <div className="listview-flex--row">
                      <b>
                        <label name="order-count">
                          {(this.props.updatedState.suspended &&
                            this.props.updatedState.suspended
                              .filter((wo) => arrayContains(wo.action, suspendedActions))
                              .filter((order) => !order?.driver?.id).length) ||
                            0}{' '}
                          LOCATIONS
                        </label>
                      </b>
                    </div>
                  </div>
                  <div className="listview-unassigned-actions">
                    <ReactToPrint
                      trigger={() => (
                        <div style={{ width: '30px', display: 'inline-flex' }}>
                          <FontAwesomeIcon icon={faPrint} className="driver-fa-icon" />
                        </div>
                      )}
                      content={() => this.suspendedRef}
                    />
                    <div
                      style={{ width: '30px', display: 'inline-flex' }}
                      onClick={this.handleSuspendedVisibility}
                    >
                      <FontAwesomeIcon
                        icon={this.state.suspendedVisible ? faEye : faEyeSlash}
                        className="driver-fa-icon"
                      />
                    </div>
                  </div>
                </div>
                {this.props.updatedState.suspended &&
                !!this.props.updatedState.suspended.length &&
                this.state.showingSuspendedOrders ? (
                  <div className="driverOrders" id="driverOrdersSuspended">
                    <DroppableList
                      force={this.props.force}
                      waypoints={this.props.waypoints}
                      workOrders={this.props.updatedState.suspended
                        .filter((wo) => arrayContains(wo.action, suspendedActions))
                        .filter((order) => !order?.driver?.id)}
                      manageWoPollingInterval={this.handleManagePollingInterval}
                      onUpdateSingleWorkOrder={this.handleUpdateSingleWorkOrder}
                      onUpdateSingleWorkOrderWDriver={this.handleUpdateSingleWorkOrderWDriver}
                      onCreateWorkOrder={this.handleCreateWorkOrder}
                      unpublishedChanges={this.props.unpublishedChanges}
                      isUpdating={this.props.isUpdating}
                      isListItem={this.state.isListItem}
                      isSuspended
                    />
                  </div>
                ) : null}
              </li>

              <li
                className="listview-unassigned"
                onDrop={(e) => this.handleOnDrop(e, null)}
                onDragOver={this.handleOnDragOver}
                style={{ borderTop: '1px solid #888' }}
              >
                <div className="listview-unassigned-inner">
                  <div className="listview-unassigned-icon">
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      onClick={this.handleToggleUnassigned}
                      className="listview-filter-icon"
                    />
                  </div>
                  <div className="listview-unassigned-title" onClick={this.handleToggleUnassigned}>
                    <div className="listview-flex--row">
                      <label>UNASSIGNED ORDERS</label>
                    </div>
                    <div className="listview-flex--row">
                      <b>
                        <label name="order-count">
                          {(this.props.updatedState &&
                            this.props.updatedState.unassigned &&
                            this.props.updatedState.unassigned.length) ||
                            0}{' '}
                          LOCATIONS
                        </label>
                      </b>
                    </div>
                  </div>
                  <div className="listview-unassigned-actions">
                    <ReactToPrint
                      trigger={() => (
                        <div style={{ width: '30px', display: 'inline-flex' }}>
                          <FontAwesomeIcon icon={faPrint} className="driver-fa-icon" />
                        </div>
                      )}
                      content={() => this.componentRef}
                    />
                    <div
                      style={{ width: '30px', display: 'inline-flex' }}
                      onClick={this.handleClickOrderFilterUnassigned}
                    >
                      <FontAwesomeIcon icon={faFilter} className="driver-fa-icon" />
                    </div>
                    <div
                      style={{ width: '30px', display: 'inline-flex' }}
                      onClick={this.handleUnassignedVisibility}
                    >
                      <FontAwesomeIcon
                        icon={this.state.unassignedVisible ? faEye : faEyeSlash}
                        className="driver-fa-icon"
                      />
                    </div>
                    {this.state.showingFiltersUnassigned ? (
                      <FilterForm
                        onChange={this.onFilterChange}
                        state={this.props.filter}
                        sizes={this.props.sizes.filter((size) => {
                          let hasSize = false;
                          this.props.workOrders.list.forEach((order) => {
                            if (order.size === size.value) {
                              hasSize = true;
                            }
                          });
                          return hasSize;
                        })}
                        materials={this.props.materials.filter((material) => {
                          let hasMaterial = false;
                          this.props.workOrders.list.forEach((order) => {
                            if (order.material === material.value) {
                              hasMaterial = true;
                            }
                          });
                          return hasMaterial;
                        })}
                        actions={this.props.actionTypes.filter((action) => {
                          let hasAction = false;
                          this.props.workOrders.list.forEach((order) => {
                            if (order.action === action.value) {
                              hasAction = true;
                            }
                          });
                          return hasAction;
                        })}
                      />
                    ) : null}
                  </div>
                </div>
                {this.props.updatedState.unassigned &&
                !!this.props.updatedState.unassigned.length &&
                this.state.showingUnassignedOrders ? (
                  <div className="driverOrders" id="driverOrdersUnassigned">
                    <DroppableList
                      force={this.props.force}
                      waypoints={this.props.waypoints}
                      workOrders={this.props.updatedState.unassigned}
                      manageWoPollingInterval={this.handleManagePollingInterval}
                      onUpdateSingleWorkOrder={this.handleUpdateSingleWorkOrder}
                      onUpdateSingleWorkOrderWDriver={this.handleUpdateSingleWorkOrderWDriver}
                      onCreateWorkOrder={this.handleCreateWorkOrder}
                      unpublishedChanges={this.props.unpublishedChanges}
                      isUpdating={this.props.isUpdating}
                      isListItem={this.state.isListItem}
                      history={this.props.history}
                      isSuspended={false}
                    />
                  </div>
                ) : null}
              </li>

              {this.props.drivers.added
                ? this.props.drivers.added.map((driver) => {
                    const filteredWorkOrders =
                      this.props.updatedState[driver.id] === undefined
                        ? []
                        : this.props.updatedState[driver.id].concat(
                            this.props.updatedState.suspended.filter(
                              (workOrder) => workOrder?.driver?.id === driver.id,
                            ),
                          );
                    const seen = new Set();
                    const workOrders = filteredWorkOrders.filter((el) => {
                      const duplicate = seen.has(el.id);
                      seen.add(el.id);
                      return !duplicate;
                    });
                    return (
                      <div
                        key={driver.id}
                        onDrop={(e) => this.handleOnDrop(e, driver)}
                        onDragOver={this.handleOnDragOver}
                      >
                        <Driver
                          force={this.props.force}
                          driver={driver}
                          filter={this.props.filter}
                          workOrders={workOrders}
                          onDriverClick={this.onDriverClick}
                          onRemoveDriver={this.handleRemoveDriver}
                          unpublishedChanges={this.props.unpublishedChanges}
                          isUpdating={this.props.isUpdating}
                          toPrint={
                            <ReactToPrint
                              trigger={() => (
                                <div
                                  style={{
                                    width: '30px',
                                    display: 'inline-flex',
                                  }}
                                >
                                  <FontAwesomeIcon icon={faPrint} className="driver-fa-icon" />
                                </div>
                              )}
                              content={() => this[`ref${driver.id}`]}
                            />
                          }
                          toggleWorkOrderListener={this.props.toggleWorkOrderListener}
                        />
                        {workOrders && !!workOrders.length && this.state[`showing${driver.id}`] ? (
                          <li
                            style={{
                              padding: '0',
                            }}
                          >
                            <DroppableDriverList
                              force={this.props.force}
                              driver={driver}
                              drivers={this.props.drivers.added}
                              waypoints={this.props.waypoints}
                              workOrders={workOrders}
                              unpublishedChanges={this.props.unpublishedChanges}
                              isUpdating={this.props.isUpdating}
                              manageWoPollingInterval={this.handleManagePollingInterval}
                              onUpdateSingleWorkOrder={this.handleUpdateSingleWorkOrder}
                              onUpdateSingleWorkOrderWDriver={
                                this.handleUpdateSingleWorkOrderWDriver
                              }
                              onCreateWorkOrder={this.handleCreateWorkOrder}
                              isListItem={this.state.isListItem}
                              history={this.props.history}
                            />
                          </li>
                        ) : null}
                      </div>
                    );
                  })
                : null}
            </ul> : null}
        </div>
        <DriverPanelFooter
          workOrders={this.props.workOrders.filtered}
          onClickPublish={this.handlePublish}
          allOrders={this.allOrders}
          disablePublish={this.props.unpublishedChanges === 0}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filter: state.dispatcher.filter,
  setting: state.setting,
  locations: state.locations,
  drivers: state.drivers,
  isUpdating: state.workOrders.isUpdating,
  workOrders: state.workOrders,
  workOrderNotes: state.workOrderNotes,
  cans: state.cans,
  constants: state.constants,
  sizes: state.constants.can.size.map(labelAndValueExtractor),
  materials: state.constants.workOrder.material.map(labelAndValueExtractor),
  actions: Object.keys(state.constants.workOrder.action).map((key) =>
    labelAndValueExtractor(state.constants.workOrder.action[key]),
  ),
  statuses: Object.keys(state.constants.workOrder.status).map((key) =>
    labelAndValueExtractor(state.constants.workOrder.status[key]),
  ),
  actionTypes: Object.keys(state.constants.workOrder.action)
    .map((key) => labelAndValueExtractor(state.constants.workOrder.action[key]))
    .map((act) => ({
      label: act.label === 'SPOT' ? 'DELIVERY' : act.label,
      value: act.value,
    })),
});

export default connect(mapStateToProps)(DriversPanel);
