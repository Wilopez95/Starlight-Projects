/* eslint-disable react/prop-types */

import { withFormik } from 'formik';
import * as yup from 'yup';
import SelectInput from '../../../../components/Form/SelectInput';
import Form from '../../../../components/Form';
import Input from '../../../../components/Form/Input';
import { stateOptions } from '../../../../helpers/formOptions';

const validationSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
  address: yup.string().required().label('Address'),
  city: yup.string().required().label('City'),
  zip: yup.string().required().max(5, 'Too long').label('Zip'),
});

// type Props = {
//   handleSubmit: (
//     values: Object,
//     { props: Object, setSubmitting: Function },
//   ) => void,
//   isSubmitting: boolean,
//   values: Object,
//   errors: Object,
//   setFieldValue: () => void,
//   setFieldTouched: () => void,
//   touched: boolean,
//   onDismiss: () => void,
// };

const InnerFacilitiesForm = ({
  values,
  errors,
  touched,
  // handleChange,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
  isSubmitting,
  onDismiss,
}) => (
  <Form onSubmit={handleSubmit}>
    <div className="row">
      <div className="col-12">
        <Input name="name" label="Facility Name" type="text" tooltip={false} />
      </div>
    </div>
    <div className="row">
      <div className="col-12">
        <Input name="address" label="Address" type="text" tooltip={false} />
      </div>
    </div>
    <div className="row">
      <div className="col-12 col-md-6 order-md-0 order-sm-last order-xs-last">
        <Input name="city" label="City" type="text" tooltip={false} />
      </div>
      <div className="col-12 col-md-4">
        <SelectInput
          name="state"
          label="State"
          value={values.state}
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          error={errors.state}
          touched={touched.state}
          options={stateOptions}
        />
      </div>
      <div className="col-12 col-md-2">
        <Input name="zip" label="Zip" type="text" tooltip={false} />
      </div>
    </div>
    <div className="sui-form-actions">
      <button className="btn btn__link" onClick={onDismiss} disabled={isSubmitting} type="button">
        Cancel
      </button>
      <button
        className="btn btn__success"
        type="submit"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        Save
      </button>
    </div>
  </Form>
);
// $FlowIssue
const FacilitiesForm = withFormik({
  mapPropsToValues: () => ({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  }),
  enableReinitialize: false,
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.onSubmitForm(values);
      setSubmitting(false);
    }, 1000);
  },
  validationSchema,
  displayName: 'FacilitiesForm',
})(InnerFacilitiesForm);

export default FacilitiesForm;
