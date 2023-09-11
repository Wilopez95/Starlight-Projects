/* eslint-disable react/no-unused-prop-types, react/prop-types */

import { Component } from 'react';
import * as R from 'ramda';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';

import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

// type Props = {
//   onSuccessSubmit?: Function,
//   onDismiss?: () => void,
//   id?: string | number,
//   location?: LocationType,
//   mapConfig: Object,
//   isLoading: boolean,
//   onUpdateLocation: (id: number, data: LocationInputType) => LocationType,
//   onCreateLocation: LocationInputType => LocationType,
//   locations: Array<LocationType>,
// };

// type State = {
//   submitting: boolean,
//   isLocationValid: boolean,
//   location: Object,
// };

class CreateLocation extends Component {
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
      touched: false,
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  onValidSubmit(formData) {
    const data = {
      name: R.pathOr(null, ['name'], formData),
      description: R.pathOr(null, ['description'], formData),
      location: this.state.location.location,
      type: 'LOCATION',
    };
    this.setState({ submitting: true });
    try {
      this.props.onCreateLocation(data);

      this.setState({ submitting: false });
      // this.props.onSuccessSubmit();
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  setLocationValid = (value) => {
    this.setState({ isLocationValid: value });
  };

  setLocation = (value) => {
    this.setState({ location: value });
  };

  schema = Yup.object().shape({
    name: Yup.string().required('Required'),
  });

  renderForm() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          name: '',
          description: '',
          location: {
            name: '',
          },
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          if (!this.state.location.name) {
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
              this.setState({ touched: true });
              if (!this.state.location.name) {
                this.setState({ isLocationValid: false });
              }
              handleSubmit();
            }}
          >
            <div className="form-row">
              <div className="tooltip-container">
                <label className="form-label">Location Name</label>
                <Tooltip
                  title="Use this field to identify the data you are creating."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="name"
                type="name"
                className={errors.name ? 'text-input error-required' : 'text-input'}
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
                <label className="form-label">Coordinates</label>
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
                    isWaypoint={false}
                    setLocation={this.setLocation}
                    setLocationValid={this.setLocationValid}
                    centerLon={this.props.mapConfig.lon}
                    centerLat={this.props.mapConfig.lat}
                    zoom={this.props.mapConfig.zoom}
                    locations={this.props.locations}
                    isValid={
                      !this.state.touched || (this.state.touched && this.state.isLocationValid)
                    }
                    disabled={false}
                    required
                    value={this.state.location.name || ''}
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

    return isLoading ? <div>Loading...</div> : this.renderForm();
  }
}

export default CreateLocation;
