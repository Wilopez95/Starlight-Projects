import PropTypes from 'prop-types';
import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';

import IconTruck from '../../static/images/icon-truck.svg';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

class EditCanDropoff extends Component {
  static propTypes = {
    can: PropTypes.object,
    onDismiss: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    onDropOffCan: PropTypes.func,
    dispatch: PropTypes.func,
    setting: PropTypes.object,
    locations: PropTypes.array,
    truckOpts: PropTypes.array,
  };

  static defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
    onDropOffCan: () => {},
    setting: {},
    locations: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      allowNullLocation: false,
      isLocationValid: false,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  onValidSubmit(data) {
    this.setState({ submitting: true });
    try {
      const location = this.state.allowNullLocation
        ? {}
        : data.location.type === 'WAYPOINT'
        ? this.props.locations.filter(
            (location) =>
              location.location.lon === data.location.location.lon &&
              location.location.lat === data.location.location.lat,
          )[0]
        : data.location;
      const {
        can: { id },
      } = this.props;
      const locationPayload = this.state.allowNullLocation
        ? { location: {} }
        : {
            location: {
              name: location.name,
              latitude: location.latitude,
              longitude: location.longitude,
              lat: location.location.lat,
              lon: location.location.lon,
              type: location.type,
            },
          };
      this.handleSubmitDropOffCan(id, locationPayload);
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  handleSubmitDropOffCan = (canId, location) => {
    this.props.onDropOffCan(canId, location);
  };

  toggleLocation = (allowNullLocation) => {
    this.setState({ allowNullLocation: allowNullLocation.target.checked });
  };

  render() {
    const { can, truckOpts } = this.props;
    const currentTruck = truckOpts.filter((truck) => truck.value === can?.truckId && truck.label)[0]
      ?.label;
    return (
      <Formik
        enableReinitialize
        initialValues={{
          allowNullLocation: false,
          location: '',
        }}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, setFieldValue }) => (
          <form
            className="form--editCan-dropOff"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                !values.location.name &&
                !values.location.description &&
                !values.allowNullLocation
              ) {
                this.setState({ isLocationValid: false });
                return;
              }
              handleSubmit();
            }}
          >
            <div className="form-row">
              <div className="form-col">
                <div className="form-col-header">
                  <h3 className="form-label">Current truck:</h3>
                  <p>{currentTruck}</p>
                </div>
                <div className="form-col-body">
                  <IconTruck alt="Truck" />
                </div>
              </div>
              <div className="form-col">
                <label className="form-label">
                  Location
                  <Tooltip
                    title="Begin by typing the destination address in the search bar"
                    position="top"
                    trigger="click"
                  >
                    <i className="far fa-info-circle fa-xs" style={toolTips} />
                  </Tooltip>
                </label>
                <div className="checkbox-container">
                  <Field
                    name="allowNullLocation"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        className="checkbox"
                        onClick={this.toggleLocation}
                        checked={values.allowNullLocation}
                      />
                    )}
                  />
                  <label>Unknown Location</label>
                </div>
                <ConnectedGeoAutocomplete
                  name="location"
                  mapId="maptwo" /* Set the mapId to something other than map or inventory map is overwritten */
                  geocoderId="geocoder"
                  setLocationValid={(value) => this.setState({ isLocationValid: value })}
                  twoLocationsRequired={false}
                  isWaypoint
                  setLocation={(location) => setFieldValue('location', location)}
                  isValid={this.state.isLocationValid}
                  value={values.location.description || values.location.name || ''}
                  disabled={values.allowNullLocation}
                  required={!values.allowNullLocation}
                  centerLon={this.props.setting.map.lon}
                  centerLat={this.props.setting.map.lat}
                  zoom={this.props.setting.map.zoom}
                  locations={this.props.locations}
                />
              </div>
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
                Apply edits
              </button>
            </footer>
          </form>
        )}
      </Formik>
    );
  }
}

export default EditCanDropoff;
