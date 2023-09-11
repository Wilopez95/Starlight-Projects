/* eslint-disable no-negated-condition */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { getAvailableResourceLogins } from '@root/state/modules/lobby';

import ConnectedGeoAutocomplete from '../elements/GeoAutocomplete';
import Label from '../elements/label';

const toolTips = {
  position: 'relative',
  top: '-3px',
  left: '8px',
};

class EditMapConfig extends Component {
  static propTypes = {
    onDismiss: PropTypes.func,
    onUpdateSetting: PropTypes.func,
    locations: PropTypes.array,
    getAvailableResourceLogins: PropTypes.any,
    setting: PropTypes.object,
    fetchSettingByKey: PropTypes.func,
    state: PropTypes.object,
  };

  static defaultProps = {
    onDismiss: () => {},
  };

  componentDidMount() {
    if (typeof this.props.getAvailableResourceLogins === 'function') {
      this.props.getAvailableResourceLogins();
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      isLocationValid: true,
      businessUnitId: 1,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.businessUnitId !== undefined &&
      prevState.businessUnitId !== this.state.businessUnitId &&
      this.state.businessUnitId !== 'businessUnitId'
    ) {
      this.props.fetchSettingByKey('map', this.state.businessUnitId);
    }
  }

  async onValidSubmit(values) {
    this.setState({ submitting: true });
    if (values.businessUnitId === 'businessUnitId' || values.businessUnitId === undefined) {
      this.setState({ submitting: false });
      return;
    }
    if (!values.location?.location?.lat || !values.location?.location?.lon) {
      this.setState({ submitting: false });
      return;
    }
    const data = [
      {
        key: 'map',
        value: JSON.stringify({
          location: values.location,
          zoom: values.zoom,
        }),
        businessUnitId: values.businessUnitId,
      },
    ];
    try {
      await this.props.onUpdateSetting(data);
      // await this.props.fetchSettingByKey('map', this.state.businessUnitId);
      this.setState({ submitting: false, success: true });
      // eslint-disable-next-line
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  setLocationValid = (value) => {
    this.setState({ isLocationValid: value });
  };

  schema = Yup.object().shape({
    zoom: Yup.string()
      .oneOf([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
      ])
      .required(),
    location: Yup.object().required(),
  });

  render() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          businessUnitId: this.state.businessUnitId,
          zoom: this.state.businessUnitId ? this.props.setting.map.zoom : '',
          location: this.state.businessUnitId
            ? {
                location: {
                  lat: this.props.setting.map.lat,
                  lon: this.props.setting.map.lon,
                },
                description: this.props.setting.map.description,
                name: this.props.setting.map.name,
              }
            : {
                location: {
                  lat: this.props.setting.map.lat,
                  lon: this.props.setting.map.lon,
                },
                description: undefined,
                name: undefined,
              },
        }}
        validationSchema={this.schema}
        onSubmit={values => {
          if (!values.location.description && !values.location.name) {
            return;
          }
          this.onValidSubmit(values);
        }}
      >
        {({ values, errors, handleSubmit, setFieldValue }) => (
          <form
            className="form form--createLocation"
            onSubmit={e => {
              e.preventDefault();
              if (!values.location.description && !values.location.name) {
                this.setState({ isLocationValid: false });
              }
              handleSubmit();
            }}
          >
            {this.state.success ? (
              <div className="alert alert-success" role="alert">
                Map settings changed!
              </div>
            ) : null}
            <div className="form-col">
              <div className="tooltip-container">
                <label className="form-label">Business Unit</label>
                <Tooltip
                  title="Selection of the Business Unit for which map settings should be defined."
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="businessUnitId"
                component="select"
                className="text-input"
                onChange={e => {
                  this.setState({ businessUnitId: e.target.value });
                }}
              >
                <option key="businessUnitId" value="businessUnitId">
                  Select Business Unit
                </option>
                {Object.keys(this.props.state.data ?? {}).length > 0
                  ? Object.keys(this.props.state.data).map(elem => {
                      const item = Object.values(this.props.state.data)[elem];
                      return (
                        item.id !== 'systemConfig' && (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        )
                      );
                    })
                  : null}
              </Field>
              <div className="tooltip-container">
                <Label htmlFor="zoom">Map Zoom</Label>
                <Tooltip
                  title="Enter a number to change zoom settings of map"
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field
                name="zoom"
                type="text"
                className={errors.zoom ? 'text-input error-required' : 'text-input'}
                value={this.state.businessUnitId != 'businessUnitId' ? values.zoom : ''}
              />
            </div>
            <div className="form-row">
              <div className="tooltip-container">
                <Label htmlFor="location">Coordinates</Label>
                <Tooltip
                  title="Begin by typing the destination address in the search bar"
                  position="top"
                  trigger="click"
                >
                  <i className="far fa-info-circle fa-xs" style={toolTips} />
                </Tooltip>
              </div>
              <Field name="location">
                {() => (
                  <ConnectedGeoAutocomplete
                    name="location"
                    mapId="map"
                    geocoderId="geocoder"
                    setLocation={values => setFieldValue('location', values)}
                    twoLocationsRequired={false}
                    isWaypoint
                    setLocationValid={this.setLocationValid}
                    centerLon={
                      parseFloat(values.location?.location?.lon || values?.location?.lon) || 0
                    }
                    centerLat={
                      parseFloat(values?.location?.location?.lat || values?.location?.lat) || 0
                    }
                    zoom={parseInt(values.zoom, 10) || 0}
                    limit={1}
                    isValid={
                      this.state.isLocationValid ||
                      values.location.description ||
                      values.location.name
                    }
                    disabled={false}
                    locations={this.props.locations}
                    value={
                      this.state.businessUnitId !== 'businessUnitId'
                        ? values.location.description || values.location.name || ''
                        : ''
                    }
                    isAutoComplete
                  />
                )}
              </Field>
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
}

const mapStateToProps = (state) => ({
  state: state.lobby,
  setting: state.setting,
});
const mapDispatchToProps = (dispatch) => ({
  getAvailableResourceLogins: dispatch(getAvailableResourceLogins()),
  fetchSettingByKey: (key, businessUnitId) => dispatch(fetchSettingByKey(key, businessUnitId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditMapConfig);
