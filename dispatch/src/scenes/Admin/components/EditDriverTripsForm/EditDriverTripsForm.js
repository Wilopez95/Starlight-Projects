import { withFormik, Field } from 'formik';
import Form from '@root/components/Form';

// type Props = {
//   handleSubmit: Object => void,
//   isSubmitting: boolean,
// };

/* eslint-disable */
const InnerDriverTripsForm = props => {
  const { handleSubmit, isSubmitting } = props;

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <div style={{ marginTop: '20px' }}>
          <h4>Odometer</h4>
          <br />
          <Field
            name="odometer"
            type="number"
            className="text-input"
            placeholder="Enter corrected odometer value"
          />
        </div>
        <footer className="form-actions" style={{ paddingTop: '20px' }}>
          <button
            className="button button__primary"
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            Save
          </button>
        </footer>
      </Form>
    </div>
  );
};

// type WrappedProps = {
//   user: UserType,
//   driver: DriverType,
//   driverData: Array<Object>,
// };

const EditDriverTripsForm = withFormik({
  enableReinitialize: true,
  mapPropsToValues: props => ({
    odometer: props.odometer,
  }),
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.updateDriverTrips(values);
      setSubmitting(false);
    }, 1000);
  },
  displayName: 'InnerDriverTripsForm',
})(InnerDriverTripsForm);

export default EditDriverTripsForm;
