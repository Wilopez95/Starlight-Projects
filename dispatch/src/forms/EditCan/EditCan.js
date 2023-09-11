/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { removeCan, updateCan } from '@root/state/modules/cans';
import Checkbox from '../elements/checkbox';

class EditCan extends Component {
  static propTypes = {
    can: PropTypes.object,
    sizes: PropTypes.array,
    dispatch: PropTypes.func,
    onDismiss: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
  };

  static defaultProps = {
    can: {},
    sizes: [],
    onDismiss: () => {},
    onSuccessSubmit: () => {},
  };

  schema = Yup.object().shape({
    name: Yup.string().required('Required'),
    size: Yup.string().notOneOf(['selectSize']).required('Required'),
  });

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
    };
    this.reomveCan = this.removeCan.bind(this);
    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  async onValidSubmit(data) {
    const formData = R.mapObjIndexed((value) => (value === '' ? null : value), data);

    this.setState({ submitting: true });

    try {
      await this.props.dispatch(updateCan({ id: this.props.can.id, ...formData }));
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
    } catch (error) {
      this.setState({ submitting: false });
    }
  }

  removeCan = async () => {
    this.setState({ submitting: true });

    try {
      await this.props.dispatch(removeCan(this.props.can.id));
      this.setState({ submitting: false });
      this.props.onSuccessSubmit();
    } catch (error) {
      this.setState({ submitting: false });
    }
  };

  render() {
    const { sizes, can } = this.props;

    return (
      <Formik
        enableReinitialize
        initialValues={{
          name: can.name || '',
          size: can.size || 'selectSize',
          serial: can.serial || '',
          requiresMaintenance: can.requiresMaintenance || false,
          outOfService: can.outOfService || false,
          hazardous: can.hazardous || false,
        }}
        validationSchema={this.schema}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
      >
        {({ values, handleSubmit, errors }) => (
          <form className="form--editCan-info">
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
                  value={values.size}
                >
                  <option key="selectSize" value="selectSize">
                    Select size
                  </option>
                  {sizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.value}
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
                <Checkbox
                  name="requiresMaintenance"
                  label="Requires Maintenance"
                  value={values.requiresMaintenance}
                />
                <Checkbox name="outOfService" label="Out of Service" value={values.outOfService} />
                <Checkbox name="hazardous" label="Hazardous Material" value={values.hazardous} />
              </div>
            </div>
            <footer className="form-actions">
              <div className="actions-group">
                <button
                  className="btn btn__danger"
                  onClick={this.removeCan}
                  type="button"
                  disabled={this.state.submitting}
                >
                  Remove can
                </button>
              </div>
              <div className="actions-group">
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
              </div>
            </footer>
          </form>
        )}
      </Formik>
    );
  }
}

export default connect()(EditCan);
