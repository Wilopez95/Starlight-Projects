/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { withFormik, Field } from 'formik';
import * as yup from 'yup';
import { connect } from 'react-redux';
import { FormRow } from '@root/forms/elements/layout';
import Form from '@root/components/Form';
import Input from '@root/components/Form/Input';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { getAvailableResourceLogins } from '@root/state/modules/lobby';

const validationSchema = yup.object().shape({
  phone: yup.string().required().max(13).label('Phone'),
});

// type Props = {
//   handleSubmit: (
//     values: Object,
//     { props: Object, setSubmitting: Function },
//   ) => void,
//   isSubmitting: boolean,
//   fetchSettingByKey: () => void,
// };

const InnerDriverAppForm = ({
  values,
  // errors,
  // touched,
  setting,
  setFieldValue,
  handleChange,
  handleSubmit,
  isSubmitting,
  ...props
}) => {
  const [businessUnitId, setBusinessUnitId] = useState(undefined);
  useEffect(() => {
    props.fetchSettingByKey('driver.dispatcherPhone', businessUnitId);
  }, [businessUnitId]);

  useEffect(() => {
    if (values.businessUnitId !== undefined) {
      setFieldValue('phone', setting.driver);
    }
  }, [setting]);
  return (
    <Form onSubmit={handleSubmit}>
      <FormRow>
        <div className="form-col">
          <label className="form-label">Business Unit</label>
          <Field
            name="businessUnitId"
            component="select"
            className="text-input"
            onChange={(e) => {
              setBusinessUnitId(e.target.value);
              handleChange(e);
            }}
          >
            <option key="businessUnitId" value="businessUnitId">
              Select Business Unit
            </option>
            {Object.keys(props.state.data ?? {}).length > 0 ? Object.keys(props.state.data).map((elem) => {
                const item = Object.values(props.state.data)[elem];
                return (
                  item.id !== 'systemConfig' && (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  )
                );
              }) : null}
          </Field>
        </div>
      </FormRow>
      <FormRow>
        <Input
          name="phone"
          label="Dispatcher Phone"
          type="tel"
          tooltip
          tipTitle="This phone number will be used in the DriverApp if the driver needs to contact Dispatch."
        />
      </FormRow>
      <footer className="form-actions">
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
  );
};

const DriverAppForm = withFormik({
  mapPropsToValues: (props) => ({
    phone: props.businessUnitId ? props.phone : undefined,
    businessUnitId: props.businessUnitId,
  }),
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.onUpdateSetting(values);
      setSubmitting(false);
    }, 1000);
  },
  validationSchema,
  displayName: 'DriverAppForm',
})(InnerDriverAppForm);

const mapStateToProps = (state) => ({
  state: state.lobby,
  setting: state.setting,
});
const mapDispatchToProps = (dispatch) => ({
  getAvailableResourceLogins: dispatch(getAvailableResourceLogins()),
  fetchSettingByKey: (key, businessUnitId) => dispatch(fetchSettingByKey(key, businessUnitId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DriverAppForm);
