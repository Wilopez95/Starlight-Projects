/* eslint-disable max-lines, camelcase */
import { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { contextMenu } from 'react-contexify';
import { connect } from 'react-redux';
import MapboxTraffic from '@mapbox/mapbox-gl-traffic';
import mapboxgl from '@starlightpro/mapboxgl';
import moment from 'moment';
import { styleSwitcherControl } from '@root/helpers/mapboxStyleSwitcher';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';
import constants from '@root/helpers/constants.json';
// import colors from 'helpers/colors';
import DraggableMapWorkOrder from '@root/components/DraggableMapWorkOrder';
import DraggableMapSuspendedOrder from '@root/components/DraggableMapSuspendedOrder';
import DraggableMapDriverOrder from '@root/components/DraggableMapDriverOrder';
import makeCanTotalsPopup from '@root/components/CanTotalsPopup';
import WorkOrderListItem from '@root/components/WorkOrderListItem';
import ContextMenu from '@root/components/ContextMenu';
import {
  updateSingleWorkOrder,
  updateSingleWorkOrderWithDriver,
  createWorkOrder,
} from '@root/state/modules/workOrders';
import GroupedWorkOrdersSVG from './GroupedWorkOrdersSVG';
import TruckSVG from './TruckSVG';
import ContextMenuPortal from './ContextMenuPortal';

const { orderConfigs } = constants;

const HOUSE_IMG = 'https://starlight-prod-cdn-origin.s3.amazonaws.com/dispatch/img/home_icon.png';
const TRASH_IMG =
  'https://starlight-prod-cdn-origin.s3.amazonaws.com/dispatch/img/trashcan_icon.png';
const RECYCLE_IMG =
  'https://starlight-prod-cdn-origin.s3.amazonaws.com/dispatch/img/recycle_icon.png';

const waypointTypes = [
  {
    key: 'STORAGE_YARD',
    name: 'Storage Yard',
    waypointImage: HOUSE_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'HOME_YARD',
    name: 'Home Yard',
    waypointImage: HOUSE_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'LANDFILL',
    name: 'Landfill',
    waypointImage: TRASH_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'RECYCLE_CENTER',
    name: 'Recycle Center',
    waypointImage: RECYCLE_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'LAND_FILL_/_STORAGE_YARD',
    name: 'Land fill / Storage Yard',
    waypointImage: TRASH_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'LANDFILL_STORAGE_YARD',
    name: 'Land fill / Storage Yard',
    waypointImage: TRASH_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'LAND_FILL / STORAGE YARD',
    name: 'Land fill / Storage Yard',
    waypointImage: TRASH_IMG,
    scaledSize: [52, 60],
  },
  {
    key: 'TRANSFER_CENTER',
    name: 'Transfer Center',
    waypointImage: TRASH_IMG,
    scaledSize: [52, 60],
  },
];

const suspendedActions = [
  'DUMP & RETURN RESUME',
  'FINAL RESUME',
  'SWITCH RESUME',
  'LIVE LOAD RESUME',
];

const arrayContains = (action, arrayOfActions) => arrayOfActions.indexOf(action) > -1;

class DispatchMap extends Component {
  static propTypes = {
    cans: PropTypes.array.isRequired,
    updatedState: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    locations: PropTypes.array.isRequired,
    drivers: PropTypes.array.isRequired,
    filter: PropTypes.object,
    sidebarOpen: PropTypes.bool.isRequired,
    onDragEnd: PropTypes.func,
    workOrderNotes: PropTypes.object.isRequired,
    force: PropTypes.func,
    dispatch: PropTypes.func,
    unpublishedChanges: PropTypes.number,
    manageWoPollingInterval: PropTypes.func,
  };

  static defaultProps = {
    drivers: [],
    options: {
      center: {
        lat: 39.75101745196717,
        lng: -105.00389099121094,
      },
    },
  };

  constructor(props) {
    super(props);

    this.driverMarkers = [];
    this.markers = [];
    this.stackedMarkers = [];
    this.traffic = new MapboxTraffic();
    this.nav = new mapboxgl.NavigationControl();
    this.styleSwitcher = new styleSwitcherControl();
    this.fullscreen = new mapboxgl.FullscreenControl();
    this.clientX = 0;
    this.clientY = 0;
    this.isDragging = false;
    this.workOrder = null;
    this.state = {
      driversHidden: [],
      suspendedVisible: true,
      unassignedVisible: true,
    };
    this.zoom = props.options.zoom;
  }

  componentDidMount() {
    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: 'dispatch-map',
      style: MAPBOX_STYLE_URL,
      // lon, lat
      center: [
        parseFloat(this.props.options.center.lng),
        parseFloat(this.props.options.center.lat),
      ],
      zoom: this.props.options.zoom,
      boxZoom: false,
      pitchWithRotate: false,
      dragRotate: false,
      interactive: true,
    });

    map.on('load', () => {
      this.map = map;
      this.map.addControl(this.nav, 'top-left');
      this.map.addControl(this.traffic, 'top-left');
      this.map.addControl(this.styleSwitcher, 'top-left');
      this.map.addControl(this.fullscreen, 'top-left');

      this.map.on('style.load', () => {
        this.traffic.toggleTraffic();
        this.traffic.toggleTraffic();
      });

      this.map.on('zoomend', () => {
        this.zoom = this.map.getZoom();
        this.markers.forEach((marker) => marker.marker.remove());
        this.markers = [];
        this.stackedMarkers.forEach((marker) => marker.marker.remove());
        this.stackedMarkers = [];

        this.createUnassignedMarkers();
        this.createAssignedMarkers();
        this.setListeners();
      });

      this.props.locations.forEach((item) => {
        const icon = waypointTypes.filter((waypoint) => waypoint.key === item.waypointType);
        const el = document.createElement('div');
        el.title = item.description ? item.description : item.name || item.waypointName;
        el.style.width = icon[0] && `${icon[0].scaledSize[0]}px`;
        el.style.height = icon[0] && `${icon[0].scaledSize[1]}px`;
        el.style.backgroundImage = `url(${
          (icon[0] && icon[0].waypointImage) ||
          'https://cdn.starlightpro.com/dispatch/img/trash-icon.png'
        })`;
        el.style.backgroundRepeat = 'no-repeat';

        const cans = this.props.cans.filter((can) => can.location.id === item.id);
        const html = makeCanTotalsPopup(cans);

        const marker = new mapboxgl.Marker(el);
        marker.setLngLat([item.location.lon, item.location.lat]);
        marker.setPopup(new mapboxgl.Popup().setHTML(html));

        marker.addTo(this.map);
      });

      this.createDrivers();
      this.createUnassignedMarkers();
      this.createAssignedMarkers();
      this.setListeners();
    });
    window.addEventListener('hideDriverOrders', this.hideDriverOrders);
    window.addEventListener('hideUnassignedOrders', this.hideUnassignedOrders);
    window.addEventListener('hideSuspendedOrders', this.hideSuspendedOrders);
  }

  componentDidUpdate(prevProps) {
    if (!this.map) {
      return;
    }
    this.enablePan();
    if (prevProps.sidebarOpen) {
      this.map.resize();
    }
    if (
      !isEqual(prevProps.updatedState, this.props.updatedState) ||
      !isEqual(this.props.drivers.length, prevProps.drivers.length)
    ) {
      this.markers.forEach((marker) => marker.marker.remove());
      this.markers = [];
      this.stackedMarkers.forEach((marker) => marker.marker.remove());
      this.stackedMarkers = [];

      this.createUnassignedMarkers();
      this.createAssignedMarkers();
      this.setListeners();
    }

    if (!isEqual(this.props.drivers, prevProps.drivers)) {
      this.driverMarkers.forEach((marker) => marker.marker.remove());
      this.driverMarkers = [];
      this.createDrivers();
    }
  }

  componentWillUnmount() {
    this.unsetListeners();
    window.removeEventListener('hideDriverOrders', this.hideDriverOrders);
    window.removeEventListener('hideUnassignedOrders', this.hideUnassignedOrders);
    window.removeEventListener('hideSuspendedOrders', this.hideSuspendedOrders);
    document.removeEventListener('dragover', this.dragListener);
    this.driverMarkers = [];
    this.markers = [];
    this.stackedMarkers = [];
  }

  handleUpdateSingleWorkOrder = async (payload) => {
    // JULIE
    await this.props.dispatch(updateSingleWorkOrder(payload, this.props.filter));
    this.props.force({}, true, false, false);
  };

  handleUpdateSingleWorkOrderWDriver = (payload, driver) => {
    this.props.dispatch(updateSingleWorkOrderWithDriver(payload, driver));
  };

  handleCreateWorkOrder = (payload) => {
    this.props.dispatch(createWorkOrder(payload));
  };

  hideUnassignedOrders = (e) => {
    this.setState({
      unassignedVisible: e.detail.visible,
    });
    if (e.detail.visible) {
      this.markers.forEach((marker) => {
        if (marker.type && marker.type === 'unassigned') {
          marker.marker.addTo(this.map);
        }
      });
      if (e.detail.driverId === 'unassigned') {
        this.stackedMarkers.forEach((marker) => {
          marker.marker.addTo(this.map);
        });
      }
    } else {
      this.markers.forEach((marker) => {
        if (marker.type && marker.type === 'unassigned') {
          marker.marker.remove();
        }
      });
      if (e.detail.driverId === 'unassigned') {
        this.stackedMarkers.forEach((marker) => {
          marker.marker.remove();
        });
      }
    }
  };

  hideSuspendedOrders = (e) => {
    this.setState({
      suspendedVisible: e.detail.visible,
    });
    if (e.detail.visible) {
      this.markers.forEach((marker) => {
        if (marker.type && marker.type === 'suspended') {
          marker.marker.addTo(this.map);
        }
      });
      if (e.detail.driverId === 'suspended') {
        this.stackedMarkers.forEach((marker) => {
          marker.marker.addTo(this.map);
        });
      }
    } else {
      this.markers.forEach((marker) => {
        if (marker.type && marker.type === 'suspended') {
          marker.marker.remove();
        }
      });
      if (e.detail.driverId === 'suspended') {
        this.stackedMarkers.forEach((marker) => {
          marker.marker.remove();
        });
      }
    }
  };

  hideDriverOrders = (e) => {
    if (e.detail.visible) {
      this.markers.forEach((marker) => {
        if (marker.driver && marker.driver.id === e.detail.driverId) {
          marker.marker.addTo(this.map);
        }
      });
      this.setState((state) => ({
        driversHidden: state.driversHidden.filter((driver) => driver !== e.detail.driverId),
      }));
    } else {
      this.markers.forEach((marker) => {
        if (marker.driver && marker.driver.id === e.detail.driverId) {
          marker.marker.remove();
        }
      });
      this.setState((state) => ({
        driversHidden: [e.detail.driverId, ...state.driversHidden],
      }));
    }
  };

  /**
   * Adds a marker for each driver on the map with a custom truck image. Each marker
   * has its own popup element.
   * @memberof DispatchMap
   */
  createDrivers = () => {
    this.props.drivers.forEach((driver) => {
      const popup = new mapboxgl.Popup({
        offset: 25,
      }).setHTML(
        `<div id="driver-marker-popup">${driver.description} <br/> Truck: ${driver.truck.description}</div>`,
      );

      const el = document.createElement('div');
      el.title = `${driver.description}\n${driver.truck.description}`;
      el.innerHTML = TruckSVG(driver);

      const marker = new mapboxgl.Marker(el).setPopup(popup);
      if (!this.driverMarkers.map((marker) => marker.driver.id).includes(driver.id)) {
        this.driverMarkers.push({
          driver,
          marker,
        });
      }
      marker.setLngLat([
        driver.truck.location ? driver.truck.location.lon : null,
        driver.truck.location ? driver.truck.location?.lat : null,
      ]);
      marker.addTo(this.map);
    });
  };

  handleContextMenu = (event) => {
    event.preventDefault();
    contextMenu.show({
      event,
      id: event.currentTarget.dataset.menu,
    });
  };

  onShown = () => {
    const stackedMarkerInfoWindow = document.getElementById('stackedMarkerInfoWindow');
    const onScroll = () => {
      contextMenu.hideAll();
      stackedMarkerInfoWindow.removeEventListener('scroll', onScroll);
    };
    stackedMarkerInfoWindow.addEventListener('scroll', onScroll);
  };

  createUnassignedMarkers = () => {
    let orders = [];
    // orders = orders.concat(this.props.updatedState.suspended);
    orders = orders.concat(
      this.props.updatedState.suspended
        .filter((wo) => arrayContains(wo.action, suspendedActions))
        .filter((order) => !order?.driver?.id),
    );
    orders = orders.concat(this.props.updatedState.unassigned);
    orders.forEach((workOrder) => {
      const orderConfig = orderConfigs.filter(
        (config) => config.name.toLowerCase() === workOrder.action.toLowerCase(),
      )[0];

      if (
        orders.filter(
          (marker) =>
            marker.location1.location.lat === workOrder.location1.location.lat &&
            marker.location1.location.lon === workOrder.location1.location.lon,
        ).length < 2
      ) {
        const workorderAction = workOrder.action === 'SPOT' ? 'DELIVERY' : workOrder.action;
        const el = document.createElement('div');
        el.id = `drag-target${workOrder.id}`;
        el.title = `#${workOrder.id}: ${workOrder.size} yard - ${workorderAction}`;
        el.draggable = 'true';
        el.className = 'draggable-map-work-order';
        el.innerHTML = workOrder.suspensionLocation.id
          ? DraggableMapSuspendedOrder(workOrder, orderConfig)
          : DraggableMapWorkOrder(workOrder, orderConfig);

        const marker = new mapboxgl.Marker(el);
        if (!this.markers.map((item) => item.workOrder.id).includes(workOrder.id)) {
          this.markers.push({
            marker,
            workOrder,
            type: workOrder.suspensionLocation.id ? 'suspended' : 'unassigned',
            lat: workOrder.location1.location.lat,
            lon: workOrder.location1.location.lon,
          });
        }

        marker.setLngLat([workOrder.location1.location.lon, workOrder.location1.location.lat]);
        if (!workOrder.suspensionLocation.id && this.state.unassignedVisible) {
          marker.addTo(this.map);
        }
        if (workOrder.suspensionLocation.id && this.state.suspendedVisible) {
          marker.addTo(this.map);
        }
      } else if (
        !this.stackedMarkers.filter(
          (marker) =>
            marker.lat === workOrder.location1.location.lat &&
            marker.lon === workOrder.location1.location.lon,
        ).length
      ) {
        const groupedWorkOrdersArr = orders.filter(
          (order) =>
            order.location1.location.lat === workOrder.location1.location.lat &&
            order.location1.location.lon === workOrder.location1.location.lon,
        );
        const el = document.createElement('div');
        el.innerHTML = GroupedWorkOrdersSVG(groupedWorkOrdersArr);

        const marker = new mapboxgl.Marker(el);
        this.stackedMarkers.push({
          workOrders: orders.filter(
            (item) =>
              item.location1.location.lat === workOrder.location1.location.lat &&
              item.location1.location.lon === workOrder.location1.location.lon,
          ),
          marker,
          lat: workOrder.location1.location.lat,
          lon: workOrder.location1.location.lon,
        });
        marker.setLngLat([workOrder.location1.location.lon, workOrder.location1.location.lat]);

        const html = `<div id="stackedMarkerInfoWindow" style="max-height: 500px; overflow-y: auto; overflow-x: hidden; width: 372px; position: relative; text-align: left;" />`;

        const popup = new mapboxgl.Popup();
        popup.on('close', () => {
          // el.style.backgroundImage =
          //   "url('https://cdn.starlightpro.com/dispatch/img/plus_botton_for_map.png')";
        });
        popup.on('open', () => {
          this.map.setCenter([
            workOrder?.location1?.location?.lon,
            workOrder?.location1?.location?.lat,
          ]);
          // el.style.backgroundImage =
          //   "url('https://cdn.starlightpro.com/dispatch/img/minus_botton_for_map.png')";
          ReactDOM.render(
            <div
              style={{
                border: '1px solid black',
                width: '360px',
                padding: '12px 6px 0 6px',
                background: 'white',
              }}
            >
              {orders
                .filter(
                  (order) =>
                    order.location1.location.lat === workOrder.location1.location.lat &&
                    order.location1.location.lon === workOrder.location1.location.lon,
                )
                .map((match, index) => {
                  const orderConfig = orderConfigs.filter(
                    (config) => config.name.toLowerCase() === match.action.toLowerCase(),
                  )[0];

                  return (
                    <div
                      key={match.id}
                      onContextMenu={this.handleContextMenu}
                      data-menu={`${match.id.toString()}-window`}
                    >
                      <WorkOrderListItem
                        key={match.id}
                        orderConfig={orderConfig}
                        workOrder={match}
                        workOrders={orders.filter(
                          (order) =>
                            order.location1.location.lat === workOrder.location1.location.lat &&
                            order.location1.location.lon === workOrder.location1.location.lon,
                        )}
                        id={`drag-target${match.id}`}
                        index={index}
                        manageWoPollingInterval={this.props.manageWoPollingInterval}
                        suppressSVG
                      />
                      <ContextMenuPortal>
                        <ContextMenu
                          driver={{ id: null }}
                          waypoints={this.props.locations}
                          workOrder={match}
                          onShown={this.onShown}
                          menuId={`${match.id.toString()}-window`}
                          force={this.props.force}
                          onUpdateSingleWorkOrder={this.handleUpdateSingleWorkOrder}
                          onUpdateSingleWorkOrderWDriver={this.handleUpdateSingleWorkOrderWDriver}
                          onCreateWorkOrder={this.handleCreateWorkOrder}
                          // dispatch={this.props.dispatch}
                          showSelectLandfill={
                            orderConfig.puzzlePositions.bottom ||
                            orderConfig.name === 'dump & return'
                          }
                          showCreatePickup={
                            (orderConfig.puzzlePositions.top &&
                              workOrder.status !== 'UNASSIGNED' &&
                              orderConfig.name === 'dump & return') ||
                            orderConfig.name === 'live load' ||
                            orderConfig.name === 'switch' ||
                            orderConfig.name === 'spot'
                          }
                          showCreateDropoff={
                            (orderConfig.puzzlePositions.bottom &&
                              workOrder.status !== 'UNASSIGNED' &&
                              orderConfig.name === 'dump & return') ||
                            orderConfig.name === 'live load' ||
                            orderConfig.name === 'switch' ||
                            orderConfig.name === 'final'
                          }
                          unpublishedChanges={this.props.unpublishedChanges}
                        />
                      </ContextMenuPortal>
                    </div>
                  );
                })}
            </div>,
            document.getElementById('stackedMarkerInfoWindow'),
          );
        });
        marker.setPopup(popup.setHTML(html));
        marker.addTo(this.map);
      }
    });
  };

  createAssignedMarkers = () => {
    this.props.drivers.forEach((driver) => {
      if (this.props.updatedState[driver.id]) {
        if (!this.state.driversHidden.includes(driver.id)) {
          this.props.updatedState[driver.id].forEach((workOrder, index) => {
            if (!this.markers.map((item) => item.workOrder.id).includes(workOrder.id)) {
              this.markers.push({
                type: 'assigned',
                driver,
                lat: workOrder.location1.location.lat,
                lon: workOrder.location1.location.lon,
                workOrder: {
                  ...workOrder,
                  index,
                },
              });
            }
          });
        }
      }
    });

    this.markers.forEach((marker) => {
      if (marker.type !== 'assigned') {
        return;
      }
      const hasStackedUnassignedOrder =
        this.stackedMarkers.filter((item) => marker.lat === item.lat && marker.lon === item.lon)
          .length === 1;

      const markerWorkorderAction =
        marker.workOrder.action === 'SPOT' ? 'DELIVERY' : marker.workOrder.action;
      const el = document.createElement('div');
      const hasTime = marker.workOrder.scheduledStart && marker.workOrder.scheduledEnd;
      const timeTitle = `scheduled time: ${moment(
        marker.workOrder.scheduledStart,
        'HH:mm:ss',
      ).format('hh:mm a')} - ${moment(marker.workOrder.scheduledEnd, 'HH:mm:ss').format(
        'hh:mm a',
      )}`;

      el.id = `drag-target${marker.workOrder.id}`;

      el.title = `#${marker.workOrder.id}: ${
        marker.workOrder.size
      } yard - ${markerWorkorderAction} ${hasTime ? timeTitle : ''}`;
      el.className = 'draggable-map-work-order';
      el.draggable = true;
      el.innerHTML = DraggableMapDriverOrder(marker.workOrder, marker.driver);

      const index = this.markers
        .filter((item) => item.type === 'assigned')
        .filter((item) => marker.lat === item.lat && marker.lon === item.lon)
        .map((item) => item.workOrder.id)
        .indexOf(marker.workOrder.id);

      switch (index) {
        case 0:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-5 * this.zoom, -1.5 * this.zoom]
              : [0, -2 * this.zoom],
          });
          break;
        case 1:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-2 * this.zoom, -1.5 * this.zoom]
              : [3 * this.zoom, -2 * this.zoom],
          });
          break;
        case 2:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-3.5 * this.zoom, 1.5 * this.zoom]
              : [1.5 * this.zoom, this.zoom],
          });
          break;
        case 3:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-6.5 * this.zoom, 1.5 * this.zoom]
              : [-1.5 * this.zoom, this.zoom],
          });
          break;
        case 4:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-8.0 * this.zoom, -1.5 * this.zoom]
              : [-3 * this.zoom, -2 * this.zoom],
          });
          break;
        case 5:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-6.5 * this.zoom, -4.5 * this.zoom]
              : [-1.5 * this.zoom, -5 * this.zoom],
          });
          break;
        case 6:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-3.5 * this.zoom, -4.5 * this.zoom]
              : [1.5 * this.zoom, -5 * this.zoom],
          });
          break;
        default:
          marker.marker = new mapboxgl.Marker(el, {
            offset: hasStackedUnassignedOrder
              ? [-2.0 * this.zoom, -1.5 * this.zoom]
              : [3 * this.zoom, -2 * this.zoom],
          });
      }

      marker.marker.setLngLat([marker.lon, marker.lat]);
      marker.marker.addTo(this.map);
    });
  };

  setListeners = () => {
    document.addEventListener('dragover', this.dragListener);
    this.markers.forEach((item) => {
      const dragTarget = document.getElementById(`drag-target${item.workOrder.id}`);
      if (!dragTarget) {
        return;
      }
      dragTarget.addEventListener('dragstart', (e) =>
        this.onDragStart(e, item.workOrder, item.driver),
      );
      dragTarget.addEventListener('dragend', (e) => this.onDragEnd(e, item.workOrder));
      dragTarget.addEventListener('mouseenter', this.disablePan);
      dragTarget.addEventListener('mouseleave', this.enablePan);
      dragTarget.addEventListener('drag', this.handleOnDrag);

      const driverNotes = [];
      if (this.props.workOrderNotes.list > 0) {
        driverNotes.push(this.props.workOrderNotes.list);
      }
      if (item.workOrder.instructions !== null) {
        driverNotes.push(item.workOrder);
      }
      dragTarget.addEventListener('click', () => this.props.onClick(item.workOrder, driverNotes));
    });
    this.stackedMarkers.forEach((marker) => {
      marker.workOrders.forEach((order) => {
        const dragTarget = document.getElementById(`drag-target${order.id}`);
        if (!dragTarget) {
          return;
        }
        dragTarget.addEventListener('dragstart', (e) => this.onDragStart(e, order, null));
        this.map.flyTo({ center: order.location1.location });
        dragTarget.addEventListener('dragend', (e) => this.onDragEnd(e, order));
        dragTarget.addEventListener('mouseenter', this.disablePan);
        dragTarget.addEventListener('mouseleave', this.enablePan);
      });
    });
  };

  dragListener = (e) => {
    e.preventDefault();
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    if (this.isDragging) {
      const dragImage = document.getElementById(`drag-offscreen${this.workOrder.id}`);
      if (!dragImage) {
        return;
      }
      dragImage.style.left = `${this.clientX - 300}px`;
      dragImage.style.top = `${this.clientY - 50}px`;
    }
  };

  unsetListeners = () => {
    this.markers.forEach((item) => {
      const { workOrder } = item;
      const dragTarget = document.getElementById(`drag-target${workOrder.id}`);
      if (!dragTarget) {
        return;
      }
      const clonedElement = dragTarget.cloneNode(true);
      dragTarget.parentNode.replaceChild(clonedElement, dragTarget);
    });
    this.stackedMarkers.forEach((marker) => {
      marker.workOrders.forEach((workOrder) => {
        const dragTarget = document.getElementById(`drag-target${workOrder.id}`);
        if (!dragTarget) {
          return;
        }
        const clonedElement = dragTarget.cloneNode(true);
        dragTarget.parentNode.replaceChild(clonedElement, dragTarget);
      });
    });
  };

  onDragStart = (e, workOrder, driver) => {
    this.isDragging = true;
    this.workOrder = workOrder;
    const event = new CustomEvent('setIsListItem', {
      detail: {
        isListItem: false,
      },
    });
    window.dispatchEvent(event);
    e.stopPropagation();
    this.props.manageWoPollingInterval(false);
    this.screenY = e.screenY;
    const startY = document.getElementById(
      `workOrderListItem-${workOrder.driver.id}-${workOrder.id}`,
    )
      ? document
          .getElementById(`workOrderListItem-${workOrder.driver.id}-${workOrder.id}`)
          .getBoundingClientRect().top
      : 0;
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    const dragImage = document.getElementById(`drag-offscreen${workOrder.id}`);
    if (!dragImage) {
      return;
    }
    dragImage.style.display = 'block';
    e.dataTransfer.effectAllowed = 'move';
    const img = document.createElement('img');
    img.setAttribute(
      'src',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
    );
    document.body.appendChild(img);
    e.dataTransfer.setDragImage(img, 100, 50);
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        workOrder,
        driverId: (driver && driver.id) || 'unassigned',
        y: startY,
        isMapOrder: true,
        isSuspended: dragImage.className.includes('suspended'),
      }),
    );
  };

  onDragEnd = (e, workOrder) => {
    this.isDragging = false;
    const event = new CustomEvent('setIsListItem', {
      detail: {
        isListItem: true,
      },
    });
    window.dispatchEvent(event);
    e.stopPropagation();
    // document.getElementsByTagName('html')[0].style.overflow = 'visible';
    const dragImage = document.getElementById(`drag-offscreen${workOrder.id}`);
    if (!dragImage) {
      return;
    }
    dragImage.style.display = 'none';
    dragImage.style.left = '-500px';
  };

  disablePan = () => {
    this.map.dragPan.disable();
  };

  enablePan = () => {
    this.map.dragPan.enable();
  };

  handleOnDragOver = (e) => {
    e.preventDefault();

    const driverElement = document.getElementById(`driverOrdersUnassigned`);
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (driverElement != null) {
      const { children } = driverElement;
      for (let i = 0; i < children.length; i++) {
        children[i].children[0].style.marginBottom = '0';
      }
    }
  };

  handleOnDrag = (e) => {
    const listElement = document.getElementsByClassName('listview')[0];
    if (e.screenY > this.screenY && this.lastScreenY < e.screenY) {
      listElement.scrollTop += 8;
    } else if (e.screenY < this.screenY && this.lastScreenY > e.screenY) {
      listElement.scrollTop -= 8;
    }
    this.lastScreenY = e.screenY;
  };

  handleOnDrop = (e) => {
    e.preventDefault();

    const driverElement = document.getElementById(`driverOrdersUnassigned`);
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (driverElement != null) {
      const { children } = driverElement;
      for (let i = 0; i < children.length; i++) {
        children[i].children[0].style.marginBottom = '0';
        children[i].children[0].style.marginTop = '0';
      }
    }

    let data;

    try {
      data = JSON.parse(e.dataTransfer.getData('text'));
      // eslint-disable-next-line
    } catch (err) {
      return;
    }

    if (data.isSuspended) {
      return;
    }
    const from = `${data.driverId}` || 'unassigned';
    const to = 'unassigned';

    if (from === 'unassigned' || data.isMapOrder) {
      return;
    }

    const event = new CustomEvent('addModifiedUnassignedOrder', {
      detail: data.workOrder,
    });
    window.dispatchEvent(event);

    const driverEvent = new CustomEvent('addModifiedDriver', {
      detail: {
        to,
        from,
      },
    });
    window.dispatchEvent(driverEvent);

    this.props.onDragEnd(
      {
        ...data.workOrder,
        index: 0,
        driver: { ...data.workOrder.driver, id: to },
      },
      from,
      to,
    );
  };

  render() {
    return (
      <div
        style={{
          height: 'calc(100vh - 62px)',
          width: this.props.sidebarOpen ? 'calc(100% - 395px)' : '100%',
        }}
        id="dispatch-map"
        onDragOver={this.handleOnDragOver}
        onDrop={this.handleOnDrop}
        onDragEnter={(e) => e.preventDefault()}
      />
    );
  }
}

export default connect()(DispatchMap);
