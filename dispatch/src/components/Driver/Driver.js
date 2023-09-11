import { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTimes, faSpinner } from '@fortawesome/pro-regular-svg-icons';

class Driver extends Component {
  static propTypes = {
    driver: PropTypes.object.isRequired,
    workOrders: PropTypes.array.isRequired,
    onDriverClick: PropTypes.func.isRequired,
    toPrint: PropTypes.object,
    onRemoveDriver: PropTypes.func.isRequired,
    unpublishedChanges: PropTypes.number,
    isUpdating: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    workOrders: [],
    isUpdating: false,
  };

  state = {
    visible: true,
  };

  handleDriverClick = () => {
    this.props.onDriverClick(this.props.driver);
  };

  handleClickX = () => {
    if (this.props.unpublishedChanges > 0) {
      // eslint-disable-next-line no-alert
      alert('Can not remove a driver while there are unpublished changes!');
      return;
    }
    if (!this.props.isUpdating) {
      this.props.onRemoveDriver(this.props.driver);
      const event = new CustomEvent('hideDriverOrders', {
        detail: {
          driverId: this.props.driver.id,
          visible: true,
        },
      });
      window.dispatchEvent(event);
      // this.props.force(this.props.filter, true, false, false, true);
    }
  };

  handleClickEye = () => {
    this.setState(
      (prevState) => ({
        visible: !prevState.visible,
      }),
      () => {
        const event = new CustomEvent('hideDriverOrders', {
          detail: {
            driverId: this.props.driver.id,
            visible: this.state.visible,
          },
        });
        window.dispatchEvent(event);
      },
    );
  };

  render() {
    const { driver, workOrders, toPrint } = this.props;

    return (
      <div
        id={driver.id}
        className="driver-list-item"
        style={{
          backgroundColor:
            workOrders.pendingSuspend || workOrders.suspendRequested ? 'lightgrey' : 'white',
        }}
      >
        <li
          className="driver driver--withContextMenu"
          style={{
            backgroundColor:
              workOrders.pendingSuspend || workOrders.suspendRequested ? 'lightgrey' : 'white',
          }}
        >
          <div className="context-menu-driver">
            <div className="driver-marker" style={{ backgroundColor: driver.color }} />
            <div className="driver-photo" onClick={this.handleDriverClick}>
              <img src={driver.photo || 'https://cdn.starlightpro.com/img/noDriverPhoto.png'} />
            </div>
            <div className="driver-content" onClick={this.handleDriverClick}>
              <div className="listview-flex--row">
                <h4 id="dr-name" className="driver-name">
                  {driver.description}
                </h4>
              </div>
              <div className="listview-flex--row">
                <span className="locations-count">{workOrders.length} LOCATIONS</span>
              </div>
            </div>
            <div className="driver-icons">
              {toPrint}
              {this.props.isUpdating ? (
                <div style={{ width: '30px', display: 'inline-flex' }}>
                  <FontAwesomeIcon icon={faSpinner} className="driver-fa-icon" spin />
                </div>
              ) : (
                <div style={{ width: '30px', display: 'inline-flex' }} onClick={this.handleClickX}>
                  <FontAwesomeIcon icon={faTimes} className="driver-fa-icon" />
                </div>
              )}
              <div style={{ width: '30px', display: 'inline-flex' }} onClick={this.handleClickEye}>
                <FontAwesomeIcon
                  icon={this.state.visible ? faEye : faEyeSlash}
                  className="driver-fa-icon"
                />
              </div>
            </div>
          </div>
        </li>
      </div>
    );
  }
}

export default Driver;
