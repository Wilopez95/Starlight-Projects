/* eslint-disable react/prop-types */

import { withFormik } from 'formik';
import TextInput from '@root/components/TextInput';

import Form from '@root/components/Form';

// type Props = {
//   handleChange: Function,
//   handleBlur: Function,
//   handleSubmit: Function,
//   isSubmitting: boolean,
// };

const InnerResetForm = (props) => {
  const { handleChange, handleBlur, handleSubmit, isSubmitting } = props;
  return (
    <Form onSubmit={handleSubmit}>
      <TextInput
        name="password"
        label="New Password"
        onChange={handleChange}
        type="password"
        onBlur={handleBlur}
      />

      <footer className="form-actions">
        <button className="button button__primary btn__lg" type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </footer>
    </Form>
  );
};

const ResetForm = withFormik({
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.handleResetPassword(values);
      setSubmitting(false);
      props.pushToLogin();
    }, 1000);
  },
  displayName: 'ResetForm',
})(InnerResetForm);

export default ResetForm;
