import PropTypes from 'prop-types';
import * as R from 'ramda';
import * as yup from 'yup';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, Formik } from 'formik';
import { setWorkOrderState, fetchWorkOrder } from '@root/state/modules/workOrders';
import { fetchWorkOrderNotes } from '@root/state/modules/workOrderNotes';
import FormError from '../elements/form-error';

class WorkOrderSetState extends Component {
  static propTypes = {
    workOrderStatus: PropTypes.string,
    transitionStates: PropTypes.array,
    dispatch: PropTypes.func,
    workOrderId: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]),
  };

  constructor(props) {
    super(props);

    this.onValidSubmit = this.onValidSubmit.bind(this);
  }

  state = {
    error: null,
  };

  async componentDidMount() {
    await this.props.dispatch(fetchWorkOrder(this.props.workOrderId));
  }

  async onValidSubmit(data) {
    this.setState({ submitting: true, error: false });
    try {
      await this.props.dispatch(setWorkOrderState(this.props.workOrderId, data.stateType));
      const { workOrderId } = this.props;

      this.props.dispatch(fetchWorkOrderNotes(workOrderId));
    } catch (error) {
      this.setState({ error });
    } finally {
      this.setState({ submitting: false });
    }
  }

  validationSchema = yup.object().shape({
    stateType: yup.string().required(),
  });

  render() {
    const { transitionStates, workOrderStatus } = this.props;
    return (
      <Formik
        enableReinitialize
        initialValues={{
          type: 'Change state',
        }}
        onSubmit={(values) => {
          this.onValidSubmit(values);
        }}
        validationSchema={this.validationSchema}
      >
        {({ errors, handleSubmit, values }) => (
          <form className="form form--setWorkOrderState">
            {this.state.error ? <FormError error={this.state.error} /> : null}
            <div className="form-row">
              <div className="form-col" style={{ width: '90%' }}>
                <Field
                  disabled={workOrderStatus === 'CANCELED'}
                  name="stateType"
                  component="select"
                  className={errors.stateType ? 'text-input error-required' : 'text-input'}
                  value={values.stateType}
                  errors={errors}
                >
                  <option key="changeState" value="Change state">
                    Change state
                  </option>
                  {transitionStates.map((transitionState) => (
                    <option key={transitionState.value} value={transitionState.value}>
                      {transitionState.value}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="form-col">
                <button
                  className="btn btn__success"
                  type="submit"
                  onClick={handleSubmit}
                  style={{ height: '34px' }}
                  disabled={
                    transitionStates.length === 0 ||
                    this.state.submitting ||
                    workOrderStatus === 'CANCELED'
                  }
                >
                  Set state
                </button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    );
  }
}

export const initialState = ({
  workOrders,
  constants: {
    actionTransitionsOrdered = [],
    workOrder: {
      note: { transitionState },
    },
  },
}) => ({
  workOrderStatus: workOrders.single.status,
  transitionStates: R.map(
    (value) => ({
      label: R.replace(/_/g, ' ', value),
      value,
      disabled: value === transitionState.DROP_CAN || value === transitionState.PICKUP_CAN,
    }),
    actionTransitionsOrdered[workOrders.single.action] || [],
  ),
});

export default connect(initialState)(WorkOrderSetState);
