/* eslint-disable no-unused-vars, eqeqeq */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Formik } from 'formik';
import mapboxgl from '@starlightpro/mapboxgl';
import * as Yup from 'yup';
import { MAPBOX_API_KEY, MAPBOX_STYLE_URL } from '@root/helpers/config';
import IconTruck from '../../static/images/icon-truck.svg';

class EditCanPickup extends Component {
  static propTypes = {
    can: PropTypes.object,
    truckOpts: PropTypes.array,
    onDismiss: PropTypes.func,
    trucks: PropTypes.array,
    setting: PropTypes.object,
    onSuccessSubmit: PropTypes.func,
    onPickUpCan: PropTypes.func,
  };

  static defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
    };
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  componentDidMount() {
    const { location } = this.props.can.location;
    const isValidLocation = location && location.lat && location.lon;
    if (isValidLocation) {
      mapboxgl.accessToken = MAPBOX_API_KEY;
      const map = new mapboxgl.Map({
        container: 'can-pickup-map',
        style: MAPBOX_STYLE_URL,
        center: [this.props.setting.map.lon, this.props.setting.map.lat],
        zoom: this.props.setting.map.zoom,
      });
      const marker = new mapboxgl.Marker();
      marker.setLngLat([this.props.setting.map.lon, this.props.setting.map.lat]);

      marker.addTo(map);
    }
  }

  onValidSubmit(data) {
    this.setState({ submitting: true });

    try {
      const {
        can: { id },
      } = this.props;
      const truck = this.props.trucks.filter((truck) => truck.id == data.truck)[0];
      this.handleSubmitPickUpCan(id, {
        truckId: truck.id,
        location: truck.location,
      });
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  handleSubmitPickUpCan = (id, truck) => {
    this.props.onPickUpCan(id, truck);
  };

  schema = Yup.object().shape({
    truck: Yup.string().notOneOf(['selectTruck']).required('Required'),
  });

  renderForm() {
    const { can, truckOpts } = this.props;

    const { location } = can.location;
    const isValidLocation = location && location.lat && location.lon;

    return (
      <Formik
        enableReinitialize
        initialValues={{
          truck: '',
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, errors }) => (
          <form className="form--editCan-pickUp">
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
                  <div id="can-pickup-map" style={{ height: '140px', width: '100%' }} />
                ) : null}
              </div>
              <div className="form-col">
                <div className="form-col-header">
                  <label htmlFor="f-pickUp-truck" className="form-label">
                    Truck:
                  </label>
                  <Field
                    name="truck"
                    component="select"
                    className={errors.truck ? 'text-input error-required' : 'text-input'}
                    value={values.truck}
                  >
                    <option key="selectTruck" value="selectTruck">
                      Select a truck
                    </option>
                    {truckOpts.map((truck) => (
                      <option key={truck.value} value={truck.value}>
                        {truck.label}
                      </option>
                    ))}
                  </Field>
                </div>
                <div className="form-col-body">
                  <IconTruck />
                </div>
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
                onClick={handleSubmit}
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

  render() {
    return this.renderForm();
  }
}

export default EditCanPickup;
