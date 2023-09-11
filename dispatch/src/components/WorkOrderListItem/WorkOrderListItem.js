/* eslint-disable complexity */
import { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Waiting from '@root/static/images/waiting.svg';

const getItemStyle = (orderConfig, isTopConnected, isBottomConnected) => {
  const padding = orderConfig.puzzlePositions.top ? 0 : 16;
  return {
    userSelect: 'none',
    paddingTop: padding,
    paddingBottom: padding,
    marginTop: isTopConnected ? '20px' : '0',
    marginBottom: isBottomConnected ? '25px' : '45px',
    backgroundColor: orderConfig.bodyColor,
    color: orderConfig.color,
  };
};

const getPositionDifferenceFromWorkOrder = (size) => {
  switch (size) {
    case '10':
      return 50;
    case '12':
      return 90;
    case '20':
      return 140;
    case '30':
      return 190;
    case '40':
      return 240;
    case '40CT':
      return 240;
    default:
      return 50;
  }
};

// const Header =

class WorkOrderListItem extends Component {
  static propTypes = {
    orderConfig: PropTypes.object.isRequired,
    workOrder: PropTypes.object,
    workOrders: PropTypes.array,
    drivers: PropTypes.array,
    driver: PropTypes.object,
    style: PropTypes.object,
    id: PropTypes.string,
    index: PropTypes.number,
    suppressSVG: PropTypes.bool,
    class: PropTypes.string,
    manageWoPollingInterval: PropTypes.func,
    isListItem: PropTypes.bool,
    isSuspended: PropTypes.bool,
  };

  static defaultProps = {
    drivers: [],
    isListItem: true,
  };

  constructor(props) {
    super(props);

    this.clientX = 0;
    this.clientY = 0;
    this.isDragging = false;
    this.state = {
      driverId: this.props.workOrder.driver.id || 'unassigned',
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.ref.ondragstart = (e) => this.onDragStart(e, this.props.workOrder);
    this.ref.ondragend = (e) => this.onDragEnd(e);
    this.ref.ondragover = this.handleOnDragOver;
    this.ref.ondrag = this.handleOnDrag;
    document.addEventListener('dragover', this.dragOverListener);
  }

  componentWillUnmount() {
    document.removeEventListener('dragover', this.dragOverListener);
    this._isMounted = false;
  }

  _isMounted = false;

  dragOverListener = (e) => {
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    if (this.isDragging) {
      const dragImage = document.getElementById(`drag-offscreen${this.props.workOrder.id}`);
      if (!dragImage) {
        return;
      }
      dragImage.style.left = `${this.clientX - 300}px`;
      dragImage.style.top = `${this.clientY - 50}px`;
    }
  };

  getActionName = (action) => {
    switch (action) {
      case 'SPOT':
        return 'DELIVERY';
      case 'DROPOFF CAN':
        return 'DROPOFF';
      case 'PICKUP CAN':
        return 'PICKUP';
      default:
        return action;
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

  handleOnDragOver = (e) => {
    if (!this.props.isListItem) {
      return;
    }
    e.preventDefault();
    if (this.props.suppressSVG || !this.props.workOrder.driver.id) {
      return;
    }

    const element = this.ref;
    let driverElement = null;
    if (this.props.driver) {
      driverElement = document.getElementById(`driverOrders${this.props.driver.id}`);
    } else {
      driverElement = document.getElementById(`driverOrdersUnassigned`);
    }
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (driverElement != null) {
      const { children } = driverElement;
      for (let i = 0; i < children.length; i++) {
        children[i].children[0].style.marginBottom = '0';
        children[i].children[0].style.marginTop = '0';
        driverElement.style.paddingBottom = '0';
      }
    }
    if (
      // eslint-disable-next-line no-eq-null, eqeqeq
      driverElement != null &&
      driverElement.getBoundingClientRect().bottom - element.getBoundingClientRect().height / 2 <
        e.clientY
    ) {
      driverElement.style.paddingBottom = '50px';
    }
    if (
      element.getBoundingClientRect().bottom - element.getBoundingClientRect().height / 2 <
      e.clientY
    ) {
      element.style.marginBottom = '100px';
    } else {
      element.style.marginTop = '100px';
    }
  };

  onDragStart = (e, workOrder) => {
    // e.stopPropagation();
    this.isDragging = true;
    this.props.manageWoPollingInterval(false);
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.screenY = e.screenY;
    const startY = this.props.suppressSVG
      ? document.getElementById(`drag-target${workOrder.id}`).getBoundingClientRect().top
      : e.clientY;

    const dragImage = document.getElementById(`drag-offscreen${workOrder.id}`);
    if (!dragImage) {
      return;
    }
    setTimeout(() => {
      dragImage.style.display = 'block';
    }, 10);
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
        driverId: this.state.driverId,
        y: startY,
        isSuspended: this.props.isSuspended,
      }),
    );
  };

  onDragEnd = (e) => {
    this.isDragging = false;
    if (this._isMounted) {
      e.stopPropagation();
      // document.getElementsByTagName('html')[0].style.overflow = 'visible';
      if (e.target.id) {
        const driverId = e.target.id.split('-')[1];
        this.setState({ driverId: `${driverId}` });
      }
    }
    let driverElement = null;
    if (this.props.driver) {
      driverElement = document.getElementById(`driverOrders${this.props.driver.id}`);
    } else {
      driverElement = document.getElementById(`driverOrdersUnassigned`);
    }
    if (driverElement !== null) {
      const { children } = driverElement;
      for (const element of children) {
        element.children[0].style.marginBottom = '0';
        element.children[0].style.marginTop = '0';
        driverElement.style.paddingBottom = '0';
      }
    }
    const dragImages = document.getElementsByClassName(`hidden-workOrder`);
    for (const element of dragImages) {
      element.style.display = 'none';
    }
  };

  render() {
    const { style, id, index, orderConfig, workOrder, workOrders } = this.props;

    let isTopConnected = false;
    if (workOrders[index] && workOrders[index - 1]) {
      if (workOrders[index - 1].size === workOrders[index].size) {
        if (
          (workOrders[index - 1].action.includes('SWITCH') ||
            workOrders[index - 1].action.includes('LIVE LOAD') ||
            workOrders[index - 1].action.includes('FINAL') ||
            workOrders[index - 1].action === 'PICKUP CAN') &&
          (workOrders[index].action.includes('SWITCH') ||
            workOrders[index].action.includes('LIVE LOAD') ||
            workOrders[index].action === 'SPOT' ||
            workOrders[index].action === 'DROPOFF CAN')
        ) {
          isTopConnected = true;
        }
      }
    }
    let isBottomConnected = false;
    if (workOrders[index] && workOrders[index + 1]) {
      if (workOrders[index + 1].size === workOrders[index].size) {
        if (
          (workOrders[index + 1].action.includes('SWITCH') ||
            workOrders[index + 1].action.includes('LIVE LOAD') ||
            workOrders[index + 1].action === 'SPOT' ||
            workOrders[index + 1].action === 'DROPOFF CAN') &&
          (workOrders[index].action.includes('SWITCH') ||
            workOrders[index].action.includes('LIVE LOAD') ||
            workOrders[index].action.includes('FINAL') ||
            workOrders[index].action === 'PICKUP CAN')
        ) {
          isBottomConnected = true;
        }
      }
    }
    let status = 'Not started';
    if (workOrder.status === 'INPROGRESS' || workOrder.status === 'ASSIGNED') {
      status = workOrder.step ? workOrder.step.replace(/_/g, ' ') : 'Not started';
    } else if (workOrder.status === 'COMPLETED') {
      status = 'Completed';
    } else if (workOrder.status === 'CANCELED') {
      status = 'Can not completed';
    }

    let selectedDriver = {};
    if (this.props.drivers && this.props.drivers.length) {
      this.props.drivers.forEach((driver) => {
        if (this.props.workOrder.driver.id === driver.id) {
          selectedDriver = driver;
        }
      });
    }
    const driverColor =
      (selectedDriver && selectedDriver.color) ||
      (this.props.driver && this.props.driver.color) ||
      'black';

    return (
      <div
        className={`dispatch-row context${workOrder.id} ${this.props.class}`}
        id={id}
        ref={(ref) => (this.ref = ref)}
        style={style}
        draggable="true"
      >
        <div
          className={
            orderConfig.puzzlePositions.top
              ? 'puzzleMainDiv puzzleWithTop'
              : 'puzzleMainDiv puzzleWithoutTop'
          }
          style={getItemStyle(orderConfig, isTopConnected, isBottomConnected)}
        >
          {workOrder.priority ? <span
              style={{
                color: 'black',
                position: 'absolute',
                fontSize: '30px',
                top: orderConfig.puzzlePositions.top ? '-20px' : '5px',
                right: '10px',
                zIndex: '99',
              }}
            >
              &#x26A0;
            </span> : null}
          {workOrder.pendingSuspend ? <span
              style={{
                position: 'absolute',
                top: orderConfig.puzzlePositions.top ? '-20px' : '14px',
                right: '40px',
                zIndex: '99',
              }}
            >
              <Waiting style={{ width: '16px', height: '16px' }} />
            </span> : null}
          {workOrder.suspendRequested ? <span
              style={{
                position: 'absolute',
                top: orderConfig.puzzlePositions.top ? '-20px' : '14px',
                right: '40px',
                zIndex: '99',
              }}
            >
              <Waiting style={{ width: '16px', height: '16px' }} />
            </span> : null}
          <img src="https://cdn.starlightpro.com/dispatch/img/points.png" className="pointImg" />

          {this.props.suppressSVG ? null : (<svg
              x="0"
              y="0"
              version="1.1"
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
              width="40px"
              height="95px"
              className="puzzleSvg"
              style={{
                top: orderConfig.puzzlePositions.top ? -50 : -30,
                left: 5,
              }}
            >
              <path
                d="M20 3.33334C13.55 3.33334 8.33331 8.55001 8.33331 15C8.33331 23.75 20 36.6667 20 36.6667C20 36.6667 31.6666 23.75 31.6666 15C31.6666 8.55001 26.45 3.33334 20 3.33334Z"
                fill={driverColor}
              />
              <text
                textAnchor="middle"
                x="20"
                y="19"
                fontSize="25px !important"
                stroke="white"
                fill="white"
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              >
                {index + 1}
              </text>
            </svg>)}
          <div
            className="puzzleRightDiv"
            style={{
              marginBottom: orderConfig.puzzlePositions.top ? '20px' : 0,
            }}
          >
            <label className="actionAlias">
              #{workOrder.id} {this.getActionName(workOrder.action)}{' '}
            </label>
            <label className="labelOrderStatus">{status}</label>
            <br />
            <p>
              {moment(workOrder.scheduledDate).format('MM-DD-YYYY')}{' '}
              {workOrder.scheduledStart
                ? moment(workOrder.scheduledStart, 'HH:mm:ss').format('hh:mm a')
                : ''}{' '}
              {workOrder.scheduledEnd
                ? `- ${moment(workOrder.scheduledEnd, 'HH:mm:ss').format('hh:mm a')}`
                : ''}
            </p>
            <p>{workOrder.customerName}</p>
            {workOrder.location1?.description || workOrder.location1?.name ? (
              <p className="labelOrderLocation1">
                {workOrder.location1?.description || workOrder.location1?.name}
              </p>
            ) : null}
            {workOrder.location2?.description || workOrder.location2?.name ? (
              <p className="labelOrderLocation2">
                {workOrder.location2.type === 'LOCATION' ? 'Location 2: ' : null}
                {workOrder.location2.type === 'WAYPOINT' ? 'Landfill: ' : null}
                {workOrder.location2?.description || workOrder.location2?.name}
              </p>
            ) : null}
            {workOrder.action === 'GENERAL PURPOSE' ? null : <p>{workOrder.size} yard can</p>}
          </div>
          {orderConfig.puzzlePositions.bottom ? (
            <div
              className="downPuzzle"
              style={{
                height: '21px',
                width: '41px',
                position: 'absolute',
                bottom: '-16px',
                left: `${getPositionDifferenceFromWorkOrder(workOrder.size) + 1}px`,
                backgroundColor: orderConfig.bodyColor,
              }}
            />
          ) : null}
          {orderConfig.puzzlePositions.top ? (
            <div
              style={{
                position: 'absolute',
                top: '-24px',
                left: `${getPositionDifferenceFromWorkOrder(workOrder.size) + 28}px`,
                right: '0',
                borderBottom: `24px solid ${orderConfig.bodyColor}`,
                borderLeft: '15px solid transparent',
              }}
            />
          ) : null}
          {orderConfig.puzzlePositions.top ? (
            <div
              className="moon"
              style={{
                height: '43px',
                width: '43px',
                position: 'absolute',
                borderRadius: '80%',
                boxShadow: `0px 9px 0 0 ${orderConfig.bodyColor}`,
                top: '-51px',
                left: `${getPositionDifferenceFromWorkOrder(workOrder.size)}px`,
              }}
            />
          ) : null}
          {orderConfig.puzzlePositions.top ? (
            <div
              style={{
                position: 'absolute',
                width: `${getPositionDifferenceFromWorkOrder(workOrder.size) + 15}px`,
                top: '-24px',
                left: '0px',
                borderBottom: `24px solid ${orderConfig.bodyColor}`,
                borderRight: '15px solid transparent',
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default WorkOrderListItem;
