/* eslint-disable react/prop-types */
/* eslint-disable eqeqeq */

import { withFormik } from 'formik';
import Popup from 'reactjs-popup';
import * as yup from 'yup';
import { FormRow } from '@root/forms/elements/layout';
import Form from '@root/components/Form';
import Input from '@root/components/Form/Input';
import './modal.css';

const validationSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
});

// type Props = {
//   handleSubmit: (
//     values: Object,
//     { props: Object, setSubmitting: Function },
//   ) => void,
//   isSubmitting: boolean,
//   values: Object,
//   onDismiss: () => void,
// };

const InnerSizeForm = ({ handleSubmit, isSubmitting, onDismiss, values }) => (
  <Form onSubmit={handleSubmit}>
    <FormRow>
      <Input
        name="name"
        label="Size Name"
        type="text"
        tooltip
        tipTitle="The name of the can size (12, 10, 40CT)."
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
      {!Number(values.name) == true ? (
        <Popup
          trigger={
            <button className="button button__primary" type="button">
              Save
            </button>
          }
          modal
          position="top left"
        >
          {(close) => (
            <div>
              <div className="header" style={{ fontWeight: 'bold' }}>
                {' '}
                We noticed you added characters to your can size.{' '}
              </div>
              <div className="content">
                <br />
                Please confirm you really want to add Alpha Characters (CT, YD, etc) to your can
                size. Please note, this could cause issues with filtering.
                <div className="actions">
                  <br />
                  <button
                    className="button button__primary submit"
                    disabled={isSubmitting}
                    type="button"
                    onClick={handleSubmit}
                    style={{ width: '110px' }}
                  >
                    Save Anyway
                  </button>
                  {'        '}
                  <button
                    className="button button__empty submit"
                    type="button"
                    style={{
                      width: '110px',
                    }}
                    onClick={() => {
                      close();
                    }}
                  >
                    Close & Rename
                  </button>
                </div>
                <br />
              </div>
            </div>
          )}
        </Popup>
      ) : (
        <button
          className="button button__primary"
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          Save
        </button>
      )}
    </div>
  </Form>
);

const SizeForm = withFormik({
  mapPropsToValues: (props) => ({
    name: props.size.name,
  }),
  enableReinitialize: true,
  handleSubmit: (values, { props, setSubmitting }) => {
    setTimeout(() => {
      props.onSubmitForm(values);
      setSubmitting(false);
    }, 1000);
  },
  validationSchema,
  displayName: 'SizeForm',
})(InnerSizeForm);

export default SizeForm;
