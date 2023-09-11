/* eslint-disable react/prop-types */

import { withFormik } from 'formik';
import * as yup from 'yup';
import { FormRow } from '@root/forms/elements/layout';
import Form from '@root/components/Form';
import Input from '@root/components/Form/Input';

const validationSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
});

// type Props = {
//   handleSubmit: (
//     values: Object,
//     { props: Object, setSubmitting: Function },
//   ) => void,
//   isSubmitting: boolean,
//   onDismiss: () => void,
// };

const InnerMaterialForm = ({
  // values,
  // errors,
  // touched,
  // handleChange,
  // setFieldValue,
  // handleBlur,
  handleSubmit,
  isSubmitting,
  onDismiss,
}) => (
  <Form onSubmit={handleSubmit}>
    <FormRow>
      <Input
        name="name"
        label="Material Name"
        type="text"
        tooltip
        tipTitle="What kind of material will you be hauling? Drywall, C&D, Hazmat… etc."
      />
    </FormRow>
    <div className="sui-form-actions">
      <button
        className="button button__empty"
        onClick={onDismiss}
        disabled={isSubmitting}
        type="button"
      >
        Cancel
      </button>
      <button
        className="button button__primary"
        type="submit"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  </Form>
);

const MaterialForm = withFormik({
  mapPropsToValues: (props) => ({
    name: props.mode === 'edit' ? props.materials[props.id].name : '',
  }),
  enableReinitialize: true,
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.onSubmitForm(values);
      setSubmitting(false);
    }, 1000);
  },
  validationSchema,
  displayName: 'MaterialForm',
})(InnerMaterialForm);

export default MaterialForm;
