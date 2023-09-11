/* eslint-disable no-unused-vars, eqeqeq */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import IconTruck from '../../static/images/icon-truck.svg';

class EditCanTransfer extends Component {
  static propTypes = {
    can: PropTypes.object,
    onDismiss: PropTypes.func,
    onTransferCan: PropTypes.func,
    trucks: PropTypes.array,
    truckOpts: PropTypes.array,
    onSuccessSubmit: PropTypes.func,
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

  handleTransferCan = (id, truck) => {
    this.props.onTransferCan(id, truck);
  };

  onValidSubmit(data) {
    this.setState({ submitting: true });

    try {
      const {
        can: { id },
      } = this.props;
      const truck = this.props.trucks.filter((truck) => truck.id == data.truck)[0];
      this.handleTransferCan(id, {
        truckId: truck.id,
        location: truck.location,
      });
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  handleDismiss = () => {
    this.props.onDismiss();
  };

  schema = Yup.object().shape({
    truck: Yup.string().required(),
  });

  renderForm() {
    const { can, truckOpts } = this.props;
    const currentTruck = truckOpts.filter((truck) => truck.value === can?.truckId && truck.label)[0]
      ?.label;

    return (
      <Formik
        enableReinitialize
        validationSchema={this.schema}
        initialValues={{
          truck: '',
        }}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, errors }) => (
          <form className="form form--editCan-transfer">
            <div className="form-row">
              <div className="form-col">
                <div className="form-col-header">
                  <h3 className="form-label">Current truck:</h3>
                  <p>{currentTruck}</p>
                </div>
                <div className="form-col-body">
                  <IconTruck />
                </div>
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
                    <option key="truck" value="truck">
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
                onClick={this.handleDismiss}
                disabled={this.state.submitting}
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

export default EditCanTransfer;
