/* eslint-disable react/prop-types */
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import * as Yup from 'yup';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Field, Formik } from 'formik';
import { addCan } from '@root/state/modules/cans';
import { selectWaypoints } from '@root/state/modules/locations';
import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';

export class CreateCan extends Component {
  static propTypes = {
    sizes: PropTypes.array,
    onSubmit: PropTypes.func,
    dispatch: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    onDismiss: PropTypes.func,
    mapConfig: PropTypes.object,
    locations: PropTypes.array,
  };

  static defaultProps = {
    sizes: [],
    onSubmit: () => {},
    onSuccessSubmit: () => {},
    onDismiss: () => {},
    dispatch: () => {},
    mapConfig: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      location: {},
      isLocationValid: true,
    };
  }

  async onValidSubmit(data) {
    this.setState({ submitting: true });
    try {
      const res = await this.props.dispatch(
        addCan(
          R.omit(['allowNullLocation'], {
            ...data,
            businessUnitId: this.props.match.params.businessUnit,
            location: this.state.location,
          }),
        ),
      );
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
      return res;
    } catch (error) {
      return error;
    }
  }

  schema = Yup.object().shape({
    name: Yup.string().required('Required'),
    size: Yup.string().notOneOf(['selectSize']).required('Required'),
  });

  setLocationValid = (value) => {
    if (value.name) {
      this.setState({ isLocationValid: value });
    } else {
      this.setState({ isLocationValid: true });
    }
  };

  setLocation = (value) => {
    this.setState({ location: value });
  };

  render() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          name: '',
          size: 'selectSize',
          serial: '',
          requiresMaintenance: false,
          outOfService: false,
          hazardous: false,
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          const inputElementValue =
            document.getElementById('geocoder').children[0].children[1].value;
          if (inputElementValue.length > 0 && !this.state.location.name) {
            this.setState({ isLocationValid: false });
            return;
          }
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, errors }) => (
          <form className="form--addCan">
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Can Name</label>
                <Field
                  name="name"
                  type="name"
                  className={errors.name ? 'text-input error-required' : 'text-input'}
                />
              </div>
              <div className="form-col">
                <label className="form-label">Size</label>
                <Field
                  name="size"
                  component="select"
                  className={errors.size ? 'text-input error-required' : 'text-input'}
                >
                  <option key="selectSize" value="selectSize">
                    Select size
                  </option>
                  {this.props.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Field>
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Serial Number</label>
                <Field
                  name="serial"
                  type="serial"
                  className={errors.serial ? 'text-input error-required' : 'text-input'}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <div className="checkbox-container">
                  <Field
                    name="requiresMaintenance"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        className="checkbox"
                        checked={values.requiresMaintenance}
                      />
                    )}
                  />
                  <label>Requires Maintenance</label>
                </div>
                <div className="checkbox-container">
                  <Field
                    name="outOfService"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        className="checkbox"
                        checked={values.outOfService}
                      />
                    )}
                  />
                  <label>Out of Service</label>
                </div>
                <div className="checkbox-container">
                  <Field
                    name="hazardous"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        className="checkbox"
                        checked={values.hazardous}
                      />
                    )}
                  />
                  <label>Hazardous Material</label>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Initial Location</label>
                <ConnectedGeoAutocomplete
                  name="location"
                  mapId="geo"
                  geocoderId="geocoder"
                  twoLocationsRequired={false}
                  isWaypoint
                  locations={this.props.locations}
                  setLocation={this.setLocation}
                  setLocationValid={this.setLocationValid}
                  isValid={this.state.isLocationValid}
                  disabled={false}
                  required
                  centerLon={this.props.mapConfig.lon}
                  centerLat={this.props.mapConfig.lat}
                  zoom={this.props.mapConfig.zoom}
                  value={this.state.location.description || this.state.location.name || ''}
                />
              </div>
            </div>
            <footer className="form-actions">
              <button
                data-name="dismissBtn"
                className="button button__empty mr-2"
                onClick={this.props.onDismiss}
                type="button"
              >
                Cancel
              </button>
              <button
                className="button button__primary"
                type="submit"
                onClick={handleSubmit}
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
}

const initialState = (state) => ({
  sizes: state.constants.can.size,
  mapConfig: state.setting.map,
  locations: selectWaypoints(state),
});

export default withRouter(connect(initialState)(CreateCan));
