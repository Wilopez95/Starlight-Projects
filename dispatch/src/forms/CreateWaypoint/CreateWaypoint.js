/* eslint-disable react/no-unused-prop-types, camelcase */
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import Loader from '@root/components/Loader';
import constants from '../../helpers/constants.json';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

const { WAYPOINT } = constants.location.type;

class CreateWaypoint extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    action: PropTypes.string,
    onDismiss: PropTypes.func,
    onUpdateWaypoint: PropTypes.func,
    isLoading: PropTypes.bool,
    location: PropTypes.object,
    locations: PropTypes.array,
    onCreateWaypoint: PropTypes.func,
    types: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      }),
    ),
    waypointTypes: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      }),
    ),
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    forgetLocation: PropTypes.func,
    entity: PropTypes.string,
    mapConfig: PropTypes.object,
  };

  static defaultProps = {
    onDismiss: R.identity,
    onSuccessSubmit: R.identity,
    types: [],
    waypointTypes: [],
    mapConfig: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      location: {
        name: '',
      },
      isLocationValid: false,
      touched: false,
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  componentDidMount() {
    this.setDefault();
  }

  componentWillUnmount() {
    this.props.forgetLocation();
  }

  setDefault = () => {
    const defaultLocation = this.setType();
    this.setState({
      defaultLocation,
      location: this.props.location,
      coordinates:
        this.props.location &&
        this.props.location.location &&
        `${this.props.location.location.lat},${this.props.location.location.lon}`,
    });
  };

  onValidSubmit(formData) {
    const { id, onUpdateWaypoint, onCreateWaypoint } = this.props;

    const data = {
      name: this.state.location.name,
      description: R.pathOr(null, ['description'], formData),
      location: this.state.location.location,
      type: R.propOr(this.state.defaultLocation, 'type', location),
      waypointName: R.pathOr(null, ['waypointName'], formData),
      waypointType: R.pathOr(null, ['waypointType'], formData),
    };
    this.setState({ submitting: true, touched: true });
    try {
      if (id) {
        onUpdateWaypoint(id, data);
      } else {
        onCreateWaypoint(data);
      }

      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  setType() {
    return WAYPOINT;
  }

  setLocationValid = (value) => {
    this.setState({ isLocationValid: value });
  };

  setLocation = (value) => {
    this.setState({ location: value });
  };

  schema = Yup.object().shape({
    waypointName: Yup.string().required('Required'),
  });

  renderForm() {
    const { location } = this.props || {};
    const lat = R.pathOr('', ['location', 'lat'], location);
    const lon = R.pathOr('', ['location', 'lon'], location);
    if (lat && lon) {
      location.coordinates = `${lat},${lon}`;
    }

    return (
      <Formik
        enableReinitialize
        initialValues={
          this.props.action === 'edit'
            ? {
                waypointName: (location && location.waypointName) || '',
                waypointType: (location && location.waypointType) || 'HOME_YARD',
                description: (location && location.description) || '',
                coordinates: location.coordinates,
              }
            : {
                waypointName: '',
                waypointType: 'HOME_YARD',
                description: '',
              }
        }
        validationSchema={this.schema}
        onSubmit={(values) => {
          if (!this.state.location.name || !this.state.isLocationValid) {
            return;
          }
          this.onValidSubmit(values);
        }}
      >
        {({ handleSubmit, errors }) => (
          <form
            className="form form--createLocation"
            onSubmit={(e) => {
              e.preventDefault();
              if (!this.state.location.name) {
                this.setState({ isLocationValid: false });
              }
              handleSubmit();
            }}
          >
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Waypoint Name</label>
                <Tooltip
                  title="Use this field to identify the data you are creating."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="waypointName"
                type="waypointName"
                className={errors.waypointName ? 'text-input error-required' : 'text-input'}
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Waypoint Type</label>
                <Tooltip title="Waypoint type" position="top" trigger="click">
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="waypointType"
                component="select"
                className={errors.waypointType ? 'text-input error-required' : 'text-input'}
              >
                {this.props.waypointTypes.map((waypointType) => (
                  <option key={waypointType.label} value={waypointType.label}>
                    {waypointType.label}
                  </option>
                ))}
              </Field>
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Coordinates</label>
                <Tooltip
                  title="This is where you can explain in greater detail what you are creating. "
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="coordinates"
                type="coordinates"
                className={errors.coordinates ? 'text-input error-required' : 'text-input'}
                value={this.state.coordinates}
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Description</label>
                <Tooltip
                  title="This is where you can explain in greater detail what you are creating. "
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="description"
                type="description"
                className={errors.description ? 'text-input error-required' : 'text-input'}
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Location Name</label>
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
                    twoLocationsRequired={false}
                    isWaypoint
                    setLocation={this.setLocation}
                    setLocationValid={this.setLocationValid}
                    isValid={
                      !this.state.touched || (this.state.touched && this.state.isLocationValid)
                    }
                    disabled={false}
                    required
                    value={this.state.location.name || ''}
                    centerLon={this.props.mapConfig.lon}
                    centerLat={this.props.mapConfig.lat}
                    locations={this.props.locations}
                    zoom={this.props.mapConfig.zoom}
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
    );
  }

  render() {
    const { isLoading } = this.props;

    return isLoading ? <Loader /> : this.renderForm();
  }
}

export default CreateWaypoint;
