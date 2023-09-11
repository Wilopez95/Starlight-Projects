
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { animation, Menu, Item, Submenu } from 'react-contexify';
import { Paths } from '@root/routes/routing';
import { pathToUrl } from '@root/helpers/pathToUrl';

const suspendableOrders = ['DUMP & RETURN', 'FINAL', 'SWITCH', 'LIVE LOAD'];

const arrayContains = (action, arrayOfActions) => arrayOfActions.indexOf(action) > -1;

class CtxMenu extends PureComponent {
  static propTypes = {
    menuId: PropTypes.string,
    waypoints: PropTypes.array,
    workOrder: PropTypes.object.isRequired,
    force: PropTypes.func,
    showSelectLandfill: PropTypes.bool.isRequired,
    showCreateDropoff: PropTypes.bool.isRequired,
    showCreatePickup: PropTypes.bool.isRequired,
    unpublishedChanges: PropTypes.number.isRequired,
    isUpdating: PropTypes.bool,
    driver: PropTypes.object,
    onUpdateSingleWorkOrder: PropTypes.func.isRequired,
    onUpdateSingleWorkOrderWDriver: PropTypes.func.isRequired,
    onCreateWorkOrder: PropTypes.func.isRequired,
    onShown: PropTypes.func.isRequired,
    history: PropTypes.object,
  };

  handleCtxMenuEditClick = ({ event }) => {
    event.preventDefault();
    window.open(
      `/business-units/${window.location.pathname.match(/\d+/g)[0]}/workorders/map/edit/${
        this.props.workOrder.id
      }`,
      '_blank',
    );
  };

  handleCtxMenuSuspendClick = ({ event }) => {
    event.preventDefault();
    const { workOrder } = this.props;
    this.props.history.push(
      pathToUrl(`${Paths.Dispatcher}/suspend/:woaction/:step/:driverId/:workOrderId`, {
        businessUnit: window.location.pathname.match(/\d+/g)[0],
        woaction: encodeURIComponent(workOrder.action),
        step: encodeURIComponent(workOrder.step === null ? 'workorder' : workOrder.step),
        driverId: workOrder.driver?.id ?  workOrder.driver.id : 'nodriver',
        workOrderId: workOrder.id,
      }),
    );
  };

  handleCtxMenuCompleteClick = () => {
    const { onUpdateSingleWorkOrder } = this.props;

    const payload = {
      id: this.props.workOrder.id,
      status: 'COMPLETED',
    };

    onUpdateSingleWorkOrder(payload);
  };

  handleClickSubmenu1 = ({ data }) => {
    const { onUpdateSingleWorkOrderWDriver, driver } = this.props;

    const payload = {
      id: data.workOrderId,
      location2: data.location,
    };
    onUpdateSingleWorkOrderWDriver(payload, driver);
  };

  handleClickSubmenu2 = async ({ data }) => {
    const {  onCreateWorkOrder, force } = this.props;

    const payload = {
      size: data.workOrder.size,
      location1: data.location,
      driverId: data.workOrder.driver.id,
      action: 'DROPOFF CAN',
      status: 'ASSIGNED',
      index: data.workOrder.index,
      scheduledDate: data.workOrder.scheduledDate,
      material: data.workOrder.material,
      businessUnitId: window.location.pathname.match(/\d+/g)[0],
    };

    await onCreateWorkOrder(payload);
    force({}, false, false, true);
  };

  handleClickSubmenu3 = async ({ data }) => {
    const { onCreateWorkOrder, force } = this.props;

    const payload = {
      size: data.workOrder.size,
      location1: data.location,
      driverId: data.workOrder.driver.id,
      action: 'PICKUP CAN',
      status: 'ASSIGNED',
      index: data.workOrder.index - 1,
      scheduledDate: data.workOrder.scheduledDate,
      material: data.workOrder.material,
      businessUnitId: window.location.pathname.match(/\d+/g)[0],
    };

    await onCreateWorkOrder(payload);
    force({}, false, true, false);
  };

  renderDropOff() {
    return (
      <Submenu label="Create DROPOFF CAN">
        {this.props.waypoints
          ? this.props.waypoints
              .sort((a, b) => a.waypointName?.localeCompare(b.waypointName))
              .map((waypoint) => (
                <Item
                  key={waypoint.id}
                  data={{
                    location: waypoint,
                    workOrder: this.props.workOrder,
                  }}
                  onClick={this.handleClickSubmenu2}
                >
                  {waypoint.description || waypoint.name || waypoint.waypointName}
                </Item>
              ))
          : null}
      </Submenu>
    );
  }

  renderLandfills() {
    return (
      <Submenu label="Select landfill">
        {this.props.waypoints
          ? this.props.waypoints
              .sort((a, b) => a.waypointName?.localeCompare(b.waypointName))
              .map((waypoint) => (
                <Item
                  key={waypoint.id}
                  data={{
                    location: waypoint,
                    workOrderId: this.props.workOrder.id,
                  }}
                  onClick={this.handleClickSubmenu1}
                >
                  {waypoint.description || waypoint.name || waypoint.waypointName}
                </Item>
              ))
          : null}
      </Submenu>
    );
  }

  renderPickUp() {
    return (
      <Submenu label="Create PICKUP CAN">
        {this.props.waypoints
          ? this.props.waypoints
              .sort((a, b) => a.waypointName?.localeCompare(b.waypointName))
              .map((waypoint) => (
                <Item
                  key={waypoint.id}
                  data={{
                    location: waypoint,
                    workOrder: this.props.workOrder,
                  }}
                  onClick={this.handleClickSubmenu3}
                >
                  {waypoint.description || waypoint.name || waypoint.waypointName}
                </Item>
              ))
          : null}
      </Submenu>
    );
  }

  render() {
    const {
      workOrder,
      waypoints,
      showSelectLandfill,
      showCreatePickup,
      showCreateDropoff,
      onShown,
    } = this.props;

    return (
      <Menu id={this.props.menuId} animation={animation.fade} onShown={onShown}>
        <Item data={{ workOrderId: workOrder.id }} onClick={this.handleCtxMenuEditClick}>
          View/edit order
        </Item>
        {/* Only shows context for suspend if the step is on FINISH SERVICE and if not already suspended */}
        {arrayContains(workOrder.action, suspendableOrders) &&
          workOrder.suspensionLocation.id === null &&
          workOrder.step === 'FINISH SERVICE' ? <Item data={{ workOrderId: workOrder.id }} onClick={this.handleCtxMenuSuspendClick}>
              Suspend order
            </Item> : null}
        {showSelectLandfill && waypoints ? this.renderLandfills() : null}
        {showCreatePickup && waypoints ? this.renderPickUp() : null}
        {showCreateDropoff && waypoints ? this.renderDropOff() : null}
      </Menu>
    );
  }
}

export default CtxMenu;
