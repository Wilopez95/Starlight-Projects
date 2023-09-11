/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-prop-types */

import { Component } from 'react';
import * as R from 'ramda';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';
import { withRouter } from 'react-router-dom';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { updateSingleWorkOrder } from '../../state/modules/workOrders/actions';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';
import alert from '../../static/images/alert.svg';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

// type State = {
//   submitting: boolean,
//   isLocationValid: boolean,
//   location: Object,
// };

class SuspendWorkOrder extends Component {
  static defaultProps = {
    onDismiss: R.identity,
    onSuccessSubmit: R.identity,
    mapConfig: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      isLocationValid: false,
      location: {
        name: '',
      },
      action: `${this.props.woaction} SUSPEND`, // takes current action and adds suspend to action
      touched: false,
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  async onValidSubmit() {
    this.setState({ submitting: true });
    try {
      const pathParam = this.props.location.pathname.includes('table');
      const type = pathParam ? 'workorders' : 'dispatch';

      if (!this.props.driverId || this.props.driverId === 'nodriver') {
        // adding in this only in case there is no driver assigned to an order, this should not be the case
        // however a dispatcher could technically change a workorder to finish service and then try to assign a suspend location with no driver

        await this.props.dispatch(
          updateSingleWorkOrder(
            {
              id: this.props.workOrderId,
              suspensionLocationId: this.state.location.id,
              action: this.state.action,
              pendingSuspend: 0,
              suspendRequested: 0,
            },
            null,
            type,
          ),
        );
      } else {
        await this.props.dispatch(
          updateSingleWorkOrder(
            {
              id: this.props.workOrderId,
              driverId: this.props.driverId,
              suspensionLocationId: this.state.location.id,
              action: this.state.action,
              pendingSuspend: 0,
              suspendRequested: 0,
            },
            null,
            type,
          ),
        );
      }

      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      const event = new CustomEvent('forceEvent', {});
      window.dispatchEvent(event);
      this.props.fetchSuspendedWorkOrders(this.props.match.params.businessUnit);
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  setLocationValid = (value) => {
    this.setState({ isLocationValid: value });
  };

  setLocation = (value) => {
    // const shortAddressName = value.name?.split('-')[0].trim(' ');
    const location = this.props.waypoints.filter((waypoint) => waypoint.name === value.name)[0];
    this.setState({ location });
  };

  schema = Yup.object().shape({
    name: Yup.string().required('Required'),
  });

  renderForm() {
    return this.props.step === 'FINISH SERVICE' ? (
      <Formik
        enableReinitialize
        initialValues={{
          location: {
            name: '',
          },
          action: '',
        }}
        validationSchema={this.schema}
      >
        {() => (
          <form
            className="form form--createLocation"
            onSubmit={async (e) => {
              e.preventDefault();
              this.setState({ touched: true });
              if (!this.state.location?.name) {
                this.setState({ isLocationValid: false });
                return;
              }
              await this.onValidSubmit();
            }}
          >
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Location</label>
                <Tooltip
                  title="You can geo tag using this field, start typing an address in the search bar."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="location"
                render={() => (
                  <ConnectedGeoAutocomplete
                    name="location"
                    mapId="map"
                    geocoderId="geocoder"
                    setLocation={this.setLocation}
                    setLocationValid={this.setLocationValid}
                    centerLon={this.props.mapConfig.lon}
                    centerLat={this.props.mapConfig.lat}
                    zoom={this.props.mapConfig.zoom}
                    locations={this.props.waypoints}
                    disabled={false}
                    value={
                      (this.state.location &&
                        (this.state.location.description || this.state.location.name)) ||
                      ''
                    }
                    isValid={
                      !this.state.touched || (this.state.touched && this.state.isLocationValid)
                    }
                    required
                    isWaypoint
                    waypointsOnly
                    isSuspendedOrder
                  />
                )}
              />
            </div>
            <footer className="form-actions">
              <button
                className="button button__empty mr-2"
                onClick={this.props.onDismiss}
                disabled={this.state.submitting}
                type="button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button__primary"
                disabled={this.state.submitting}
              >
                Submit
              </button>
            </footer>
          </form>
        )}
      </Formik>
    ) : (
      <>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div>
            <img
              src={alert}
              style={{
                width: 50,
                height: 50,
                marginRight: 15,
                verticalAlign: 'center',
                alignContent: 'center',
                marginTop: '50%',
              }}
              alt="Suspended workorder icon"
            />
            {/* <p style={{textAlign: 'center'}}> Problem suspendeing the order </p> */}
          </div>
          <div style={{ marginLeft: 20 }}>
            <p style={{ fontWeight: 'bold' }}>
              You cannot suspend a workorder that is not in Finish Service step.{' '}
            </p>
            <br />
            <p>
              Please direct your driver to this step so you can continue suspending the order. Once
              the driver is at this step please try again.
            </p>
          </div>
        </div>
        <footer style={{ marginTop: 30 }}>
          <button
            className="button button__empty mr-2"
            onClick={this.props.onDismiss}
            disabled={this.state.submitting}
            type="button"
          >
            Close
          </button>
        </footer>
      </>
    );
  }

  render() {
    const { isLoading } = this.props;

    return isLoading ? <div>Loading...</div> : this.renderForm();
  }
}

export default withRouter(connect()(SuspendWorkOrder));
