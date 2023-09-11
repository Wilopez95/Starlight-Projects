import PropTypes from 'prop-types';
import { Component } from 'react';
import { Field, Formik } from 'formik';
import mapboxgl from '@starlightpro/mapboxgl';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';

class EditCanMove extends Component {
  static propTypes = {
    can: PropTypes.object,
    onDismiss: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    dispatch: PropTypes.func,
    setting: PropTypes.object,
    onMoveCan: PropTypes.func,
    locations: PropTypes.array,
  };

  static defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
    setting: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      location: {
        name: '',
      },
      // location: this.props.can.location.location,
      isLocationValid: false,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  componentDidMount() {
    const { location } = this.props.can.location;
    const isValidLocation = location && location.lat && location.lon;
    if (!isValidLocation) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
      container: 'can-move-map',
      style: MAPBOX_STYLE_URL,
      center: [location.lon, location.lat],
      zoom: this.props.setting.map.zoom,
    });

    const marker = new mapboxgl.Marker();

    marker.setLngLat([location.lon, location.lat]);

    marker.addTo(map);
  }

  // fixes context mapgl issue
  componentWillUnmount() {
    if (this._map) {
      this._map.remove();
    }
  }

  onValidSubmit(data) {
    this.setState({
      submitting: true,
    });

    try {
      const location = data.allowNullLocation
        ? { location: {} }
        : this.state.location.type === 'WAYPOINT'
        ? this.props.locations.filter(
            (location) =>
              location.location.lon === this.state.location.location.lon &&
              location.location.lat === this.state.location.location.lat,
          )[0]
        : this.state.location;
      const canId = this.props.can.id;
      const locationPayload = {
        location: {
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          lat: location.location.lat,
          lon: location.location.lon,
          type: location.type,
        },
      };
      this.handleSubmitMoveCan(canId, locationPayload);
      this.setState({ submitting: false });

      this.props.onSuccessSubmit();
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  handleSubmitMoveCan = (canId, location) => {
    this.props.onMoveCan(canId, location);
  };

  setLocationValid = (value) => {
    this.setState({ isLocationValid: value });
  };

  setLocation = (value) => {
    this.setState({ location: value });
  };

  render() {
    const { can } = this.props;
    const { location } = can.location;
    const isValidLocation = location && location.lat && location.lon;
    return (
      <Formik
        enableReinitialize
        initialValues={{
          allowNullLocation: false,
          location: {
            name: location,
          },
        }}
        onSubmit={(values) => {
          if (!this.state.location.name && !values.allowNullLocation) {
            return;
          }
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit }) => (
          <form
            className="form--editCan-move"
            onSubmit={(e) => {
              e.preventDefault();
              if (!this.state.location.name && !values.allowNullLocation) {
                this.setState({ isLocationValid: false });
              }
              handleSubmit();
            }}
          >
            <div className="form-row">
              <div className="form-col">
                <div className="form-col-header">
                  <h3 className="form-label">Current location:</h3>
                  <p data-name="location-name">
                    {isValidLocation
                      ? can.location.description || can.location.name
                      : 'Unknown Location'}
                  </p>
                </div>
                {isValidLocation ? (
                  <div
                    id="can-move-map"
                    style={{
                      height: '140px',
                      width: '100%',
                    }}
                  />
                ) : null}
              </div>
              <div className="form-col">
                <label htmlFor="f-move-location" className="form-label">
                  New location:
                </label>
                {isValidLocation ? (
                  <div className="checkbox-container">
                    <Field
                      name="allowNullLocation"
                      render={({ field }) => (
                        <input
                          {...field}
                          type="checkbox"
                          className="checkbox"
                          checked={values.allowNullLocation}
                        />
                      )}
                    />
                    <label>Unknown Location</label>
                  </div>
                ) : null}
                <Field
                  name="location"
                  render={() => (
                    <ConnectedGeoAutocomplete
                      name="location"
                      mapId="can-move-map-new-location"
                      geocoderId="geocoder"
                      isWaypoint
                      setLocation={this.setLocation}
                      twoLocationsRequired={false}
                      setLocationValid={this.setLocationValid}
                      isValid={this.state.isLocationValid}
                      disabled={values.allowNullLocation}
                      required={!values.allowNullLocation}
                      value={this.state.location.description || this.state.location.name || ''}
                      centerLon={this.props.setting.map.lon}
                      centerLat={this.props.setting.map.lat}
                      zoom={this.props.setting.map.zoom}
                      locations={this.props.locations}
                    />
                  )}
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

export default EditCanMove;
